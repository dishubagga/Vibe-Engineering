import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { isAuthenticated, onboardingCompleted } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

export default ProtectedRoute;
