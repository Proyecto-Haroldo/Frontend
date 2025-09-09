// API service for authentication
import { apiClient } from './apiClient';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  cedulaOrNIT: string;
  legalName: string;
  clientType: string;
  role: { id: number };
}

export interface LoginResponse {
  token: string;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status === 401) {
      throw new Error('Credenciales inválidas. Por favor verifica tu correo y contraseña.');
    }
    throw new Error('Error al iniciar sesión. Por favor intenta nuevamente.');
  }
}

export async function register(data: RegisterRequest): Promise<string> {
  try {
    const response = await apiClient.post<string>('/auth/register', data);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status === 409) {
      throw new Error('Correo ya registrado');
    }
    throw new Error('Error al registrar usuario. Por favor intenta nuevamente.');
  }
} 