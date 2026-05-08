import { NextResponse } from 'next/server';
import { generateFullArticle, generateWithGemini } from '@/lib/ai';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

async function handleCommand(trendId: string, command: string, env: any) {
  const db = env.DB;
  const GEMINI_API_KEY = env.GEMINI_API_KEY;
  const SERPER_API_KEY = env.SERPER_API_KEY;

  const trend = await db.prepare('SELECT * FROM trends WHERE id = ?').bind(trendId).first() as any;
  if (!trend) return '❌ Trend not found.';

  const alreadyPublished = await db.prepare('SELECT 1 FROM posts WHERE trend_id = ?').bind(trendId).first();
  if (alreadyPublished && command === 'go') {
    return '⚠️ Article already published for this trend.';
  }

  if (command === 'sm') {
    const prompt = `Write a 2-sentence summary about the current trend: ${trend.topic}`;
    const summary = await generateWithGemini(prompt, GEMINI_API_KEY);
    return summary ? `📑 **Summary for ${trend.topic}:**\n${summary}` : '❌ AI Error';
  } else if (command === 'go') {
    const result = await generateFullArticle(trend.topic, GEMINI_API_KEY, SERPER_API_KEY);
    if (!result) return '❌ Failed to generate article.';

    await db.prepare(`
      INSERT INTO posts (title, content, slug, summary, trend_id, status, published_at) 
      VALUES (?, ?, ?, ?, ?, 'published', CURRENT_TIMESTAMP)
    `).bind(result.title, result.content, result.slug, result.summary, trendId).run();

    return `✅ **Published Article:** ${result.title}\nURL: /blog/${result.slug}`;
  }

  return 'Unknown command.';
}

export async function GET(request: Request) {
  const env = getRequestContext().env;
  const { searchParams } = new URL(request.url);
  const trendId = searchParams.get('id');
  const command = searchParams.get('action');

  if (!trendId || !command) return new Response('Missing params', { status: 400 });

  const result = await handleCommand(trendId, command, env);
  return new Response(`<h1>Blog Action Triggered</h1><p>${result}</p><a href="/">Go to Blog</a>`, {
    headers: { 'Content-Type': 'text/html' }
  });
}

export async function POST(request: Request) {
  const env = getRequestContext().env;
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

  const result = await handleCommand(trendId, command, env);
  return NextResponse.json({ type: 4, data: { content: result } });
}
