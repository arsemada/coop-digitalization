import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

const STATUS_BADGE = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  SUSPENDED: 'bg-amber-100 text-amber-800',
  INACTIVE: 'bg-slate-200 text-slate-600',
};

export default function MembersPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [otpResult, setOtpResult] = useState(null);
  const [showCreate, setShowCreate] = useState(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('create') === '1');
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    joinDate: new Date().toISOString().slice(0, 10),
    region: '',
    woreda: '',
    kebele: '',
    houseNumber: '',
  });

  const saccoId = user?.institutionId;
  const canCreate = (user?.role === 'SACCO_ADMIN' || user?.role === 'SACCO_EMPLOYEE') && saccoId;

  const fetchMembers = () => {
    if (!saccoId) return setLoading(false);
    api.get('/members', { params: { saccoId } })
      .then(({ data }) => {
        if (data?.success && data?.data) setMembers(data.data);
      })
      .catch(() => setError('Failed to load members'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    fetchMembers();
  }, [saccoId]);

  const handleCreate = (e) => {
    e.preventDefault();
    setError('');
    setOtpResult(null);
    api.post('/members', { ...form, ...(saccoId != null && { saccoId }) })
      .then(({ data }) => {
        if (data?.success && data?.data) {
          setForm({ fullName: '', phone: '', joinDate: new Date().toISOString().slice(0, 10), region: '', woreda: '', kebele: '', houseNumber: '' });
          setShowCreate(false);
          fetchMembers();
          if (data.data.otp) {
            setOtpResult({ username: data.data.username, otp: data.data.otp, memberName: data.data.member?.fullName });
          }
        }
      })
      .catch((err) => setError(err.response?.data?.message || err.message || 'Create failed'));
  };

  if (!saccoId && user?.role !== 'SUPER_ADMIN') {
    return (
      <div>
        <h1 className="text-3xl font-bold text-forest">Members</h1>
        <p className="mt-2 text-polished/80">Members are managed by SACCOs. You are not linked to a SACCO.</p>
      </div>
    );
  }

  if (!saccoId && user?.role === 'SUPER_ADMIN') {
    return (
      <div>
        <h1 className="text-3xl font-bold text-forest">Members</h1>
        <p className="mt-2 text-polished/80">Super Admin: select a SACCO from Institutions to view members.</p>
        <p className="mt-4 text-polished/70">For now, members are created and listed by SACCO staff in their dashboard.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-forest">Members</h1>
          <p className="mt-2 text-polished/80">Manage SACCO members. Create and list members.</p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setShowCreate(!showCreate)}
            className="rounded-lg bg-forest px-4 py-2 font-semibold text-offwhite hover:bg-emerald transition-colors"
          >
            {showCreate ? 'Cancel' : 'Create Member'}
          </button>
        )}
      </div>

      {showCreate && canCreate && (
        <form onSubmit={handleCreate} className="mt-8 rounded-xl border border-champagne/20 bg-white p-8 shadow-md">
          <h2 className="text-xl font-bold text-forest mb-6">Create Member</h2>
          <p className="text-sm text-polished/80 mb-6">A unique member number (SACCO account) will be auto-generated. An OTP will be provided to share with the member for first login.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-polished mb-1">Full Name *</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                className="w-full rounded-lg border border-bronze/30 px-3 py-2 focus:border-forest"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-polished mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full rounded-lg border border-bronze/30 px-3 py-2 focus:border-forest"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-polished mb-1">Join Date</label>
              <input
                type="date"
                value={form.joinDate}
                onChange={(e) => setForm((f) => ({ ...f, joinDate: e.target.value }))}
                className="w-full rounded-lg border border-bronze/30 px-3 py-2 focus:border-forest"
              />
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
          <p className="font-semibold text-forest">Member created! Share login credentials with the member:</p>
          {otpResult.memberName && <p className="mt-2 text-polished">Member: <strong>{otpResult.memberName}</strong></p>}
          <p className="mt-2 text-polished">Username (Member Number): <strong>{otpResult.username}</strong></p>
          <p className="mt-1 text-polished">OTP: <strong className="text-2xl tracking-widest">{otpResult.otp}</strong></p>
          <p className="mt-4 text-sm text-polished/80">Member logs in with member number + OTP, then changes password.</p>
          <button type="button" onClick={() => setOtpResult(null)} className="mt-4 text-sm text-forest font-medium hover:underline">Dismiss</button>
        </div>
      )}

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {loading ? (
        <p className="mt-8 text-polished/70">Loading...</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-champagne/20 bg-white shadow-md">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-champagne/20 bg-forest/5">
                <th className="px-6 py-4 text-left text-sm font-semibold text-forest">Member Number</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-forest">Full Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-forest">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-forest">Join Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-forest">Region</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-forest">Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-champagne/10 hover:bg-offwhite/50">
                  <td className="px-6 py-4 font-medium text-polished">{m.memberNumber}</td>
                  <td className="px-6 py-4 text-polished">{m.fullName}</td>
                  <td className="px-6 py-4 text-polished/80">{m.phone || '—'}</td>
                  <td className="px-6 py-4 text-polished/80">{m.joinDate || '—'}</td>
                  <td className="px-6 py-4 text-polished/80">{m.region || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[m.status] || 'bg-slate-100'}`}>
                      {m.status || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {members.length === 0 && (
            <p className="px-6 py-12 text-center text-polished/70">No members yet. Create one to get started.</p>
          )}
        </div>
      )}
    </div>
  );
}
