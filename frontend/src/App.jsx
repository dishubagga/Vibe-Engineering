import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingFlow from './pages/OnboardingFlow';
import ProfilePage from './pages/ProfilePage';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="app">
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
        />

        {/* Onboarding — authenticated but not yet onboarded */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingFlow />
            </ProtectedRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
