import { create } from 'zustand'
import type { AuthResponse } from '../types'

interface AuthState {
  user: AuthResponse | null
  isAuthenticated: boolean
  login: (data: AuthResponse) => void
  logout: () => void
}

const stored = localStorage.getItem('user')

export const useAuthStore = create<AuthState>((set) => ({
  user: stored ? JSON.parse(stored) : null,
  isAuthenticated: !!stored,
  login: (data) => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
    set({ user: data, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, isAuthenticated: false })
  },
}))
