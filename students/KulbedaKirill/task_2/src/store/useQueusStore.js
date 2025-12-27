import { create } from 'zustand'

export const useQueusStore = create((set, get) => ({
  queues: [],
  isQueuesLoading: false,
  queuesError: null,

  fetchQueues: async (customFetcher) => {
    if (get().isQueuesLoading) return

    set({ queues: [], isQueuesLoading: true, queuesError: null })
    try {
      const fetcher =
        customFetcher ??
        (async () => {
          const token = JSON.parse(localStorage.getItem('token') || 'null')
          const res = await fetch(
            '/api/queues',
            {
              method: 'GET',
              'Content-Type': 'application/json',
              headers: { Authorization: `Bearer ${token}` },
            },
            { cache: 'no-store' }
          )

          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = await res.json()

          return data.queues
        })

      const items = await fetcher()
      set({ queues: items, isQueuesLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ queuesError: message, isQueuesLoading: false })
    }
  },

  resetQueues: () => set({ queues: [], isQueuesLoading: false, queuesError: null }),
}))
