import { unstable_cache } from 'next/cache';

export interface NotificationSettings {
  notification_email: string;
  contact_phone: string;
  contact_website_url: string;
  telegram_bot_token?: string;
  telegram_chat_id?: string;
}

async function fetchNotificationSettings(): Promise<NotificationSettings> {
  try {
    const strapiUrl = process.env.STRAPI_API_URL || 'https://api.donburi.vn';
    const res = await fetch(`${strapiUrl}/api/notification-setting`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Strapi ${res.status}`);
    const json = await res.json();
    const attrs = json?.data?.attributes ?? json?.data ?? {};
    return {
      notification_email: attrs.notification_email || process.env.NOTIFICATION_EMAIL || '',
      contact_phone:       attrs.contact_phone       || process.env.CONTACT_PHONE       || '',
      contact_website_url: attrs.contact_website_url || process.env.CONTACT_WEBSITE_URL || '',
      telegram_bot_token:  attrs.telegram_bot_token || process.env.TELEGRAM_BOT_TOKEN || '',
      telegram_chat_id:    attrs.telegram_chat_id || process.env.TELEGRAM_CHAT_ID || '',
    };
  } catch (error: any) {
    console.error('❌ Failed to load notification settings:', error?.message || error);
    return {
      notification_email: process.env.NOTIFICATION_EMAIL || '',
      contact_phone:       process.env.CONTACT_PHONE       || '',
      contact_website_url: process.env.CONTACT_WEBSITE_URL || '',
      telegram_bot_token:  process.env.TELEGRAM_BOT_TOKEN || '',
      telegram_chat_id:    process.env.TELEGRAM_CHAT_ID || '',
    };
  }
}

export const getNotificationSettings = unstable_cache(
  fetchNotificationSettings,
  ['notification-settings'],
  { revalidate: 30, tags: ['notification-settings', 'payment-settings'] }
);
