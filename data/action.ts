'use server'
import { calculateSpamScore, isHoneypotTriggered, shouldBlockSubmission } from '@/lib/anti-spam';
import { sendContactFormNotification } from '@/lib/email-resend';
import { RATE_LIMITS, rateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';
import { z } from 'zod';
import { orderForm, OrderFormProps } from './service';

const contactFormSchema = z.object({
    fullName: z.string().min(1, { message: "Vui lòng nhập họ và tên" }),
    telephone: z.string().optional(),
    address: z.string().min(1, { message: "Vui lòng nhập địa chỉ" }),
    content: z.any(),
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

    const formDataObject = {
        fullName: (formData.get("fullName") || formData.get("name")) as string | null,
        telephone: (formData.get("telephone") as string | null) || "",
        address: (formData.get("address") as string | null) || "",
        content: formData.get("content") as any | null,
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

    const dataToSend: OrderFormProps = {
        fullName: validatedFields.data.fullName,
        telephone: validatedFields.data.telephone || "",
        address: validatedFields.data.address,
        content: validatedFields.data.content,
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

    // ✅ Gửi email thông báo (không chờ hoàn tất, chạy nền để không làm chậm phản hồi)
    // Không dùng await - gửi email ngầm, phản hồi người dùng ngay lập tức
    sendContactFormNotification({
        fullName: dataToSend.fullName,
        telephone: dataToSend.telephone,
        address: dataToSend.address,
        content: dataToSend.content,
    }).catch(error => {
        console.error('⚠️ Failed to send email notification (non-critical):', error);
    });

    return {
        ...prevState,
        zodErrors: null,
        strapiErrors: null,
        errorMessage: null,
        successMessage: "Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm.",
    };
}