export type Match = {
  id: string
  homeTeam: string
  awayTeam: string
  homeFlag: string
  awayFlag: string
  date: string
  time: string
  group: string
  venue: string
  result: null | { winner: string; homeScore: number; awayScore: number }
}

export const matches: Match[] = [
  { id: "match_001", homeTeam: "Mexico", awayTeam: "South Africa", homeFlag: "🇲🇽", awayFlag: "🇿🇦", date: "2026-06-11", time: "03:00 WIB", group: "Group A", venue: "Estadio Azteca", result: null },
  { id: "match_002", homeTeam: "South Korea", awayTeam: "Czechia", homeFlag: "🇰🇷", awayFlag: "🇨🇿", date: "2026-06-11", time: "10:00 WIB", group: "Group A", venue: "Estadio Akron", result: null },
  { id: "match_003", homeTeam: "Brazil", awayTeam: "Morocco", homeFlag: "🇧🇷", awayFlag: "🇲🇦", date: "2026-06-13", time: "06:00 WIB", group: "Group C", venue: "SoFi Stadium", result: null },
  { id: "match_004", homeTeam: "Argentina", awayTeam: "Iceland", homeFlag: "🇦🇷", awayFlag: "🇮🇸", date: "2026-06-13", time: "09:00 WIB", group: "Group D", venue: "AT&T Stadium", result: null },
  { id: "match_005", homeTeam: "France", awayTeam: "Australia", homeFlag: "🇫🇷", awayFlag: "🇦🇺", date: "2026-06-14", time: "03:00 WIB", group: "Group E", venue: "Rose Bowl", result: null },
  { id: "match_006", homeTeam: "Germany", awayTeam: "Curacao", homeFlag: "🇩🇪", awayFlag: "🇨🇼", date: "2026-06-14", time: "06:00 WIB", group: "Group F", venue: "MetLife Stadium", result: null },
  { id: "match_007", homeTeam: "Spain", awayTeam: "Cape Verde", homeFlag: "🇪🇸", awayFlag: "🇨🇻", date: "2026-06-15", time: "00:00 WIB", group: "Group G", venue: "Mercedes-Benz Stadium", result: null },
  { id: "match_008", homeTeam: "England", awayTeam: "Croatia", homeFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", awayFlag: "🇭🇷", date: "2026-06-17", time: "09:00 WIB", group: "Group H", venue: "AT&T Stadium", result: null },
]

export const getUpcomingMatches = () => {
  const today = new Date().toISOString().split("T")[0]
  return matches.filter(m => m.date >= today && m.result === null)
}

export const getCompletedMatches = () => matches.filter(m => m.result !== null)
export const getMatchById = (id: string) => matches.find(m => m.id === id) ?? null
