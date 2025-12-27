const CHANNELS_KEY = '__channels_sse_map__'
const channels = globalThis[CHANNELS_KEY] ?? (globalThis[CHANNELS_KEY] = new Map())

export function publishEvent(ticketId, event, payload) {
  const subs = channels.get(ticketId)

  if (!subs) {
    return
  }

  const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`
  subs.forEach((s) => s.send(data))
}
