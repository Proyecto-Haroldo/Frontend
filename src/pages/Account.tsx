import { User, Mail, Phone, Building2, Shield, Bell } from 'lucide-react';

function Account() {
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
              <h2 className="font-medium">Juan Pérez</h2>
              <p className="text-sm text-base-content/70">Cliente Personal</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-base-content/50" />
              <span>ejemplo@correo.itm.edu.co</span>
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
            <button className="btn btn-link p-0 text-sm font-semibold text-primary">
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
          <div>
            <button className="btn btn-link p-0 text-sm font-semibold text-error">
              Eliminar cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Account;