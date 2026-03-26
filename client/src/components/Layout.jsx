import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import ErrorBoundary from './ErrorBoundary';

/**
 * Layout wrapper for all protected routes: fixed Navbar + scrollable main content.
 */
function Layout() {
  return (
    <>
      <Navbar />
      <main className="app-main">
        <div className="container">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </>
  );
}

export default Layout;
