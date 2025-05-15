import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * A wrapper component that protects routes requiring authentication
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.user);
  const currentPath = window.location.pathname + window.location.search;

  useEffect(() => {
    // If not authenticated, redirect to login with the current path as redirect parameter
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [isAuthenticated, navigate, currentPath]);

  // Only render children if authenticated
  return isAuthenticated ? children : null;
};

export default ProtectedRoute;