import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

export default function SettingsPage() {
  const { user } = useAuth();
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [defaultLoanInterestRate, setDefaultLoanInterestRate] = useState('12');

  const canEdit = user?.role === 'SACCO_ADMIN' || user?.role === 'SACCO_EMPLOYEE' || user?.role === 'UNION_ADMIN';

  useEffect(() => {
    if (!canEdit) return setLoading(false);
    api.get('/institutions/me')
      .then(({ data }) => {
        if (data?.success && data?.data) {
          setInstitution(data.data);
          setDefaultLoanInterestRate(data.data.defaultLoanInterestRate != null ? String(data.data.defaultLoanInterestRate) : '12');
        }
      })
      .catch(() => setError('Failed to load institution'))
      .finally(() => setLoading(false));
  }, [canEdit]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!institution?.id || saving) return;
    setError('');
    setSaving(true);
    api.patch(`/institutions/${institution.id}`, { defaultLoanInterestRate: Number(defaultLoanInterestRate) })
      .then(({ data }) => {
        if (data?.success && data?.data) {
          setInstitution(data.data);
          setDefaultLoanInterestRate(data.data.defaultLoanInterestRate != null ? String(data.data.defaultLoanInterestRate) : '12');
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Save failed'))
      .finally(() => setSaving(false));
  };

  if (!canEdit) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-forest">Settings</h1>
        <p className="mt-2 text-polished/80">Settings are available to SACCO and Union administrators.</p>
      </div>
    );
  }

  if (loading) return <p className="mt-8 text-polished/70">Loading...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-forest">Settings</h1>
      <p className="mt-2 text-polished/80">{institution?.name} – configure loan interest and other options.</p>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      <form onSubmit={handleSave} className="mt-8 max-w-md rounded-xl border border-champagne/20 bg-white p-8 shadow-md">
        <h2 className="text-xl font-bold text-forest mb-6">Loan Interest Rate</h2>
        <p className="text-sm text-polished/80 mb-4">Members see this rate when applying for loans. Set the default annual interest rate (%).</p>
        <div>
          <label className="block text-sm font-medium text-polished mb-1">Default Loan Interest Rate (%)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={defaultLoanInterestRate}
            onChange={(e) => setDefaultLoanInterestRate(e.target.value)}
            className="w-full rounded-lg border border-bronze/30 px-3 py-2 focus:border-forest"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-6 rounded-lg bg-forest px-6 py-2 font-semibold text-offwhite hover:bg-emerald disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
