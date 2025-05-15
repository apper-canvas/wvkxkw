import { useLocation } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

const Header = () => {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/menu')) return 'Menu Management';
    if (path.includes('/orders')) return 'Order Management';
    if (path.includes('/inventory')) return 'Inventory Management';
    return 'Checkers Cafe';
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('darkMode', !isDarkMode);
  };

  return (
    <header className="bg-white dark:bg-surface-800 shadow-sm py-4 px-6 flex justify-between items-center ml-64">
      <h1 className="text-xl font-bold">{getPageTitle()}</h1>
      <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700">
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    </header>
  );
};

export default Header;