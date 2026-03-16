import { useEffect, useState } from 'react';
import {
  User, Mail, Phone, Building2, Settings, Key,
  SquareUserRound, BriefcaseBusiness, Trash
} from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { getUserById, deleteUserById } from '../../api/usersApi';
import { useNavigate } from 'react-router-dom';
import { IUser } from '../../core/models/user';
import ModalEditUser from '../../shared/ui/components/modals/ModalEditUser';
import DialogConfirmDelete from '../../shared/ui/components/dialogs/DialogConfirmDelete';

interface JwtPayload {
  sub: string; // email
  [key: string]: unknown;
}

function AdviserProfile() {
  const { token, logout, userId } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [userData, setUserData] = useState<IUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();

  // Estado para confirmar eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // --- Obtener email desde token JWT ---
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

  // Obtener userId desde AuthContext y cargar datos del usuario
  useEffect(() => {
    if (userId == null) return;

    getUserById(userId)
      .then(user => {
        setUserData(user);
        setName(user.legalName);
      })
      .catch(err => console.error('Error al obtener cliente:', err));
  }, [userId]);

  const handleUpdate = (updatedUser: IUser) => {
    setUserData(updatedUser);
    setName(updatedUser.legalName);
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
      await deleteUserById(id);
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
      <h1 className="text-2xl font-semibold">Perfil del Asesor</h1>

      {/* Profile Section */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="font-medium">{name || 'Nombre de usuario'}</h2>
              <p className="text-sm text-base-content/70">Asesor</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <BriefcaseBusiness className="h-5 w-5 text-base-content/50" />
            <span>{userData?.clientType || 'No disponible'}</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <SquareUserRound className="h-5 w-5 text-base-content/50" />
              <span>{userData?.cedulaOrNIT || 'No disponible'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-base-content/50" />
              <span>{email || 'No disponible'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-base-content/50" />
              <span>{userData?.phone || '+57 000 0000000'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-base-content/50" />
              <span>{userData?.address || 'Medellín, Colombia'}</span>
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

      {/* Admin Settings */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="font-medium mb-6">Configuración Administrativa</h2>

          <div className="space-y-4">

            <div className="flex items-center justify-between py-3 border-b border-base-200">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-base-content/50" />
                <div>
                  <p className="font-medium">Gestión de Cuestionarios</p>
                  <p className="text-sm text-base-content/70">Administrar cuestionarios y métricas</p>
                </div>
              </div>
              <button onClick={() => navigate('/a')} className="btn btn-link p-0 text-sm font-semibold text-primary">
                Gestionar
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="font-medium mb-6">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="btn btn-outline btn-sm gap-2">
              <Key className="h-4 w-4" />
              Cambiar Contraseña
            </button>
            <button className="btn btn-outline btn-sm gap-2">
              <Settings className="h-4 w-4" />
              Configuración Avanzada
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="font-medium text-error mb-4">Zona de Peligro</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trash className="h-5 w-5 text-error" />
              <div>
                <p className="font-medium">Eliminar Cuenta</p>
                <p className="text-sm text-base-content/70">Borrar permanentemente tu cuenta del sistema</p>
              </div>
            </div>
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
      </div>

      {/* Modal para editar perfil */}
      {showEditModal && userData && (
        <ModalEditUser
          user={userData}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdate}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <DialogConfirmDelete
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

export default AdviserProfile;

