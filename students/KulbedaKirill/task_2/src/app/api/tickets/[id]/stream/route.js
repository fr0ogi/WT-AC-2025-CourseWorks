import { NextResponse } from 'next/server'

const CHANNELS_KEY = '__channels_sse_map__'
const channels = globalThis[CHANNELS_KEY] ?? (globalThis[CHANNELS_KEY] = new Map())

export async function GET(req, context) {
  const { id } = await context.params

  try {
    if (!id) {
      return NextResponse.json({ status: 'error', message: 'Missing id' }, { status: 500 })
    }

    let pingRef
    let subscriber

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder()
        const send = (data) => controller.enqueue(encoder.encode(data))

        let set = channels.get(id)
        if (!set) {
          set = new Set()
          channels.set(id, set)
        }
        subscriber = { send }
        set.add(subscriber)

        send('event: ping\ndata: ok\n\n')
        pingRef = setInterval(() => send('event: ping\ndata: ok\n\n'), 30000)
      },

      cancel() {
        cleanup(id, subscriber, pingRef)
      },
    })

    req.signal?.addEventListener('abort', () => cleanup(id, subscriber, pingRef), { once: true })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error.message,
      },
      {
        status: 500,
      }
    )
  }
}

function cleanup(id, subscriber, pingRef) {
  if (pingRef) clearInterval(pingRef)
  const set = channels.get(id)
  if (set && subscriber) {
    set.delete(subscriber)
    if (set.size === 0) channels.delete(id)
  }
}

export function publishMessage(ticketId, payload) {
  const subs = channels.get(ticketId)

  if (!subs) {
    return
  }

  const data = `event: message\ndata: ${JSON.stringify(payload)}\n\n`
  subs.forEach((s) => s.send(data))
}
