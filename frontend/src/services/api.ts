import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth endpoints
export const authApi = {
  register: (email: string, password: string, name?: string) =>
    api.post('/api/auth/register', { email, password, name }),
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
}

// Complaint endpoints
export const complaintApi = {
  createComplaint: (formData: FormData) =>
    api.post('/api/complaints/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  listComplaints: (filters?: any) =>
    api.get('/api/complaints', { params: filters }),
  getComplaint: (id: number) =>
    api.get(`/api/complaints/${id}`),
  updateStatus: (id: number, status: string, reason?: string) =>
    api.patch(`/api/complaints/${id}/status`, { status, reason }),
  getDashboardStats: () =>
    api.get('/api/complaints/dashboard/stats'),
  getHeatmapData: () =>
    api.get('/api/complaints/heatmap/data'),
}

export default api
