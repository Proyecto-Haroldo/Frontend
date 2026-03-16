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
    sector: string;
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