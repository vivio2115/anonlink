import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface FileItem {
  id: string;
  user_id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  download_token: string;
  download_count: number;
  max_downloads: number;
  expires_at?: string;
  created_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export const authAPI = {
  register: async (username: string, email: string, password: string) => {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>('/register', {
      username,
      email,
      password,
    });
    return response.data;
  },

  login: async (username: string, password: string) => {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>('/login', {
      username,
      password,
    });
    return response.data;
  },
};

export const filesAPI = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<ApiResponse<FileItem>>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getUserFiles: async () => {
    const response = await api.get<ApiResponse<FileItem[]>>('/files');
    return response.data;
  },

  deleteFile: async (fileId: string) => {
    const response = await api.delete<ApiResponse>(`/files/${fileId}`);
    return response.data;
  },

  downloadFile: async (fileId: string) => {
    const response = await api.get(`/files/${fileId}/download`, {
      responseType: 'blob',
    });
    return response;
  },

  regenerateShareLink: async (fileId: string) => {
    const response = await api.post<ApiResponse<FileItem>>(`/files/${fileId}/regenerate-link`);
    return response.data;
  },

  getFileInfo: async (token: string) => {
    const response = await api.get<ApiResponse<Partial<FileItem>>>(`/file-info/${token}`);
    return response.data;
  },

  getPublicDownloadUrl: (token: string) => {
    return `${API_BASE_URL}/download/${token}`;
  },

  getPublicViewUrl: (token: string) => {
    return `${window.location.origin}/download/${token}`;
  },
};

export default api;
