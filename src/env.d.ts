interface CloudflareEnv {
  DB: D1Database;
  SLACK_WEBHOOK_URL: string;
  DISCORD_WEBHOOK_URL: string;
  GEMINI_API_KEY: string;
  SERPER_API_KEY: string;
  AI: any; // Cloudflare Workers AI binding
}

declare namespace NodeJS {
  interface ProcessEnv extends CloudflareEnv {}
}
