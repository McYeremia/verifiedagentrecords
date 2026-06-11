import { getMemWal } from "./memwal"

/**
 * Submit a memory to Walrus and wait for job completion.
 * The wait is non-fatal — a 60s timeout means Walrus is slow to confirm,
 * but the job was already submitted and will eventually be committed.
 * Never throws on timeout so callers can safely continue (cache update,
 * snapshot generation, response) even when confirmation is delayed.
 */
export async function rememberSafely(text: string): Promise<string> {
  const mem = getMemWal()
  const job = await mem.remember(text)
  try {
    await mem.waitForRememberJob(job.job_id)
  } catch {
    console.warn(`Walrus job ${job.job_id} wait timed out — data is submitted and will be stored`)
  }
  return job.job_id
}
