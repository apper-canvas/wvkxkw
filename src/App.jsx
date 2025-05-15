import { createContext, useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, clearUser } from './store/userSlice';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Callback from './pages/auth/Callback';
import ErrorPage from './pages/auth/ErrorPage';
import Dashboard from './pages/dashboard/Dashboard';
import MenuItems from './pages/menu/MenuItems';
import MenuItemDetails from './pages/menu/MenuItemDetails';
import MenuItemForm from './pages/menu/MenuItemForm';
import Orders from './pages/orders/Orders';
import OrderDetails from './pages/orders/OrderDetails';
import OrderForm from './pages/orders/OrderForm';
import Inventory from './pages/inventory/Inventory';
import InventoryDetails from './pages/inventory/InventoryDetails';
import InventoryForm from './pages/inventory/InventoryForm';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

// Create auth context
export const AuthContext = createContext(null);

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Get authentication status with proper error handling
  const userState = useSelector((state) => state.user);
  const isAuthenticated = userState?.isAuthenticated || false;
  
  // Initialize ApperUI once when the app loads
  useEffect(() => {
    const { ApperClient, ApperUI } = window.ApperSDK;
    const client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Initialize but don't show login yet
    ApperUI.setup(client, {
      target: '#authentication',
      clientId: import.meta.env.VITE_APPER_PROJECT_ID,
      view: 'both',
      onSuccess: function (user) {
        // CRITICAL: This exact currentPath logic must be preserved in all implementations
        // DO NOT simplify or modify this pattern as it ensures proper redirection flow
        let currentPath = window.location.pathname + window.location.search;
        let redirectPath = new URLSearchParams(window.location.search).get('redirect');
        const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || currentPath.includes(
                '/callback') || currentPath.includes('/error');
        if (user) {
            // User is authenticated
            if (redirectPath) {
                navigate(redirectPath);
            } else if (!isAuthPage) {
                if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
                    navigate(currentPath);
                } else {
                    navigate('/dashboard');
                }
            } else {
                navigate('/dashboard');
            }
            // Store user information in Redux
            dispatch(setUser(JSON.parse(JSON.stringify(user))));
        } else {
            // User is not authenticated
            if (!isAuthPage) {
                navigate(
                    currentPath.includes('/signup')
                     ? `/signup?redirect=${currentPath}`
                     : currentPath.includes('/login')
                     ? `/login?redirect=${currentPath}`
                     : '/login');
            } else if (redirectPath) {
                if (
                    ![
                        'error',
                        'signup',
                        'login',
                        'callback'
                    ].some((path) => currentPath.includes(path)))
                    navigate(`/login?redirect=${redirectPath}`);
                else {
                    navigate(currentPath);
                }
            } else if (isAuthPage) {
                navigate(currentPath);
            } else {
                navigate('/login');
            }
            dispatch(clearUser());
        }
      },
      onError: function(error) {
        console.error("Authentication failed:", error);
        navigate('/error?message=' + encodeURIComponent(error.message || 'Authentication failed'));
      }
    });
    
    setIsInitialized(true);
  }, [dispatch, navigate]);
  
  // Authentication methods to share via context
  const authMethods = {
    isInitialized,
    logout: async () => {
      try {
        const { ApperUI } = window.ApperSDK;
        await ApperUI.logout();
        dispatch(clearUser());
        navigate('/login');
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  };
  
  return (
    <AuthContext.Provider value={authMethods}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/error" element={<ErrorPage />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        <Route path="/menu" element={<ProtectedRoute><MenuItems /></ProtectedRoute>} />
        <Route path="/menu/new" element={<ProtectedRoute><MenuItemForm /></ProtectedRoute>} />
        <Route path="/menu/:id" element={<ProtectedRoute><MenuItemDetails /></ProtectedRoute>} />
        <Route path="/menu/:id/edit" element={<ProtectedRoute><MenuItemForm /></ProtectedRoute>} />
        
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/orders/new" element={<ProtectedRoute><OrderForm /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
        <Route path="/orders/:id/edit" element={<ProtectedRoute><OrderForm /></ProtectedRoute>} />
        
        <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/inventory/new" element={<ProtectedRoute><InventoryForm /></ProtectedRoute>} />
        <Route path="/inventory/:id" element={<ProtectedRoute><InventoryDetails /></ProtectedRoute>} />
        <Route path="/inventory/:id/edit" element={<ProtectedRoute><InventoryForm /></ProtectedRoute>} />
        
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;