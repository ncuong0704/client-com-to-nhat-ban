// ============================================
// EMAIL NOTIFICATIONS - RESEND VERSION
// ============================================

type EmailHtmlParams = {
  data: {
    fullName: string;
    telephone?: string;
    email?: string;
    address: string;
    content: any;
    paymentMethod?: string;
  };
  settings: any;
  createdAtStr: string;
  isPickup: boolean;
  deliveryLabel: string;
  escapeHtml: (s: string) => string;
  renderContentHtml: (c: any) => string;
};

function buildOrderEmailHtml({ data, settings, createdAtStr, isPickup, deliveryLabel, escapeHtml, renderContentHtml }: EmailHtmlParams): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Đơn hàng mới</title></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f5f5f5;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:20px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
  <tr><td style="background:linear-gradient(135deg,#BB3031 0%,#8B2526 100%);padding:30px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600;">🧾 ĐƠN HÀNG MỚI</h1>
    <p style="margin:10px 0 0 0;color:#ffffff;opacity:0.9;font-size:13px;">Thời gian: ${escapeHtml(createdAtStr)}</p>
  </td></tr>
  <tr><td style="padding:30px;">
    <div style="background-color:#f8f9fa;border-left:4px solid #BB3031;padding:20px;margin-bottom:25px;border-radius:4px;">
      <h2 style="margin:0 0 15px 0;color:#333333;font-size:16px;">👤 Thông tin khách hàng</h2>
      <table width="100%" cellpadding="8" cellspacing="0">
        <tr><td style="color:#666666;font-size:14px;width:140px;"><strong>Họ tên:</strong></td><td style="color:#333333;font-size:14px;">${escapeHtml(data.fullName)}</td></tr>
        ${data.telephone ? `<tr><td style="color:#666666;font-size:14px;"><strong>Điện thoại:</strong></td><td style="color:#333333;font-size:14px;"><a href="tel:${escapeHtml(data.telephone)}" style="color:#BB3031;text-decoration:none;">${escapeHtml(data.telephone)}</a></td></tr>` : ''}
        ${data.email ? `<tr><td style="color:#666666;font-size:14px;"><strong>Email:</strong></td><td style="color:#333333;font-size:14px;"><a href="mailto:${escapeHtml(data.email)}" style="color:#BB3031;text-decoration:none;">${escapeHtml(data.email)}</a></td></tr>` : ''}
        <tr><td style="color:#666666;font-size:14px;"><strong>Hình thức:</strong></td><td style="color:#333333;font-size:14px;font-weight:600;">${isPickup ? '🏪 ' : '🛵 '}${escapeHtml(deliveryLabel)}</td></tr>
        ${!isPickup ? `<tr><td style="color:#666666;font-size:14px;"><strong>Địa chỉ:</strong></td><td style="color:#333333;font-size:14px;">${escapeHtml(data.address)}</td></tr>` : ''}
        <tr><td style="color:#666666;font-size:14px;"><strong>Thanh toán:</strong></td><td style="color:#333333;font-size:14px;">${data.paymentMethod === 'bank_transfer' ? '<span style="color:#BB3031;font-weight:600;">🏦 Chuyển khoản ngân hàng</span>' : '<span style="font-weight:600;">💵 Thanh toán khi nhận hàng (COD)</span>'}</td></tr>
      </table>
    </div>
    <div style="margin-bottom:25px;">
      <h2 style="margin:0 0 15px 0;color:#333333;font-size:16px;">🧩 Nội dung đơn hàng</h2>
      <div style="background-color:#f8f9fa;padding:20px;border-radius:4px;line-height:1.6;">${renderContentHtml(data.content)}</div>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:20px 0;">
      <a href="tel:${data.telephone ? escapeHtml(data.telephone) : ''}" style="display:inline-block;background-color:#BB3031;color:#ffffff;text-decoration:none;padding:12px 30px;border-radius:4px;font-weight:600;font-size:14px;">📞 Gọi ngay</a>
    </td></tr></table>
  </td></tr>
  <tr><td style="background-color:#f8f9fa;padding:20px;text-align:center;border-top:1px solid #e9ecef;">
    <p style="margin:0 0 10px 0;color:#666666;font-size:12px;">
      📞 <a href="tel:${settings.contact_phone}" style="color:#BB3031;text-decoration:none;">${settings.contact_phone}</a> |
      📧 <a href="mailto:${settings.notification_email}" style="color:#BB3031;text-decoration:none;">${settings.notification_email}</a><br>
      🌐 <a href="${settings.contact_website_url}" style="color:#BB3031;text-decoration:none;">${settings.contact_website_url}</a>
    </p>
    <p style="margin:0;color:#999999;font-size:11px;">Email được gửi tự động từ hệ thống website</p>
  </td></tr>
</table>
</td></tr></table></body></html>`;
}

function buildCustomerConfirmHtml({ data, settings, createdAtStr, isPickup, deliveryLabel, escapeHtml, renderContentHtml }: EmailHtmlParams): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Xác nhận đơn hàng</title></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f5f5f5;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:20px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
  <tr><td style="background:linear-gradient(135deg,#BB3031 0%,#8B2526 100%);padding:30px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600;">Cảm ơn bạn đã đặt đơn!</h1>
    <p style="margin:10px 0 0 0;color:#ffffff;opacity:0.9;font-size:13px;">Donburi — ${escapeHtml(createdAtStr)}</p>
  </td></tr>
  <tr><td style="padding:30px;">
    <p style="margin:0 0 20px 0;font-size:15px;color:#333333;">Xin chào <strong>${escapeHtml(data.fullName)}</strong>,</p>
    <p style="margin:0 0 20px 0;font-size:14px;color:#555555;">Chúng tôi đã nhận đơn hàng của bạn và sẽ liên hệ xác nhận trong vài phút qua số điện thoại <strong>${data.telephone ? escapeHtml(data.telephone) : ''}</strong>.</p>
    <div style="background-color:#f8f9fa;border-left:4px solid #BB3031;padding:20px;margin-bottom:25px;border-radius:4px;">
      <h2 style="margin:0 0 12px 0;color:#333333;font-size:15px;">Thông tin đơn hàng</h2>
      <table width="100%" cellpadding="6" cellspacing="0">
        <tr><td style="color:#666666;font-size:14px;width:140px;"><strong>Hình thức:</strong></td><td style="color:#333333;font-size:14px;font-weight:600;">${isPickup ? '🏪 ' : '🛵 '}${escapeHtml(deliveryLabel)}</td></tr>
        ${!isPickup ? `<tr><td style="color:#666666;font-size:14px;"><strong>Địa chỉ:</strong></td><td style="color:#333333;font-size:14px;">${escapeHtml(data.address)}</td></tr>` : ''}
        <tr><td style="color:#666666;font-size:14px;"><strong>Thanh toán:</strong></td><td style="color:#333333;font-size:14px;">${data.paymentMethod === 'bank_transfer' ? '🏦 Chuyển khoản ngân hàng' : '💵 COD - Thanh toán khi nhận hàng'}</td></tr>
      </table>
    </div>
    <div style="margin-bottom:25px;">
      <h2 style="margin:0 0 15px 0;color:#333333;font-size:15px;">Chi tiết đơn hàng</h2>
      <div style="background-color:#f8f9fa;padding:20px;border-radius:4px;line-height:1.6;">${renderContentHtml(data.content)}</div>
    </div>
  </td></tr>
  <tr><td style="background-color:#f8f9fa;padding:20px;text-align:center;border-top:1px solid #e9ecef;">
    <p style="margin:0 0 6px 0;color:#666666;font-size:13px;">Cần hỗ trợ? Liên hệ ngay:</p>
    <p style="margin:0 0 10px 0;color:#333333;font-size:14px;">
      📞 <a href="tel:${settings.contact_phone}" style="color:#BB3031;text-decoration:none;font-weight:600;">${settings.contact_phone}</a>
    </p>
    <p style="margin:0;color:#999999;font-size:11px;">Email xác nhận tự động — Vui lòng không reply</p>
  </td></tr>
</table>
</td></tr></table></body></html>`;
}

import { getNotificationSettings } from './notification-settings';
import { Resend } from 'resend';

// Helper function to get Resend instance (create fresh for each request in serverless)
function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

// Helper function to send email with retry logic
async function sendEmailWithRetry(emailOptions: any, maxRetries = 2): Promise<any> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Create fresh Resend instance for each attempt (important for serverless)
      const resend = getResendClient();
      
      // Send email with timeout
      const result: any = await Promise.race([
        resend.emails.send(emailOptions),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Email timeout after 8s')), 8000)
        )
      ]);
      
      // Check for error in response
      if (result.error) {
        throw new Error(JSON.stringify(result.error));
      }
      
      return result;
    } catch (error: any) {
      lastError = error;
      console.error(`Email attempt ${attempt + 1}/${maxRetries + 1} failed:`, error.message || error);
      
      if (attempt < maxRetries) {
        const delay = 500 * (attempt + 1); // 500ms, 1000ms
        console.log(`⚠️ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * Send contact form notification email
 */
export async function sendContactFormNotification(data: {
  fullName: string;
  telephone?: string;
  email?: string;
  deliveryMethod?: string;
  branchName?: string;
  address: string;
  content: any;
  paymentMethod?: string;
}) {
  // Validate required fields
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not set');
    return false;
  }

  if (!data.fullName || !data.content) {
    console.error('❌ Missing required fields:', {
      fullName: data.fullName,
      content: !!data.content
    });
    return false;
  }
  
  try {
    const settings = await getNotificationSettings();

    if (!settings.notification_email) {
      console.error('❌ notification_email not configured in Strapi or .env');
      return false;
    }

    // Helpers
    const escapeHtml = (str: string) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const renderContentHtml = (content: any): string => {
      if (typeof content === 'string') {
        const trimmed = content.trim();
        if (trimmed.startsWith('<')) {
          return trimmed;
        }
        return `<div style="white-space: pre-wrap;">${escapeHtml(content)}</div>`;
      }
      try {
        // Fallback: pretty JSON
        return `<pre style="background:#f8f9fa;padding:12px;border-radius:4px;overflow:auto;">${escapeHtml(JSON.stringify(content, null, 2))}</pre>`;
      } catch {
        return `<div>${escapeHtml(String(content))}</div>`;
      }
    };

    const now = new Date();
    const createdAtStr = now.toISOString();
    const isPickup = data.deliveryMethod === 'pickup';
    const deliveryLabel = isPickup
      ? `Lấy tại quán${data.branchName ? ` — ${data.branchName}` : ''}`
      : 'Giao tại nhà';

    const adminEmailHtml = buildOrderEmailHtml({ data, settings, createdAtStr, isPickup, deliveryLabel, escapeHtml, renderContentHtml });

    const { data: emailData, error } = await sendEmailWithRetry({
      from: 'Donburi Order <donhang@donburi.vn>',
      to: [settings.notification_email],
      subject: `Đơn hàng mới từ ${data.fullName} — ${isPickup ? 'Lấy tại quán' : 'Giao tại nhà'} — ${data.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : 'COD'}`,
      html: adminEmailHtml,
      text: `
ĐƠN HÀNG MỚI TỪ WEBSITE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THÔNG TIN KHÁCH HÀNG:
• Họ tên: ${data.fullName}
${data.telephone ? `• Điện thoại: ${data.telephone}` : ''}
• Hình thức: ${deliveryLabel}
${isPickup ? '' : `• Địa chỉ: ${data.address}`}
${data.email ? `• Email: ${data.email}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NỘI DUNG ĐƠN HÀNG:
${typeof data.content === 'string' ? data.content : JSON.stringify(data.content, null, 2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Liên hệ: ${settings.notification_email}
      `.trim(),
    });

    if (error) {
      console.error('❌ Resend API returned error:', error);
      return false;
    }

    if (!emailData || !emailData.id) {
      console.error('❌ No email ID returned from Resend');
      return false;
    }

    console.log('✅ Admin notification sent. ID:', emailData.id);

    // Send customer confirmation email if email provided
    if (data.email) {
      try {
        await sendEmailWithRetry({
          from: 'Donburi <donhang@donburi.vn>',
          to: [data.email],
          subject: `Donburi — Xác nhận đơn hàng của ${escapeHtml(data.fullName)}`,
          html: buildCustomerConfirmHtml({ data, settings, createdAtStr, isPickup, deliveryLabel, escapeHtml, renderContentHtml }),
          text: `
Xin chào ${data.fullName},

Cảm ơn bạn đã đặt đơn tại Donburi!

Hình thức: ${deliveryLabel}
${isPickup ? '' : `Địa chỉ giao hàng: ${data.address}`}
Thanh toán: ${data.paymentMethod === 'bank_transfer' ? 'Chuyển khoản ngân hàng' : 'COD - Thanh toán khi nhận hàng'}

Chúng tôi sẽ liên hệ xác nhận đơn hàng trong vài phút.

Liên hệ hỗ trợ: ${settings.contact_phone}
${settings.contact_website_url}
          `.trim(),
        });
        console.log('✅ Customer confirmation email sent to:', data.email);
      } catch (err: any) {
        console.error('⚠️ Customer email failed (non-blocking):', err.message);
      }
    }

    return true;
  } catch (error: any) {
    console.error('❌ Failed to send contact form notification:', {
      message: error.message,
      name: error.name,
      cause: error.cause
    });
    return false;
  }
}

