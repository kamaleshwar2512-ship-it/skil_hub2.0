import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import SidebarLeft from './SidebarLeft';
import ErrorBoundary from './ErrorBoundary';

/**
 * App shell: fixed Navbar + icon sidebar + scrollable content area.
 * Wrapped in a global ErrorBoundary for overall stability,
 * with an inner boundary isolating the page content.
 */
function Layout() {
  return (
    <ErrorBoundary>
      <Navbar />
      <div className="app-shell">
        <SidebarLeft />
        <main className="app-main">
          <div className="container">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default Layout;
