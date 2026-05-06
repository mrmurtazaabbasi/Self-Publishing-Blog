import { getRequestContext } from '@cloudflare/next-on-pages';
import { notFound } from 'next/navigation';

export const runtime = 'edge';

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const env = getRequestContext().env;
  const db = env.DB;

  const post = await db.prepare('SELECT * FROM posts WHERE slug = ? AND status = "published"')
    .bind(slug)
    .first() as any;

  if (!post) {
    notFound();
  }

  return (
    <article className="container animate-fade-in" style={{ maxWidth: '800px', paddingBottom: '6rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <div className="blog-post-meta">Published on {new Date(post.published_at).toLocaleDateString()}</div>
        <h1 style={{ fontSize: '3rem' }}>{post.title}</h1>
      </header>
      
      <div className="blog-post-image" style={{ height: '400px', marginBottom: '3rem' }}>
        {/* In real app, use the fetched image URL */}
      </div>

      <div 
        className="blog-content" 
        dangerouslySetInnerHTML={{ __html: post.content }} 
        style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}
      />
    </article>
  )
}
