// Axios Configuration
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

const config: AxiosRequestConfig = {
  baseURL: 'https://assessment.ksensetech.com/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'ak_9e16883b95258a12b93339bc8f836ac098f31590179d1b8a',
  },
}

const api: AxiosInstance = axios.create(config)

api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default api
