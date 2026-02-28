import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

export default function SavingsPage() {
  const { user } = useAuth();
  const saccoId = user?.institutionId;
  const canManage = (user?.role === 'SACCO_ADMIN' || user?.role === 'SACCO_EMPLOYEE') && saccoId;

  const [members, setMembers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showTransaction, setShowTransaction] = useState(false);
  const [txnForm, setTxnForm] = useState({
    memberSavingsAccountId: '',
    type: 'DEPOSIT',
    amount: '',
  });

  const fetchMembers = () => {
    if (!saccoId) return;
    api.get('/members', { params: { saccoId } })
      .then(({ data }) => data?.success && data?.data && setMembers(data.data))
      .catch(() => {});
  };

  const fetchAccountsByMember = (memberId) => {
    if (!memberId) return setAccounts([]);
    api.get(`/savings/accounts/member/${memberId}`)
      .then(({ data }) => {
        if (data?.success && data?.data) setAccounts(data.data);
        else setAccounts([]);
      })
      .catch(() => setAccounts([]));
  };

  const fetchTransactions = (accountId) => {
    if (!accountId) return setTransactions([]);
    api.get(`/savings/accounts/${accountId}/transactions`, { params: { limit: 20 } })
      .then(({ data }) => {
        if (data?.success && data?.data) setTransactions(data.data);
        else setTransactions([]);
      })
      .catch(() => setTransactions([]));
  };

  useEffect(() => {
    setLoading(true);
    fetchMembers();
    setLoading(false);
  }, [saccoId]);

  const isMember = user?.role === 'MEMBER';
  useEffect(() => {
    if (isMember && members.length > 0 && user?.username && !selectedMemberId) {
      const me = members.find((m) => String(m.memberNumber) === String(user.username));
      if (me) setSelectedMemberId(String(me.id));
    }
  }, [isMember, members, user?.username, selectedMemberId]);

  useEffect(() => {
    setSelectedAccountId(null);
    setTransactions([]);
    fetchAccountsByMember(selectedMemberId || null);
  }, [selectedMemberId]);

  useEffect(() => {
    fetchTransactions(selectedAccountId || null);
  }, [selectedAccountId]);

  const handleRecordTransaction = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const amount = Number(txnForm.amount);
    if (!amount || amount <= 0) {
      setError('Amount must be positive.');
      return;
    }
    api.post('/savings/transactions', {
      memberSavingsAccountId: Number(txnForm.memberSavingsAccountId),
      type: txnForm.type,
      amount,
    })
      .then(({ data }) => {
        if (data?.success) {
          setSuccess(txnForm.type === 'DEPOSIT' ? 'Deposit recorded.' : 'Withdrawal recorded.');
          const accountId = txnForm.memberSavingsAccountId;
          setTxnForm((f) => ({ ...f, amount: '' }));
          setShowTransaction(false);
          fetchAccountsByMember(selectedMemberId);
          fetchTransactions(accountId);
          setSelectedAccountId(accountId);
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Transaction failed'));
  };

  if (!saccoId && user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="rounded-2xl border border-champagne/30 bg-white p-8 shadow-lg text-center">
        <div className="text-5xl mb-4 opacity-60">🏦</div>
        <h1 className="text-2xl font-bold text-forest">Savings</h1>
        <p className="mt-2 text-polished/80">You are not linked to a SACCO. Contact your administrator.</p>
      </div>
    );
  }

  if (!saccoId && user?.role === 'SUPER_ADMIN') {
    return (
      <div className="rounded-2xl border border-champagne/30 bg-white p-8 shadow-lg text-center">
        <div className="text-5xl mb-4 opacity-60">🏦</div>
        <h1 className="text-2xl font-bold text-forest">Savings</h1>
        <p className="mt-2 text-polished/80">Select a SACCO from Institutions to manage savings.</p>
      </div>
    );
  }

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest/10 text-2xl">💰</span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-forest md:text-3xl">
              {isMember ? 'My Savings' : 'Savings'}
            </h1>
            <p className="text-sm text-polished/80 mt-0.5">
              {isMember
                ? 'View your accounts and balances'
                : 'View member accounts and record deposits or withdrawals'}
            </p>
          </div>
        </div>
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
            {success}
          </div>
        )}
      </div>

      {/* Member selector (admin only) */}
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

      {/* Main content: accounts + transactions */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Accounts */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-champagne/20 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-champagne/20 bg-forest/5 px-5 py-4">
              <h2 className="text-lg font-semibold text-forest">
                {isMember ? 'Your accounts' : 'Accounts'}
              </h2>
              <p className="text-xs text-polished/70 mt-0.5">
                {isMember
                  ? 'One account per category you chose at registration'
                  : 'Accounts are created when the member is registered'}
              </p>
            </div>
            <div className="p-4">
              {loading && !selectedMemberId ? (
                <p className="py-12 text-center text-polished/60">Loading…</p>
              ) : !selectedMemberId ? (
                <div className="py-16 text-center">
                  <span className="text-4xl opacity-40">📋</span>
                  <p className="mt-3 text-polished/70">Select a member to see their accounts</p>
                </div>
              ) : accounts.length === 0 ? (
                <div className="py-16 text-center">
                  <span className="text-4xl opacity-40">📭</span>
                  <p className="mt-3 text-polished/70">No savings accounts for this member yet</p>
                  <p className="text-sm text-polished/60 mt-1">Accounts are created when the member is registered with savings categories</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {accounts.map((a) => {
                    const isSelected = selectedAccountId === a.id;
                    const accNo = a.accountNumber || `SAV-${String(a.id).padStart(6, '0')}`;
                    const balance = Number(a.balance || 0);
                    return (
                      <div
                        key={a.id}
                        onClick={() => setSelectedAccountId(a.id)}
                        className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-forest bg-forest/5 shadow-md'
                            : 'border-champagne/20 bg-offwhite/30 hover:border-forest/40 hover:bg-forest/[0.03]'
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-forest">{a.productName}</p>
                            <p className="text-xs font-mono text-polished/80 mt-1">#{accNo}</p>
                            <p className="mt-2 text-lg font-bold text-forest">
                              {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          {canManage && (
                            <button
                              type="button"
                              onClick={(ev) => {
                                ev.stopPropagation();
                                setTxnForm({ memberSavingsAccountId: a.id, type: 'DEPOSIT', amount: '' });
                                setShowTransaction(true);
                              }}
                              className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2"
                            >
                              Deposit / Withdraw
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {accounts.length > 0 && (
                    <div className="rounded-xl border border-champagne/20 bg-forest/5 px-4 py-3 mt-2">
                      <p className="text-sm text-polished/70">Total across accounts</p>
                      <p className="text-xl font-bold text-forest">
                        {totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent transactions */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-champagne/20 bg-white shadow-sm overflow-hidden sticky top-4">
            <div className="border-b border-champagne/20 bg-forest/5 px-5 py-4">
              <h2 className="text-lg font-semibold text-forest">Recent transactions</h2>
              <p className="text-xs text-polished/70 mt-0.5">Select an account to see history</p>
            </div>
            <div className="p-4 max-h-[420px] overflow-y-auto">
              {!selectedAccountId ? (
                <div className="py-12 text-center">
                  <span className="text-3xl opacity-40">📄</span>
                  <p className="mt-2 text-sm text-polished/60">Select an account</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-12 text-center">
                  <span className="text-3xl opacity-40">📄</span>
                  <p className="mt-2 text-sm text-polished/60">No transactions yet</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {transactions.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between rounded-lg border border-champagne/20 bg-offwhite/30 px-3 py-2.5"
                    >
                      <span
                        className={`text-sm font-medium ${
                          t.type === 'DEPOSIT' ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {t.type === 'DEPOSIT' ? '+' : '−'} {Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-polished/70">{t.transactionDate}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Record transaction modal-style form */}
      {showTransaction && canManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-polished/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-champagne/30 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-forest mb-4">Record transaction</h3>
            <form onSubmit={handleRecordTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-polished mb-1">Type</label>
                <select
                  value={txnForm.type}
                  onChange={(e) => setTxnForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full rounded-xl border border-champagne/30 px-4 py-2.5 focus:border-forest focus:ring-2 focus:ring-forest/20 focus:outline-none"
                >
                  <option value="DEPOSIT">Deposit</option>
                  <option value="WITHDRAWAL">Withdrawal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-polished mb-1">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={txnForm.amount}
                  onChange={(e) => setTxnForm((f) => ({ ...f, amount: e.target.value }))}
                  className="w-full rounded-xl border border-champagne/30 px-4 py-2.5 focus:border-forest focus:ring-2 focus:ring-forest/20 focus:outline-none"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-forest py-2.5 font-semibold text-white hover:bg-emerald focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowTransaction(false)}
                  className="rounded-xl border border-champagne/30 px-4 py-2.5 font-medium text-polished hover:bg-offwhite/80"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
