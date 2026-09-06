// Manuelle rettelser når RankedIn's dato er forkert (fx efter deadline for at flytte kampe).
// Find matchId'et i /api/matches (feltet "matchId"), og skriv den KORREKTE dato/tid herunder.
// Format: dato = "DD/MM/YYYY", tid = "DD/MM/YYYY HH:MM"
export const overrides = {
  152188: { date: '04/09/2026', time: '04/09/2026 19:01' },
};
