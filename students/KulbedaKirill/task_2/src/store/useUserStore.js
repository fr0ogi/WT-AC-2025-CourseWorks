import { create } from 'zustand'

export const useUserStore = create((set) => ({
  user: null,
  userLoading: true,

  setUser: (user) => {
    return set(() => ({ user }))
  },
  clearUser: () => {
    return set(() => ({ user: null }))
  },
}))
