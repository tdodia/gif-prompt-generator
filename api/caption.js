// Vercel serverless function — runs server-side only. The Anthropic API key
// lives in an environment variable (set in Vercel project settings), never
// shipped to the browser, unlike the GIPHY key used elsewhere in this app.
export default async function handler(req, res) {
  // Allow cross-origin calls — the Chrome extension has no backend of its
  // own, so it calls this function directly from a chrome-extension://
  // origin, not from this site's own origin. Safe to leave open since this
  // endpoint doesn't return anything user-specific or sensitive.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server missing ANTHROPIC_API_KEY' });
    return;
  }

  const { prompt, avoid } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Missing prompt' });
    return;
  }

  const avoidLine = avoid
    ? `\n\nDo not reuse this exact previous line: "${avoid}"`
    : '';

  const instruction =
    'Translate this casual workplace scenario or complaint into overly formal, ' +
    'ironic corporate-speak, as if it were a Slack message or status update email. ' +
    'One sentence only. No quotes, no preamble, no explanation — just the translated line.' +
    avoidLine +
    `\n\nScenario: "${prompt}"`;

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 80,
        messages: [{ role: 'user', content: instruction }],
      }),
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: 'Upstream request failed' });
      return;
    }

    const data = await upstream.json();
    const text = data && data.content && data.content[0] && data.content[0].text
      ? data.content[0].text.trim().replace(/^"|"$/g, '')
      : null;

    if (!text) {
      res.status(502).json({ error: 'No caption returned' });
      return;
    }

    res.status(200).json({ caption: text });
  } catch (err) {
    res.status(500).json({ error: 'Request failed' });
  }
}
