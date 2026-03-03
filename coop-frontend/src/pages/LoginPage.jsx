import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    const msg = location.state?.message;
    if (msg) {
      setSuccess(msg);
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await login(username, password);
      if (res?.data?.mustChangePassword) {
        navigate('/change-password', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-champagne/20 bg-white p-8 shadow-lg relative">
      {/* Back to Home Button */}
      <Link
        to="/landing"
        className="absolute top-4 right-4 p-2 rounded-lg text-polished/60 hover:text-forest hover:bg-champagne/20 transition-colors group"
        title="Back to Home"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-forest">Sign in</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-polished">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded-lg border border-bronze/30 px-3 py-2 focus:border-forest focus:ring-1 focus:ring-forest"
            required
            autoComplete="username"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-polished">
            Password or OTP
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-bronze/30 px-3 py-2 focus:border-forest focus:ring-1 focus:ring-forest"
            required
            autoComplete="current-password"
          />
        </div>
        {success && <p className="text-sm text-emerald">{success}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-forest py-3 font-semibold text-offwhite hover:bg-emerald disabled:opacity-50 transition-colors"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-polished/70">
        SACCOs/Unions:{' '}
        <Link to="/apply" className="font-semibold text-forest hover:text-emerald">
          Apply for institution
        </Link>
        . Members are registered by your SACCO.
      </p>
    </div>
  );
}
