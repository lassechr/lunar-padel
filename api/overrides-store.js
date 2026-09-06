import { list, put } from '@vercel/blob';

export async function getOverrides() {
  try {
    const { blobs } = await list({ prefix: 'overrides.json', limit: 1 });
    if (blobs.length === 0) return {};
    const res = await fetch(blobs[0].url);
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
