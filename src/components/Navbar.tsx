import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Briefcase,
  Calendar,
  FileText,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';

function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/services', icon: Briefcase, label: 'Servicios' },
    { path: '/schedule', icon: Calendar, label: 'Agendar' },
    { path: '/diagnostics', icon: FileText, label: 'Diagnósticos' },
    { path: '/account', icon: User, label: 'Cuenta' },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white rounded-b-2xl flex items-center justify-between px-4 md:hidden">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-light-purple rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold">FC</span>
          </div>
          <span className="font-semibold text-xl">FinanceConsult</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-neutral-100 rounded-lg"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-neutral-600" />
          ) : (
            <Menu className="h-6 w-6 text-neutral-600" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/15  md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav className={`fixed md:fixed w-64 h-screen bg-white rounded-r-2xl p-6 z-50 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        <div className="hidden md:flex items-center gap-3 mb-8">
          <div className="h-8 w-8 bg-light-purple rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold">FC</span>
          </div>
          <span className="font-semibold text-xl">FinanceConsult</span>
        </div>

        <div className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-light-purple/10 text-dark-purple'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <button className="flex items-center gap-3 w-full px-4 py-3 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
            <LogOut className="h-5 w-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </nav>
    </>
  );
}

export default Navbar;