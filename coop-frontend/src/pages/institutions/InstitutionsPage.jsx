import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

const TYPE_OPTIONS = [
  { value: 'SACCO', label: 'SACCO' },
  { value: 'UNION', label: 'Union' },
];

const STATUS_BADGE = {
  PENDING_APPROVAL: 'bg-amber-100 text-amber-800',
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  SUSPENDED: 'bg-red-100 text-red-800',
  INACTIVE: 'bg-slate-200 text-slate-600',
};

export default function InstitutionsPage() {
  const { user } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [otpResult, setOtpResult] = useState(null);
  const [filter, setFilter] = useState('all'); // all | pending | active
  const [showCreate, setShowCreate] = useState(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('create') === '1');
  const [form, setForm] = useState({
    name: '',
    type: 'SACCO',
    region: '',
    woreda: '',
    kebele: '',
    houseNumber: '',
  });

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isUnionAdmin = user?.role === 'UNION_ADMIN';
  const canCreateInstitution = isSuperAdmin || isUnionAdmin;

  const fetchInstitutions = () => {
    api.get('/institutions')
      .then(({ data }) => {
        if (data?.success && data?.data) setInstitutions(data.data);
      })
      .catch(() => setError('Failed to load institutions'))
      .finally(() => setLoading(false));
  };

  useEffect(() => fetchInstitutions(), []);

  const filtered = institutions.filter((i) => {
    if (filter === 'pending') return i.status === 'PENDING_APPROVAL';
    if (filter === 'active') return i.status === 'ACTIVE';
    return true;
  });

  const handleCreate = (e) => {
    e.preventDefault();
    setError('');
    const payload = isUnionAdmin ? { ...form, type: 'SACCO' } : form;
    api.post('/institutions', payload)
      .then(({ data }) => {
        if (data?.success) {
          setForm({ name: '', type: 'SACCO', region: '', woreda: '', kebele: '', houseNumber: '' });
          setShowCreate(false);
          fetchInstitutions();
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Create failed'));
  };

  const handleApprove = (id) => {
    setError('');
    setOtpResult(null);
    api.post(`/institutions/${id}/approve`)
      .then(({ data }) => {
        if (data?.success && data?.data) {
          fetchInstitutions();
          if (data.data.otp) {
            setOtpResult({ username: data.data.username, otp: data.data.otp });
          }
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Approve failed'));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-forest">Institutions</h1>
          <p className="mt-2 text-polished/80">Unions and SACCOs. Super Admin creates or approves applications.</p>
        </div>
        {canCreateInstitution && (
          <button
            type="button"
            onClick={() => setShowCreate(!showCreate)}
            className="rounded-lg bg-forest px-4 py-2 font-semibold text-offwhite hover:bg-emerald transition-colors"
          >
            {showCreate ? 'Cancel' : isUnionAdmin ? 'Create SACCO' : 'Create Institution'}
          </button>
        )}
      </div>

      {showCreate && canCreateInstitution && (
        <form onSubmit={handleCreate} className="mt-8 rounded-xl border border-champagne/20 bg-white p-8 shadow-md">
          <h2 className="text-xl font-bold text-forest mb-6">Create Institution</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-polished mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-bronze/30 px-3 py-2 focus:border-forest"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-polished mb-1">Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full rounded-lg border border-bronze/30 px-3 py-2 focus:border-forest"
                disabled={isUnionAdmin}
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {isUnionAdmin && <p className="mt-1 text-xs text-polished/70">Unions can only create SACCOs.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-polished mb-1">Region</label>
              <input
                type="text"
                value={form.region}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                className="w-full rounded-lg border border-bronze/30 px-3 py-2 focus:border-forest"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-polished mb-1">Woreda</label>
              <input
                type="text"
                value={form.woreda}
                onChange={(e) => setForm((f) => ({ ...f, woreda: e.target.value }))}
                className="w-full rounded-lg border border-bronze/30 px-3 py-2 focus:border-forest"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-polished mb-1">Kebele</label>
              <input
                type="text"
                value={form.kebele}
                onChange={(e) => setForm((f) => ({ ...f, kebele: e.target.value }))}
                className="w-full rounded-lg border border-bronze/30 px-3 py-2 focus:border-forest"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-polished mb-1">House Number</label>
              <input
                type="text"
                value={form.houseNumber}
                onChange={(e) => setForm((f) => ({ ...f, houseNumber: e.target.value }))}
                className="w-full rounded-lg border border-bronze/30 px-3 py-2 focus:border-forest"
              />
            </div>
          </div>
          <button type="submit" className="mt-6 rounded-lg bg-forest px-6 py-2 font-semibold text-offwhite hover:bg-emerald">
            Create
          </button>
        </form>
      )}

      {otpResult && (
        <div className="mt-6 rounded-xl border-2 border-emerald bg-emerald/10 p-6">
          <p className="font-semibold text-forest">Institution approved! Share OTP with applicant:</p>
          <p className="mt-2 text-polished">Username: <strong>{otpResult.username}</strong></p>
          <p className="mt-1 text-polished">OTP: <strong className="text-2xl tracking-widest">{otpResult.otp}</strong></p>
          <p className="mt-4 text-sm text-polished/80">Applicant logs in with username + OTP, then changes password.</p>
          <button type="button" onClick={() => setOtpResult(null)} className="mt-4 text-sm text-forest font-medium hover:underline">Dismiss</button>
        </div>
      )}

      {error && <p className="mt-4 text-red-600">{error}</p>}

      <div className="mt-8 flex gap-2">
        {['all', 'pending', 'active'].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
              filter === f ? 'bg-forest text-offwhite' : 'bg-white border border-champagne/30 text-polished hover:bg-forest/5'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-8 text-polished/70">Loading...</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-champagne/20 bg-white shadow-md">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-champagne/20 bg-forest/5">
                <th className="px-6 py-4 text-left text-sm font-semibold text-forest">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-forest">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-forest">Region</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-forest">Status</th>
                {isSuperAdmin && <th className="px-6 py-4 text-right text-sm font-semibold text-forest">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inst) => (
                <tr key={inst.id} className="border-b border-champagne/10 hover:bg-offwhite/50">
                  <td className="px-6 py-4 font-medium text-polished">{inst.name}</td>
                  <td className="px-6 py-4 text-polished/80">{inst.type}</td>
                  <td className="px-6 py-4 text-polished/80">{inst.region || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[inst.status] || 'bg-slate-100'}`}>
                      {inst.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  {isSuperAdmin && (
                    <td className="px-6 py-4 text-right">
                      {inst.status === 'PENDING_APPROVAL' && (
                        <button
                          type="button"
                          onClick={() => handleApprove(inst.id)}
                          className="rounded-lg bg-emerald px-3 py-1 text-sm font-medium text-white hover:bg-emerald/90"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="px-6 py-12 text-center text-polished/70">No institutions found.</p>
          )}
        </div>
      )}
    </div>
  );
}
