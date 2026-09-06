export const config = { maxDuration: 30 };

export default async function handler(request) {
  const res = await fetch(
    'https://api.rankedin.com/v1/teamleague/GetTeamMatchesAsync?teamid=3281205&language=en',
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://rankedin.com/',
      },
    }
  );
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { 'content-type': 'application/json' },
  });
}
