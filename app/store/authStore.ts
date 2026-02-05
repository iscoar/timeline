import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type User = {
  id?: string
  email?: string
  [k: string]: any
} | null

type AuthState = {
  user: User
  pendingEmail?: string | null
  setUser: (u: User) => void
  setPendingEmail: (email?: string | null) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      pendingEmail: null,
      setUser: (u) => set(() => ({ user: u })),
      setPendingEmail: (email) => set(() => ({ pendingEmail: email })),
      clear: () => set(() => ({ user: null, pendingEmail: null })),
    }),
    {
      name: 'timeline-auth',
      partialize: (state) => ({ user: state.user, pendingEmail: state.pendingEmail }),
    }
  )
)

export default useAuthStore
