import { IUser } from "../core/models/user";
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

// Helper to transform backend user to frontend format
const transformUser = (user: any): IUser => ({
  ...user,
  role: mapRoleNameToRoleObject(user.roleName),
  questionnaires: user.questionnaires || []
});

export async function getUserByEmail(email: string, token: string) {
  try {
    const response = await fetch(`${API_URL}/users/email/${encodeURIComponent(email)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      // If endpoint doesn't exist (404), return empty user
      if (response.status === 404) {
        return { legalName: '' } as IUser;
      }
      throw new Error('No se pudo obtener el usuario');
    }
    const user = await response.json();
    return transformUser(user);
  } catch (error) {
    console.error('Error in getUserByEmail, endpoint might not exist:', error);
    // Return empty user object to prevent crashes
    return { legalName: '' } as IUser;
  }
}

export const getAllUsers = async (): Promise<IUser[]> => {
  try {
    const response = await apiClient.get<IUser[]>('/users');
    // Transform backend response to frontend format
    return response.data.map(transformUser);
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw new Error('Failed to fetch users');
  }
};

export const getUserById = async (id: number): Promise<IUser> => {
  try {
    const response = await apiClient.get<IUser>(`/users/${id}`);
    return transformUser(response.data);
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw new Error('Failed to fetch user details');
  }
};

export const deleteUserById = async (id: number): Promise<IUser> => {
  try {
    const response = await apiClient.delete<IUser>(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user details:', error);
    throw new Error('Failed to delete user details');
  }
};

export const putUserById = async (id: number, user: IUser): Promise<IUser> => {
  try {
    const response = await apiClient.put<IUser>(`/users/${id}`, { user });
    return response.data;
  } catch (error) {
    console.error('Error updating user details:', error);
    throw new Error('Failed to update user details');
  }
};