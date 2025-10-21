import { Client } from "../core/models/ClientModel";
import { apiClient } from "./apiClient";

const API_URL = import.meta.env.VITE_API_URL;

export async function getUserByEmail(email: string, token: string) {
  const response = await fetch(`${API_URL}/Clients/email/${encodeURIComponent(email)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('No se pudo obtener el usuario');
  return response.json();
}

export const getAllClients = async (): Promise<Client[]> => {
  try {
    const response = await apiClient.get<Client[]>('/Clients');
    return response.data;
  } catch (error) {
    console.error('Error fetching all clients:', error);
    throw new Error('Failed to fetch clients');
  }
};

export const getClientById = async (id: number): Promise<Client> => {
  try {
    const response = await apiClient.get<Client>(`/Clients/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching client details:', error);
    throw new Error('Failed to fetch client details');
  }
};

export const deleteClientById = async (id: number): Promise<Client> => {
  try {
    const response = await apiClient.delete<Client>(`/ClientsDelete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting client details:', error);
    throw new Error('Failed to delete client details');
  }
};

export const putClientById = async (id: number, client: Client): Promise<Client> => {
  try {
    const response = await apiClient.put<Client>(`/ClientsPut/${id}`, { client });
    return response.data;
  } catch (error) {
    console.error('Error deleting client details:', error);
    throw new Error('Failed to delete client details');
  }
};