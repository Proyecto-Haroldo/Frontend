// API service for authentication
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
  role: string;
}

export interface LoginResponse {
  token: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Credenciales inválidas. Por favor verifica tu correo y contraseña.');
    }
    throw new Error('Error al iniciar sesión. Por favor intenta nuevamente.');
  }
  return response.json();
}

export async function register(data: RegisterRequest): Promise<string> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    if (response.status === 409) {
      throw new Error('Correo ya registrado');
    }
    throw new Error('Error al registrar usuario. Por favor intenta nuevamente.');
  }
  return response.text();
} 