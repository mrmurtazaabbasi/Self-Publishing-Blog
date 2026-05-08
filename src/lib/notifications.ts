export async function sendNotification(topic: string, keywords: string[], trendId: string, discordUrl?: string, baseUrl?: string) {
  const approveUrl = `${baseUrl}/api/webhook?id=${trendId}&action=go`;
  const summaryUrl = `${baseUrl}/api/webhook?id=${trendId}&action=sm`;

  const messageText = `🚀 **New Trend Discovered:** ${topic}\n**Keywords:** ${keywords.join(', ')}\n\n[📝 Get Summary](${summaryUrl})  |  [✅ Publish Article](${approveUrl})`;

  if (discordUrl) {
    await fetch(discordUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: messageText,
      }),
    });
  }
}
