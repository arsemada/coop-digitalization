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
  const [editingInterest, setEditingInterest] = useState(null);
  const [filter, setFilter] = useState('all'); // all | pending | active
  const [showCreate, setShowCreate] = useState(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('create') === '1');
  const [form, setForm] = useState({
    name: '',
    type: 'SACCO',
    region: '',
    woreda: '',
    kebele: '',
    houseNumber: '',
    defaultLoanInterestRate: '12',
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
    if (form.defaultLoanInterestRate != null && form.defaultLoanInterestRate !== '') payload.defaultLoanInterestRate = Number(form.defaultLoanInterestRate);
    api.post('/institutions', payload)
      .then(({ data }) => {
        if (data?.success) {
          setForm({ name: '', type: 'SACCO', region: '', woreda: '', kebele: '', houseNumber: '', defaultLoanInterestRate: '12' });
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
    <div className="min-h-screen bg-offwhite">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-forest">Institutions</h1>
          <p className="mt-2 text-lg text-polished/80">Manage Unions and SACCOs. Super Admin creates or approves applications.</p>
        </div>
        {canCreateInstitution && (
          <button
            type="button"
            onClick={() => setShowCreate(!showCreate)}
            className="rounded-xl bg-forest px-6 py-2.5 font-semibold text-offwhite shadow-md hover:bg-emerald transition-colors"
          >
            {showCreate ? 'Cancel' : isUnionAdmin ? 'Create SACCO' : 'Create Institution'}
          </button>
        )}
      </div>

      {showCreate && canCreateInstitution && (
        <form onSubmit={handleCreate} className="mt-8 rounded-2xl border border-champagne/20 bg-white p-8 shadow-lg">
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
              <label className="block text-sm font-medium text-polished mb-1">Default Loan Interest Rate (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.defaultLoanInterestRate}
                onChange={(e) => setForm((f) => ({ ...f, defaultLoanInterestRate: e.target.value }))}
                className="w-full rounded-lg border border-bronze/30 px-3 py-2 focus:border-forest"
                placeholder="12"
              />
              <p className="text-xs text-polished/70 mt-1">Members see this when applying for loans.</p>
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

      <div className="mt-8 flex flex-wrap gap-2">
        {['all', 'pending', 'active'].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition-colors ${
              filter === f ? 'bg-forest text-offwhite shadow-md' : 'bg-white border border-champagne/40 text-polished hover:bg-champagne/10'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-12 flex items-center justify-center py-16"><span className="text-polished/70">Loading...</span></div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-champagne/20 bg-white shadow-lg">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-champagne/20 bg-forest text-offwhite">
                <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Loan Rate %</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Region</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                {isSuperAdmin && <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inst) => (
                <tr key={inst.id} className="border-b border-champagne/10 hover:bg-champagne/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-polished">{inst.name}</td>
                  <td className="px-6 py-4 text-polished/80">{inst.type}</td>
                  <td className="px-6 py-4">
                    {editingInterest?.id === inst.id ? (
                      <form onSubmit={(e) => { e.preventDefault(); api.patch(`/institutions/${inst.id}`, { defaultLoanInterestRate: Number(editingInterest.value) }).then(({ data }) => { if (data?.success) { setEditingInterest(null); fetchInstitutions(); } }); }} className="flex gap-2 items-center">
                        <input type="number" step="0.01" value={editingInterest.value} onChange={(e) => setEditingInterest((x) => ({ ...x, value: e.target.value }))} className="w-20 rounded border px-2 py-1 text-sm" />
                        <button type="submit" className="text-sm text-forest font-medium">Save</button>
                        <button type="button" onClick={() => setEditingInterest(null)} className="text-sm text-polished/70">Cancel</button>
                      </form>
                    ) : (
                      <button type="button" onClick={() => setEditingInterest({ id: inst.id, value: String(inst.defaultLoanInterestRate ?? 12) })} className="text-polished hover:text-forest hover:underline">
                        {inst.defaultLoanInterestRate ?? 12}%
                      </button>
                    )}
                  </td>
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
