import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useContext } from 'react';
import { AuthContext } from '../../App';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ShoppingCart, 
  Package, 
  ChevronDown, 
  LogOut, 
  User 
} from 'lucide-react';

const SideNav = () => {
  const location = useLocation();
  const [expanded, setExpanded] = useState(true);
  const { user } = useSelector(state => state.user);
  const { logout } = useContext(AuthContext);

  const navItems = [
    { 
      path: '/dashboard', 
      name: 'Dashboard', 
      icon: <LayoutDashboard className="w-5 h-5" /> 
    },
    { 
      path: '/menu', 
      name: 'Menu', 
      icon: <UtensilsCrossed className="w-5 h-5" /> 
    },
    { 
      path: '/orders', 
      name: 'Orders', 
      icon: <ShoppingCart className="w-5 h-5" /> 
    },
    { 
      path: '/inventory', 
      name: 'Inventory', 
      icon: <Package className="w-5 h-5" /> 
    }
  ];

  return (
    <div className={`bg-white dark:bg-surface-800 shadow-md transition-all duration-300 ${expanded ? 'w-64' : 'w-16'} h-screen fixed left-0 top-0`}>
      <div className="flex justify-between items-center p-4 border-b border-surface-200 dark:border-surface-700">
        {expanded && <div className="text-xl font-bold">Checkers Cafe</div>}
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="p-1 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
        >
          <ChevronDown className={`w-5 h-5 transform transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      <div className="py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center p-3 mx-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 dark:bg-surface-700 dark:text-blue-400' 
                  : 'hover:bg-surface-100 dark:hover:bg-surface-700'
              }`
            }
          >
            <span className="mr-3">{item.icon}</span>
            {expanded && <span>{item.name}</span>}
          </NavLink>
        ))}
      </div>
      
      <div className="absolute bottom-0 w-full border-t border-surface-200 dark:border-surface-700 p-4">
        {expanded && user && (
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="overflow-hidden">
              <div className="truncate font-medium">{user.firstName} {user.lastName}</div>
              <div className="text-xs text-surface-500 truncate">{user.emailAddress}</div>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center w-full p-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          {expanded && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default SideNav;