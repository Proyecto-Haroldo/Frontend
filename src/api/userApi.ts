import { Client } from "../core/models/ClientModel";
import { apiClient } from "./apiClient";

const API_URL = import.meta.env.VITE_API_URL;

// Helper function to map role name to role object
const mapRoleNameToRoleObject = (roleName: string | null | undefined) => {
  const nameToIdMap: Record<string, number> = {
    'admin': 1,
    'administrador': 1,
    'role_admin': 1,
    'client': 2,
    'cliente': 2,
    'role_client': 2,
    'adviser': 3,
    'asesor': 3,
    'role_adviser': 3,
    'role_asesor': 3,
  };
  
  if (!roleName) {
    return { id: 0, name: 'Unknown' };
  }
  
  // Normalize role name by removing special characters and extra whitespace
  const roleNameLower = roleName.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const roleId = nameToIdMap[roleNameLower] || 0;
  
  return {
    id: roleId,
    name: roleName
  };
};

// Helper to transform backend client to frontend format
const transformClient = (client: any): Client => ({
  ...client,
  role: mapRoleNameToRoleObject(client.roleName),
  questionnaires: client.questionnaires || []
});

export async function getUserByEmail(email: string, token: string) {
  try {
    const response = await fetch(`${API_URL}/users/email/${encodeURIComponent(email)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      // If endpoint doesn't exist (404), return empty client
      if (response.status === 404) {
        return { legalName: '' } as Client;
      }
      throw new Error('No se pudo obtener el usuario');
    }
    const client = await response.json();
    return transformClient(client);
  } catch (error) {
    console.error('Error in getUserByEmail, endpoint might not exist:', error);
    // Return empty client object to prevent crashes
    return { legalName: '' } as Client;
  }
}

export const getAllClients = async (): Promise<Client[]> => {
  try {
    const response = await apiClient.get<Client[]>('/users');
    // Transform backend response to frontend format
    return response.data.map(transformClient);
  } catch (error) {
    console.error('Error fetching all clients:', error);
    throw new Error('Failed to fetch clients');
  }
};

export const getClientById = async (id: number): Promise<Client> => {
  try {
    const response = await apiClient.get<Client>(`/users/${id}`);
    return transformClient(response.data);
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw new Error('Failed to fetch user details');
  }
};

export const deleteClientById = async (id: number): Promise<Client> => {
  try {
    const response = await apiClient.delete<Client>(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user details:', error);
    throw new Error('Failed to delete user details');
  }
};

export const putClientById = async (id: number, client: Client): Promise<Client> => {
  try {
    const response = await apiClient.put<Client>(`/users/${id}`, { client });
    return response.data;
  } catch (error) {
    console.error('Error updating user details:', error);
    throw new Error('Failed to update user details');
  }
};