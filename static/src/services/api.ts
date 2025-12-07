import axios from 'axios';
import type {LoginCredentials, RegisterCredentials, Document, AIRequest} from '../types';

const API_BASE_URL = 'http://localhost:8000'; // FastAPI бэкенд

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Добавляем токен к запросам
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Обработка ошибок авторизации
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (credentials: LoginCredentials) =>
        axios.post(`${API_BASE_URL}/auth/token`,
            new URLSearchParams({
                username: credentials.email,
                password: credentials.password,
            }), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }),

    register: (credentials: RegisterCredentials) =>
        api.post('/auth/register', credentials),

    logout: () => {
        localStorage.removeItem('accessToken');
    },
};

export const documentsAPI = {
    getAll: () => api.get<Document[]>('/documents/'),

    getById: (id: number) => api.get<string>(`/documents/${id}`),

    create: (title: string) =>
        api.post<Document>('/documents/', { title }),

    update: (id: number, content: string) =>
        api.put(`/documents/${id}`, { content }),

    delete: (id: number) => api.delete(`/documents/${id}`),

    assist: (id: number, data: AIRequest) =>
        api.post<string>(`/documents/${id}/assist`, data),
};

export default api;