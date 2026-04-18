import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home, Compass, Briefcase,
  Calendar, ClipboardList, User, LogOut, Menu, X,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { BarChart } from 'lucide-react';
import type { Variants } from 'motion/react';
import ThemeToggle from '../theme/ThemeToggle';
import ITMLogo from '../../../../../public/assets/ITMLogo';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { logout, role, userStatus } = useAuth();

  const isActive = (path: string) => {
    if (
      location.pathname.startsWith('/a/questionnaires') ||
      location.pathname.startsWith('/a/analysis') ||
      location.pathname.startsWith('/m/users') ||
      location.pathname.startsWith('/m/questionnaires') ||
      location.pathname.startsWith('/m/analysis')
    ) return location.pathname.includes(path);
    return location.pathname === path;
  };

  // Navigation items based on user role
  const getNavItems = () => {
    if (role === 1) { // Admin
      return [
        { path: '/m', icon: Compass, label: 'Dashboard' },
        { path: '/m/reports', icon: BarChart, label: 'Reportes' },
        { path: '/m/profile', icon: User, label: 'Perfil' },
      ];
    } else if (role === 2) { // Client
      return [
        { path: '/c', icon: Home, label: 'Inicio' },
        { path: '/c/services', icon: Briefcase, label: 'Servicios' },
        { path: '/c/schedule', icon: Calendar, label: 'Agendar' },
        { path: '/c/analysis', icon: ClipboardList, label: 'Análisis' },
        { path: '/c/profile', icon: User, label: 'Perfil' },
      ];
    } else if (role === 3) { // Adviser
      const baseItems = [
        { path: '/a', icon: Compass, label: 'Dashboard' },
        { path: '/a/profile', icon: User, label: 'Perfil' },
      ];

      // Only add Reportes if user is AUTHORIZED
      if (userStatus === "AUTHORIZED") {
        baseItems.splice(1, 0, { path: '/a/reports', icon: BarChart, label: 'Reportes' });
      }

      return baseItems;
    }
    return [];
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = getNavItems();

  // Animation variants
  const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };

  const sidebarVariants: Variants = {
    hidden: { x: "-100%" },
    visible: {
      x: 0,
      transition: {
        type: "spring" as const,
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
      <div
        className="fixed top-0 left-0 right-0 h-16 bg-base-100 rounded-b-2xl flex items-center justify-between px-4 md:hidden z-22">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="h-12 w-12 flex items-center justify-center">
            <ITMLogo className='h-10 w-10 text-[var(--color-navbar)]' />
          </div>
          <span className="font-normal text-sm text-[var(--color-navbar)] tracking-[4px]">CONSULTORÍA</span>
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
            className="fixed inset-0 bg-base-300/30 backdrop-blur-[1px] z-18 md:hidden"
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
        className="fixed w-64 h-dvh overflow-hidden bg-base-100 rounded-r-2xl p-6 z-20 md:translate-x-0 pt-[68px]"
        variants={sidebarVariants}
        initial="hidden"
        animate={isOpen ? "visible" : "hidden"}
        style={{ display: isOpen ? "block" : "none" }}
        transition={{
          type: "spring" as const,
          stiffness: 400,
          damping: 40
        }}
      >
        <motion.div
          className="hidden md:flex items-center gap-3 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="h-12 w-12 flex items-center justify-center">
            <ITMLogo className='h-15 w-15 text-[var(--color-navbar)]' />
          </div>
          <span className="font-normal text-sm text-[var(--color-navbar)] tracking-[4px]">CONSULTORÍA</span>
        </motion.div>

        <div className="space-y-2 overflow-y-auto pr-2 max-h-[calc(100dvh - 220px)]">
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
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
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
        className="fixed hidden md:block w-64 h-dvh overflow-hidden bg-base-100 rounded-r-2xl p-6 z-20"
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
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="h-12 w-12 flex items-center justify-center">
            <ITMLogo className='h-15 w-15 text-[var(--color-navbar)]' />
          </div>
          <span className="font-normal text-sm tracking-[4px] text-[var(--color-navbar)]">CONSULTORÍA</span>
        </motion.div>

        <div className="space-y-2 overflow-y-auto pr-2 max-h-[calc(100dvh - 220px)]">
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
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${isActive(item.path)
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