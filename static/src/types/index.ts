export interface User {
    email: string;
    id: number;
}

export interface Document {
    id: number;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
    user_id: number;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
}

export interface AIRequest {
    current_text: string;
    user_prompt: string;
}