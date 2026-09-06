export const config = { maxDuration: 60 };

import { getOverrides, saveOverrides } from './overrides-store.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Kun POST tilladt' });
  }

  const { secret, matchId, date, time, remove } = req.body || {};

  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Forkert adgangskode' });
  }

  if (!matchId) {
    return res.status(400).json({ error: 'Match ID mangler' });
  }

  const overrides = await getOverrides();

  if (remove) {
    delete overrides[matchId];
  } else {
    if (!date || !time) {
      return res.status(400).json({ error: 'Dato og tid skal udfyldes' });
    }
    overrides[matchId] = { date, time };
  }

  await saveOverrides(overrides);

  try {
    await fetch(`https://${req.headers.host}/api/refresh`);
  } catch {}

  res.status(200).json({ ok: true, overrides });
}
