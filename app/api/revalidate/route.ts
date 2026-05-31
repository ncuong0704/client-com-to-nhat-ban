import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const LOCALES = ['vi', 'en'];

// Map Strapi model UID → base cache tags (locale variants auto-appended)
const MODEL_TAGS: Record<string, string[]> = {
  'api::global.global':                             ['global-data'],
  'api::landingpage.landingpage':                   ['landing-page'],
  'api::dish.dish':                                 ['dish'],
  'api::video.video':                               ['video'],
  'api::notification-setting.notification-setting': ['payment-settings', 'notification-settings'],
  'api::badge.badge':                               ['dish'],
  'api::category-dish.category-dish':               ['dish'],
  'api::category-video.category-video':             ['video'],
};

function expandTags(baseTags: string[]): string[] {
  const all = new Set<string>();
  for (const tag of baseTags) {
    all.add(tag);
    for (const locale of LOCALES) {
      all.add(`${tag}-${locale}`);
    }
  }
  return [...all];
}

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
    ?? req.headers.get('x-revalidate-secret');

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));

    // Strapi gửi `model` ("dish") hoặc `uid` ("api::dish.dish")
    const uid: string | undefined = body?.uid
      ?? (body?.model ? `api::${body.model}.${body.model}` : undefined);

    if (!uid || uid === 'all') {
      const allTags = expandTags(Object.values(MODEL_TAGS).flat());
      for (const tag of allTags) {
        revalidateTag(tag, 'default');
      }
      revalidatePath('/', 'layout');
      return NextResponse.json({ revalidated: true, tags: 'all' });
    }

    const baseTags = MODEL_TAGS[uid];
    if (!baseTags) {
      return NextResponse.json({ revalidated: false, message: `Unknown model: ${uid}` });
    }

    const tags = expandTags(baseTags);
    for (const tag of tags) {
      revalidateTag(tag, 'default');
    }
    return NextResponse.json({ revalidated: true, uid, tags });

  } catch {
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
  }
}
