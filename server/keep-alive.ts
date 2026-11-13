// Daily Vercel cron: one cheap read so Supabase's free plan sees activity and does not pause the project.
export type KeepAliveStore = { ping(): Promise<boolean> }

export async function handleKeepAlive(store: KeepAliveStore): Promise<{ status: number; body: string }> {
  try {
    if (await store.ping()) return { status: 200, body: JSON.stringify({ ok: true }) }
  } catch {
    // fall through: the error text could hold details, so it is not logged or returned
  }
  console.error('keep-alive: database read failed')
  return { status: 503, body: JSON.stringify({ ok: false }) }
}

type Client = { from(table: string): { select(cols: string, opts: { count: 'exact'; head: true }): PromiseLike<{ error: unknown }> } }

export const supabaseKeepAliveStore = (client: Client): KeepAliveStore => ({
  async ping() {
    const { error } = await client.from('profiles').select('id', { count: 'exact', head: true })
    return !error
  },
})
