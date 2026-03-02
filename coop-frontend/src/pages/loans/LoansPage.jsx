import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

const STATUS_BADGE = {
  PENDING_APPROVAL: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-red-100 text-red-800',
  DISBURSED: 'bg-indigo-100 text-indigo-800',
  REPAYING: 'bg-emerald-100 text-emerald-800',
  CLOSED: 'bg-slate-200 text-slate-700',
};

export default function LoansPage() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [savingsAccounts, setSavingsAccounts] = useState([]);
  const [myMember, setMyMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApply, setShowApply] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({
    principalAmount: '',
    interestRate: '12',
    termInMonths: '12',
    memberSavingsAccountId: '',
    loanReason: '',
  });
  const [repayForm, setRepayForm] = useState({ loanId: '', amountPaid: '', paymentDate: new Date().toISOString().slice(0, 10), installmentNumber: '' });
  const [repayments, setRepayments] = useState([]);
  const [saccoSettings, setSaccoSettings] = useState(null);

  const isMember = user?.role === 'MEMBER';
  const isStaff = user?.role === 'SACCO_ADMIN' || user?.role === 'SACCO_EMPLOYEE';
  const saccoId = user?.institutionId;

  const fetchLoans = () => {
    if (isMember && myMember?.id) {
      api.get(`/loans/member/${myMember.id}`)
        .then(({ data }) => { if (data?.success && data?.data) setLoans(data.data); })
        .catch(() => setError('Failed to load loans'));
    } else if (isStaff && saccoId) {
      api.get('/loans', { params: { saccoId } })
        .then(({ data }) => { if (data?.success && data?.data) setLoans(data.data); })
        .catch(() => setError('Failed to load loans'));
      api.get('/loans/repayments', { params: { saccoId } })
        .then(({ data }) => { if (data?.success && data?.data) setRepayments(data.data); })
        .catch(() => {});
    } else {
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  const fetchMemberAndAccounts = () => {
    if (!isMember) return;
    api.get('/members/me')
      .then(({ data }) => {
        if (data?.success && data?.data) {
          setMyMember(data.data);
          api.get(`/savings/accounts/member/${data.data.id}`)
            .then((r) => { if (r.data?.success && r.data?.data) setSavingsAccounts(r.data.data); })
            .catch(() => {});
        }
      })
      .catch(() => setError('Failed to load member'));
  };

  useEffect(() => {
    setLoading(true);
    if (isMember) {
      fetchMemberAndAccounts();
      api.get('/institutions/me')
        .then(({ data }) => {
          if (data?.success && data?.data) {
            setSaccoSettings(data.data);
            const rate = data.data.defaultLoanInterestRate != null ? String(data.data.defaultLoanInterestRate) : '12';
            setForm((f) => ({ ...f, interestRate: rate }));
          }
        })
        .catch(() => {});
    } else {
      fetchLoans();
    }
  }, [isMember, saccoId]);

  useEffect(() => {
    if (isMember && myMember?.id) {
      fetchLoans();
    }
  }, [myMember?.id, isMember]);

  const handleApply = (e) => {
    e.preventDefault();
    setError('');
    api.post('/loans/apply', {
      principalAmount: form.principalAmount,
      interestRate: form.interestRate,
      termInMonths: form.termInMonths,
      memberSavingsAccountId: form.memberSavingsAccountId,
      loanReason: form.loanReason,
    })
      .then(({ data }) => {
        if (data?.success) {
          setForm({ principalAmount: '', interestRate: '12', termInMonths: '12', memberSavingsAccountId: '', loanReason: '' });
          setShowApply(false);
          fetchLoans();
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Apply failed'));
  };

  const handleApprove = (loanId, approved) => {
    setError('');
    api.post(`/loans/${loanId}/approve`, { approved })
      .then(({ data }) => { if (data?.success) fetchLoans(); })
      .catch((err) => setError(err.response?.data?.message || 'Failed'));
  };

  const handleDisburse = (loanId) => {
    setError('');
    api.post(`/loans/${loanId}/disburse`)
      .then(({ data }) => { if (data?.success) fetchLoans(); })
      .catch((err) => setError(err.response?.data?.message || 'Failed'));
  };

  const handleRepay = (e) => {
    e?.preventDefault?.();
    const loanId = repayForm.loanId ? Number(repayForm.loanId) : null;
    const amountPaid = repayForm.amountPaid ? Number(repayForm.amountPaid) : null;
    const paymentDate = repayForm.paymentDate || new Date().toISOString().slice(0, 10);
    if (!loanId || amountPaid == null) return;
    setError('');
    const payload = { loanId, amountPaid, paymentDate };
    if (repayForm.installmentNumber != null && repayForm.installmentNumber !== '') payload.installmentNumber = Number(repayForm.installmentNumber);
    api.post('/loans/repayments', payload)
      .then(({ data }) => {
        if (data?.success) {
          setRepayForm({ loanId: '', amountPaid: '', paymentDate: new Date().toISOString().slice(0, 10), installmentNumber: '' });
          fetchLoans();
          refetchRepayments();
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed'));
  };

  const refetchRepayments = () => {
    if (isStaff && saccoId) {
      api.get('/loans/repayments', { params: { saccoId } })
        .then(({ data }) => { if (data?.success && data?.data) setRepayments(data.data); })
        .catch(() => {});
    }
  };

  const handleRepayInline = (loanId, amountPaid, paymentDate, installmentNumber) => {
    setError('');
    const payload = { loanId, amountPaid: Number(amountPaid), paymentDate: paymentDate || new Date().toISOString().slice(0, 10) };
    if (installmentNumber != null && installmentNumber !== '') payload.installmentNumber = Number(installmentNumber);
    api.post('/loans/repayments', payload)
      .then(({ data }) => { if (data?.success) { fetchLoans(); refetchRepayments(); } })
      .catch((err) => setError(err.response?.data?.message || 'Failed'));
  };

  const filtered = loans.filter((l) => {
    if (filter === 'all') return true;
    return l.status === filter;
  });

  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = (dueDate) => dueDate && !dueDate.startsWith('—') && dueDate < today;

  return (
    <div className="min-h-screen bg-offwhite">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-forest">Loans</h1>
          <p className="mt-2 text-lg text-polished/80">Apply for loans, track status, and manage repayments.</p>
        </div>
        {isMember && (
          <button
            type="button"
            onClick={() => setShowApply(!showApply)}
            className="rounded-xl bg-forest px-6 py-2.5 font-semibold text-offwhite shadow-md hover:bg-emerald transition-colors"
          >
            {showApply ? 'Cancel' : 'Apply for Loan'}
          </button>
        )}
      </div>

      {showApply && isMember && (
        <form onSubmit={handleApply} className="mt-8 rounded-2xl border border-champagne/20 bg-white p-8 shadow-lg">
          <h2 className="text-xl font-bold text-forest mb-6">Apply for Loan</h2>
          {saccoSettings?.defaultLoanInterestRate != null && (
            <p className="mb-6 rounded-lg bg-forest/10 px-4 py-3 text-forest font-medium">
              Your SACCO&apos;s interest rate: <strong>{saccoSettings.defaultLoanInterestRate}%</strong> per year (set by your SACCO)
            </p>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-polished mb-1">Savings Account (Collateral) *</label>
              <select
                value={form.memberSavingsAccountId}
                onChange={(e) => setForm((f) => ({ ...f, memberSavingsAccountId: e.target.value }))}
                className="w-full rounded-lg border border-bronze/30 px-3 py-2 focus:border-forest"
                required
              >
                <option value="">Select account</option>
                {savingsAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.productName} ({typeof a.productCategory === 'string' ? a.productCategory : a.productCategory?.name || ''}) - Balance: {a.balance}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-polished mb-1">Principal Amount *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.principalAmount}
                onChange={(e) => setForm((f) => ({ ...f, principalAmount: e.target.value }))}
                className="w-full rounded-lg border border-bronze/30 px-3 py-2 focus:border-forest"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-polished mb-1">Interest Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={form.interestRate}
                readOnly={isMember}
                onChange={(e) => !isMember && setForm((f) => ({ ...f, interestRate: e.target.value }))}
                className={`w-full rounded-lg border border-bronze/30 px-3 py-2 focus:border-forest ${isMember ? 'bg-slate-50 cursor-not-allowed' : ''}`}
                title={isMember ? 'Set by your SACCO' : undefined}
              />
              {isMember && <p className="text-xs text-polished/70 mt-1">Set by your SACCO.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-polished mb-1">Term (months)</label>
              <input
                type="number"
                min="1"
                value={form.termInMonths}
                onChange={(e) => setForm((f) => ({ ...f, termInMonths: e.target.value }))}
                className="w-full rounded-lg border border-bronze/30 px-3 py-2 focus:border-forest"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-polished mb-1">Loan Reason</label>
              <textarea
                value={form.loanReason}
                onChange={(e) => setForm((f) => ({ ...f, loanReason: e.target.value }))}
                className="w-full rounded-lg border border-bronze/30 px-3 py-2 focus:border-forest"
                rows={3}
                placeholder="Purpose of the loan"
              />
            </div>
          </div>
          <button type="submit" className="mt-6 rounded-lg bg-forest px-6 py-2 font-semibold text-offwhite hover:bg-emerald">
            Submit Application
          </button>
        </form>
      )}

      {isStaff && (
        <div className="mt-8 rounded-2xl border border-champagne/20 bg-white p-8 shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-bold text-forest mb-2">Record Repayment</h3>
          <p className="text-sm text-polished/80 mb-6">Enter the <strong>total payment amount</strong> the member pays (cash received). The system applies it to interest first, then principal for the chosen installment.</p>
          {repayForm.loanId && (() => {
            const sel = loans.find((x) => String(x.id) === repayForm.loanId);
            return sel && (sel.status === 'REPAYING' || sel.status === 'DISBURSED') && (
              <div className="mb-6 rounded-xl bg-forest/10 px-4 py-3 flex items-center gap-4">
                <span className="text-forest font-semibold">Left to repay:</span>
                <span className="text-xl font-bold text-forest">{sel.outstandingBalance ?? sel.principalAmount}</span>
              </div>
            );
          })()}
          <form onSubmit={handleRepay} className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-polished mb-1">Loan</label>
              <select
                value={repayForm.loanId}
                onChange={(e) => { setRepayForm((f) => ({ ...f, loanId: e.target.value, installmentNumber: '' })); }}
                className="rounded-xl border border-bronze/30 px-4 py-2.5 min-w-[220px] focus:border-forest focus:ring-1 focus:ring-forest"
              >
                <option value="">Select loan</option>
                {loans.filter((l) => l.status === 'REPAYING' || l.status === 'DISBURSED').map((l) => (
                  <option key={l.id} value={l.id}>#{l.id} {l.memberName} — Outstanding: {l.outstandingBalance ?? l.principalAmount}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-polished mb-1">Installment (optional)</label>
              <select
                value={repayForm.installmentNumber}
                onChange={(e) => setRepayForm((f) => ({ ...f, installmentNumber: e.target.value }))}
                className="rounded-xl border border-bronze/30 px-4 py-2.5 min-w-[180px] focus:border-forest focus:ring-1 focus:ring-forest"
              >
                <option value="">Next unpaid</option>
                {(loans.find((x) => String(x.id) === repayForm.loanId)?.schedule || [])
                  .filter((s) => !s.paid)
                  .map((s) => (
                    <option key={s.id} value={s.installmentNumber}>Month {s.installmentNumber} — Due {s.dueDate} ({s.totalDue})</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-polished mb-1">Amount (total payment)</label>
              <input type="number" step="0.01" value={repayForm.amountPaid} onChange={(e) => setRepayForm((f) => ({ ...f, amountPaid: e.target.value }))} placeholder="Cash received" className="rounded-xl border border-bronze/30 px-4 py-2.5 w-36 focus:border-forest focus:ring-1 focus:ring-forest" required />
              <p className="text-xs text-polished/70 mt-1">Applied to interest first, then principal.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-polished mb-1">Payment date</label>
              <input type="date" value={repayForm.paymentDate} onChange={(e) => setRepayForm((f) => ({ ...f, paymentDate: e.target.value }))} className="rounded-xl border border-bronze/30 px-4 py-2.5 focus:border-forest focus:ring-1 focus:ring-forest" />
            </div>
            <button type="submit" className="rounded-xl bg-forest px-6 py-2.5 text-offwhite font-semibold hover:bg-emerald transition-colors shadow-md">Record</button>
          </form>
        </div>
      )}

      {error && <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700">{error}</div>}

      {isStaff && (
        <div className="mt-8 flex flex-wrap gap-2">
          {['all', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'DISBURSED', 'REPAYING', 'CLOSED'].map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-forest text-offwhite shadow-md' : 'bg-white border border-champagne/40 text-polished hover:bg-champagne/10'}`}>{f.replace(/_/g, ' ')}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="mt-12 flex items-center justify-center py-16"><span className="text-polished/70">Loading...</span></div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-champagne/20 bg-white shadow-lg">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-champagne/20 bg-forest text-offwhite">
                <th className="px-6 py-4 text-left text-sm font-semibold">#</th>
                {isStaff && <th className="px-6 py-4 text-left text-sm font-semibold">Member</th>}
                <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Left to Repay</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Reason</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                {isStaff && <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-b border-champagne/10 hover:bg-champagne/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-forest">{l.id}</td>
                  {isStaff && <td className="px-6 py-4 text-polished">{l.memberName} ({l.memberNumber})</td>}
                  <td className="px-6 py-4 text-polished">{l.principalAmount} / {l.termInMonths} mo</td>
                  <td className="px-6 py-4 text-right font-semibold text-forest">{(l.status === 'REPAYING' || l.status === 'DISBURSED') ? (l.outstandingBalance ?? l.principalAmount) : '—'}</td>
                  <td className="px-6 py-4 text-polished/80">{l.loanReason || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[l.status] || ''}`}>
                      {l.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  {isStaff && (
                    <td className="px-6 py-4">
                      {l.status === 'PENDING_APPROVAL' && (
                        <>
                          <button type="button" onClick={() => handleApprove(l.id, true)} className="mr-2 rounded bg-emerald px-2 py-1 text-sm text-white">Approve</button>
                          <button type="button" onClick={() => handleApprove(l.id, false)} className="rounded bg-red-600 px-2 py-1 text-sm text-white">Reject</button>
                        </>
                      )}
                      {l.status === 'APPROVED' && (
                        <button type="button" onClick={() => handleDisburse(l.id)} className="rounded bg-forest px-2 py-1 text-sm text-offwhite">Disburse</button>
                      )}
                      {(l.status === 'REPAYING' || l.status === 'DISBURSED') && <span className="text-polished/70">—</span>}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="px-6 py-12 text-center text-polished/70">No loans found.</p>}
        </div>
      )}

      {isStaff && saccoId && repayments.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-champagne/20 bg-white shadow-lg">
          <h3 className="px-6 py-4 font-bold text-forest border-b border-champagne/20">Repayments</h3>
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-champagne/20 bg-forest text-offwhite">
                <th className="px-6 py-4 text-left text-sm font-semibold">Payment Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Recorded At</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Loan #</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Member</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Amount</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Principal</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Interest</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {repayments.map((r) => {
                const recordedAt = r.createdAt ? new Date(r.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '—';
                return (
                  <tr key={r.id} className="border-b border-champagne/10 hover:bg-offwhite/50">
                    <td className="px-6 py-4 text-polished">{r.paymentDate}</td>
                    <td className="px-6 py-4 text-polished text-sm">{recordedAt}</td>
                    <td className="px-6 py-4 font-medium">{r.loanId}</td>
                    <td className="px-6 py-4">{r.memberName} ({r.memberNumber})</td>
                    <td className="px-6 py-4 text-right">{r.amountPaid}</td>
                    <td className="px-6 py-4 text-right">{r.principalComponent ?? '—'}</td>
                    <td className="px-6 py-4 text-right">{r.interestComponent ?? '—'}</td>
                    <td className="px-6 py-4">
                      {r.recordedByType && (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${r.recordedByType === 'SACCO' ? 'bg-forest/15 text-forest' : 'bg-champagne/30 text-bronze'}`}>
                          {r.recordedByType}
                        </span>
                      )}
                      {r.recordedBy && <span className="ml-1 text-polished/80 text-sm">{r.recordedBy}</span>}
                      {!r.recordedBy && !r.recordedByType && '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isMember && loans.length > 0 && (
        <div className="mt-8 space-y-6">
          <h3 className="text-xl font-bold text-forest">Your Loan Schedule</h3>
          <p className="text-sm text-polished/80">Monthly installments with due dates. Overdue installments are highlighted.</p>
          {loans.filter((l) => l.schedule?.length).map((l) => (
            <div key={l.id} className="rounded-2xl border border-champagne/20 bg-white p-8 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <p className="font-bold text-forest">Loan #{l.id} — {l.principalAmount} | {l.status}</p>
                  {l.loanReason && <p className="text-sm text-polished/80 mt-1">Reason: {l.loanReason}</p>}
                </div>
                {(l.status === 'REPAYING' || l.status === 'DISBURSED') && (
                  <div className="rounded-xl bg-forest/10 px-4 py-2">
                    <span className="text-sm text-polished/80">Left to repay:</span>
                    <span className="ml-2 font-bold text-forest">{l.outstandingBalance ?? l.principalAmount}</span>
                  </div>
                )}
              </div>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-champagne/30 bg-forest/5">
                    <th className="text-left py-3 px-2 font-semibold text-forest">#</th>
                    <th className="text-left py-3 px-2 font-semibold text-forest">Due date</th>
                    <th className="text-right py-3 px-2 font-semibold text-forest">Principal</th>
                    <th className="text-right py-3 px-2 font-semibold text-forest">Interest</th>
                    <th className="text-right py-3 px-2 font-semibold text-forest">Total</th>
                    <th className="text-center py-3 px-2 font-semibold text-forest">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {l.schedule?.map((s) => {
                    const overdue = !s.paid && isOverdue(s.dueDate);
                    return (
                      <tr key={s.id} className={`border-b border-champagne/10 ${overdue ? 'bg-red-50' : ''}`}>
                        <td className="py-3 px-2">{s.installmentNumber}</td>
                        <td className="py-3 px-2">
                          <span className={overdue ? 'text-red-700 font-medium' : ''}>{s.dueDate}</span>
                          {overdue && <span className="ml-2 text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded">Overdue</span>}
                        </td>
                        <td className="text-right py-3 px-2">{s.principalDue ?? '—'}</td>
                        <td className="text-right py-3 px-2">{s.interestDue ?? '—'}</td>
                        <td className="text-right py-3 px-2">{s.totalDue}</td>
                        <td className="text-center py-3 px-2">{s.paid ? <span className="text-emerald font-semibold">✓ Paid</span> : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {(l.status === 'REPAYING' || l.status === 'DISBURSED') && (
                <form onSubmit={(e) => { e.preventDefault(); const amt = e.currentTarget.querySelector('input[type="number"]')?.value; const dt = e.currentTarget.querySelector('input[type="date"]')?.value; const inst = e.currentTarget.querySelector('select[name="installment"]')?.value; if (amt) handleRepayInline(l.id, amt, dt || new Date().toISOString().slice(0, 10), inst || undefined); }} className="mt-6 flex flex-wrap gap-4 items-end rounded-xl bg-champagne/5 p-4">
                  <div>
                    <label className="block text-sm font-medium text-polished mb-1">Installment</label>
                    <select name="installment" className="rounded-xl border border-bronze/30 px-3 py-2 min-w-[140px]">
                      <option value="">Next unpaid</option>
                      {l.schedule?.filter((s) => !s.paid)?.map((s) => <option key={s.id} value={s.installmentNumber}>Month {s.installmentNumber} — Due {s.dueDate} ({s.totalDue})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-polished mb-1">Amount (total payment)</label>
                    <input type="number" step="0.01" required className="rounded-xl border border-bronze/30 px-3 py-2 w-32" placeholder="Cash received" />
                    <p className="text-xs text-polished/70 mt-1">Applied to interest first, then principal.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-polished mb-1">Date</label>
                    <input type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="rounded-xl border border-bronze/30 px-3 py-2" />
                  </div>
                  <button type="submit" className="rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-offwhite hover:bg-emerald transition-colors shadow-md">Record Repayment</button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
