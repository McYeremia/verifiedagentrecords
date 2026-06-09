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