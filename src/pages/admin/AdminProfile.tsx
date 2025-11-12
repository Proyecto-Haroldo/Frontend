import { useEffect, useState } from 'react';
import {
  User, Mail, Phone, Building2, Shield,
  Bell, LogOut, Settings, Key,
  SquareUserRound,
  BriefcaseBusiness
} from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { getUserById } from '../../api/userApi';
import { useNavigate } from 'react-router-dom';
import { IUser } from '../../core/models/user';
import EditUserModal from '../../shared/ui/components/modals/EditUserModal';

interface JwtPayload {
  sub: string; // email
  [key: string]: unknown;
}

function AdminProfile() {
  const { token, logout } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [userData, setUserData] = useState<IUser | null>(null);
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

  // --- Obtener clientId desde localStorage ---
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      const id = parseInt(storedUserId, 10);
      getUserById(id)
        .then(user => {
          setUserData(user);
          setName(user.legalName);
        })
        .catch(err => console.error('Error al obtener cliente:', err));
    }
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleUpdate = (updatedUser: IUser) => {
    setUserData(updatedUser);
    setName(updatedUser.legalName);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Perfil Administrativo</h1>

      {/* Profile Section */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="font-medium">{name || 'Nombre de usuario'}</h2>
              <p className="text-sm text-base-content/70">Administrador del Sistema</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <SquareUserRound className="h-5 w-5 text-base-content/50" />
              <span>{userData?.cedulaOrNIT || 'No disponible'}</span>
            </div>
            <div className="flex items-center gap-3">
              <BriefcaseBusiness className="h-5 w-5 text-base-content/50" />
              <span>{userData?.clientType || 'No disponible'}</span>
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

      {/* Logout Section */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="font-medium text-error mb-4">Sesión</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogOut className="h-5 w-5 text-error" />
              <div>
                <p className="font-medium">Cerrar Sesión</p>
                <p className="text-sm text-base-content/70">Salir del panel administrativo</p>
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

      {/* Modal para editar perfil */}
      {showEditModal && userData && (
        <EditUserModal
          user={userData}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}

export default AdminProfile;

