const API_URL = import.meta.env.VITE_API_URL;

export async function getUserByEmail(email: string, token: string) {
    const response = await fetch(`${API_URL}/Clients/email/${encodeURIComponent(email)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('No se pudo obtener el usuario');
    return response.json();
  }