// One-off diagnostic: recall a user's PREDICTION memories from Walrus.
// Usage: node scripts/diag-recall.mjs <userId>
import { readFileSync } from "node:fs"
import { MemWal } from "@mysten-incubation/memwal"

// Load .env.local manually (standalone script — Next doesn't run here)
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
}

const userId = process.argv[2]
if (!userId) { console.error("pass userId"); process.exit(1) }

const mem = MemWal.create({
  key: process.env.MEMWAL_PRIVATE_KEY,
  accountId: process.env.MEMWAL_ACCOUNT_ID,
  serverUrl: process.env.MEMWAL_SERVER_URL,
  namespace: "var-wc2026",
})

const res = await mem.recall({ query: `User ${userId} predictions results forecast` })
const all = (res.results ?? []).map(r => r.text).filter(t => t.includes(userId))
console.log(`\nTotal memories recalled for user: ${all.length}\n`)
const preds = all.filter(t => t.startsWith("[PREDICTION]"))
console.log(`PREDICTION memories: ${preds.length}`)
for (const p of preds) console.log("  -", p.replace(/Timestamp:.*/, "").trim())
const forecasts = all.filter(t => t.startsWith("[VAR_FORECAST]"))
console.log(`\nVAR_FORECAST memories: ${forecasts.length}`)
for (const f of forecasts) console.log("  -", f.replace(/Timestamp:.*/, "").trim())
