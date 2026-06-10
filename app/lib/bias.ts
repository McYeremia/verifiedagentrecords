import { getTLA } from "./matches"

// ── Bias profile ─────────────────────────────────────────────────────────────
// Derived entirely from raw [PREDICTION] + [RESULT] memory text — no Groq, no
// extra data. Shared foundation for VAR Pre-Cog (and future confidence/profile
// features).

export interface BiasProfile {
  predictionCount: number
  teamBacks: Record<string, number>   // team → times backed (Draw excluded)
  topTeam: string | null
  topTeamCount: number
  homePicks: number
  awayPicks: number
  drawPicks: number
  homeBiasPct: number                 // home picks / decisive picks
  drawRatePct: number                 // draw picks / all picks
  resultCount: number
  correctCount: number
  accuracyPct: number
}

export interface ParsedPrediction {
  matchId: string
  pick: string
  home: string
  away: string
  confidence: string
}

export const PRECOG_MIN_PREDICTIONS = 3

export function parsePredictions(memories: string[]): ParsedPrediction[] {
  const out: ParsedPrediction[] = []
  for (const text of memories) {
    if (!text.startsWith("[PREDICTION]")) continue
    const pickM = text.match(/predicted (.+?) to win/)
    const teamsM = text.match(/to win (.+?) vs (.+?) \(matchId/)
    const midM = text.match(/matchId: ([\w_]+)/)
    const confM = text.match(/Confidence: ([\w-]+)/)
    if (!pickM || !teamsM || !midM) continue
    out.push({
      matchId: midM[1],
      pick: pickM[1].trim(),
      home: teamsM[1].trim(),
      away: teamsM[2].trim(),
      confidence: confM?.[1] ?? "medium",
    })
  }
  // One prediction per match (keep first seen).
  const seen = new Set<string>()
  return out.filter(p => (seen.has(p.matchId) ? false : (seen.add(p.matchId), true)))
}

export function computeBiasProfile(memories: string[]): BiasProfile {
  const preds = parsePredictions(memories)
  const teamBacks: Record<string, number> = {}
  let homePicks = 0
  let awayPicks = 0
  let drawPicks = 0

  for (const p of preds) {
    if (p.pick === "Draw") { drawPicks++; continue }
    teamBacks[p.pick] = (teamBacks[p.pick] || 0) + 1
    if (p.pick === p.home) homePicks++
    else if (p.pick === p.away) awayPicks++
  }

  let topTeam: string | null = null
  let topTeamCount = 0
  for (const [team, count] of Object.entries(teamBacks)) {
    if (count > topTeamCount) { topTeam = team; topTeamCount = count }
  }

  const decisive = homePicks + awayPicks
  const total = preds.length
  const homeBiasPct = decisive > 0 ? Math.round((homePicks / decisive) * 100) : 50
  const drawRatePct = total > 0 ? Math.round((drawPicks / total) * 100) : 0

  const results = memories.filter(m => m.startsWith("[RESULT]"))
  const resultCount = results.length
  const correctCount = results.filter(m => m.includes("— CORRECT")).length
  const accuracyPct = resultCount > 0 ? Math.round((correctCount / resultCount) * 100) : 0

  return {
    predictionCount: total,
    teamBacks,
    topTeam,
    topTeamCount,
    homePicks,
    awayPicks,
    drawPicks,
    homeBiasPct,
    drawRatePct,
    resultCount,
    correctCount,
    accuracyPct,
  }
}

// ── Forecast ─────────────────────────────────────────────────────────────────

export type ForecastBasis = "loyalty" | "home" | "away" | "draw" | "lean"
export type WrongLikely = "wrong" | "right" | "neutral" | "unknown"

export interface Forecast {
  pick: string
  basis: ForecastBasis
  wrongLikely: WrongLikely
  line: string
}

// Pre-Cog scoreboard — "VAR knows you X%". Counts matches where a [VAR_FORECAST]
// and the user's [PREDICTION] both exist and agree, by matchId.
export function computeScoreboard(memories: string[]): { total: number; hits: number; knowsYouPct: number } {
  const predMap: Record<string, string> = {}
  for (const p of parsePredictions(memories)) predMap[p.matchId] = p.pick

  let total = 0
  let hits = 0
  const seen = new Set<string>()
  for (const f of memories) {
    if (!f.startsWith("[VAR_FORECAST]")) continue
    const midM = f.match(/matchId: ([\w_]+)/)
    const pickM = f.match(/would pick (.+?) for /)
    if (!midM || !pickM) continue
    const mid = midM[1]
    if (seen.has(mid)) continue
    seen.add(mid)
    const actual = predMap[mid]
    if (!actual) continue
    total++
    if (pickM[1].trim() === actual) hits++
  }
  return { total, hits, knowsYouPct: total > 0 ? Math.round((hits / total) * 100) : 0 }
}

export function forecastPick(
  profile: BiasProfile,
  fixture: { home: string; away: string; matchId: string }
): Forecast | null {
  if (profile.predictionCount < PRECOG_MIN_PREDICTIONS) return null

  const backHome = profile.teamBacks[fixture.home] || 0
  const backAway = profile.teamBacks[fixture.away] || 0

  let pick: string
  let basis: ForecastBasis

  if (backHome >= 2 || backAway >= 2) {
    pick = backHome >= backAway ? fixture.home : fixture.away
    basis = "loyalty"
  } else if (profile.drawRatePct >= 40) {
    pick = "Draw"
    basis = "draw"
  } else if (profile.homeBiasPct >= 65) {
    pick = fixture.home
    basis = "home"
  } else if (profile.homeBiasPct <= 35) {
    pick = fixture.away
    basis = "away"
  } else {
    pick = backHome >= backAway ? fixture.home : fixture.away
    basis = "lean"
  }

  let wrongLikely: WrongLikely
  if (profile.resultCount < 3) wrongLikely = "unknown"
  else if (profile.accuracyPct < 45) wrongLikely = "wrong"
  else if (profile.accuracyPct >= 60) wrongLikely = "right"
  else wrongLikely = "neutral"

  const line = phraseForecast(pick, basis, wrongLikely, profile, fixture.matchId)
  return { pick, basis, wrongLikely, line }
}

function seedFrom(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

// Templated phrasing — varied but deterministic per match (no Groq).
function phraseForecast(
  pick: string,
  basis: ForecastBasis,
  wrongLikely: WrongLikely,
  profile: BiasProfile,
  matchId: string
): string {
  const tla = pick === "Draw" ? "a draw" : getTLA(pick)

  const headPools: Record<ForecastBasis, string[]> = {
    loyalty: [
      `You can't quit ${tla}. I bet you back them again.`,
      `${tla} again? You always come crawling back.`,
      `Predictable — ${tla} is your comfort pick.`,
    ],
    home: [
      `You always trust the home side. ${tla} it is.`,
      `Home-team loyalist — my money's on ${tla}.`,
    ],
    away: [
      `You love an away day. I say you go ${tla}.`,
      `Always backing the visitors — ${tla} for you.`,
    ],
    draw: [
      `You and your draws. I bet you sit on the fence again.`,
      `Fence-sitter — you'll call it ${tla}.`,
    ],
    lean: [
      `Going by your history, I'd say ${tla}.`,
      `My read on you: ${tla}.`,
    ],
  }

  const tailPools: Record<WrongLikely, string[]> = {
    wrong: [
      ` And going by your ${profile.accuracyPct}% record, you'll regret it.`,
      ` Your ${profile.accuracyPct}% accuracy says you'll blow it.`,
    ],
    right: [` Annoyingly, you might actually be right this time.`],
    neutral: [` Coin-flip territory — but that's my call.`],
    unknown: [` No results in yet, but VAR called it first.`],
  }

  const seed = seedFrom(matchId + pick)
  const heads = headPools[basis]
  const tails = tailPools[wrongLikely]
  return heads[seed % heads.length] + tails[seed % tails.length]
}

// ── Confidence calibration (#2 Overconfidence Index) ─────────────────────────
// Cross the confidence level stored on each [PREDICTION] with the CORRECT/WRONG
// outcome from [RESULT] (joined by matchId). Zero Groq.

export interface ConfBucket {
  level: string     // "low" | "medium" | "high" | "all-in"
  label: string
  total: number     // resolved predictions at this level
  correct: number
  accuracy: number  // %
}

export interface Calibration {
  buckets: ConfBucket[]   // only levels with resolved data, ordered low→all-in
  resolvedCount: number
  verdict: string | null  // one-liner, null until enough data
  overconfident: boolean  // bold picks land notably worse than cautious ones
}

const CONF_ORDER = ["low", "medium", "high", "all-in"]
const CONF_LABEL: Record<string, string> = {
  low: "Low", medium: "Medium", high: "High", "all-in": "All in",
}

export function computeConfidenceCalibration(memories: string[]): Calibration {
  const outcome: Record<string, boolean> = {}
  for (const t of memories) {
    if (!t.startsWith("[RESULT]")) continue
    const midM = t.match(/Match ([\w_]+)/)
    if (!midM) continue
    if (t.includes("— CORRECT")) outcome[midM[1]] = true
    else if (t.includes("— WRONG")) outcome[midM[1]] = false
  }

  const acc: Record<string, { total: number; correct: number }> = {}
  for (const p of parsePredictions(memories)) {
    if (!(p.matchId in outcome)) continue
    const lvl = CONF_ORDER.includes(p.confidence) ? p.confidence : "medium"
    acc[lvl] = acc[lvl] || { total: 0, correct: 0 }
    acc[lvl].total++
    if (outcome[p.matchId]) acc[lvl].correct++
  }

  const buckets: ConfBucket[] = CONF_ORDER.filter(l => acc[l]).map(l => ({
    level: l,
    label: CONF_LABEL[l],
    total: acc[l].total,
    correct: acc[l].correct,
    accuracy: Math.round((acc[l].correct / acc[l].total) * 100),
  }))
  const resolvedCount = buckets.reduce((s, b) => s + b.total, 0)

  const sum = (ls: string[], k: "total" | "correct") =>
    buckets.filter(b => ls.includes(b.level)).reduce((s, b) => s + b[k], 0)
  const boldTot = sum(["high", "all-in"], "total")
  const boldCor = sum(["high", "all-in"], "correct")
  const cauTot = sum(["low", "medium"], "total")
  const cauCor = sum(["low", "medium"], "correct")
  const boldAcc = boldTot > 0 ? Math.round((boldCor / boldTot) * 100) : null
  const cauAcc = cauTot > 0 ? Math.round((cauCor / cauTot) * 100) : null
  const overconfident = boldAcc !== null && cauAcc !== null && boldTot >= 2 && boldAcc + 10 < cauAcc

  let verdict: string | null = null
  if (resolvedCount >= 3) {
    if (overconfident && boldAcc !== null && cauAcc !== null) {
      verdict = `Your bold picks land just ${boldAcc}% of the time vs ${cauAcc}% when you play it safe. Your confidence runs backwards.`
    } else if (boldAcc !== null && boldAcc >= 60) {
      verdict = `When you commit, you deliver — ${boldAcc}% on your high-confidence calls. Annoyingly solid.`
    } else {
      const top = [...buckets].sort((a, b) => b.total - a.total)[0]
      verdict = `Most of your calls are "${top.label}" confidence at ${top.accuracy}% accuracy. VAR is keeping count.`
    }
  }

  return { buckets, resolvedCount, verdict, overconfident }
}

// ── Trait detection (#3 VAR Rap Sheet) ───────────────────────────────────────

export type TraitTone = "blue" | "violet" | "green" | "amber" | "coral"

export interface Trait {
  id: string
  label: string
  icon: string      // tabler icon name without the "ti-" prefix
  blurb: string
  evidence: string
  tone: TraitTone
}

export const TRAITS_MIN_PREDICTIONS = 5

export function detectTraits(
  profile: BiasProfile,
  calibration: Calibration,
  memories: string[]
): Trait[] {
  const traits: Trait[] = []
  if (profile.predictionCount < TRAITS_MIN_PREDICTIONS) return traits

  const decisive = profile.homePicks + profile.awayPicks

  // Homer / Road Warrior
  if (decisive >= 4) {
    if (profile.homeBiasPct >= 60) {
      traits.push({
        id: "homer", label: "Homer", icon: "home", tone: "blue",
        blurb: "You instinctively trust the home side.",
        evidence: `${profile.homeBiasPct}% of your picks are the home team.`,
      })
    } else if (profile.homeBiasPct <= 40) {
      traits.push({
        id: "road", label: "Road Warrior", icon: "plane", tone: "blue",
        blurb: "You back the visitors more than most.",
        evidence: `${100 - profile.homeBiasPct}% of your picks are the away team.`,
      })
    }
  }

  // Draw-denier / Fence-sitter
  if (profile.drawRatePct <= 5) {
    traits.push({
      id: "draw-denier", label: "Draw-denier", icon: "ban", tone: "coral",
      blurb: "You refuse to sit on the fence.",
      evidence: `${profile.drawPicks} draws in ${profile.predictionCount} predictions.`,
    })
  } else if (profile.drawRatePct >= 30) {
    traits.push({
      id: "fence", label: "Fence-sitter", icon: "equal", tone: "amber",
      blurb: "You love calling a draw.",
      evidence: `${profile.drawRatePct}% of your picks are draws.`,
    })
  }

  // Loyalist
  if (profile.topTeam && profile.topTeamCount >= 3) {
    traits.push({
      id: "loyalist", label: "Loyalist", icon: "heart", tone: "coral",
      blurb: `You can't quit ${getTLA(profile.topTeam)}.`,
      evidence: `Backed ${profile.topTeam} ${profile.topTeamCount} times.`,
    })
  }

  // Overconfident (from calibration)
  if (calibration.overconfident) {
    const boldTot = calibration.buckets.filter(b => b.level === "high" || b.level === "all-in").reduce((s, b) => s + b.total, 0)
    const boldCor = calibration.buckets.filter(b => b.level === "high" || b.level === "all-in").reduce((s, b) => s + b.correct, 0)
    const boldAcc = boldTot > 0 ? Math.round((boldCor / boldTot) * 100) : 0
    traits.push({
      id: "overconfident", label: "Overconfident", icon: "flame", tone: "amber",
      blurb: "Your boldest calls flop the hardest.",
      evidence: `High-confidence picks land just ${boldAcc}%.`,
    })
  }

  // Streaky (from [STREAK])
  const streaks = memories.filter(m => m.startsWith("[STREAK]")).sort()
  const latest = streaks[streaks.length - 1] ?? ""
  const sm = latest.match(/on a (\d+)-game (winning|losing) streak/)
  if (sm) {
    const len = parseInt(sm[1])
    if (len >= 3) {
      if (sm[2] === "winning") {
        traits.push({
          id: "hot", label: "On Fire", icon: "flame", tone: "green",
          blurb: "VAR hates to admit it — you're hot.",
          evidence: `${len}-game winning streak.`,
        })
      } else {
        traits.push({
          id: "cold", label: "Ice Cold", icon: "snowflake", tone: "blue",
          blurb: "At this point, just pick the opposite.",
          evidence: `${len}-game losing streak.`,
        })
      }
    }
  }

  return traits
}
