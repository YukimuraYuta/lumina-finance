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

// Response interceptor: standardize error messages and notify on 401 session expiry
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: any }>) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('lumina-auth-expired'))
    }
    const customMessage =
      error.response?.data?.message || error.message || 'An unexpected error occurred'
    return Promise.reject(new Error(customMessage))
  }
)

export default apiClient
