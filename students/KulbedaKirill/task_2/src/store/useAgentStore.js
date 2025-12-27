import { create } from 'zustand'

export const useAgentStore = create((set, get) => ({
  agent: null,
  isAgentLoading: false,
  agentError: null,

  fetchAgent: async (customFetcher) => {
    if (get().isAgentLoading) return

    set({ isAgentLoading: true, agentError: null })
    try {
      const fetcher =
        customFetcher ??
        (async () => {
          const token = JSON.parse(localStorage.getItem('token') || 'null')
          const res = await fetch(
            '/api/agent/',
            {
              method: 'GET',
              'Content-Type': 'application/json',
              headers: { Authorization: `Bearer ${token}` },
            },
            { cache: 'no-store' }
          )

          if (!res.ok) throw new Error(`HTTP ${res.status}`)

          const data = await res.json()
          return data.agent
        })

      const agent = await fetcher()
      set({ agent: agent, isAgentLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ agentError: message, isAgentLoading: false })
    }
  },

  addTicketToAssignedTickets: (item) =>
    set((state) => {
      if (state.agent) {
        const tickets = state.agent.assignedTickets
        const updatedTickets = [...tickets, item]

        return {
          ...state,
          agent: { ...state.agent, assignedTickets: updatedTickets },
        }
      }
    }),

  resetAgent: () => set({ agent: null, isAgentLoading: false, agentError: null }),
}))
