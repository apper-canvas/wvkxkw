import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-surface-800 dark:text-surface-200 mb-6">Page Not Found</h2>
        <p className="text-surface-600 dark:text-surface-400 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/dashboard"
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;