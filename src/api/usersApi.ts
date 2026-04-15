import { IUser } from "../core/models/user";
import { apiClient } from "./apiClient";

// Helper function to map role name to role object
const mapRoleNameToRoleObject = (roleName: string) => {

  // Normalizar a minúsculas
  let normalized = roleName.toLowerCase().trim();

  // Mantener guion bajo
  const key = normalized.replaceAll(/[^a-z0-9_]/g, '');

  // Mapa final
  const nameToIdMap: Record<string, number> = {
    'admin': 1,
    'administrador': 1,
    'role_administrador': 1,
    'role_admin': 1,

    'client': 2,
    'cliente': 2,
    'role_cliente': 2,
    'role_client': 2,
    'user': 2,
    'usuario': 2,
    'role_user': 2,
    'role_usuario': 2,

    'adviser': 3,
    'asesor': 3,
    'role_adviser': 3,
    'role_asesor': 3,
  };

  const roleId = nameToIdMap[key] || 0;

  return {
    id: roleId,
    name: key.toUpperCase()
  };
};

// Helper to transform backend user to frontend format
const transformUser = (user: any): IUser => ({
  ...user,
  role: mapRoleNameToRoleObject(user.roleName),
  questionnaires: user.questionnaires || []
});

export const normalizeUserRole = (value?: number): string => {
  switch (value) {
    case 1:
      return 'Admin';
    case 2:
      return 'Cliente';
    case 3:
      return 'Asesor';
    default:
      return 'N/A';
  }
};

export async function getUserByEmail(email: string, token: string) {
  try {
    const response = await apiClient.get<IUser>(
      `/users/email/${encodeURIComponent(email)}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return transformUser(response.data);

  } catch (error: any) {
    // Si el endpoint responde 404, devolver usuario vacío
    if (error.response?.status === 404) {
      return { legalName: '' } as IUser;
    }

    console.error('Error fetching user by email:', error);
    throw new Error('No se pudo obtener el usuario');
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
    const userDTO = {
      userId: id,
      cedulaOrNIT: user.cedulaOrNIT,
      legalName: user.legalName,
      clientType: user.clientType,
      email: user.email,
      sector: user.sector,
      roleName: user.role?.name || '',
      network: user.network,
      location: user.location,
      phone: user.phone,
      specialities: user.specialities?.map(s => ({
        categoryId: s.categoryId,
        title: s.title,
        description: s.description,
        icon: s.icon
      })) || []
    };
    
    const response = await apiClient.put<IUser>('/users', userDTO);
    return transformUser(response.data);
  } catch (error) {
    console.error('Error updating user details:', error);
    throw new Error('Failed to update user details');
  }
};