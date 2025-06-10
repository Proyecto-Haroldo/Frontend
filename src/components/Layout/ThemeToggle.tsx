import { useState, useEffect, ReactElement } from 'react';
import { motion } from 'motion/react';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';

type Theme = 'default' | 'light' | 'dark';

function ThemeToggle() {
  // Initialize theme state properly
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'default';
  });

  // Apply theme on mount and when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listen for theme changes from DaisyUI theme controller
  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.classList.contains('theme-controller')) {
        setTheme(target.value as Theme);
      }
    };

    document.addEventListener('change', handleThemeChange);
    return () => document.removeEventListener('change', handleThemeChange);
  }, []);

  // Get theme icon and label
  const getThemeIcon = (): ReactElement => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getThemeLabel = (): string => {
    switch (theme) {
      case 'light':
        return 'Claro';
      case 'dark':
        return 'Oscuro';
      default:
        return 'Predeterminado';
    }
  };

  return (
    <motion.div 
      className="dropdown dropdown-top"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9 }}
    >
      <motion.div
        tabIndex={0}
        role="button"
        className="btn btn-ghost justify-start gap-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {getThemeIcon()}
        <span>{getThemeLabel()}</span>
        <ChevronDown className="h-4 w-4" />
      </motion.div>
      
      <ul tabIndex={0} className="dropdown-content bg-base-300 rounded-box z-50 w-52 p-2 shadow-2xl">
        <li>
          <input
            type="radio"
            name="theme-dropdown"
            className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
            aria-label="Predeterminado"
            value="default"
            defaultChecked={theme === 'default'}
          />
        </li>
        <li>
          <input
            type="radio"
            name="theme-dropdown"
            className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
            aria-label="Claro"
            value="light"
            defaultChecked={theme === 'light'}
          />
        </li>
        <li>
          <input
            type="radio"
            name="theme-dropdown"
            className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
            aria-label="Oscuro"
            value="dark"
            defaultChecked={theme === 'dark'}
          />
        </li>
      </ul>
    </motion.div>
  );
}

export default ThemeToggle;