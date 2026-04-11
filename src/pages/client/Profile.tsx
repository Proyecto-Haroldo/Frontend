import { useEffect, useState } from 'react';
import { User, Mail, Phone, Building2, Shield, Bell, Trash, MapPin, IdCard, Globe } from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { getUserById, deleteUserById } from '../../api/usersApi';
import { IUser } from '../../core/models/user';
import { useNavigate } from 'react-router-dom';
import ModalEditUser from '../../shared/ui/components/modals/ModalEditUser';
import DialogConfirmDelete from '../../shared/ui/components/dialogs/DialogConfirmDelete';

interface JwtPayload {
  sub: string; // email
  [key: string]: unknown;
}

function Profile() {
  const { token, logout, userId } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [userData, setUserData] = useState<IUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const navigate = useNavigate();

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

    const id = Number(storedUserId);

    try {
      setLoadingDelete(true);
      await deleteUserById(id);
      setLoadingDelete(false);
      setShowDeleteConfirm(false);
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      setLoadingDelete(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex items-start justify-center">
      <div className="container space-y-4 md:space-y-5">
        <h1 className="text-2xl font-semibold">Mi Cuenta</h1>

        {/* Profile Section */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-start w-full gap-4">
              <div className="h-12 w-12 rounded-full aspect-[1/1] bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className='flex flex-col w-full'>
                <h2 className="font-medium text-xl">{name}</h2>
                <span className='text-base-content/50 capitalize'>{userData?.clientType.toLocaleLowerCase() || 'No disponible'}</span>
              </div>
            </div>

            <hr className="text-accent/30 w-full max-w-100 my-4" />

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-base-content/50" />
                <span>{email || 'No disponible'}</span>
              </div>
              <div className="flex items-center gap-3">
                <IdCard className="h-5 w-5 text-base-content/50" />
                <span>{userData?.cedulaOrNIT || 'No específicado'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-base-content/50" />
                <span>{userData?.sector || 'No específicado'}</span>
              </div>
              {userData?.network && (
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-base-content/50" />
                  <a target='_blank' href={userData.network} className='link'>LinkedIn</a>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-base-content/50" />
                <span>{userData?.phone || 'No específicado'}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-base-content/50" />
                <span>{userData?.location || 'No específicado'}</span>
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

        {/* Modal de edición */}
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
    </div>
  );
}

export default Profile;
