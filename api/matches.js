export const config = { runtime: 'edge' };

const TEAM_IDS = [
  3281205, // SHI Hjørring Padel Herre 1
  // tilføj flere hold-ID'er her efterhånden som du finder dem
];

const CLUB_NAME_MATCH = 'SHI Hjørring';

export default async function handler(request) {
  try {
    const results = await Promise.all(
      TEAM_IDS.map(async (teamId) => {
        const res = await fetch(
          `https://api.rankedin.com/v1/teamleague/GetTeamMatchesAsync?teamid=${teamId}&language=en`
        );
        if (!res.ok) throw new Error(`RankedIn svarede ${res.status} for team ${teamId}`);
        const data = await res.json();
        return data.matches ?? [];
      })
    );

    const allMatches = results.flat().map((m) => {
      const isHome = m.team1.name.includes(CLUB_NAME_MATCH);
      return {
        matchId: m.matchId,
        date: m.details?.date,
        time: m.details?.time,
        homeTeam: m.team1.name,
        awayTeam: m.team2.name,
        location: m.location,
        isHomeMatch: isHome,
        result: m.showResults ? `${m.team1.result} - ${m.team2.result}` : null,
      };
    });

    allMatches.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

    return new Response(JSON.stringify({ matches: allMatches }), {
      headers: { 'content-type': 'application/json', 'cache-control': 's-maxage=1800' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
