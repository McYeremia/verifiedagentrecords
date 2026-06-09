export const matches = [
  { id: "match_001", homeTeam: "Mexico", awayTeam: "South Africa", date: "2026-06-11", result: null },
  { id: "match_002", homeTeam: "South Korea", awayTeam: "Czechia", date: "2026-06-11", result: null },
  { id: "match_003", homeTeam: "Brazil", awayTeam: "Morocco", date: "2026-06-13", result: null },
  { id: "match_004", homeTeam: "Argentina", awayTeam: "Iceland", date: "2026-06-13", result: null },
  { id: "match_005", homeTeam: "France", awayTeam: "Australia", date: "2026-06-14", result: null },
  { id: "match_006", homeTeam: "Germany", awayTeam: "Curacao", date: "2026-06-14", result: null },
  { id: "match_007", homeTeam: "Spain", awayTeam: "Cape Verde", date: "2026-06-15", result: null },
  { id: "match_008", homeTeam: "England", awayTeam: "Croatia", date: "2026-06-17", result: null },
];

export function getMatchById(id: string) {
  return matches.find((m) => m.id === id) || null;
}

export function getUpcomingMatches() {
  const today = new Date().toISOString().split("T")[0];
  return matches.filter((m) => m.date >= today);
}