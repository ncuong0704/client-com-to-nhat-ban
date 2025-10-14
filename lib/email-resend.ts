// ============================================
// EMAIL NOTIFICATIONS - RESEND VERSION
// ============================================
// For Vercel deployment - uses Resend API instead of SMTP
// Install: npm install resend
// Get API key: https://resend.com/api-keys

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
  address: string;
  content: any; // rich text (string or JSON)
}) {
  // Validate required fields
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not set');
    return false;
  }
  
  if (!data.fullName || !data.address || !data.content) {
    console.error('❌ Missing required fields:', { 
      fullName: data.fullName,
      address: data.address,
      content: !!data.content 
    });
    return false;
  }
  
  try {
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

    const { data: emailData, error } = await sendEmailWithRetry({
      from: 'Website Order <onboarding@resend.dev>', // Use Resend default (no verification needed)
      to: [process.env.NOTIFICATION_EMAIL],
      subject: `Đơn hàng mới từ ${data.fullName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Đơn hàng mới</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #BB3031 0%, #8B2526 100%); padding: 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 600;">
                        🧾 ĐƠN HÀNG MỚI
                      </h1>
                      <p style="margin: 10px 0 0 0; color: #ffffff; opacity: 0.9; font-size: 13px;">
                        Thời gian: ${escapeHtml(createdAtStr)}
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Customer Info -->
                  <tr>
                    <td style="padding: 30px;">
                      
                      <div style="background-color: #f8f9fa; border-left: 4px solid #BB3031; padding: 20px; margin-bottom: 25px; border-radius: 4px;">
                        <h2 style="margin: 0 0 15px 0; color: #333333; font-size: 16px;">
                          👤 Thông tin khách hàng
                        </h2>
                        
                        <table width="100%" cellpadding="8" cellspacing="0">
                          <tr>
                            <td style="color: #666666; font-size: 14px; width: 120px;">
                              <strong>Họ tên:</strong>
                            </td>
                            <td style="color: #333333; font-size: 14px;">
                              ${escapeHtml(data.fullName)}
                            </td>
                          </tr>
                          ${data.telephone ? `
                          <tr>
                            <td style="color: #666666; font-size: 14px;">
                              <strong>Điện thoại:</strong>
                            </td>
                            <td style="color: #333333; font-size: 14px;">
                              <a href="tel:${escapeHtml(data.telephone)}" style="color: #BB3031; text-decoration: none;">
                                ${escapeHtml(data.telephone)}
                              </a>
                            </td>
                          </tr>
                          ` : ''}
                          <tr>
                            <td style="color: #666666; font-size: 14px;">
                              <strong>Địa chỉ:</strong>
                            </td>
                            <td style="color: #333333; font-size: 14px;">
                              ${escapeHtml(data.address)}
                            </td>
                          </tr>
                        </table>
                      </div>
                      
                      <!-- Order Content (Rich Text) -->
                      <div style="margin-bottom: 25px;">
                        <h2 style="margin: 0 0 15px 0; color: #333333; font-size: 16px;">
                          🧩 Nội dung đơn hàng
                        </h2>
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px; line-height: 1.6;">
                          ${renderContentHtml(data.content)}
                        </div>
                      </div>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="tel:${data.telephone ? escapeHtml(data.telephone) : ''}" 
                               style="display: inline-block; background-color: #BB3031; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-weight: 600; font-size: 14px;">
                              📞 Gọi ngay
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="margin: 0 0 10px 0; color: #666666; font-size: 12px;">
                        <strong>Website</strong><br>
                        📞 <a href="tel:${process.env.CONTACT_PHONE}" style="color: #BB3031; text-decoration: none;">${process.env.CONTACT_PHONE}</a> | 
                        📧 <a href="mailto:${process.env.NOTIFICATION_EMAIL}" style="color: #BB3031; text-decoration: none;">${process.env.NOTIFICATION_EMAIL}</a><br>
                        🌐 <a href="${process.env.CONTACT_WEBSITE_URL}" style="color: #BB3031; text-decoration: none;">${process.env.CONTACT_WEBSITE_URL}</a>
                      </p>
                      <p style="margin: 10px 0 0 0; color: #999999; font-size: 11px;">
                        Email được gửi tự động từ hệ thống website
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
ĐƠN HÀNG MỚI TỪ WEBSITE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THÔNG TIN KHÁCH HÀNG:
• Họ tên: ${data.fullName}
${data.telephone ? `• Điện thoại: ${data.telephone}` : ''}
• Địa chỉ: ${data.address}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NỘI DUNG ĐƠN HÀNG (Rich Text):
${typeof data.content === 'string' ? data.content : JSON.stringify(data.content, null, 2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Liên hệ: ${process.env.NOTIFICATION_EMAIL}
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

    console.log('✅ Contact form notification sent successfully. ID:', emailData.id);
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

