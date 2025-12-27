import { create } from 'zustand'

export const useRegularUserTicketsStore = create((set, get) => ({
  tickets: [],
  isTicketsLoading: false,
  ticketsError: null,

  fetchTickets: async (customFetcher) => {
    if (get().isTicketsLoading) return

    set({ isTicketsLoading: true, ticketsError: null })
    try {
      const fetcher =
        customFetcher ??
        (async () => {
          const token = JSON.parse(localStorage.getItem('token') || 'null')
          const res = await fetch(
            '/api/user/tickets',
            {
              method: 'GET',
              'Content-Type': 'application/json',
              headers: { Authorization: `Bearer ${token}` },
            },
            { cache: 'no-store' }
          )

          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = await res.json()
          return data.tickets
        })

      const items = await fetcher()
      set({ tickets: items, isTicketsLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ ticketsError: message, isTicketsLoading: false })
    }
  },

  addTicket: (ticket) =>
    set((state) => ({
      tickets: [...state.tickets, ticket],
    })),

  resetTickets: () => set({ tickets: [], isTicketsLoading: false, ticketsError: null }),
}))
