import './App.css';
import { Outlet, Link, useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <>
      <header className="app-header">
        <div className="container header-content">
          <Link to="/" className="logo">Athena LMS</Link>
          <nav>
            <ul className="nav-menu">
              <li>
                <Link to="/login" className={isActive('/login')}>Login</Link>
              </li>
              <li>
                <Link to="/register" className={isActive('/register')}>Register</Link>
              </li>
              <li>
                <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="container main-content">
        <Outlet />
      </main>
    </>
  )
}

export default App
