import { getOverrides } from './overrides-store.js';

export default async function handler(req, res) {
  const overrides = await getOverrides();
  res.status(200).json({ overrides });
}
