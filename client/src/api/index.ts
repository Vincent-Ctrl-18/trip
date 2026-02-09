import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

// ========== Auth API ==========
export const authAPI = {
  register: (data: { username: string; password: string; role: string }) =>
    api.post('/auth/register', data),
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data),
  profile: () => api.get('/auth/profile'),
};

// ========== Hotel API ==========
export const hotelAPI = {
  // Public
  search: (params: Record<string, any>) => api.get('/hotels/search', { params }),
  banner: () => api.get('/hotels/banner'),
  detail: (id: number | string) => api.get(`/hotels/${id}`),

  // Merchant
  myHotels: () => api.get('/hotels/my'),
  create: (data: any) => api.post('/hotels', data),
  update: (id: number | string, data: any) => api.put(`/hotels/${id}`, data),
  submit: (id: number | string) => api.post(`/hotels/${id}/submit`),

  // Admin
  reviewList: (params?: Record<string, any>) => api.get('/hotels/review', { params }),
  approve: (id: number | string) => api.put(`/hotels/${id}/approve`),
  reject: (id: number | string, reason: string) => api.put(`/hotels/${id}/reject`, { reason }),
  publish: (id: number | string) => api.put(`/hotels/${id}/publish`),
  offline: (id: number | string) => api.put(`/hotels/${id}/offline`),
  online: (id: number | string) => api.put(`/hotels/${id}/online`),
};

// ========== Upload API ==========
export const uploadAPI = {
  upload: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadMultiple: (files: File[]) => {
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    return api.post('/upload/multiple', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export default api;
