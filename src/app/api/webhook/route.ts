import { NextResponse } from 'next/server';
import { generateFullArticle, generateWithGemini } from '@/lib/ai';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function POST(request: Request) {
  const env = getRequestContext().env;
  const db = env.DB;
  
  // Secrets
  const GEMINI_API_KEY = env.GEMINI_API_KEY;
  const SERPER_API_KEY = env.SERPER_API_KEY;

  const data = await request.json() as any;

  if (data.type === 1) return NextResponse.json({ type: 1 });

  let trendId = '';
  let command = '';

  if (data.type === 3) {
    const customId = data.data.custom_id;
    [trendId, command] = customId.split(':');
  } else {
    const text = (data.text || data.content || '').trim();
    const parts = text.split(' ');
    if (parts.length >= 2) {
      trendId = parts[0];
      command = parts[1].toLowerCase();
    }
  }

  if (!trendId || !command) return NextResponse.json({ text: 'Invalid command.' });

  const trend = await db.prepare('SELECT * FROM trends WHERE id = ?').bind(trendId).first() as any;
  if (!trend) return NextResponse.json({ type: 4, data: { content: '❌ Trend not found.' } });

  // Safety: Ensure we haven't already published for this trend
  const alreadyPublished = await db.prepare('SELECT 1 FROM posts WHERE trend_id = ?').bind(trendId).first();
  if (alreadyPublished && command === 'go') {
    return NextResponse.json({ type: 4, data: { content: '⚠️ Article already published for this trend.' } });
  }

  if (command === 'sm') {
    const prompt = `Write a 2-sentence summary about the current trend: ${trend.topic}`;
    const summary = await generateWithGemini(prompt, GEMINI_API_KEY);
    return NextResponse.json({ 
      type: 4, 
      data: { content: summary ? `📑 **Summary for ${trend.topic}:**\n${summary}` : '❌ AI Error' } 
    });
  } else if (command === 'go') {
    // Show "Processing" state to user
    const result = await generateFullArticle(trend.topic, GEMINI_API_KEY, SERPER_API_KEY);
    
    if (!result) return NextResponse.json({ type: 4, data: { content: '❌ Failed to generate article.' } });

    await db.prepare(`
      INSERT INTO posts (title, content, slug, summary, trend_id, status, published_at) 
      VALUES (?, ?, ?, ?, ?, 'published', CURRENT_TIMESTAMP)
    `).bind(result.title, result.content, result.slug, result.summary, trendId).run();

    return NextResponse.json({ 
      type: 4,
      data: { content: `✅ **Published Article:** ${result.title}\nURL: /blog/${result.slug}` } 
    });
  }

  return NextResponse.json({ type: 4, data: { content: 'Unknown command.' } });
}
