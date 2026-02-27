import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const TYPE_OPTIONS = [
  { value: 'SACCO', label: 'SACCO' },
  { value: 'UNION', label: 'Union' },
];

export default function ApplyInstitutionPage() {
  const [form, setForm] = useState({
    name: '',
    type: 'SACCO',
    region: '',
    woreda: '',
    kebele: '',
    houseNumber: '',
    applicantUsername: '',
    applicantEmail: '',
    applicantPhone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    api.post('/institutions/apply', form)
      .then(({ data }) => {
        if (data?.success) {
          setSuccess(true);
          setForm({ name: '', type: 'SACCO', region: '', woreda: '', kebele: '', houseNumber: '', applicantUsername: '', applicantEmail: '', applicantPhone: '' });
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Application failed'))
      .finally(() => setLoading(false));
  };

  if (success) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-champagne/20 bg-white p-12 shadow-lg text-center">
        <div className="text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-forest">Application Submitted</h2>
        <p className="mt-4 text-polished/80">
          Your institution application has been received. Our team will review it and approve it shortly.
          When approved, you will receive an OTP to log in and set your password.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-lg bg-forest px-6 py-3 font-semibold text-offwhite hover:bg-emerald"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-champagne/20 bg-white p-8 shadow-lg">
      <h1 className="text-2xl font-bold text-forest">Apply for Institution Registration</h1>
      <p className="mt-2 text-polished/80">
        SACCOs and Unions: submit your application. When approved, you&apos;ll get an OTP to log in.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-polished mb-1">Institution Name *</label>
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
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
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
        </div>
        <div>
          <label className="block text-sm font-medium text-polished mb-1">Admin Username *</label>
          <input
            type="text"
            value={form.applicantUsername}
            onChange={(e) => setForm((f) => ({ ...f, applicantUsername: e.target.value }))}
            className="w-full rounded-lg border border-bronze/30 px-3 py-2 focus:border-forest"
            required
            placeholder="For OTP login when approved"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-polished mb-1">Admin Email *</label>
          <input
            type="email"
            value={form.applicantEmail}
            onChange={(e) => setForm((f) => ({ ...f, applicantEmail: e.target.value }))}
            className="w-full rounded-lg border border-bronze/30 px-3 py-2 focus:border-forest"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-polished mb-1">Admin Phone</label>
          <input
            type="tel"
            value={form.applicantPhone}
            onChange={(e) => setForm((f) => ({ ...f, applicantPhone: e.target.value }))}
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
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-forest py-3 font-semibold text-offwhite hover:bg-emerald disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-polished/70">
        <Link to="/" className="font-medium text-forest hover:text-emerald">Back to Home</Link>
      </p>
    </div>
  );
}
