export const config = { maxDuration: 30 };

export default async function handler(request) {
  console.log('Starter fetch mod RankedIn...');
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    console.log('Timeout ramt efter 10 sek - aborter kaldet');
    controller.abort();
  }, 10000);

  try {
    const res = await fetch(
      'https://api.rankedin.com/v1/teamleague/GetTeamMatchesAsync?teamid=3281205&language=en',
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    console.log('Fik svar med status:', res.status);
    const data = await res.json();
    console.log('JSON parset OK');
    return new Response(JSON.stringify(data), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    clearTimeout(timeout);
    console.log('FEJL:', err.name, err.message);
    return new Response(JSON.stringify({ error: err.name, message: err.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
