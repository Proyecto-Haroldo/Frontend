import { useEffect, useState } from 'react';
import {
  User, Mail, Phone, Building2, Shield,
  Bell, Settings, Key, IdCard, MapPin, Globe
} from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { getUserById } from '../../api/usersApi';
import { IUser } from '../../core/models/user';
import { useNavigate } from 'react-router-dom';
import { useThemeColors } from '../../shared/hooks/useThemeColors';
import ModalEditUser from '../../shared/ui/components/modals/ModalEditUser';

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface JwtPayload {
  sub: string; // email
  [key: string]: unknown;
}

const ProfileSkeleton: React.FC = () => {
  const { base } = useThemeColors();

  return (
    <SkeletonTheme baseColor={base} highlightColor={base}>
      <div className="card bg-base-100">
        <div className="card-body">

          {/* Header (avatar + name + type) */}
          <div className="flex items-start w-full gap-4">
            <Skeleton
              circle
              width={48}
              height={48}
            />

            <div className="flex flex-col w-full gap-2">
              <div className="w-2/5 max-w-[280px]">
                <Skeleton height={24} />
              </div>
              <div className="w-1/4 max-w-[220px]">
                <Skeleton height={16} />
              </div>
            </div>
          </div>

          {/* Info list */}
          <div className="space-y-4 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton circle width={20} height={20} />
                <div className="w-3/5 max-w-[200px]">
                  <Skeleton height={18} />
                </div>
              </div>
            ))}

            {/* Optional network */}
            <div className="flex items-center gap-3">
              <Skeleton circle width={20} height={20} />
              <div className="w-1/4 max-w-[160px]">
                <Skeleton height={18} />
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <div className="mt-6 mb-1">
            <div className="w-1/3 max-w-[270px]">
              <Skeleton height={18} />
            </div>
          </div>

        </div>
      </div>
    </SkeletonTheme>
  );
};

function AdminProfile() {
  const { token, userId } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [userData, setUserData] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();

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
    if (userId == null) {
      setLoading(false);
      return;
    }

    setLoading(true);

    getUserById(userId)
      .then(user => {
        setUserData(user);
      })
      .catch(err => console.error('Error al obtener cliente:', err))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleUpdate = (updatedUser: IUser) => {
    setUserData(updatedUser);
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex items-start justify-center">
      <div className="container space-y-4 md:space-y-5">
        <h1 className="text-2xl font-semibold">Perfil Administrativo</h1>

        {loading ? (
          <ProfileSkeleton />
        ) : (
          <>
            {/* Profile Section */}
            <div className="card bg-base-100">
              <div className="card-body">
                <div className="flex items-start w-full gap-4">
                  <div className="h-12 w-12 rounded-full aspect-[1/1] bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex flex-col w-full">
                    <h2 className="font-medium text-xl">{userData?.legalName || 'No disponible'}</h2>
                    <span className="text-base-content/50 capitalize">
                      {userData?.clientType?.toLocaleLowerCase() || 'No disponible'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-base-content/50" />
                    <span>{email || 'No disponible'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <IdCard className="h-5 w-5 text-base-content/50" />
                    <span>{userData?.cedulaOrNIT || 'No especificado'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-base-content/50" />
                    <span>{userData?.sector || 'No especificado'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-base-content/50" />
                    <span>{userData?.location || 'No especificado'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-base-content/50" />
                    <span>{userData?.phone || 'No especificado'}</span>
                  </div>

                  {userData?.network && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-base-content/50" />
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={userData.network}
                        className="link"
                      >
                        LinkedIn
                      </a>
                    </div>
                  )}
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
          </>
        )}

        {/* Admin Settings */}
        <div className="card bg-base-100">
          <div className="card-body">
            <h2 className="font-medium mb-6">Configuración Administrativa</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-base-200">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-base-content/50" />
                  <div>
                    <p className="font-medium">Configuración del Sistema</p>
                    <p className="text-sm text-base-content/70">Gestión de parámetros del sistema</p>
                  </div>
                </div>
                <button className="btn btn-link p-0 text-sm font-semibold text-primary">
                  Configurar
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-base-200">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-base-content/50" />
                  <div>
                    <p className="font-medium">Gestión de Usuarios</p>
                    <p className="text-sm text-base-content/70">Administrar usuarios y permisos</p>
                  </div>
                </div>
                <button onClick={() => navigate('/m')} className="btn btn-link p-0 text-sm font-semibold text-primary">
                  Gestionar
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-base-200">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-base-content/50" />
                  <div>
                    <p className="font-medium">Seguridad</p>
                    <p className="text-sm text-base-content/70">Configuración de seguridad y acceso</p>
                  </div>
                </div>
                <button className="btn btn-link p-0 text-sm font-semibold text-primary">
                  Configurar
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-base-content/50" />
                  <div>
                    <p className="font-medium">Notificaciones</p>
                    <p className="text-sm text-base-content/70">Configurar alertas del sistema</p>
                  </div>
                </div>
                <button className="btn btn-link p-0 text-sm font-semibold text-primary">
                  Configurar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card bg-base-100">
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

        {/* Modal para editar perfil */}
        {showEditModal && userData && (
          <ModalEditUser
            user={userData}
            onClose={() => setShowEditModal(false)}
            onUpdate={handleUpdate}
          />
        )}
      </div>
    </div>
  );
}

export default AdminProfile;

