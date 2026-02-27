import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    })
      .then(({ data }) => {
        if (data?.success !== false) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login', { state: { message: 'Password changed. Please log in with your new password.' } });
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to change password'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border border-champagne/20 bg-white p-8 shadow-lg">
      <h1 className="text-2xl font-bold text-forest">Change Password</h1>
      <p className="mt-2 text-polished/80 text-sm">
        You logged in with an OTP. Please set a new password.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-polished mb-1">Current password (OTP) *</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-lg border border-bronze/30 px-3 py-2 focus:border-forest"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-polished mb-1">New password *</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg border border-bronze/30 px-3 py-2 focus:border-forest"
            required
            minLength={6}
          />
          <p className="mt-0.5 text-xs text-polished/60">At least 6 characters</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-polished mb-1">Confirm new password *</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-bronze/30 px-3 py-2 focus:border-forest"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-forest py-3 font-semibold text-offwhite hover:bg-emerald disabled:opacity-50"
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}
