import { getNotificationSettings } from './notification-settings';

/** Escape text for Telegram HTML parse_mode */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getCells(row: string): string[] {
  const cells: string[] = [];
  const re = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(row)) !== null) {
    cells.push(
      m[1]
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .trim()
    );
  }
  return cells;
}

function parseOrderHtml(html: string): string {
  if (!html || !html.includes('<table')) {
    return escapeHtml(html.replace(/<[^>]*>/g, '').trim());
  }

  const lines: string[] = [];

  const tbodyMatch = html.match(/<tbody>([\s\S]*?)<\/tbody>/i);
  if (tbodyMatch) {
    const rowRe = /<tr>([\s\S]*?)<\/tr>/gi;
    let rowM: RegExpExecArray | null;
    while ((rowM = rowRe.exec(tbodyMatch[1])) !== null) {
      const c = getCells(rowM[1]);
      // columns: 0=# 1=Món 2=SL 3=Đơn giá 4=Phụ phí 5=Thành tiền 6=Topping 7=Ghi chú
      if (c.length < 6) continue;
      const [idx, name, qty, unitPrice, surcharge, totalPrice, toppingNames, note] = c;
      lines.push(`${escapeHtml(idx)}. <b>${escapeHtml(name)}</b> × ${escapeHtml(qty)}`);
      const priceInfo = surcharge && surcharge !== '0 ₫' && surcharge !== '0đ'
        ? `${escapeHtml(unitPrice)} + phụ phí ${escapeHtml(surcharge)} → <b>${escapeHtml(totalPrice)}</b>`
        : `${escapeHtml(unitPrice)} → <b>${escapeHtml(totalPrice)}</b>`;
      lines.push(`   💰 ${priceInfo}`);
      if (toppingNames && toppingNames !== '—') {
        lines.push(`   🧂 Topping: ${escapeHtml(toppingNames)}`);
      }
      if (note && note !== '—') {
        lines.push(`   📝 ${escapeHtml(note)}`);
      }
    }
  }

  const tfootMatch = html.match(/<tfoot>([\s\S]*?)<\/tfoot>/i);
  if (tfootMatch) {
    const c = getCells(tfootMatch[1]);
    const totalQty = c.find(v => /^\d+$/.test(v));
    const totalMoney = c.find(v => v.includes('Tổng tiền'));
    if (totalQty || totalMoney) {
      lines.push('');
      if (totalQty) lines.push(`📦 Tổng số món: <b>${escapeHtml(totalQty)}</b>`);
      if (totalMoney) lines.push(`💵 ${escapeHtml(totalMoney)}`);
    }
  }

  // If parsing failed and left nothing, strip all tags as plain fallback
  if (lines.length === 0) {
    return escapeHtml(html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
  }

  return lines.join('\n');
}

async function sendTelegramMessage(
  token: string,
  chatId: string,
  text: string,
  parseMode?: 'HTML'
): Promise<{ ok: boolean; description?: string; message_id?: number }> {
  const body: Record<string, string> = {
    chat_id: chatId,
    text,
  };
  if (parseMode) body.parse_mode = parseMode;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as any;
  return {
    ok: !!json.ok,
    description: json.description,
    message_id: json.result?.message_id,
  };
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
    console.error('❌ Telegram skipped: missing telegram_bot_token or telegram_chat_id');
    return false;
  }

  const contentText = typeof data.content === 'string'
    ? parseOrderHtml(data.content)
    : escapeHtml(JSON.stringify(data.content, null, 2));

  const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  const paymentLabel = data.paymentMethod === 'bank_transfer'
    ? '🏦 Chuyển khoản ngân hàng'
    : '💵 Thanh toán khi nhận hàng (COD)';

  const isPickup = data.deliveryMethod === 'pickup';
  const deliveryLabel = isPickup
    ? `🏪 Lấy tại quán${data.branchName ? ` — ${escapeHtml(data.branchName)}` : ''}`
    : `🛵 Giao tại nhà${data.branchName ? ` — ${escapeHtml(data.branchName)}` : ''}`;

  const phone = data.telephone ? escapeHtml(data.telephone) : '';

  const lines = [
    '🧾 <b>ĐƠN HÀNG MỚI</b>',
    '',
    `👤 <b>Họ tên:</b> ${escapeHtml(data.fullName)}`,
    phone ? `📞 <b>Điện thoại:</b> <a href="tel:${phone}">${phone}</a>` : null,
    `📦 <b>Hình thức:</b> ${deliveryLabel}`,
    !isPickup && data.address ? `📍 <b>Địa chỉ:</b> ${escapeHtml(data.address)}` : null,
    `💳 <b>Thanh toán:</b> ${paymentLabel}`,
    '',
    '🧩 <b>Chi tiết đơn hàng:</b>',
    contentText,
    '',
    `⏰ ${escapeHtml(now)}`,
  ].filter((l) => l !== null).join('\n');

  // Telegram limit 4096 chars — truncate safely if needed
  const text = lines.length > 4000
    ? `${lines.slice(0, 3950)}\n\n… (nội dung bị cắt)`
    : lines;

  try {
    let result = await sendTelegramMessage(
      settings.telegram_bot_token,
      settings.telegram_chat_id,
      text,
      'HTML'
    );

    // Fallback: if HTML parse fails, retry as plain text
    if (!result.ok && result.description?.includes("can't parse entities")) {
      console.warn('⚠️ Telegram HTML parse failed, retrying as plain text:', result.description);
      const plain = text
        .replace(/<\/?b>/gi, '')
        .replace(/<a href="[^"]*">([^<]*)<\/a>/gi, '$1')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
      result = await sendTelegramMessage(
        settings.telegram_bot_token,
        settings.telegram_chat_id,
        plain
      );
    }

    if (!result.ok) {
      console.error('❌ Telegram API error:', result.description);
      return false;
    }

    console.log('✅ Telegram notification sent, message_id:', result.message_id);
    return true;
  } catch (error: any) {
    console.error('❌ Telegram notification failed:', error.message);
    return false;
  }
}
