import { UserStatus } from "../models/user";

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
    sector: string;
    phone: string;
    network: string;
    location: string;
    status: UserStatus;
    role: {
        id: number
    };
    specialities: {
        categoryId: number;
        title: string;
        description: string;
    }[];
}

export interface LoginResponse {
    token: string;
    role: {
        id: number,
        name: string
    };
    id: number;
    message?: string;
}

export interface RegisterResponse {
    token: string;
    role: {
        id: number,
        name: string
    };
    id: number;
    message?: string;
}