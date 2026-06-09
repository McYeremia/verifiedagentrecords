import { MemWal } from "@mysten-incubation/memwal";

const mem = MemWal.create({
  key: process.env.MEMWAL_PRIVATE_KEY,
  accountId: process.env.MEMWAL_ACCOUNT_ID,
  serverUrl: process.env.MEMWAL_SERVER_URL,
  namespace: "var-wc2026",
});

await mem.health();

const job = await mem.remember("User predicted Brazil to beat Morocco. Confidence: high.");
await mem.waitForRememberJob(job.job_id);

const result = await mem.recall({ query: "What did user predict about Brazil?" });
console.log(result.results);