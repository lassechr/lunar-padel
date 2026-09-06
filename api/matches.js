import { list } from '@vercel/blob';

export default async function handler(req, res) {
  try {
    const { blobs } = await list({ prefix: 'matches.json', limit: 1 });
    if (blobs.length === 0) {
      return res.status(503).json({ error: 'Ingen data endnu — kald /api/refresh først' });
    }
    const response = await fetch(blobs[0].url);
    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=60');
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
