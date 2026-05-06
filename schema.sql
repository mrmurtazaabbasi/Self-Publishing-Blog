CREATE TABLE IF NOT EXISTS trends (
  id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  keywords TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  status TEXT DEFAULT 'draft', -- draft, published
  trend_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  published_at DATETIME,
  FOREIGN KEY (trend_id) REFERENCES trends(id)
);
CREATE TABLE IF NOT EXISTS notified_trends (trend_id TEXT PRIMARY KEY, notified_at DATETIME DEFAULT CURRENT_TIMESTAMP);
