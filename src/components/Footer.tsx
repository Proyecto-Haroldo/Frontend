import { Mail, Phone, MapPin } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <div className="space-y-2">
              <p className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                +1 234 567 890
              </p>
              <p className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                info@financeconsult.com
              </p>
              <p className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                123 Financial District, City
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Servicios</h3>
            <ul className="space-y-2">
              <li>Asesoría Financiera</li>
              <li>Consultoría Empresarial</li>
              <li>Planificación Fiscal</li>
              <li>Gestión Contable</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Horario</h3>
            <p className="mb-2">Lunes a Viernes: 9:00 - 18:00</p>
            <p>Sábados: 9:00 - 13:00</p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p>&copy; 2024 FinanceConsult. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;