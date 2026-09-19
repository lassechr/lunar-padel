const MATCHES_URL = 'https://udfows3yalpli3zt.public.blob.vercel-storage.com/matches.json';

export default async function handler(req, res) {
  try {
    const response = await fetch(MATCHES_URL, { cache: 'no-store' });
    if (!response.ok) {
      return res.status(503).json({ error: 'Ingen data endnu — kald /api/refresh først' });
    }
    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=60');
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
