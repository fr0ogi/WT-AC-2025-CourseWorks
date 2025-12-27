import { create } from 'zustand'

export const useTicketStore = create((set, get) => ({
  ticket: null,
  isTicketLoading: false,
  ticketError: null,

  rating: {},

  fetchTicket: async (id) => {
    if (get().isTicketLoading) return

    set({ isTicketLoading: true, ticketError: null })

    try {
      const token = JSON.parse(localStorage.getItem('token') || 'null')
      const res = await fetch(
        `/api/tickets/${id}`,
        {
          method: 'GET',
          'Content-Type': 'application/json',
          headers: { Authorization: `Bearer ${token}` },
        },
        { cache: 'no-store' }
      )

      const data = await res.json()

      console.log('data', data)

      if (data.status === 'error') {
        throw new Error(data.message)
      }

      set({ ticket: data.ticket, isTicketLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'

      set({ ticketError: message, isTicketLoading: false })
    }
  },

  addMessage: (message) =>
    set((state) => {
      if (!state.ticket) return state
      const prev = state.ticket.messages ?? []
      return {
        ticket: {
          ...state.ticket,
          messages: [...prev, message],
        },
      }
    }),

  setAgent: (agent) =>
    set((state) => {
      if (!state.ticket) return state

      const next = { ...(state.ticket ?? {}), agent }

      return { ticket: next }
    }),

  setClose: () =>
    set((state) => {
      if (!state.ticket) return state

      const next = { ...(state.ticket ?? {}), isClose: true }

      return { ticket: next }
    }),

  setAgentRating: (agentRating) =>
    set((state) => {
      if (!state.ticket) return state

      const next = { ...(state.ticket ?? {}), agentRating }

      console.log(next)

      return { ticket: next }
    }),

  resetTicket: () =>
    set({
      ticket: null,
      isTicketLoading: false,
      ticketError: null,

      rating: {},
    }),
}))
