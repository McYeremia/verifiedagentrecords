export type Match = {
  id: string
  apiId: number
  homeTeam: string
  awayTeam: string
  date: string
  time: string
  group: string
  venue: string
  result: null | { winner: string | null; homeScore: number; awayScore: number }
}

export const matches: Match[] = [
  // ── GROUP A ──────────────────────────────────────────────────
  { id: "match_537327", apiId: 537327, homeTeam: "Mexico", awayTeam: "South Africa", date: "2026-06-12", time: "02:00 WIB", group: "Group A", venue: "Estadio Azteca", result: null },
  { id: "match_537328", apiId: 537328, homeTeam: "South Korea", awayTeam: "Czechia", date: "2026-06-12", time: "09:00 WIB", group: "Group A", venue: "Estadio Akron", result: null },
  { id: "match_537329", apiId: 537329, homeTeam: "Czechia", awayTeam: "South Africa", date: "2026-06-18", time: "23:00 WIB", group: "Group A", venue: "SoFi Stadium", result: null },
  { id: "match_537330", apiId: 537330, homeTeam: "Mexico", awayTeam: "South Korea", date: "2026-06-19", time: "08:00 WIB", group: "Group A", venue: "Rose Bowl", result: null },
  { id: "match_537331", apiId: 537331, homeTeam: "Czechia", awayTeam: "Mexico", date: "2026-06-25", time: "08:00 WIB", group: "Group A", venue: "MetLife Stadium", result: null },
  { id: "match_537332", apiId: 537332, homeTeam: "South Africa", awayTeam: "South Korea", date: "2026-06-25", time: "08:00 WIB", group: "Group A", venue: "AT&T Stadium", result: null },

  // ── GROUP B ──────────────────────────────────────────────────
  { id: "match_537333", apiId: 537333, homeTeam: "Canada", awayTeam: "Bosnia-Herz.", date: "2026-06-13", time: "02:00 WIB", group: "Group B", venue: "Estadio Azteca", result: null },
  { id: "match_537334", apiId: 537334, homeTeam: "Qatar", awayTeam: "Switzerland", date: "2026-06-14", time: "02:00 WIB", group: "Group B", venue: "AT&T Stadium", result: null },
  { id: "match_537335", apiId: 537335, homeTeam: "Switzerland", awayTeam: "Bosnia-Herz.", date: "2026-06-19", time: "02:00 WIB", group: "Group B", venue: "Levi's Stadium", result: null },
  { id: "match_537336", apiId: 537336, homeTeam: "Canada", awayTeam: "Qatar", date: "2026-06-19", time: "05:00 WIB", group: "Group B", venue: "BC Place", result: null },
  { id: "match_537337", apiId: 537337, homeTeam: "Switzerland", awayTeam: "Canada", date: "2026-06-25", time: "02:00 WIB", group: "Group B", venue: "Estadio Azteca", result: null },
  { id: "match_537338", apiId: 537338, homeTeam: "Bosnia-Herz.", awayTeam: "Qatar", date: "2026-06-25", time: "02:00 WIB", group: "Group B", venue: "Levi's Stadium", result: null },

  // ── GROUP C ──────────────────────────────────────────────────
  { id: "match_537339", apiId: 537339, homeTeam: "Brazil", awayTeam: "Morocco", date: "2026-06-14", time: "05:00 WIB", group: "Group C", venue: "SoFi Stadium", result: null },
  { id: "match_537340", apiId: 537340, homeTeam: "Haiti", awayTeam: "Scotland", date: "2026-06-14", time: "08:00 WIB", group: "Group C", venue: "Rose Bowl", result: null },
  { id: "match_537341", apiId: 537341, homeTeam: "Brazil", awayTeam: "Haiti", date: "2026-06-20", time: "07:30 WIB", group: "Group C", venue: "MetLife Stadium", result: null },
  { id: "match_537342", apiId: 537342, homeTeam: "Scotland", awayTeam: "Morocco", date: "2026-06-20", time: "05:00 WIB", group: "Group C", venue: "AT&T Stadium", result: null },
  { id: "match_537343", apiId: 537343, homeTeam: "Scotland", awayTeam: "Brazil", date: "2026-06-25", time: "05:00 WIB", group: "Group C", venue: "Rose Bowl", result: null },
  { id: "match_537344", apiId: 537344, homeTeam: "Morocco", awayTeam: "Haiti", date: "2026-06-25", time: "05:00 WIB", group: "Group C", venue: "SoFi Stadium", result: null },

  // ── GROUP D ──────────────────────────────────────────────────
  { id: "match_537345", apiId: 537345, homeTeam: "USA", awayTeam: "Paraguay", date: "2026-06-13", time: "08:00 WIB", group: "Group D", venue: "SoFi Stadium", result: null },
  { id: "match_537346", apiId: 537346, homeTeam: "Australia", awayTeam: "Turkey", date: "2026-06-14", time: "11:00 WIB", group: "Group D", venue: "Mercedes-Benz Stadium", result: null },
  { id: "match_537347", apiId: 537347, homeTeam: "Turkey", awayTeam: "Paraguay", date: "2026-06-20", time: "10:00 WIB", group: "Group D", venue: "SoFi Stadium", result: null },
  { id: "match_537348", apiId: 537348, homeTeam: "USA", awayTeam: "Australia", date: "2026-06-20", time: "02:00 WIB", group: "Group D", venue: "MetLife Stadium", result: null },
  { id: "match_537349", apiId: 537349, homeTeam: "Turkey", awayTeam: "USA", date: "2026-06-26", time: "09:00 WIB", group: "Group D", venue: "Rose Bowl", result: null },
  { id: "match_537350", apiId: 537350, homeTeam: "Paraguay", awayTeam: "Australia", date: "2026-06-26", time: "09:00 WIB", group: "Group D", venue: "AT&T Stadium", result: null },

  // ── GROUP E ──────────────────────────────────────────────────
  { id: "match_537351", apiId: 537351, homeTeam: "Germany", awayTeam: "Curaçao", date: "2026-06-15", time: "00:00 WIB", group: "Group E", venue: "MetLife Stadium", result: null },
  { id: "match_537352", apiId: 537352, homeTeam: "Ivory Coast", awayTeam: "Ecuador", date: "2026-06-15", time: "06:00 WIB", group: "Group E", venue: "AT&T Stadium", result: null },
  { id: "match_537353", apiId: 537353, homeTeam: "Germany", awayTeam: "Ivory Coast", date: "2026-06-21", time: "03:00 WIB", group: "Group E", venue: "Levi's Stadium", result: null },
  { id: "match_537354", apiId: 537354, homeTeam: "Ecuador", awayTeam: "Curaçao", date: "2026-06-21", time: "07:00 WIB", group: "Group E", venue: "MetLife Stadium", result: null },
  { id: "match_537355", apiId: 537355, homeTeam: "Ecuador", awayTeam: "Germany", date: "2026-06-26", time: "03:00 WIB", group: "Group E", venue: "Rose Bowl", result: null },
  { id: "match_537356", apiId: 537356, homeTeam: "Curaçao", awayTeam: "Ivory Coast", date: "2026-06-26", time: "03:00 WIB", group: "Group E", venue: "SoFi Stadium", result: null },

  // ── GROUP F ──────────────────────────────────────────────────
  { id: "match_537357", apiId: 537357, homeTeam: "Netherlands", awayTeam: "Japan", date: "2026-06-15", time: "03:00 WIB", group: "Group F", venue: "Levi's Stadium", result: null },
  { id: "match_537358", apiId: 537358, homeTeam: "Sweden", awayTeam: "Tunisia", date: "2026-06-15", time: "09:00 WIB", group: "Group F", venue: "BC Place", result: null },
  { id: "match_537359", apiId: 537359, homeTeam: "Netherlands", awayTeam: "Sweden", date: "2026-06-21", time: "00:00 WIB", group: "Group F", venue: "SoFi Stadium", result: null },
  { id: "match_537360", apiId: 537360, homeTeam: "Tunisia", awayTeam: "Japan", date: "2026-06-21", time: "11:00 WIB", group: "Group F", venue: "Rose Bowl", result: null },
  { id: "match_537361", apiId: 537361, homeTeam: "Tunisia", awayTeam: "Netherlands", date: "2026-06-26", time: "06:00 WIB", group: "Group F", venue: "MetLife Stadium", result: null },
  { id: "match_537362", apiId: 537362, homeTeam: "Japan", awayTeam: "Sweden", date: "2026-06-26", time: "06:00 WIB", group: "Group F", venue: "AT&T Stadium", result: null },

  // ── GROUP G ──────────────────────────────────────────────────
  { id: "match_537363", apiId: 537363, homeTeam: "Belgium", awayTeam: "Egypt", date: "2026-06-16", time: "02:00 WIB", group: "Group G", venue: "Estadio Azteca", result: null },
  { id: "match_537364", apiId: 537364, homeTeam: "Iran", awayTeam: "New Zealand", date: "2026-06-16", time: "08:00 WIB", group: "Group G", venue: "SoFi Stadium", result: null },
  { id: "match_537365", apiId: 537365, homeTeam: "Belgium", awayTeam: "Iran", date: "2026-06-22", time: "02:00 WIB", group: "Group G", venue: "MetLife Stadium", result: null },
  { id: "match_537366", apiId: 537366, homeTeam: "New Zealand", awayTeam: "Egypt", date: "2026-06-22", time: "08:00 WIB", group: "Group G", venue: "AT&T Stadium", result: null },
  { id: "match_537367", apiId: 537367, homeTeam: "New Zealand", awayTeam: "Belgium", date: "2026-06-27", time: "10:00 WIB", group: "Group G", venue: "Rose Bowl", result: null },
  { id: "match_537368", apiId: 537368, homeTeam: "Egypt", awayTeam: "Iran", date: "2026-06-27", time: "10:00 WIB", group: "Group G", venue: "Levi's Stadium", result: null },

  // ── GROUP H ──────────────────────────────────────────────────
  { id: "match_537369", apiId: 537369, homeTeam: "Spain", awayTeam: "Cape Verde", date: "2026-06-15", time: "23:00 WIB", group: "Group H", venue: "Mercedes-Benz Stadium", result: null },
  { id: "match_537370", apiId: 537370, homeTeam: "Saudi Arabia", awayTeam: "Uruguay", date: "2026-06-16", time: "05:00 WIB", group: "Group H", venue: "BC Place", result: null },
  { id: "match_537371", apiId: 537371, homeTeam: "Spain", awayTeam: "Saudi Arabia", date: "2026-06-21", time: "23:00 WIB", group: "Group H", venue: "SoFi Stadium", result: null },
  { id: "match_537372", apiId: 537372, homeTeam: "Uruguay", awayTeam: "Cape Verde", date: "2026-06-22", time: "05:00 WIB", group: "Group H", venue: "MetLife Stadium", result: null },
  { id: "match_537373", apiId: 537373, homeTeam: "Uruguay", awayTeam: "Spain", date: "2026-06-27", time: "07:00 WIB", group: "Group H", venue: "AT&T Stadium", result: null },
  { id: "match_537374", apiId: 537374, homeTeam: "Cape Verde", awayTeam: "Saudi Arabia", date: "2026-06-27", time: "07:00 WIB", group: "Group H", venue: "Rose Bowl", result: null },

  // ── GROUP I ──────────────────────────────────────────────────
  { id: "match_537391", apiId: 537391, homeTeam: "France", awayTeam: "Senegal", date: "2026-06-17", time: "02:00 WIB", group: "Group I", venue: "Rose Bowl", result: null },
  { id: "match_537392", apiId: 537392, homeTeam: "Iraq", awayTeam: "Norway", date: "2026-06-17", time: "05:00 WIB", group: "Group I", venue: "Levi's Stadium", result: null },
  { id: "match_537393", apiId: 537393, homeTeam: "France", awayTeam: "Iraq", date: "2026-06-23", time: "04:00 WIB", group: "Group I", venue: "SoFi Stadium", result: null },
  { id: "match_537394", apiId: 537394, homeTeam: "Norway", awayTeam: "Senegal", date: "2026-06-23", time: "07:00 WIB", group: "Group I", venue: "MetLife Stadium", result: null },
  { id: "match_537395", apiId: 537395, homeTeam: "Norway", awayTeam: "France", date: "2026-06-27", time: "02:00 WIB", group: "Group I", venue: "BC Place", result: null },
  { id: "match_537396", apiId: 537396, homeTeam: "Senegal", awayTeam: "Iraq", date: "2026-06-27", time: "02:00 WIB", group: "Group I", venue: "Estadio Azteca", result: null },

  // ── GROUP J ──────────────────────────────────────────────────
  { id: "match_537397", apiId: 537397, homeTeam: "Argentina", awayTeam: "Algeria", date: "2026-06-17", time: "08:00 WIB", group: "Group J", venue: "MetLife Stadium", result: null },
  { id: "match_537398", apiId: 537398, homeTeam: "Austria", awayTeam: "Jordan", date: "2026-06-17", time: "11:00 WIB", group: "Group J", venue: "AT&T Stadium", result: null },
  { id: "match_537399", apiId: 537399, homeTeam: "Argentina", awayTeam: "Austria", date: "2026-06-23", time: "00:00 WIB", group: "Group J", venue: "Rose Bowl", result: null },
  { id: "match_537400", apiId: 537400, homeTeam: "Jordan", awayTeam: "Algeria", date: "2026-06-23", time: "10:00 WIB", group: "Group J", venue: "SoFi Stadium", result: null },
  { id: "match_537401", apiId: 537401, homeTeam: "Jordan", awayTeam: "Argentina", date: "2026-06-28", time: "09:00 WIB", group: "Group J", venue: "Mercedes-Benz Stadium", result: null },
  { id: "match_537402", apiId: 537402, homeTeam: "Algeria", awayTeam: "Austria", date: "2026-06-28", time: "09:00 WIB", group: "Group J", venue: "AT&T Stadium", result: null },

  // ── GROUP K ──────────────────────────────────────────────────
  { id: "match_537403", apiId: 537403, homeTeam: "Portugal", awayTeam: "Congo DR", date: "2026-06-18", time: "00:00 WIB", group: "Group K", venue: "Rose Bowl", result: null },
  { id: "match_537404", apiId: 537404, homeTeam: "Uzbekistan", awayTeam: "Colombia", date: "2026-06-18", time: "09:00 WIB", group: "Group K", venue: "SoFi Stadium", result: null },
  { id: "match_537405", apiId: 537405, homeTeam: "Portugal", awayTeam: "Uzbekistan", date: "2026-06-24", time: "00:00 WIB", group: "Group K", venue: "MetLife Stadium", result: null },
  { id: "match_537406", apiId: 537406, homeTeam: "Colombia", awayTeam: "Congo DR", date: "2026-06-24", time: "09:00 WIB", group: "Group K", venue: "AT&T Stadium", result: null },
  { id: "match_537407", apiId: 537407, homeTeam: "Colombia", awayTeam: "Portugal", date: "2026-06-28", time: "06:30 WIB", group: "Group K", venue: "Levi's Stadium", result: null },
  { id: "match_537408", apiId: 537408, homeTeam: "Congo DR", awayTeam: "Uzbekistan", date: "2026-06-28", time: "06:30 WIB", group: "Group K", venue: "BC Place", result: null },

  // ── GROUP L ──────────────────────────────────────────────────
  { id: "match_537409", apiId: 537409, homeTeam: "England", awayTeam: "Croatia", date: "2026-06-18", time: "03:00 WIB", group: "Group L", venue: "AT&T Stadium", result: null },
  { id: "match_537410", apiId: 537410, homeTeam: "Ghana", awayTeam: "Panama", date: "2026-06-18", time: "06:00 WIB", group: "Group L", venue: "Mercedes-Benz Stadium", result: null },
  { id: "match_537411", apiId: 537411, homeTeam: "England", awayTeam: "Ghana", date: "2026-06-24", time: "03:00 WIB", group: "Group L", venue: "Estadio Azteca", result: null },
  { id: "match_537412", apiId: 537412, homeTeam: "Panama", awayTeam: "Croatia", date: "2026-06-24", time: "06:00 WIB", group: "Group L", venue: "Rose Bowl", result: null },
  { id: "match_537413", apiId: 537413, homeTeam: "Panama", awayTeam: "England", date: "2026-06-28", time: "04:00 WIB", group: "Group L", venue: "SoFi Stadium", result: null },
  { id: "match_537414", apiId: 537414, homeTeam: "Croatia", awayTeam: "Ghana", date: "2026-06-28", time: "04:00 WIB", group: "Group L", venue: "MetLife Stadium", result: null },

  // ── ROUND OF 32 (LAST_32) ────────────────────────────────────
  // Teams/times pulled from football-data.org (utcDate +07:00 = WIB). Venues TBD (API null).
  { id: "match_537417", apiId: 537417, homeTeam: "South Africa", awayTeam: "Canada", date: "2026-06-29", time: "02:00 WIB", group: "Round of 32", venue: "TBD", result: null },
  { id: "match_537423", apiId: 537423, homeTeam: "Brazil", awayTeam: "Japan", date: "2026-06-30", time: "00:00 WIB", group: "Round of 32", venue: "TBD", result: null },
  { id: "match_537415", apiId: 537415, homeTeam: "Germany", awayTeam: "Paraguay", date: "2026-06-30", time: "03:30 WIB", group: "Round of 32", venue: "TBD", result: null },
  { id: "match_537418", apiId: 537418, homeTeam: "Netherlands", awayTeam: "Morocco", date: "2026-06-30", time: "08:00 WIB", group: "Round of 32", venue: "TBD", result: null },
  { id: "match_537424", apiId: 537424, homeTeam: "Ivory Coast", awayTeam: "Norway", date: "2026-07-01", time: "00:00 WIB", group: "Round of 32", venue: "TBD", result: null },
  { id: "match_537416", apiId: 537416, homeTeam: "France", awayTeam: "Sweden", date: "2026-07-01", time: "04:00 WIB", group: "Round of 32", venue: "TBD", result: null },
  { id: "match_537425", apiId: 537425, homeTeam: "Mexico", awayTeam: "Ecuador", date: "2026-07-01", time: "08:00 WIB", group: "Round of 32", venue: "TBD", result: null },
  { id: "match_537426", apiId: 537426, homeTeam: "England", awayTeam: "Congo DR", date: "2026-07-01", time: "23:00 WIB", group: "Round of 32", venue: "TBD", result: null },
  { id: "match_537422", apiId: 537422, homeTeam: "Belgium", awayTeam: "Senegal", date: "2026-07-02", time: "03:00 WIB", group: "Round of 32", venue: "TBD", result: null },
  { id: "match_537421", apiId: 537421, homeTeam: "USA", awayTeam: "Bosnia-Herz.", date: "2026-07-02", time: "07:00 WIB", group: "Round of 32", venue: "TBD", result: null },
  { id: "match_537420", apiId: 537420, homeTeam: "Spain", awayTeam: "Austria", date: "2026-07-03", time: "02:00 WIB", group: "Round of 32", venue: "TBD", result: null },
  { id: "match_537419", apiId: 537419, homeTeam: "Portugal", awayTeam: "Croatia", date: "2026-07-03", time: "06:00 WIB", group: "Round of 32", venue: "TBD", result: null },
  { id: "match_537429", apiId: 537429, homeTeam: "Switzerland", awayTeam: "Algeria", date: "2026-07-03", time: "10:00 WIB", group: "Round of 32", venue: "TBD", result: null },
  { id: "match_537428", apiId: 537428, homeTeam: "Australia", awayTeam: "Egypt", date: "2026-07-04", time: "01:00 WIB", group: "Round of 32", venue: "TBD", result: null },
  { id: "match_537427", apiId: 537427, homeTeam: "Argentina", awayTeam: "Cape Verde", date: "2026-07-04", time: "05:00 WIB", group: "Round of 32", venue: "TBD", result: null },
  { id: "match_537430", apiId: 537430, homeTeam: "Colombia", awayTeam: "Ghana", date: "2026-07-04", time: "08:30 WIB", group: "Round of 32", venue: "TBD", result: null },
]

export const getCompletedMatches = () => matches.filter(m => m.result !== null)
export const getMatchById = (id: string) => matches.find(m => m.id === id) ?? null
export const getMatchByApiId = (apiId: number) => matches.find(m => m.apiId === apiId) ?? null

// Kickoff as an absolute instant. `time` is "HH:MM WIB" (UTC+7) on the WIB `date`,
// so a fixed +07:00 offset makes this consistent on both client and server.
export const getKickoff = (match: Match): Date => {
  const hhmm = match.time.replace(/\s*WIB\s*/i, "").trim() // "02:00 WIB" → "02:00"
  return new Date(`${match.date}T${hhmm}:00+07:00`)
}

// Predictions lock at kickoff — no calls allowed once the match has started.
export const isPredictionClosed = (match: Match): boolean => {
  const k = getKickoff(match).getTime()
  return Number.isFinite(k) && Date.now() >= k
}

// Only matches whose prediction window is still open (before kickoff),
// sorted by kickoff time ascending so the nearest match is always first.
export const getUpcomingMatches = () => {
  return matches
    .filter(m => !isPredictionClosed(m) && m.result === null)
    .sort((a, b) => getKickoff(a).getTime() - getKickoff(b).getTime())
}

export const FLAG_CODE: Record<string, string> = {
  "Mexico": "mx", "South Africa": "za", "South Korea": "kr", "Czechia": "cz",
  "Canada": "ca", "Bosnia-Herz.": "ba", "Qatar": "qa", "Switzerland": "ch",
  "Brazil": "br", "Morocco": "ma", "Haiti": "ht", "Scotland": "gb-sct",
  "USA": "us", "Paraguay": "py", "Australia": "au", "Turkey": "tr",
  "Germany": "de", "Curaçao": "cw", "Ivory Coast": "ci", "Ecuador": "ec",
  "Netherlands": "nl", "Japan": "jp", "Sweden": "se", "Tunisia": "tn",
  "Belgium": "be", "Egypt": "eg", "Iran": "ir", "New Zealand": "nz",
  "Spain": "es", "Saudi Arabia": "sa", "Uruguay": "uy", "Cape Verde": "cv",
  "France": "fr", "Senegal": "sn", "Iraq": "iq", "Norway": "no",
  "Argentina": "ar", "Algeria": "dz", "Austria": "at", "Jordan": "jo",
  "Portugal": "pt", "Congo DR": "cd", "Uzbekistan": "uz", "Colombia": "co",
  "England": "gb-eng", "Croatia": "hr", "Ghana": "gh", "Panama": "pa",
}

export const getFlagUrl = (team: string, width = 80): string => {
  const code = FLAG_CODE[team]
  return code ? `https://flagcdn.com/w${width}/${code}.png` : ""
}

export const TEAM_TLA: Record<string, string> = {
  "Mexico": "MEX", "South Africa": "RSA", "South Korea": "KOR", "Czechia": "CZE",
  "Canada": "CAN", "Bosnia-Herz.": "BIH", "Qatar": "QAT", "Switzerland": "SUI",
  "Brazil": "BRA", "Morocco": "MAR", "Haiti": "HAI", "Scotland": "SCO",
  "USA": "USA", "Paraguay": "PAR", "Australia": "AUS", "Turkey": "TUR",
  "Germany": "GER", "Curaçao": "CUW", "Ivory Coast": "CIV", "Ecuador": "ECU",
  "Netherlands": "NED", "Japan": "JPN", "Sweden": "SWE", "Tunisia": "TUN",
  "Belgium": "BEL", "Egypt": "EGY", "Iran": "IRN", "New Zealand": "NZL",
  "Spain": "ESP", "Saudi Arabia": "KSA", "Uruguay": "URU", "Cape Verde": "CPV",
  "France": "FRA", "Senegal": "SEN", "Iraq": "IRQ", "Norway": "NOR",
  "Argentina": "ARG", "Algeria": "ALG", "Austria": "AUT", "Jordan": "JOR",
  "Portugal": "POR", "Congo DR": "COD", "Uzbekistan": "UZB", "Colombia": "COL",
  "England": "ENG", "Croatia": "CRO", "Ghana": "GHA", "Panama": "PAN",
}

export const getTLA = (team: string): string =>
  TEAM_TLA[team] ?? team.slice(0, 3).toUpperCase()
