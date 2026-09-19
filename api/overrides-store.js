import { put } from '@vercel/blob';

const OVERRIDES_URL = 'https://udfows3yalpli3zt.public.blob.vercel-storage.com/overrides.json';

export async function getOverrides() {
  try {
    const res = await fetch(OVERRIDES_URL, { cache: 'no-store' });
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

export async function saveOverrides(overrides) {
  await put('overrides.json', JSON.stringify(overrides), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}
