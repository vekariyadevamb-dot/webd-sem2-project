import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('foodatlasindia-auth')
    if (stored) {
      try {
        const { state } = JSON.parse(stored)
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`
        }
      } catch (e) {
        // ignore parse errors
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const stored = localStorage.getItem('foodatlasindia-auth')
      if (stored) {
        try {
          const { state } = JSON.parse(stored)
          if (state?.refreshToken) {
            const res = await axios.post(
              `${api.defaults.baseURL}/auth/refresh`,
              { refreshToken: state.refreshToken }
            )
            const newAccessToken = res.data?.data?.accessToken
            if (newAccessToken) {
              // Update stored token
              const parsed = JSON.parse(stored)
              parsed.state.token = newAccessToken
              localStorage.setItem('foodatlasindia-auth', JSON.stringify(parsed))
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
              return api(originalRequest)
            }
          }
        } catch (e) {
          localStorage.removeItem('foodatlasindia-auth')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
