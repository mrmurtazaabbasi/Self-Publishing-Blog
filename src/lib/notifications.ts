export async function sendNotification(topic: string, keywords: string[], trendId: string, discordUrl?: string) {
  const messageText = `🚀 **New Trend Discovered:** ${topic}\n**Keywords:** ${keywords.join(', ')}\n**ID:** ${trendId}`;

  if (discordUrl) {
    // Discord Webhook with Buttons (Action Row)
    await fetch(discordUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: messageText,
        components: [
          {
            type: 1, // Action Row
            components: [
              {
                type: 2, // Button
                style: 1, // Primary (Blue)
                label: "Get Summary (sm)",
                custom_id: `${trendId}:sm`
              },
              {
                type: 2,
                style: 3, // Success (Green)
                label: "Publish Article (go)",
                custom_id: `${trendId}:go`
              }
            ]
          }
        ]
      }),
    });
  }
}
