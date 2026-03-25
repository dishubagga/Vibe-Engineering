import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import authService from '../services/authService';

function PasswordStrength({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
  ];
  const strength = checks.filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Strong'];
  const colors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-green-500'];

  if (!password) return null;

  return (
    <div className="mt-1">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= strength ? colors[strength] : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs mt-1 ${strength === 3 ? 'text-green-600' : 'text-gray-400'}`}>
        {labels[strength]}
      </p>
    </div>
  );
}

function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [confirmError, setConfirmError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'confirmPassword') {
      setConfirmError(e.target.value !== form.password ? 'Passwords do not match' : '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setConfirmError('Passwords do not match');
      return;
    }
    dispatch(loginStart());
    try {
      const data = await authService.register(form.email, form.password, form.name);
      dispatch(loginSuccess({
        token: data.token,
        user: { id: data.userId, email: data.email, name: data.name },
        onboardingCompleted: false,
      }));
      navigate('/onboarding', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      dispatch(loginFailure(message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 mt-1 text-sm">Start your nutrition journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
              placeholder="Your name"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <PasswordStrength password={form.password} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                confirmError ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {confirmError && <p className="text-red-500 text-xs mt-1">{confirmError}</p>}
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !!confirmError}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
