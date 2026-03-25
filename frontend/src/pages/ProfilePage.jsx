import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser, logout } from '../store/slices/authSlice';
import userService from '../services/userService';

const GOAL_LABELS = {
  FAT_LOSS: '🔥 Fat Loss',
  MUSCLE_GAIN: '💪 Muscle Gain',
  MAINTENANCE: '⚖️ Maintenance',
};

function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);

  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    userService.getMe()
      .then((data) => {
        setProfile(data);
        setForm({ name: data.name });
        dispatch(setUser({ id: data.id, email: data.email, name: data.name }));
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [dispatch]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const updated = await userService.updateProfile({ name: form.name });
      setProfile(updated);
      dispatch(setUser({ id: updated.id, email: updated.email, name: updated.name }));
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-sm mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
            ← Back
          </button>
          <h1 className="text-lg font-bold text-gray-900">Profile</h1>
          <div className="w-12" />
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-xl font-bold text-green-600">
              {profile?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{profile?.name}</p>
              <p className="text-sm text-gray-500">{profile?.email}</p>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="w-full py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Body stats */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Body Stats</h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Age', value: profile?.age ? `${profile.age}y` : '—' },
              { label: 'Weight', value: profile?.weightKg ? `${profile.weightKg}kg` : '—' },
              { label: 'Height', value: profile?.heightCm ? `${profile.heightCm}cm` : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-lg font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Goal */}
        {profile?.onboardingCompleted && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Current Goal</h2>
            <p className="text-gray-900 font-medium">
              {GOAL_LABELS[profile?.goalType] || '—'}
            </p>
            <button
              onClick={() => navigate('/onboarding')}
              className="mt-3 text-sm text-green-600 hover:underline"
            >
              Update goals
            </button>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3 text-red-500 border border-red-100 bg-white rounded-2xl font-medium text-sm hover:bg-red-50 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;
