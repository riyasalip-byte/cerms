import { create } from 'zustand'

export type User = {
  id: string
  username: string
  email: string
  role: string
  companyId: string
  branchId: string
}

type AuthState = {
  isAuthenticated: boolean
  isRefreshing: boolean
  accessToken: string | null
  user: User | null
  login: (user: User, accessToken: string) => void
  logout: () => void
  setAccessToken: (accessToken: string | null) => void
  setRefreshing: (isRefreshing: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isRefreshing: false,
  accessToken: null,
  user: null,
  login: (user, accessToken) =>
    set({ isAuthenticated: true, user, accessToken }),
  logout: () => {
    set({ isAuthenticated: false, user: null, accessToken: null })
    // We don't necessarily need to wait for the API call to complete 
    // but the component can call it. Alternatively, we keep it simple here.
  },
  setAccessToken: (accessToken) => set({ accessToken }),
  setRefreshing: (isRefreshing) => set({ isRefreshing }),
}))

