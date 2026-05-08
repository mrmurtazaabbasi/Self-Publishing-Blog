import { NextResponse } from 'next/server';
import { sendNotification } from '@/lib/notifications';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

const DAILY_POST_LIMIT = 1; // Hard constraint to stay in free tier

export async function GET(request: Request) {
  const env = getRequestContext().env;
  const db = env.DB;

  // 0. Safety Check: How many posts were published today?
  const today = new Date().toISOString().split('T')[0];
  const { count } = await db.prepare(
    "SELECT COUNT(*) as count FROM posts WHERE published_at >= ?"
  ).bind(today).first() as { count: number };

  if (count >= DAILY_POST_LIMIT) {
    console.log(`Daily limit of ${DAILY_POST_LIMIT} reached. Skipping trend fetch.`);
    return NextResponse.json({ success: true, message: 'Daily limit reached' });
  }

  // 1. Fetch trends (Simulated or via API)
  // For free tier, we scan once a day.
  const trends = [
    { id: 't' + Date.now(), topic: 'The Evolution of Sustainable Tech', keywords: ['green', 'sustainability', 'future'] },
  ];

  let notifiedCount = 0;

  for (const trend of trends) {
    const exists = await db.prepare('SELECT 1 FROM notified_trends WHERE trend_id = ?').bind(trend.id).first();
    
    if (!exists) {
      const baseUrl = new URL(request.url).origin;
      await sendNotification(trend.topic, trend.keywords, trend.id, env.DISCORD_WEBHOOK_URL, baseUrl);
      
      await db.prepare('INSERT INTO trends (id, topic, keywords) VALUES (?, ?, ?)')
        .bind(trend.id, trend.topic, trend.keywords.join(','))
        .run();
      
      await db.prepare('INSERT INTO notified_trends (trend_id) VALUES (?)')
        .bind(trend.id)
        .run();
      
      notifiedCount++;
      // Stop after first new trend to respect daily limit
      break; 
    }
  }

  return NextResponse.json({ 
    success: true, 
    notified: notifiedCount,
    debug: {
      hasDiscordUrl: !!env.DISCORD_WEBHOOK_URL,
      trendDiscovery: trends[0].topic
    }
  });
}
