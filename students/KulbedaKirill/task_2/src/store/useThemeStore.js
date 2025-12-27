import { create } from 'zustand'

export const useThemeStore = create((set) => ({
  theme: 'light',
  toggleTheme: () => set(() => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}))
