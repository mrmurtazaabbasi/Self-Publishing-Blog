import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Self Publishing AI Blog',
  description: 'AI-powered automated blog with the latest trends and resources.',
  keywords: ['AI Blog', 'Automation', 'Self Publishing', 'Tech Trends'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <div className="container nav-content">
            <div className="logo">AI-Blog</div>
            <div className="nav-links">
              {/* Add nav links here if needed */}
            </div>
          </div>
        </nav>
        <main className="main">
          {children}
        </main>
        <footer style={{ padding: '4rem 0', borderTop: '1px solid var(--card-border)', marginTop: '4rem' }}>
          <div className="container" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>&copy; {new Date().getFullYear()} AI-Blog. Powered by Cloudflare D1 & AI.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
