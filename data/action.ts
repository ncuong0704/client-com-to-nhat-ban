'use server'
import { calculateSpamScore, isHoneypotTriggered, shouldBlockSubmission } from '@/lib/anti-spam';
import { sendContactFormNotification } from '@/lib/email-resend';
import { sendTelegramOrderNotification } from '@/lib/telegram';
import { RATE_LIMITS, rateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';
import { z } from 'zod';
import { orderForm, OrderFormProps } from './service';

const VN_PHONE_REGEX = /^(0|\+84)(3[2-9]|5[6-9]|7[06-9]|8[0-9]|9[0-9])[0-9]{7}$/

const contactFormSchema = z.object({
    fullName: z.string().min(1, { message: "Vui lòng nhập họ và tên" }),
    telephone: z.string()
        .min(1, { message: "Vui lòng nhập số điện thoại" })
        .regex(VN_PHONE_REGEX, { message: "Số điện thoại không hợp lệ (ví dụ: 0912345678)" }),
    email: z.union([z.string().email({ message: "Email không hợp lệ" }), z.literal("")]).optional(),
    deliveryMethod: z.enum(["pickup", "delivery"]).default("delivery"),
    address: z.string().optional(),
    branchName: z.string().optional(),
    content: z.any(),
    paymentMethod: z.enum(["cod", "bank_transfer"]).default("cod"),
}).superRefine((data, ctx) => {
    if (data.deliveryMethod === "delivery" && !data.address?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Vui lòng nhập địa chỉ giao hàng", path: ["address"] });
    }
    if (data.deliveryMethod === "pickup" && !data.branchName?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Vui lòng chọn chi nhánh", path: ["branchName"] });
    }
});

export async function contactFormAction(prevState: any, formData: FormData) {
    // ✅ SECURITY: Get client IP for rate limiting
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

    // ✅ ANTI-SPAM: Check rate limit
    const rateLimitResult = await rateLimit(
        `contact:${ip}`,
        RATE_LIMITS.CONTACT_FORM.limit,
        RATE_LIMITS.CONTACT_FORM.window
    );

    if (!rateLimitResult.success) {
        return {
            ...prevState,
            zodErrors: null,
            strapiErrors: null,
            errorMessage: `Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ${Math.ceil((rateLimitResult.reset - Date.now()) / 60000)} phút.`,
        };
    }

    const deliveryMethod = (formData.get("deliveryMethod") as string | null) || "delivery";
    const branchName = (formData.get("branchName") as string | null) || "";
    const rawAddress = (formData.get("address") as string | null) || "";

    const formDataObject = {
        fullName: (formData.get("fullName") || formData.get("name")) as string | null,
        telephone: (formData.get("telephone") as string | null) || "",
        email: (formData.get("email") as string | null) || "",
        deliveryMethod: deliveryMethod as "pickup" | "delivery",
        address: rawAddress,
        branchName,
        content: formData.get("content") as any | null,
        paymentMethod: (formData.get("paymentMethod") as string | null) || "cod",
        // ✅ ANTI-SPAM: Hidden fields
        honeypot: formData.get("website") as string | null,
        timestamp: formData.get("timestamp") as string | null,
    };

    // ✅ ANTI-SPAM: Check honeypot
    if (isHoneypotTriggered(formDataObject.honeypot)) {
        console.warn(`[SPAM BLOCKED] Honeypot triggered from IP: ${ip}`);
        // Return success to bot (don't reveal detection)
        return {
            ...prevState,
            zodErrors: null,
            strapiErrors: null,
            errorMessage: null,
            successMessage: "Cảm ơn bạn đã liên hệ!",
        };
    }

    // ✅ ANTI-SPAM: Calculate spam score
    const spamScore = calculateSpamScore({
        honeypot: formDataObject.honeypot || undefined,
        formOpenTime: formDataObject.timestamp ? parseInt(formDataObject.timestamp) : undefined,
        name: formDataObject.fullName || undefined,
    });

    if (shouldBlockSubmission(spamScore.score)) {
        console.warn(`[SPAM BLOCKED] Score: ${spamScore.score}, Reasons:`, spamScore.reasons, `IP: ${ip}`);
        // Return success to bot (don't reveal detection)
        return {
            ...prevState,
            zodErrors: null,
            strapiErrors: null,
            errorMessage: null,
            successMessage: "Cảm ơn bạn đã liên hệ!",
        };
    }

    const validatedFields = contactFormSchema.safeParse(formDataObject);

    if (!validatedFields.success) {
        return {
            ...prevState,
            zodErrors: validatedFields.error.flatten().fieldErrors,
            strapiErrors: null,
        };
    }

    const d = validatedFields.data;
    const effectiveAddress = d.deliveryMethod === "pickup"
        ? `Lấy tại quán${d.branchName ? ` — ${d.branchName}` : ""}`
        : (d.address ?? "");

    const dataToSend: OrderFormProps = {
        fullName: d.fullName,
        telephone: d.telephone || "",
        email: d.email || undefined,
        deliveryMethod: d.deliveryMethod,
        branchName: d.deliveryMethod === "pickup" ? d.branchName : undefined,
        address: effectiveAddress,
        content: d.content,
        paymentMethod: d.paymentMethod,
    };

    const responseData = await orderForm(dataToSend);

    if (!responseData) {
        return {
            ...prevState,
            strapiErrors: null,
            zodErrors: null,
            errorMessage: "Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.",
        };
    }

    if ((responseData as any).error) {
        return {
            ...prevState,
            strapiErrors: (responseData as any).error,
            zodErrors: null,
            errorMessage: (responseData as any).error.message,
        };
    }

    await Promise.allSettled([
        sendContactFormNotification({
            fullName: dataToSend.fullName,
            telephone: dataToSend.telephone,
            email: dataToSend.email,
            deliveryMethod: dataToSend.deliveryMethod,
            branchName: dataToSend.branchName,
            address: dataToSend.address,
            content: dataToSend.content,
            paymentMethod: dataToSend.paymentMethod,
        }).catch(error => console.error('⚠️ Email notification failed:', error)),
        sendTelegramOrderNotification({
            fullName: dataToSend.fullName,
            telephone: dataToSend.telephone,
            deliveryMethod: dataToSend.deliveryMethod,
            branchName: dataToSend.branchName,
            address: dataToSend.address,
            content: dataToSend.content,
            paymentMethod: dataToSend.paymentMethod,
        }).catch(error => console.error('⚠️ Telegram notification failed:', error)),
    ]);

    return {
        ...prevState,
        zodErrors: null,
        strapiErrors: null,
        errorMessage: null,
        successMessage: "Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm.",
    };
}