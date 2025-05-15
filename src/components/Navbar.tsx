import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Briefcase,
  Calendar,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';

function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    // Check if theme is saved in localStorage
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Toggle theme and save to localStorage
  const toggleTheme = () => {
    const newTheme = theme ? 'light' : 'dark';
    setTheme(!theme);
    localStorage.setItem('theme', newTheme);
  };
  
  // Apply theme on initial load and listen for system theme changes
   useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

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
      <div className="fixed top-0 left-0 right-0 h-16 bg-base-100 rounded-b-2xl flex items-center justify-between px-4 md:hidden">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-content text-lg font-semibold">FC</span>
          </div>
          <span className="font-semibold text-xl">FinanceConsult</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-ghost btn-circle hover:bg-base-200"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-base-300/30 backdrop-blur-[1px] z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav className={`fixed md:fixed w-64 h-screen bg-base-100 rounded-r-2xl p-6 z-50 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        <div className="hidden md:flex items-center gap-3 mb-8">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-content text-lg font-semibold">FC</span>
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
                  ? 'bg-primary/10 text-primary'
                  : 'text-base-content hover:bg-base-200'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="absolute bottom-6 left-6 right-6 space-y-2">
          {/* Theme Toggle */}
          <label className="swap swap-rotate btn btn-ghost btn-circle hover:bg-base-200">
            <input 
              type="checkbox" 
              className="theme-controller"
              value="light"
              checked={theme}
              onChange={toggleTheme}
            />
            <Sun className="swap-on h-5 w-5" />
            <Moon className="swap-off h-5 w-5" />
          </label>

          <button className="flex items-center gap-3 w-full px-4 py-3 text-base-content hover:bg-base-200 rounded-lg transition-colors">
            <LogOut className="h-5 w-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </nav>
    </>
  );
}

export default Navbar;