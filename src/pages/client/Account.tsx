import { useEffect, useState } from 'react';
import { User, Mail, Phone, Building2, Shield, Bell, LogOut, Trash } from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { getClientById, deleteClientById } from '../../api/userApi';

import { Client } from '../../core/models/ClientModel';
import EditClientModal from '../../shared/ui/components/modals/EditClientModal';
import ConfirmDeleteCard from '../../shared/ui/components/cards/ConfirmDeleteCard';

interface JwtPayload {
  sub: string; // email
  [key: string]: unknown;
}

function Account() {
  const { token, logout } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [clientData, setClientData] = useState<Client | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Estado para confirmar eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Obtener email desde token JWT
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setEmail(decoded.sub);
      } catch {
        setEmail('');
      }
    }
  }, [token]);

  // Obtener clientId desde localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      const id = parseInt(storedUserId, 10);
      getClientById(id)
        .then(client => {
          setClientData(client);
          setName(client.legalName);
        })
        .catch(err => console.error('Error al obtener cliente:', err));
    }
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleUpdate = (updatedClient: Client) => {
    setClientData(updatedClient);
    setName(updatedClient.legalName);
  };

  // Eliminar cuenta
  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = async () => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId || !token) return;

    const id = parseInt(storedUserId, 10);

    try {
      setLoadingDelete(true);
      await deleteClientById(id);
      setLoadingDelete(false);
      setShowDeleteConfirm(false);
      logout();
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      setLoadingDelete(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Mi Cuenta</h1>

      {/* Profile Section */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="font-medium">{name || 'Nombre de usuario'}</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-base-content/50" />
              <span>{email || 'No disponible'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-base-content/50" />
              <span>+57 341 1548520</span>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-base-content/50" />
              <span>Medellin, Colombia</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => setShowEditModal(true)}
              className="btn btn-link p-0 text-sm font-semibold text-primary"
            >
              Editar información
            </button>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="font-medium mb-6">Configuración</h2>

          <div className="space-y-4">
            {/* Security */}
            <div className="flex items-center justify-between py-3 border-b border-base-200">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-base-content/50" />
                <div>
                  <p className="font-medium">Seguridad</p>
                  <p className="text-sm text-base-content/70">Contraseña y autenticación</p>
                </div>
              </div>
              <button className="btn btn-link p-0 text-sm font-semibold text-primary">
                Gestionar
              </button>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-base-content/50" />
                <div>
                  <p className="font-medium">Notificaciones</p>
                  <p className="text-sm text-base-content/70">Preferencias de comunicación</p>
                </div>
              </div>
              <button className="btn btn-link p-0 text-sm font-semibold text-primary">
                Configurar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Section */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="font-medium text-error mb-4">Sesión</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogOut className="h-5 w-5 text-error" />
              <div>
                <p className="font-medium">Cerrar Sesión</p>
                <p className="text-sm text-base-content/70">Salir del panel de asesoría</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-error btn-sm gap-2"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="font-medium text-error mb-4">Zona de Peligro</h2>
          <div>
            <button
              onClick={handleDeleteAccount}
              className="btn btn-error btn-sm gap-2"
            >
              <Trash className="h-4 w-4" />
              Eliminar cuenta
            </button>
          </div>
        </div>
      </div>

      {/* Modal de edición */}
      {showEditModal && clientData && (
        <EditClientModal
          client={clientData}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdate}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <ConfirmDeleteCard
          title="Eliminar cuenta"
          message="¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer."
          confirmText="Sí, eliminar"
          cancelText="Cancelar"
          loading={loadingDelete}
          onConfirm={confirmDeleteAccount}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}

export default Account;
