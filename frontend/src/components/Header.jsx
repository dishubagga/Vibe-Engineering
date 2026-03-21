import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { Link } from 'react-router-dom';

export default function Header() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          Full-Stack App
        </Link>
        <nav className="nav">
          <Link to="/">Dashboard</Link>
          <Link to="/users">Users</Link>
        </nav>
        <div className="auth-info">
          {isAuthenticated ? (
            <>
              <span className="user-name">{user?.name}</span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-login">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
