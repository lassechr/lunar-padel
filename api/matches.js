export const config = { maxDuration: 60 };

const ORG_ID = 10338; // SHI Hjørring Padel

async function fetchWithTimeout(url, ms = 15000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

async function getOrgTeams() {
  const urls = [
    `https://api.rankedin.com/v1/Organization/GetOrganisationTeamLeaguesAsync?organisationId=${ORG_ID}&isFinished=false&skip=0&take=100&language=en`,
    `https://api.rankedin.com/v1/Organization/GetOrganisationTeamLeaguesAsync?organisationId=${ORG_ID}&isFinished=true&skip=0&take=100&language=en`,
  ];

  const responses = await Promise.all(urls.map((u) => fetchWithTimeout(u)));
  const leagues = responses.filter(Boolean).flatMap((r) => r.payload ?? []);

  const teams = [];
  for (const league of leagues) {
    const category = league.name.includes('4P') ? 'damer' : 'herrer';
    for (const team of league.teams) {
      teams.push({
        id: team.id,
        name: team.name,
        division: team.division,
        region: team.region,
        category,
        league: league.name,
      });
    }
  }
  return teams;
}

export default async function handler(req, res) {
  try {
    const teams = await getOrgTeams();
    const teamById = Object.fromEntries(teams.map((t) => [t.id, t]));

    const matchLists = await Promise.all(
      teams.map((team) =>
        fetchWithTimeout(
          `https://api.rankedin.com/v1/teamleague/GetTeamMatchesAsync?teamid=${team.id}&language=en`
        ).then((data) => data?.matches ?? [])
      )
    );

    const seen = new Set();
    const allMatches = [];

    for (const matches of matchLists) {
      for (const m of matches) {
        if (seen.has(m.matchId)) continue;
        seen.add(m.matchId);

        const isHome = teamById[m.team1.id] !== undefined;
        const shiTeam = isHome ? teamById[m.team1.id] : teamById[m.team2.id];

        allMatches.push({
          matchId: m.matchId,
          date: m.details?.date,
          time: m.details?.time,
          homeTeam: m.team1.name,
          awayTeam: m.team2.name,
          location: m.location,
          isHomeMatch: isHome,
          result: m.showResults ? `${m.team1.result} - ${m.team2.result}` : null,
          team: shiTeam?.name,
          category: shiTeam?.category,
          division: shiTeam?.division,
        });
      }
    }

    allMatches.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

    res.setHeader('Cache-Control', 's-maxage=1800');
    res.status(200).json({ matches: allMatches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
