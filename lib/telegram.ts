import { getNotificationSettings } from './notification-settings';

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function sendTelegramOrderNotification(data: {
  fullName: string;
  telephone?: string;
  deliveryMethod?: string;
  branchName?: string;
  address: string;
  content: any;
  paymentMethod?: string;
}): Promise<boolean> {
  const settings = await getNotificationSettings();

  if (!settings.telegram_bot_token || !settings.telegram_chat_id) {
    return false;
  }

  const contentText = typeof data.content === 'string'
    ? stripHtml(data.content)
    : JSON.stringify(data.content, null, 2);

  const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  const paymentLabel = data.paymentMethod === 'bank_transfer'
    ? '🏦 Chuyển khoản ngân hàng'
    : '💵 Thanh toán khi nhận hàng (COD)';

  const isPickup = data.deliveryMethod === 'pickup';
  const deliveryLabel = isPickup
    ? `🏪 Lấy tại quán${data.branchName ? ` — ${data.branchName}` : ''}`
    : `🛵 Giao tại nhà`;

  const lines = [
    '🧾 <b>ĐƠN HÀNG MỚI</b>',
    '',
    `👤 <b>Họ tên:</b> ${data.fullName}`,
    data.telephone ? `📞 <b>Điện thoại:</b> <a href="tel:${data.telephone}">${data.telephone}</a>` : null,
    `📦 <b>Hình thức:</b> ${deliveryLabel}`,
    isPickup ? null : `📍 <b>Địa chỉ:</b> ${data.address}`,
    `💳 <b>Thanh toán:</b> ${paymentLabel}`,
    '',
    '🧩 <b>Nội dung đơn hàng:</b>',
    contentText,
    '',
    `⏰ ${now}`,
  ].filter((l) => l !== null).join('\n');

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${settings.telegram_bot_token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: settings.telegram_chat_id,
          text: lines,
          parse_mode: 'HTML',
        }),
      }
    );

    const json = await res.json() as any;
    if (!json.ok) {
      console.error('❌ Telegram API error:', json.description);
      return false;
    }

    console.log('✅ Telegram notification sent, message_id:', json.result?.message_id);
    return true;
  } catch (error: any) {
    console.error('❌ Telegram notification failed:', error.message);
    return false;
  }
}
