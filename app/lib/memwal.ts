import { MemWal } from "@mysten-incubation/memwal";

let instance: MemWal | null = null;

export function getMemWal(): MemWal {
  if (!instance) {
    instance = MemWal.create({
      key: process.env.MEMWAL_PRIVATE_KEY!,
      accountId: process.env.MEMWAL_ACCOUNT_ID!,
      serverUrl: process.env.MEMWAL_SERVER_URL!,
      namespace: "var-wc2026",
    });
  }
  return instance;
}

// ── Shared per-user recall cache ─────────────────────────────────────────────
// Walrus enforces ~30 weighted requests/min. After an action several endpoints
// (roast, precog, profile, ...) each used to recall the same user's memories,
// bursting past the limit (429). This collapses them into ONE recall per user
// per TTL window. All endpoints filter the returned list locally.

type CachedRecall = { mems: string[]; ts: number };
const userRecallCache = new Map<string, CachedRecall>();
const inFlightRecall = new Map<string, Promise<string[]>>();
const USER_RECALL_TTL = 45_000; // 45s — under the 60s rate-limit window

// Durable per-process index of which matches a user has predicted. Grows only
// (never expires), so the "one prediction per match" guard stays reliable even
// when a live recall fails under rate limit. Rebuilt from the first successful
// recall after a server restart.
const predictedIndex = new Map<string, Set<string>>();

function indexPredictionsFrom(userId: string, mems: string[]): void {
  let set = predictedIndex.get(userId);
  if (!set) { set = new Set(); predictedIndex.set(userId, set); }
  for (const t of mems) {
    if (!t.startsWith("[PREDICTION]") || !t.includes(userId)) continue;
    const m = t.match(/\(matchId: ([\w_]+)\)/);
    if (m) set.add(m[1]);
  }
}

/** True if this user is already known to have predicted this match. */
export function hasPredictedMatch(userId: string, matchId: string): boolean {
  return predictedIndex.get(userId)?.has(matchId) ?? false;
}

/** Record that a user predicted a match (call right after a successful write). */
export function markPredictedMatch(userId: string, matchId: string): void {
  let set = predictedIndex.get(userId);
  if (!set) { set = new Set(); predictedIndex.set(userId, set); }
  set.add(matchId);
}

/**
 * Recall all memory text for a user, shared across endpoints with a 45s cache
 * and in-flight coalescing (concurrent callers share one Walrus request).
 * On a recall failure (e.g. 429), serves the last cached value if available;
 * only throws when there is nothing cached to fall back on.
 */
export async function recallUserMemories(userId: string): Promise<string[]> {
  const now = Date.now();
  const cached = userRecallCache.get(userId);
  if (cached && now - cached.ts < USER_RECALL_TTL) return cached.mems;

  // Coalesce concurrent requests into a single Walrus call.
  const pending = inFlightRecall.get(userId);
  if (pending) return pending;

  const promise = (async () => {
    try {
      const mem = getMemWal();
      const res = await mem.recall({
        query: `User ${userId} predictions results forecast streak confidence`,
        limit: 200, // default is 10 — far too low for a user's full history; counts/dedup need the complete set
      });
      const mems = (res.results ?? [])
        .map((m: { text: string }) => m.text)
        .filter((t: string) => t.includes(userId));
      userRecallCache.set(userId, { mems, ts: Date.now() });
      indexPredictionsFrom(userId, mems); // keep the durable predicted-match index fresh
      return mems;
    } catch (err) {
      if (cached) return cached.mems; // serve stale rather than fail under rate limit
      throw err;
    } finally {
      inFlightRecall.delete(userId);
    }
  })();
  inFlightRecall.set(userId, promise);
  return promise;
}

/** Drop the cache for a user (call after writing a new memory for them). */
export function invalidateUserMemories(userId: string): void {
  userRecallCache.delete(userId);
}

/**
 * Append a freshly-written memory to the cached list (if present) so the next
 * read sees it without forcing another Walrus recall. Use after a remember().
 */
export function appendUserMemory(userId: string, text: string): void {
  const c = userRecallCache.get(userId);
  if (c) c.mems = [...c.mems, text];
}