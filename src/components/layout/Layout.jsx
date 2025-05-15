import SideNav from './SideNav';
import Header from './Header';

/**
 * Main layout component that wraps all protected pages
 * Includes the side navigation and header
 */
const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-surface-50 dark:bg-surface-900">
      <SideNav />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;