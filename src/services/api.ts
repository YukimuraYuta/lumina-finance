import axios, { AxiosError } from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach auth token if available in localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lumina_auth_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: standardize error messages and clear stale auth on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: any }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lumina_auth_token')
      localStorage.removeItem('lumina_auth_user')
    }
    const customMessage =
      error.response?.data?.message || error.message || 'An unexpected error occurred'
    return Promise.reject(new Error(customMessage))
  }
)

export default apiClient
