import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

/**
 * Layout wrapper for all protected routes: fixed Navbar + scrollable main content.
 */
function Layout() {
  return (
    <>
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
