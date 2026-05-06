import { getRequestContext } from '@cloudflare/next-on-pages';
import Link from 'next/link';

export const runtime = 'edge';

export default async function Home() {
  const env = getRequestContext().env;
  const db = env.DB;

  let posts: any[] = [];
  try {
    const { results } = await db.prepare('SELECT * FROM posts WHERE status = "published" ORDER BY published_at DESC LIMIT 10').all();
    posts = results;
  } catch (e) {
    console.error('DB fetch error:', e);
  }

  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '6rem' }} className="animate-fade-in">
        <h1 style={{ marginBottom: '1.5rem' }}>Automated Insights,<br/><span style={{ color: 'var(--accent-color)' }}>AI-Powered Publishing.</span></h1>
        <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.25rem' }}>
          Discover daily trends, curated by AI and published automatically. 
          Stay ahead of the curve with facts, data, and deep dives.
        </p>
      </header>

      <section>
        <h2 style={{ marginBottom: '2rem' }}>Latest Stories</h2>
        <div className="blog-grid">
          {posts.length > 0 ? (
            posts.map((post, i) => (
              <article key={post.id} className="card blog-post-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="blog-post-image"></div>
                <div className="blog-post-meta">TREND • {new Date(post.published_at).toLocaleDateString()}</div>
                <h3 style={{ fontSize: '1.5rem' }}>{post.title}</h3>
                <p style={{ fontSize: '0.95rem' }}>{post.summary || 'Click to read the full analysis on this trending topic...'}</p>
                <Link href={`/blog/${post.slug}`} className="btn btn-primary" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>Read Article</Link>
              </article>
            ))
          ) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: 'var(--card-bg)', borderRadius: '1.5rem' }}>
              <h3>No articles yet.</h3>
              <p>The AI is currently scanning for the latest trends. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
