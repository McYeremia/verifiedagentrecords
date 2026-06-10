export type Match = {
  id: string
  apiId: number
  homeTeam: string
  awayTeam: string
  homeFlag: string
  awayFlag: string
  date: string
  time: string
  group: string
  venue: string
  result: null | { winner: string | null; homeScore: number; awayScore: number }
}

export const matches: Match[] = [
  // ── GROUP A ──────────────────────────────────────────────────
  { id: "match_537327", apiId: 537327, homeTeam: "Mexico", awayTeam: "South Africa", homeFlag: "🇲🇽", awayFlag: "🇿🇦", date: "2026-06-12", time: "02:00 WIB", group: "Group A", venue: "Estadio Azteca", result: null },
  { id: "match_537328", apiId: 537328, homeTeam: "South Korea", awayTeam: "Czechia", homeFlag: "🇰🇷", awayFlag: "🇨🇿", date: "2026-06-12", time: "09:00 WIB", group: "Group A", venue: "Estadio Akron", result: null },
  { id: "match_537329", apiId: 537329, homeTeam: "Czechia", awayTeam: "South Africa", homeFlag: "🇨🇿", awayFlag: "🇿🇦", date: "2026-06-19", time: "06:00 WIB", group: "Group A", venue: "SoFi Stadium", result: null },
  { id: "match_537330", apiId: 537330, homeTeam: "Mexico", awayTeam: "South Korea", homeFlag: "🇲🇽", awayFlag: "🇰🇷", date: "2026-06-19", time: "15:00 WIB", group: "Group A", venue: "Rose Bowl", result: null },
  { id: "match_537331", apiId: 537331, homeTeam: "Czechia", awayTeam: "Mexico", homeFlag: "🇨🇿", awayFlag: "🇲🇽", date: "2026-06-25", time: "15:00 WIB", group: "Group A", venue: "MetLife Stadium", result: null },
  { id: "match_537332", apiId: 537332, homeTeam: "South Africa", awayTeam: "South Korea", homeFlag: "🇿🇦", awayFlag: "🇰🇷", date: "2026-06-25", time: "15:00 WIB", group: "Group A", venue: "AT&T Stadium", result: null },

  // ── GROUP B ──────────────────────────────────────────────────
  { id: "match_537333", apiId: 537333, homeTeam: "Canada", awayTeam: "Bosnia-Herz.", homeFlag: "🇨🇦", awayFlag: "🇧🇦", date: "2026-06-13", time: "02:00 WIB", group: "Group B", venue: "Estadio Azteca", result: null },
  { id: "match_537334", apiId: 537334, homeTeam: "Qatar", awayTeam: "Switzerland", homeFlag: "🇶🇦", awayFlag: "🇨🇭", date: "2026-06-14", time: "02:00 WIB", group: "Group B", venue: "AT&T Stadium", result: null },
  { id: "match_537335", apiId: 537335, homeTeam: "Switzerland", awayTeam: "Bosnia-Herz.", homeFlag: "🇨🇭", awayFlag: "🇧🇦", date: "2026-06-19", time: "09:00 WIB", group: "Group B", venue: "Levi's Stadium", result: null },
  { id: "match_537336", apiId: 537336, homeTeam: "Canada", awayTeam: "Qatar", homeFlag: "🇨🇦", awayFlag: "🇶🇦", date: "2026-06-19", time: "12:00 WIB", group: "Group B", venue: "BC Place", result: null },
  { id: "match_537337", apiId: 537337, homeTeam: "Switzerland", awayTeam: "Canada", homeFlag: "🇨🇭", awayFlag: "🇨🇦", date: "2026-06-25", time: "09:00 WIB", group: "Group B", venue: "Estadio Azteca", result: null },
  { id: "match_537338", apiId: 537338, homeTeam: "Bosnia-Herz.", awayTeam: "Qatar", homeFlag: "🇧🇦", awayFlag: "🇶🇦", date: "2026-06-25", time: "09:00 WIB", group: "Group B", venue: "Levi's Stadium", result: null },

  // ── GROUP C ──────────────────────────────────────────────────
  { id: "match_537339", apiId: 537339, homeTeam: "Brazil", awayTeam: "Morocco", homeFlag: "🇧🇷", awayFlag: "🇲🇦", date: "2026-06-14", time: "05:00 WIB", group: "Group C", venue: "SoFi Stadium", result: null },
  { id: "match_537340", apiId: 537340, homeTeam: "Haiti", awayTeam: "Scotland", homeFlag: "🇭🇹", awayFlag: "🏴", date: "2026-06-14", time: "08:00 WIB", group: "Group C", venue: "Rose Bowl", result: null },
  { id: "match_537341", apiId: 537341, homeTeam: "Brazil", awayTeam: "Haiti", homeFlag: "🇧🇷", awayFlag: "🇭🇹", date: "2026-06-20", time: "07:30 WIB", group: "Group C", venue: "MetLife Stadium", result: null },
  { id: "match_537342", apiId: 537342, homeTeam: "Scotland", awayTeam: "Morocco", homeFlag: "🏴", awayFlag: "🇲🇦", date: "2026-06-20", time: "05:00 WIB", group: "Group C", venue: "AT&T Stadium", result: null },
  { id: "match_537343", apiId: 537343, homeTeam: "Scotland", awayTeam: "Brazil", homeFlag: "🏴", awayFlag: "🇧🇷", date: "2026-06-25", time: "12:00 WIB", group: "Group C", venue: "Rose Bowl", result: null },
  { id: "match_537344", apiId: 537344, homeTeam: "Morocco", awayTeam: "Haiti", homeFlag: "🇲🇦", awayFlag: "🇭🇹", date: "2026-06-25", time: "12:00 WIB", group: "Group C", venue: "SoFi Stadium", result: null },

  // ── GROUP D ──────────────────────────────────────────────────
  { id: "match_537345", apiId: 537345, homeTeam: "USA", awayTeam: "Paraguay", homeFlag: "🇺🇸", awayFlag: "🇵🇾", date: "2026-06-13", time: "08:00 WIB", group: "Group D", venue: "SoFi Stadium", result: null },
  { id: "match_537346", apiId: 537346, homeTeam: "Australia", awayTeam: "Turkey", homeFlag: "🇦🇺", awayFlag: "🇹🇷", date: "2026-06-14", time: "11:00 WIB", group: "Group D", venue: "Mercedes-Benz Stadium", result: null },
  { id: "match_537347", apiId: 537347, homeTeam: "Turkey", awayTeam: "Paraguay", homeFlag: "🇹🇷", awayFlag: "🇵🇾", date: "2026-06-20", time: "10:00 WIB", group: "Group D", venue: "SoFi Stadium", result: null },
  { id: "match_537348", apiId: 537348, homeTeam: "USA", awayTeam: "Australia", homeFlag: "🇺🇸", awayFlag: "🇦🇺", date: "2026-06-20", time: "02:00 WIB", group: "Group D", venue: "MetLife Stadium", result: null },
  { id: "match_537349", apiId: 537349, homeTeam: "Turkey", awayTeam: "USA", homeFlag: "🇹🇷", awayFlag: "🇺🇸", date: "2026-06-26", time: "16:00 WIB", group: "Group D", venue: "Rose Bowl", result: null },
  { id: "match_537350", apiId: 537350, homeTeam: "Paraguay", awayTeam: "Australia", homeFlag: "🇵🇾", awayFlag: "🇦🇺", date: "2026-06-26", time: "16:00 WIB", group: "Group D", venue: "AT&T Stadium", result: null },

  // ── GROUP E ──────────────────────────────────────────────────
  { id: "match_537351", apiId: 537351, homeTeam: "Germany", awayTeam: "Curaçao", homeFlag: "🇩🇪", awayFlag: "🇨🇼", date: "2026-06-15", time: "00:00 WIB", group: "Group E", venue: "MetLife Stadium", result: null },
  { id: "match_537352", apiId: 537352, homeTeam: "Ivory Coast", awayTeam: "Ecuador", homeFlag: "🇨🇮", awayFlag: "🇪🇨", date: "2026-06-15", time: "06:00 WIB", group: "Group E", venue: "AT&T Stadium", result: null },
  { id: "match_537353", apiId: 537353, homeTeam: "Germany", awayTeam: "Ivory Coast", homeFlag: "🇩🇪", awayFlag: "🇨🇮", date: "2026-06-21", time: "03:00 WIB", group: "Group E", venue: "Levi's Stadium", result: null },
  { id: "match_537354", apiId: 537354, homeTeam: "Ecuador", awayTeam: "Curaçao", homeFlag: "🇪🇨", awayFlag: "🇨🇼", date: "2026-06-21", time: "07:00 WIB", group: "Group E", venue: "MetLife Stadium", result: null },
  { id: "match_537355", apiId: 537355, homeTeam: "Ecuador", awayTeam: "Germany", homeFlag: "🇪🇨", awayFlag: "🇩🇪", date: "2026-06-26", time: "10:00 WIB", group: "Group E", venue: "Rose Bowl", result: null },
  { id: "match_537356", apiId: 537356, homeTeam: "Curaçao", awayTeam: "Ivory Coast", homeFlag: "🇨🇼", awayFlag: "🇨🇮", date: "2026-06-26", time: "10:00 WIB", group: "Group E", venue: "SoFi Stadium", result: null },

  // ── GROUP F ──────────────────────────────────────────────────
  { id: "match_537357", apiId: 537357, homeTeam: "Netherlands", awayTeam: "Japan", homeFlag: "🇳🇱", awayFlag: "🇯🇵", date: "2026-06-15", time: "03:00 WIB", group: "Group F", venue: "Levi's Stadium", result: null },
  { id: "match_537358", apiId: 537358, homeTeam: "Sweden", awayTeam: "Tunisia", homeFlag: "🇸🇪", awayFlag: "🇹🇳", date: "2026-06-15", time: "09:00 WIB", group: "Group F", venue: "BC Place", result: null },
  { id: "match_537359", apiId: 537359, homeTeam: "Netherlands", awayTeam: "Sweden", homeFlag: "🇳🇱", awayFlag: "🇸🇪", date: "2026-06-21", time: "00:00 WIB", group: "Group F", venue: "SoFi Stadium", result: null },
  { id: "match_537360", apiId: 537360, homeTeam: "Tunisia", awayTeam: "Japan", homeFlag: "🇹🇳", awayFlag: "🇯🇵", date: "2026-06-21", time: "11:00 WIB", group: "Group F", venue: "Rose Bowl", result: null },
  { id: "match_537361", apiId: 537361, homeTeam: "Tunisia", awayTeam: "Netherlands", homeFlag: "🇹🇳", awayFlag: "🇳🇱", date: "2026-06-26", time: "13:00 WIB", group: "Group F", venue: "MetLife Stadium", result: null },
  { id: "match_537362", apiId: 537362, homeTeam: "Japan", awayTeam: "Sweden", homeFlag: "🇯🇵", awayFlag: "🇸🇪", date: "2026-06-26", time: "13:00 WIB", group: "Group F", venue: "AT&T Stadium", result: null },

  // ── GROUP G ──────────────────────────────────────────────────
  { id: "match_537363", apiId: 537363, homeTeam: "Belgium", awayTeam: "Egypt", homeFlag: "🇧🇪", awayFlag: "🇪🇬", date: "2026-06-16", time: "02:00 WIB", group: "Group G", venue: "Estadio Azteca", result: null },
  { id: "match_537364", apiId: 537364, homeTeam: "Iran", awayTeam: "New Zealand", homeFlag: "🇮🇷", awayFlag: "🇳🇿", date: "2026-06-16", time: "08:00 WIB", group: "Group G", venue: "SoFi Stadium", result: null },
  { id: "match_537365", apiId: 537365, homeTeam: "Belgium", awayTeam: "Iran", homeFlag: "🇧🇪", awayFlag: "🇮🇷", date: "2026-06-22", time: "02:00 WIB", group: "Group G", venue: "MetLife Stadium", result: null },
  { id: "match_537366", apiId: 537366, homeTeam: "New Zealand", awayTeam: "Egypt", homeFlag: "🇳🇿", awayFlag: "🇪🇬", date: "2026-06-22", time: "08:00 WIB", group: "Group G", venue: "AT&T Stadium", result: null },
  { id: "match_537367", apiId: 537367, homeTeam: "New Zealand", awayTeam: "Belgium", homeFlag: "🇳🇿", awayFlag: "🇧🇪", date: "2026-06-27", time: "17:00 WIB", group: "Group G", venue: "Rose Bowl", result: null },
  { id: "match_537368", apiId: 537368, homeTeam: "Egypt", awayTeam: "Iran", homeFlag: "🇪🇬", awayFlag: "🇮🇷", date: "2026-06-27", time: "17:00 WIB", group: "Group G", venue: "Levi's Stadium", result: null },

  // ── GROUP H ──────────────────────────────────────────────────
  { id: "match_537369", apiId: 537369, homeTeam: "Spain", awayTeam: "Cape Verde", homeFlag: "🇪🇸", awayFlag: "🇨🇻", date: "2026-06-16", time: "06:00 WIB", group: "Group H", venue: "Mercedes-Benz Stadium", result: null },
  { id: "match_537370", apiId: 537370, homeTeam: "Saudi Arabia", awayTeam: "Uruguay", homeFlag: "🇸🇦", awayFlag: "🇺🇾", date: "2026-06-16", time: "12:00 WIB", group: "Group H", venue: "BC Place", result: null },
  { id: "match_537371", apiId: 537371, homeTeam: "Spain", awayTeam: "Saudi Arabia", homeFlag: "🇪🇸", awayFlag: "🇸🇦", date: "2026-06-22", time: "06:00 WIB", group: "Group H", venue: "SoFi Stadium", result: null },
  { id: "match_537372", apiId: 537372, homeTeam: "Uruguay", awayTeam: "Cape Verde", homeFlag: "🇺🇾", awayFlag: "🇨🇻", date: "2026-06-22", time: "12:00 WIB", group: "Group H", venue: "MetLife Stadium", result: null },
  { id: "match_537373", apiId: 537373, homeTeam: "Uruguay", awayTeam: "Spain", homeFlag: "🇺🇾", awayFlag: "🇪🇸", date: "2026-06-27", time: "14:00 WIB", group: "Group H", venue: "AT&T Stadium", result: null },
  { id: "match_537374", apiId: 537374, homeTeam: "Cape Verde", awayTeam: "Saudi Arabia", homeFlag: "🇨🇻", awayFlag: "🇸🇦", date: "2026-06-27", time: "14:00 WIB", group: "Group H", venue: "Rose Bowl", result: null },

  // ── GROUP I ──────────────────────────────────────────────────
  { id: "match_537391", apiId: 537391, homeTeam: "France", awayTeam: "Senegal", homeFlag: "🇫🇷", awayFlag: "🇸🇳", date: "2026-06-17", time: "02:00 WIB", group: "Group I", venue: "Rose Bowl", result: null },
  { id: "match_537392", apiId: 537392, homeTeam: "Iraq", awayTeam: "Norway", homeFlag: "🇮🇶", awayFlag: "🇳🇴", date: "2026-06-17", time: "05:00 WIB", group: "Group I", venue: "Levi's Stadium", result: null },
  { id: "match_537393", apiId: 537393, homeTeam: "France", awayTeam: "Iraq", homeFlag: "🇫🇷", awayFlag: "🇮🇶", date: "2026-06-23", time: "11:00 WIB", group: "Group I", venue: "SoFi Stadium", result: null },
  { id: "match_537394", apiId: 537394, homeTeam: "Norway", awayTeam: "Senegal", homeFlag: "🇳🇴", awayFlag: "🇸🇳", date: "2026-06-23", time: "14:00 WIB", group: "Group I", venue: "MetLife Stadium", result: null },
  { id: "match_537395", apiId: 537395, homeTeam: "Norway", awayTeam: "France", homeFlag: "🇳🇴", awayFlag: "🇫🇷", date: "2026-06-27", time: "09:00 WIB", group: "Group I", venue: "BC Place", result: null },
  { id: "match_537396", apiId: 537396, homeTeam: "Senegal", awayTeam: "Iraq", homeFlag: "🇸🇳", awayFlag: "🇮🇶", date: "2026-06-27", time: "09:00 WIB", group: "Group I", venue: "Estadio Azteca", result: null },

  // ── GROUP J ──────────────────────────────────────────────────
  { id: "match_537397", apiId: 537397, homeTeam: "Argentina", awayTeam: "Algeria", homeFlag: "🇦🇷", awayFlag: "🇩🇿", date: "2026-06-17", time: "08:00 WIB", group: "Group J", venue: "MetLife Stadium", result: null },
  { id: "match_537398", apiId: 537398, homeTeam: "Austria", awayTeam: "Jordan", homeFlag: "🇦🇹", awayFlag: "🇯🇴", date: "2026-06-17", time: "11:00 WIB", group: "Group J", venue: "AT&T Stadium", result: null },
  { id: "match_537399", apiId: 537399, homeTeam: "Argentina", awayTeam: "Austria", homeFlag: "🇦🇷", awayFlag: "🇦🇹", date: "2026-06-23", time: "07:00 WIB", group: "Group J", venue: "Rose Bowl", result: null },
  { id: "match_537400", apiId: 537400, homeTeam: "Jordan", awayTeam: "Algeria", homeFlag: "🇯🇴", awayFlag: "🇩🇿", date: "2026-06-23", time: "17:00 WIB", group: "Group J", venue: "SoFi Stadium", result: null },
  { id: "match_537401", apiId: 537401, homeTeam: "Jordan", awayTeam: "Argentina", homeFlag: "🇯🇴", awayFlag: "🇦🇷", date: "2026-06-28", time: "16:00 WIB", group: "Group J", venue: "Mercedes-Benz Stadium", result: null },
  { id: "match_537402", apiId: 537402, homeTeam: "Algeria", awayTeam: "Austria", homeFlag: "🇩🇿", awayFlag: "🇦🇹", date: "2026-06-28", time: "16:00 WIB", group: "Group J", venue: "AT&T Stadium", result: null },

  // ── GROUP K ──────────────────────────────────────────────────
  { id: "match_537403", apiId: 537403, homeTeam: "Portugal", awayTeam: "Congo DR", homeFlag: "🇵🇹", awayFlag: "🇨🇩", date: "2026-06-18", time: "00:00 WIB", group: "Group K", venue: "Rose Bowl", result: null },
  { id: "match_537404", apiId: 537404, homeTeam: "Uzbekistan", awayTeam: "Colombia", homeFlag: "🇺🇿", awayFlag: "🇨🇴", date: "2026-06-18", time: "09:00 WIB", group: "Group K", venue: "SoFi Stadium", result: null },
  { id: "match_537405", apiId: 537405, homeTeam: "Portugal", awayTeam: "Uzbekistan", homeFlag: "🇵🇹", awayFlag: "🇺🇿", date: "2026-06-24", time: "07:00 WIB", group: "Group K", venue: "MetLife Stadium", result: null },
  { id: "match_537406", apiId: 537406, homeTeam: "Colombia", awayTeam: "Congo DR", homeFlag: "🇨🇴", awayFlag: "🇨🇩", date: "2026-06-24", time: "16:00 WIB", group: "Group K", venue: "AT&T Stadium", result: null },
  { id: "match_537407", apiId: 537407, homeTeam: "Colombia", awayTeam: "Portugal", homeFlag: "🇨🇴", awayFlag: "🇵🇹", date: "2026-06-28", time: "13:30 WIB", group: "Group K", venue: "Levi's Stadium", result: null },
  { id: "match_537408", apiId: 537408, homeTeam: "Congo DR", awayTeam: "Uzbekistan", homeFlag: "🇨🇩", awayFlag: "🇺🇿", date: "2026-06-28", time: "13:30 WIB", group: "Group K", venue: "BC Place", result: null },

  // ── GROUP L ──────────────────────────────────────────────────
  { id: "match_537409", apiId: 537409, homeTeam: "England", awayTeam: "Croatia", homeFlag: "🏴", awayFlag: "🇭🇷", date: "2026-06-18", time: "03:00 WIB", group: "Group L", venue: "AT&T Stadium", result: null },
  { id: "match_537410", apiId: 537410, homeTeam: "Ghana", awayTeam: "Panama", homeFlag: "🇬🇭", awayFlag: "🇵🇦", date: "2026-06-18", time: "06:00 WIB", group: "Group L", venue: "Mercedes-Benz Stadium", result: null },
  { id: "match_537411", apiId: 537411, homeTeam: "England", awayTeam: "Ghana", homeFlag: "🏴", awayFlag: "🇬🇭", date: "2026-06-24", time: "10:00 WIB", group: "Group L", venue: "Estadio Azteca", result: null },
  { id: "match_537412", apiId: 537412, homeTeam: "Panama", awayTeam: "Croatia", homeFlag: "🇵🇦", awayFlag: "🇭🇷", date: "2026-06-24", time: "13:00 WIB", group: "Group L", venue: "Rose Bowl", result: null },
  { id: "match_537413", apiId: 537413, homeTeam: "Panama", awayTeam: "England", homeFlag: "🇵🇦", awayFlag: "🏴", date: "2026-06-28", time: "11:00 WIB", group: "Group L", venue: "SoFi Stadium", result: null },
  { id: "match_537414", apiId: 537414, homeTeam: "Croatia", awayTeam: "Ghana", homeFlag: "🇭🇷", awayFlag: "🇬🇭", date: "2026-06-28", time: "11:00 WIB", group: "Group L", venue: "MetLife Stadium", result: null },
]

export const getUpcomingMatches = () => {
  const today = new Date().toISOString().split("T")[0]
  return matches.filter(m => m.date >= today && m.result === null)
}

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
