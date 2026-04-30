import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const res = await api.post('/auth/login', { email, password })
          const { user, accessToken, refreshToken } = res.data.data
          set({
            user,
            token: accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })
          return { success: true }
        } catch (err) {
          const message = err.response?.data?.message || 'Login failed'
          set({ error: message, isLoading: false })
          return { success: false, message }
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const res = await api.post('/auth/register', data)
          const { user, accessToken, refreshToken } = res.data.data
          set({
            user,
            token: accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })
          return { success: true }
        } catch (err) {
          const message = err.response?.data?.message || 'Registration failed'
          set({ error: message, isLoading: false })
          return { success: false, message }
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        })
        delete api.defaults.headers.common['Authorization']
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get()
        if (!refreshToken) return false
        try {
          const res = await api.post('/auth/refresh', { refreshToken })
          const { accessToken } = res.data.data
          set({ token: accessToken })
          return true
        } catch {
          get().logout()
          return false
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'foodatlasindia-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
