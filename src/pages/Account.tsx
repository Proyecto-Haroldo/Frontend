import React from 'react';
import { User, Mail, Phone, Building2, Shield, Bell } from 'lucide-react';

function Account() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Mi Cuenta</h1>

      {/* Profile Section */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="font-medium">Juan Pérez</h2>
            <p className="text-sm text-neutral-600">Cliente Personal</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-neutral-400" />
            <span>juan.perez@email.com</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-neutral-400" />
            <span>+1 234 567 890</span>
          </div>
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-neutral-400" />
            <span>Lima, Perú</span>
          </div>
        </div>

        <button className="mt-6 text-sm text-blue-600 hover:text-blue-700">
          Editar información
        </button>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="font-medium mb-6">Configuración</h2>
        
        <div className="space-y-4">
          {/* Security */}
          <div className="flex items-center justify-between py-3 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-neutral-400" />
              <div>
                <p className="font-medium">Seguridad</p>
                <p className="text-sm text-neutral-600">Contraseña y autenticación</p>
              </div>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              Gestionar
            </button>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between py-3 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-neutral-400" />
              <div>
                <p className="font-medium">Notificaciones</p>
                <p className="text-sm text-neutral-600">Preferencias de comunicación</p>
              </div>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              Configurar
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="font-medium text-red-600 mb-4">Zona de Peligro</h2>
        <button className="text-sm text-red-600 hover:text-red-700">
          Eliminar cuenta
        </button>
      </div>
    </div>
  );
}

export default Account;