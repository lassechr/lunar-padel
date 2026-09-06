import { overrides } from './overrides.js';
export const config = { maxDuration: 60 };

import { put } from '@vercel/blob';

const ORG_ID = 10338; // SHI Hjørring Padel

function normalizeTeamName(name) {
  return name.replace(/(\p{L})(\d)/gu, '$1 $2');
}

async function fetchWithTimeout(url, ms = 10000) {
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
  const url = `https://api.rankedin.com/v1/Organization/GetOrganisationTeamLeaguesAsync?organisationId=${ORG_ID}&isFinished=false&skip=0&take=100&language=en`;
  const response = await fetchWithTimeout(url);
  const leagues = response?.payload ?? [];

  const teams = [];
  for (const league of leagues) {
    const category = league.name.includes('4P') ? 'damer' : 'herrer';
    for (const team of league.teams) {
      teams.push({
        id: team.id,
        name: normalizeTeamName(team.name),
        division: team.division,
        region: team.region,
        category,
        league: league.name,
      });
    }
  }
  return teams;
}

async function fetchInBatches(teams, batchSize = 10) {
  const results = [];
  for (let i = 0; i < teams.length; i += batchSize) {
    const batch = teams.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((team) =>
        fetchWithTimeout(
          `https://api.rankedin.com/v1/teamleague/GetTeamMatchesAsync?teamid=${team.id}&language=en`
        ).then((data) => data?.matches ?? [])
      )
    );
    results.push(...batchResults);
  }
  return results;
}

export default async function handler(req, res) {
  try {
    const teams = await getOrgTeams();
    const teamById = Object.fromEntries(teams.map((t) => [t.id, t]));
    const matchLists = await fetchInBatches(teams, 10);

    const seen = new Set();
    const allMatches = [];

    for (const matches of matchLists) {
      for (const m of matches) {
        if (seen.has(m.matchId)) continue;
        seen.add(m.matchId);

        const isHome = teamById[m.team1.id] !== undefined;
        const shiTeam = isHome ? teamById[m.team1.id] : teamById[m.team2.id];

        const team1Known = teamById[m.team1.id];
        const team2Known = teamById[m.team2.id];

        allMatches.push({
          matchId: m.matchId,
          date: m.details?.date,
          time: m.details?.time,
          homeTeam: team1Known ? team1Known.name : m.team1.name,
          awayTeam: team2Known ? team2Known.name : m.team2.name,
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

    await put('matches.json', JSON.stringify({ matches: allMatches, updatedAt: new Date().toISOString() }), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    });

    res.status(200).json({ ok: true, count: allMatches.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
