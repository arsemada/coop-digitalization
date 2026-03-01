import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

export default function TransferPage() {
  const { user } = useAuth();
  const saccoId = user?.institutionId;
  const isMember = user?.role === 'MEMBER';
  const isSacco = user?.role === 'SACCO_ADMIN' || user?.role === 'SACCO_EMPLOYEE';

  const [members, setMembers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Request transfer form
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [transferForm, setTransferForm] = useState({
    sourceMemberSavingsAccountId: '',
    destinationAccountNumber: '',
    amount: '',
  });
  const [lookup, setLookup] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  // My requests (member) / SACCO list
  const [transferRequests, setTransferRequests] = useState([]);
  const [transferFilter, setTransferFilter] = useState('PENDING');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);

  // Transfer history (sent + received)
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('request'); // 'request' | 'requests' | 'history' | 'admin'

  const fetchMembers = useCallback(() => {
    if (!saccoId) return;
    api.get('/members', { params: { saccoId } })
      .then(({ data }) => data?.success && data?.data && setMembers(data.data))
      .catch(() => {});
  }, [saccoId]);

  const fetchAccountsByMember = useCallback((memberId) => {
    if (!memberId) return setAccounts([]);
    api.get(`/savings/accounts/member/${memberId}`)
      .then(({ data }) => {
        if (data?.success && data?.data) setAccounts(data.data);
        else setAccounts([]);
      })
      .catch(() => setAccounts([]));
  }, []);

  const fetchTransferRequests = useCallback(() => {
    if (isMember && selectedMemberId) {
      api.get(`/savings/transfer-requests/member/${selectedMemberId}`)
        .then(({ data }) => data?.success && data?.data && setTransferRequests(data.data))
        .catch(() => setTransferRequests([]));
    } else if (isSacco && saccoId) {
      const params = transferFilter ? { status: transferFilter } : {};
      api.get(`/savings/transfer-requests/sacco/${saccoId}`, { params })
        .then(({ data }) => data?.success && data?.data && setTransferRequests(data.data))
        .catch(() => setTransferRequests([]));
    } else {
      setTransferRequests([]);
    }
  }, [isMember, isSacco, selectedMemberId, saccoId, transferFilter]);

  const fetchHistory = useCallback(() => {
    if (!selectedMemberId) return setHistory([]);
    api.get(`/savings/transfer-requests/member/${selectedMemberId}/history`)
      .then(({ data }) => data?.success && data?.data && setHistory(data.data || []))
      .catch(() => setHistory([]));
  }, [selectedMemberId]);

  const doLookup = useCallback((accountNumber) => {
    const num = (accountNumber || '').trim().toUpperCase();
    if (!num) {
      setLookup(null);
      setLookupError('');
      return;
    }
    setLookupLoading(true);
    setLookupError('');
    setLookup(null);
    api.get('/savings/accounts/lookup', { params: { accountNumber: num } })
      .then(({ data }) => {
        if (data?.success && data?.data) {
          setLookup(data.data);
          setLookupError('');
        } else {
          setLookup(null);
          setLookupError(data?.message || 'Account not found');
        }
      })
      .catch((err) => {
        setLookup(null);
        setLookupError(err.response?.data?.message || 'Account not found');
      })
      .finally(() => setLookupLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchMembers();
    setLoading(false);
  }, [fetchMembers]);

  useEffect(() => {
    if (isMember && members.length > 0 && user?.username && !selectedMemberId) {
      const me = members.find((m) => String(m.memberNumber) === String(user.username));
      if (me) setSelectedMemberId(String(me.id));
    }
  }, [isMember, members, user?.username, selectedMemberId]);

  useEffect(() => {
    setAccounts([]);
    fetchAccountsByMember(selectedMemberId || null);
  }, [selectedMemberId, fetchAccountsByMember]);

  useEffect(() => {
    fetchTransferRequests();
  }, [fetchTransferRequests]);

  useEffect(() => {
    if (selectedMemberId) fetchHistory();
    else setHistory([]);
  }, [selectedMemberId, fetchHistory]);

  useEffect(() => {
    if (transferForm.destinationAccountNumber) {
      const num = transferForm.destinationAccountNumber.trim().toUpperCase();
      if (num.length >= 4) doLookup(num);
      else {
        setLookup(null);
        setLookupError('');
      }
    } else {
      setLookup(null);
      setLookupError('');
    }
  }, [transferForm.destinationAccountNumber, doLookup]);

  const handleTransferRequest = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const amount = Number(transferForm.amount);
    if (!amount || amount <= 0) {
      setError('Amount must be positive.');
      return;
    }
    if (!(transferForm.destinationAccountNumber || '').trim()) {
      setError('Destination account number is required.');
      return;
    }
    api.post('/savings/transfer-requests', {
      sourceMemberSavingsAccountId: Number(transferForm.sourceMemberSavingsAccountId),
      destinationAccountNumber: (transferForm.destinationAccountNumber || '').trim().toUpperCase(),
      amount,
    })
      .then(({ data }) => {
        if (data?.success) {
          setSuccess('Transfer request submitted. SACCO will process it.');
          setTransferForm({ sourceMemberSavingsAccountId: '', destinationAccountNumber: '', amount: '' });
          setLookup(null);
          setLookupError('');
          setShowRequestForm(false);
          fetchTransferRequests();
          fetchHistory();
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Request failed'));
  };

  const handleApproveTransfer = (id) => {
    setError('');
    setSuccess('');
    api.post(`/savings/transfer-requests/${id}/approve`)
      .then(({ data }) => {
        if (data?.success) {
          setSuccess('Transfer approved and completed.');
          fetchTransferRequests();
          fetchHistory();
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Approval failed'));
  };

  const handleRejectTransfer = (id) => {
    setError('');
    setSuccess('');
    api.post(`/savings/transfer-requests/${id}/reject`, { reason: rejectReason || undefined })
      .then(({ data }) => {
        if (data?.success) {
          setSuccess('Transfer request rejected.');
          setRejectingId(null);
          setRejectReason('');
          fetchTransferRequests();
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Reject failed'));
  };

  if (!saccoId && user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="rounded-2xl border border-champagne/30 bg-white p-8 shadow-lg text-center">
        <div className="text-5xl mb-4 opacity-60">↔</div>
        <h1 className="text-2xl font-bold text-forest">Transfer</h1>
        <p className="mt-2 text-polished/80">You are not linked to a SACCO. Contact your administrator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest/10 text-2xl">↔</span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-forest md:text-3xl">Transfer</h1>
            <p className="text-sm text-polished/80 mt-0.5">
              {isMember
                ? 'Send money to another member or view your transfer history'
                : 'Approve transfer requests and view history'}
            </p>
          </div>
        </div>
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        {success && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
            {success}
          </div>
        )}
      </div>

      {!isMember && (
        <div className="rounded-2xl border border-champagne/20 bg-white p-5 shadow-sm">
          <label className="block text-sm font-semibold text-forest mb-2">Select member</label>
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="w-full max-w-md rounded-xl border border-champagne/30 bg-offwhite/50 px-4 py-3 text-polished focus:border-forest focus:ring-2 focus:ring-forest/20 focus:outline-none transition"
          >
            <option value="">— Choose a member —</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.memberNumber} — {m.fullName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-champagne/20 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('request')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeTab === 'request' ? 'bg-forest text-white' : 'bg-champagne/20 text-polished hover:bg-champagne/30'
          }`}
        >
          {isMember ? 'New transfer' : 'Overview'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeTab === 'requests' ? 'bg-forest text-white' : 'bg-champagne/20 text-polished hover:bg-champagne/30'
          }`}
        >
          {isMember ? 'My requests' : 'Transfer requests'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeTab === 'history' ? 'bg-forest text-white' : 'bg-champagne/20 text-polished hover:bg-champagne/30'
          }`}
        >
          Transfer history
        </button>
        {isSacco && (
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === 'admin' ? 'bg-forest text-white' : 'bg-champagne/20 text-polished hover:bg-champagne/30'
            }`}
          >
            Pending (admin)
          </button>
        )}
      </div>

      {/* New transfer / Request form */}
      {activeTab === 'request' && (
        <div className="rounded-2xl border border-champagne/20 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-champagne/20 bg-forest/5 px-5 py-4">
            <h2 className="text-lg font-semibold text-forest">Request a transfer</h2>
            <p className="text-xs text-polished/70 mt-0.5">
              Enter the destination account number; we’ll show the account holder name so you can confirm.
            </p>
          </div>
          <div className="p-5">
            {!selectedMemberId ? (
              <p className="py-8 text-center text-polished/60">
                {isMember ? 'Loading your accounts…' : 'Select a member to request a transfer.'}
              </p>
            ) : accounts.length === 0 ? (
              <p className="py-8 text-center text-polished/60">No savings accounts for this member.</p>
            ) : !showRequestForm ? (
              <button
                type="button"
                onClick={() => {
                  setShowRequestForm(true);
                  setTransferForm((f) => ({ ...f, sourceMemberSavingsAccountId: accounts[0]?.id || '' }));
                }}
                className="rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2"
              >
                New transfer request
              </button>
            ) : (
              <form onSubmit={handleTransferRequest} className="max-w-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-polished mb-1">From account *</label>
                  <select
                    value={transferForm.sourceMemberSavingsAccountId}
                    onChange={(e) => setTransferForm((f) => ({ ...f, sourceMemberSavingsAccountId: e.target.value }))}
                    className="w-full rounded-xl border border-champagne/30 px-4 py-2.5 focus:border-forest focus:ring-2 focus:ring-forest/20 focus:outline-none"
                    required
                  >
                    <option value="">— Select account —</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.productName} — #{a.accountNumber || `SAV-${String(a.id).padStart(6, '0')}`} (
                        {Number(a.balance).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-polished mb-1">Destination account number *</label>
                  <input
                    type="text"
                    value={transferForm.destinationAccountNumber}
                    onChange={(e) =>
                      setTransferForm((f) => ({ ...f, destinationAccountNumber: e.target.value }))
                    }
                    className="w-full rounded-xl border border-champagne/30 px-4 py-2.5 font-mono focus:border-forest focus:ring-2 focus:ring-forest/20 focus:outline-none"
                    placeholder="e.g. SAV-000002"
                    required
                  />
                  {lookupLoading && <p className="text-xs text-polished/60 mt-1">Checking account…</p>}
                  {lookup && !lookupLoading && (
                    <p className="mt-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800">
                      <span className="font-semibold">Account holder:</span> {lookup.memberName}
                      {lookup.memberNumber && ` (${lookup.memberNumber})`}
                      {lookup.productName && ` · ${lookup.productName}`}
                    </p>
                  )}
                  {lookupError && !lookupLoading && (
                    <p className="mt-2 text-sm text-amber-700">{lookupError}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-polished mb-1">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm((f) => ({ ...f, amount: e.target.value }))}
                    className="w-full rounded-xl border border-champagne/30 px-4 py-2.5 focus:border-forest focus:ring-2 focus:ring-forest/20 focus:outline-none"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="rounded-xl bg-forest px-4 py-2.5 font-semibold text-white hover:bg-emerald focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2"
                  >
                    Submit request
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRequestForm(false);
                      setLookup(null);
                      setLookupError('');
                    }}
                    className="rounded-xl border border-champagne/30 px-4 py-2.5 text-polished hover:bg-offwhite/80"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* My requests / SACCO list */}
      {activeTab === 'requests' && (
        <div className="rounded-2xl border border-champagne/20 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-champagne/20 bg-forest/5 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-forest">
              {isMember ? 'My transfer requests' : 'Transfer requests'}
            </h2>
            {isSacco && saccoId && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTransferFilter('PENDING')}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    transferFilter === 'PENDING' ? 'bg-forest text-white' : 'bg-champagne/20 text-polished'
                  }`}
                >
                  Pending
                </button>
                <button
                  type="button"
                  onClick={() => setTransferFilter('')}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    !transferFilter ? 'bg-forest text-white' : 'bg-champagne/20 text-polished'
                  }`}
                >
                  All
                </button>
              </div>
            )}
          </div>
          <div className="p-5">
            {!selectedMemberId && isMember ? (
              <p className="py-8 text-center text-polished/60">Loading…</p>
            ) : transferRequests.length === 0 ? (
              <p className="py-8 text-center text-polished/60">
                {isMember ? 'No transfer requests yet.' : 'No transfer requests.'}
              </p>
            ) : (
              <ul className="space-y-3">
                {transferRequests.map((tr) => (
                  <li key={tr.id} className="rounded-xl border border-champagne/20 bg-offwhite/30 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-forest">
                          {Number(tr.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} — From #
                          {tr.sourceAccountNumber} → To #{tr.destinationAccountNumber}
                        </p>
                        <p className="text-sm text-polished/80 mt-1">
                          From: {tr.sourceMemberName} ({tr.sourceMemberNumber})
                          {tr.destinationMemberName ? ` → To: ${tr.destinationMemberName}` : ''}
                        </p>
                        <p className="text-xs text-polished/60 mt-1">
                          {tr.createdAt ? new Date(tr.createdAt).toLocaleString() : ''}
                          {tr.processedAt &&
                            ` · Processed ${new Date(tr.processedAt).toLocaleString()}${tr.processedByUsername ? ` by ${tr.processedByUsername}` : ''}`}
                        </p>
                        {tr.rejectionReason && (
                          <p className="text-sm text-amber-700 mt-1">Reason: {tr.rejectionReason}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            tr.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : tr.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {tr.status}
                        </span>
                        {isSacco && tr.status === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApproveTransfer(tr.id)}
                              className="rounded-lg bg-emerald px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald/90"
                            >
                              Approve
                            </button>
                            {rejectingId === tr.id ? (
                              <div className="flex gap-1 items-center">
                                <input
                                  type="text"
                                  value={rejectReason}
                                  onChange={(e) => setRejectReason(e.target.value)}
                                  placeholder="Reason (optional)"
                                  className="rounded border border-champagne/30 px-2 py-1 text-sm w-32"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRejectTransfer(tr.id)}
                                  className="rounded bg-red-600 px-2 py-1 text-sm text-white"
                                >
                                  Confirm
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRejectingId(null);
                                    setRejectReason('');
                                  }}
                                  className="rounded border px-2 py-1 text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setRejectingId(tr.id)}
                                className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-200"
                              >
                                Reject
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Transfer history (sent + received) */}
      {activeTab === 'history' && (
        <div className="rounded-2xl border border-champagne/20 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-champagne/20 bg-forest/5 px-5 py-4">
            <h2 className="text-lg font-semibold text-forest">Transfer history</h2>
            <p className="text-xs text-polished/70 mt-0.5">All transfers you sent or received (approved only for received).</p>
          </div>
          <div className="p-5">
            {!selectedMemberId ? (
              <p className="py-8 text-center text-polished/60">Select a member to see history.</p>
            ) : history.length === 0 ? (
              <p className="py-8 text-center text-polished/60">No transfer history yet.</p>
            ) : (
              <ul className="space-y-3">
                {history.map((tr) => (
                  <li
                    key={tr.id}
                    className={`rounded-xl border p-4 ${
                      tr.direction === 'SENT'
                        ? 'border-amber-200 bg-amber-50/50'
                        : 'border-emerald-200 bg-emerald-50/50'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          tr.direction === 'SENT' ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                        }`}
                      >
                        {tr.direction === 'SENT' ? 'Sent' : 'Received'}
                      </span>
                      <span className="font-medium text-forest">
                        {Number(tr.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="text-sm text-polished/80 mt-1">
                      {tr.direction === 'SENT' ? (
                        <>
                          To #{tr.destinationAccountNumber}
                          {tr.destinationMemberName && ` — ${tr.destinationMemberName}`}
                        </>
                      ) : (
                        <>
                          From #{tr.sourceAccountNumber} — {tr.sourceMemberName}
                        </>
                      )}
                    </p>
                    <p className="text-xs text-polished/60 mt-1">
                      {tr.processedAt ? new Date(tr.processedAt).toLocaleString() : tr.createdAt ? new Date(tr.createdAt).toLocaleString() : ''}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Admin: Pending (same as requests but default filter PENDING) */}
      {activeTab === 'admin' && (
        <div className="rounded-2xl border border-champagne/20 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-champagne/20 bg-forest/5 px-5 py-4">
            <h2 className="text-lg font-semibold text-forest">Pending transfer requests</h2>
            <p className="text-xs text-polished/70 mt-0.5">Approve or reject. Destination account holder is shown when available.</p>
          </div>
          <div className="p-5">
            {transferRequests.filter((r) => r.status === 'PENDING').length === 0 ? (
              <p className="py-8 text-center text-polished/60">No pending requests.</p>
            ) : (
              <ul className="space-y-3">
                {transferRequests
                  .filter((r) => r.status === 'PENDING')
                  .map((tr) => (
                    <li key={tr.id} className="rounded-xl border border-champagne/20 bg-offwhite/30 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-forest">
                            {Number(tr.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} — From #
                            {tr.sourceAccountNumber} → To #{tr.destinationAccountNumber}
                            {tr.destinationMemberName && (
                              <span className="text-emerald-700 font-normal"> ({tr.destinationMemberName})</span>
                            )}
                          </p>
                          <p className="text-sm text-polished/80 mt-1">
                            From: {tr.sourceMemberName} ({tr.sourceMemberNumber})
                          </p>
                          <p className="text-xs text-polished/60 mt-1">
                            {tr.createdAt ? new Date(tr.createdAt).toLocaleString() : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleApproveTransfer(tr.id)}
                            className="rounded-lg bg-emerald px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald/90"
                          >
                            Approve
                          </button>
                          {rejectingId === tr.id ? (
                            <div className="flex gap-1 items-center">
                              <input
                                type="text"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Reason (optional)"
                                className="rounded border border-champagne/30 px-2 py-1 text-sm w-32"
                              />
                              <button
                                type="button"
                                onClick={() => handleRejectTransfer(tr.id)}
                                className="rounded bg-red-600 px-2 py-1 text-sm text-white"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectingId(null);
                                  setRejectReason('');
                                }}
                                className="rounded border px-2 py-1 text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setRejectingId(tr.id)}
                              className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-200"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
