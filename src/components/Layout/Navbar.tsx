import { useState } from 'react';
import ITMLogo from '../Common/ITMLogo';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import ThemeToggle from './ThemeToggle';
import {
  Home,
  Briefcase,
  Calendar,
  FileText,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BarChart } from 'lucide-react';

function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { logout, role } = useAuth();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Navigation items based on user role
  const getNavItems = () => {
    if (role === 1) { // Admin
      return [
        { path: '/m', icon: BarChart, label: 'Dashboard' },
        { path: '/m/profile', icon: User, label: 'Perfil' },
      ];
    } else if (role === 2) { // Client
      return [
        { path: '/c', icon: Home, label: 'Inicio' },
        { path: '/c/services', icon: Briefcase, label: 'Servicios' },
        { path: '/c/schedule', icon: Calendar, label: 'Agendar' },
        { path: '/c/diagnostics', icon: FileText, label: 'Diagnósticos' },
        { path: '/c/account', icon: User, label: 'Cuenta' },
      ];
    } else if (role === 3) { // Adviser
      return [
        { path: '/a', icon: Home, label: 'Inicio' },
        { path: '/a/profile', icon: User, label: 'Perfil' },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };

  const sidebarVariants = {
    hidden: { x: "-100%" },
    visible: { 
      x: 0,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 30
      }
    }
  };

  const navItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: custom * 0.05,
        duration: 0.3
      }
    })
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.1 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.05 }
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-base-100 rounded-b-2xl flex items-center justify-between px-4 md:hidden z-50">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="h-12 w-12 flex items-center justify-center">
            <ITMLogo/>
          </div>
          <span className="font-semibold text-xl">FinanceConsult</span>
        </motion.div>
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-ghost btn-circle hover:bg-base-200"
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isOpen ? 'close' : 'menu'}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.div>
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-base-300/30 backdrop-blur-[1px] z-40 md:hidden"
            onClick={() => setIsOpen(false)}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.nav 
        className="fixed md:fixed w-64 h-screen bg-base-100 rounded-r-2xl p-6 z-50 md:translate-x-0"
        variants={sidebarVariants}
        initial="hidden"
        animate={isOpen ? "visible" : "hidden"}
        style={{ display: isOpen ? "block" : "none" }}
        transition={{ 
          type: "spring",
          stiffness: 400,
          damping: 40
        }}
      >
        <motion.div 
          className="hidden md:flex items-center gap-3 mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="h-12 w-12 flex items-center justify-center">
            <ITMLogo/>
          </div>
          <span className="font-semibold text-xl">FinanceConsult</span>
        </motion.div>

        <div className="space-y-2">
          {navItems.map((item, index) => (
            <motion.div
              key={item.path}
              custom={index}
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ x: 5, transition: { duration: 0.1 } }}
            >
              <Link
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
                {isActive(item.path) && (
                  <motion.div
                    className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                    layoutId="activeIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="absolute bottom-6 left-6 right-6 space-y-2">
          {/* Use the ThemeToggle component */}
          <ThemeToggle />

          <motion.button 
            className="flex items-center gap-3 w-full px-4 py-3 text-base-content hover:bg-base-200 rounded-lg transition-colors cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            whileHover={{ x: 5, scale: 1.02, transition: { duration: 0.1 } }}
            whileTap={{ scale: 0.98, transition: { duration: 0.05 } }}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span>Cerrar Sesión</span>
          </motion.button>
        </div>
      </motion.nav>

      {/* Desktop Sidebar */}
      <motion.nav 
        className="fixed hidden md:block w-64 h-screen bg-base-100 rounded-r-2xl p-6 z-50"
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 30,
          delay: 0.2
        }}
      >
        <motion.div 
          className="flex items-center gap-3 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="h-12 w-12 flex items-center justify-center">
            <ITMLogo className='h-15 w-15 text-primary'/>
          </div>
          <span className="font-semibold text-xl">FinanceConsult</span>
        </motion.div>

        <div className="space-y-2">
          {navItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ x: 5, transition: { duration: 0.1 } }}
            >
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                  isActive(item.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-base-content hover:bg-base-200'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
                {isActive(item.path) && (
                  <motion.div
                    className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                    layoutId="activeIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="absolute bottom-6 left-6 right-6 space-y-2">
          {/* Use the ThemeToggle component */}
          <ThemeToggle />

          <motion.button 
            className="flex items-center gap-3 w-full px-4 py-3 text-base-content hover:bg-base-200 rounded-lg transition-colors cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            whileHover={{ x: 5, scale: 1.02, transition: { duration: 0.1 } }}
            whileTap={{ scale: 0.98, transition: { duration: 0.05 } }}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span>Cerrar Sesión</span>
          </motion.button>
        </div>
      </motion.nav>
    </>
  );
}

export default Navbar;