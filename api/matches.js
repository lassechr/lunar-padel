export const config = { maxDuration: 30 };

export default async function handler(request) {
  const res = await fetch(
    'https://api.rankedin.com/v1/teamleague/GetTeamMatchesAsync?teamid=3281205&language=en'
  );
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { 'content-type': 'application/json' },
  });
}
