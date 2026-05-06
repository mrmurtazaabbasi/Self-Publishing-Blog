# AI Self-Publishing Blog

An automated blogging system built with Next.js, Cloudflare D1, and AI.

## Features
- **Automated Trend Fetching**: Scans Google Trends daily (Cron Job).
- **Approval Workflow**: Sends discovered trends to Slack/Discord.
- **AI Content Generation**: Generates SEO-rich articles with facts and media resources.
- **Cloudflare Native**: Runs on Cloudflare Pages with D1 Database.
- **SEO Optimized**: Built-in meta tags and semantic HTML.

## Setup Instructions

### 1. Cloudflare D1 Setup
Initialize your database and apply the schema:
```bash
npx wrangler d1 create blog_db
# Update wrangler.toml with the generated database_id
npx wrangler d1 execute blog_db --file=schema.sql
```

### 2. Notifications Configuration
Set your webhook URLs in Cloudflare:
```bash
npx wrangler pages secret put SLACK_WEBHOOK_URL
npx wrangler pages secret put DISCORD_WEBHOOK_URL
```

### 3. Local Development
```bash
npm install
npm run dev
```

### 4. Deployment
```bash
npm run build
npx wrangler pages deploy .next
```

## Approval Mechanism
When a trend is found, you'll get a message on Slack/Discord.
Reply with:
- `{trendId} sm`: Generate a short summary.
- `{trendId} go`: Generate full article and post it.

## Infrastructure
- **Frontend**: Next.js (App Router)
- **Database**: Cloudflare D1
- **Cron**: Cloudflare Workers Cron Triggers
- **Hosting**: Cloudflare Pages
