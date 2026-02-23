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
  role: { id: number, name: string };
  id: number;
  message?: string;
}

export interface RegisterResponse {
  token: string;
  role: { id: number, name: string };
  id: number;
  message?: string;
}

function getMessageFromResponse(response: { status: number; data?: unknown }): string | null {
  if (typeof response.data === 'string' && response.data.trim()) {
    return response.data.trim();
  }
  return null;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  } catch (error: unknown) {
    const axiosError = error && typeof error === 'object' && 'response' in error ? (error as { response?: { status: number; data?: unknown } }).response : undefined;
    if (axiosError && typeof axiosError === 'object' && 'status' in axiosError) {
      const serverMessage = getMessageFromResponse(axiosError);
      if (serverMessage) {
        throw new Error(serverMessage);
      }
      switch (axiosError.status) {
        case 404:
          throw new Error('El correo electrónico no está registrado');
        case 401:
          throw new Error('Las credenciales ingresadas son incorrectas');
        default:
          break;
      }
    }
    throw new Error('Error al iniciar sesión. Por favor intenta nuevamente.');
  }
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  try {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status === 409) {
      throw new Error('Correo ya registrado');
    }
    throw new Error('Error al registrar usuario. Por favor intenta nuevamente.');
  }
} 