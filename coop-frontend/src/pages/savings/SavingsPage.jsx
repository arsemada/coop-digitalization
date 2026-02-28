import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

export default function SavingsPage() {
  const { user } = useAuth();
  const saccoId = user?.institutionId;
  const canManage = (user?.role === 'SACCO_ADMIN' || user?.role === 'SACCO_EMPLOYEE') && saccoId;

  const [products, setProducts] = useState([]);
  const [members, setMembers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showOpenAccount, setShowOpenAccount] = useState(false);
  const [openAccountForm, setOpenAccountForm] = useState({ memberId: '', savingsProductId: '' });

  const [showTransaction, setShowTransaction] = useState(false);
  const [txnForm, setTxnForm] = useState({
    memberSavingsAccountId: '',
    type: 'DEPOSIT',
    amount: '',
  });

  const fetchProducts = () => {
    if (!saccoId) return;
    api.get('/savings/products', { params: { saccoId } })
      .then(({ data }) => data?.success && data?.data && setProducts(data.data))
      .catch(() => {});
  };

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
    fetchProducts();
    fetchMembers();
    setLoading(false);
  }, [saccoId]);

  // When logged in as MEMBER, auto-select their own record from members list (username = member number)
  const isMember = user?.role === 'MEMBER';
  useEffect(() => {
    if (isMember && members.length > 0 && user?.username && !selectedMemberId) {
      const me = members.find((m) => String(m.memberNumber) === String(user.username));
      if (me) setSelectedMemberId(String(me.id));
    }
  }, [isMember, members, user?.username, selectedMemberId]);

  useEffect(() => {
    setSelectedAccountId('');
    setTransactions([]);
    fetchAccountsByMember(selectedMemberId || null);
  }, [selectedMemberId]);

  useEffect(() => {
    fetchTransactions(selectedAccountId || null);
  }, [selectedAccountId]);

  const handleOpenAccount = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    api.post('/savings/accounts', {
      memberId: Number(openAccountForm.memberId),
      savingsProductId: Number(openAccountForm.savingsProductId),
    })
      .then(({ data }) => {
        if (data?.success) {
          setSuccess('Savings account opened.');
          setOpenAccountForm({ memberId: selectedMemberId || '', savingsProductId: '' });
          setShowOpenAccount(false);
          fetchAccountsByMember(selectedMemberId);
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to open account'));
  };

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
          setSelectedAccountId(String(accountId));
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Transaction failed'));
  };

  if (!saccoId && user?.role !== 'SUPER_ADMIN') {
    return (
      <div>
        <h1 className="text-3xl font-bold text-forest">Savings</h1>
        <p className="mt-2 text-polished/80">Savings products, member accounts, and transactions. You are not linked to a SACCO.</p>
      </div>
    );
  }

  if (!saccoId && user?.role === 'SUPER_ADMIN') {
    return (
      <div>
        <h1 className="text-3xl font-bold text-forest">Savings</h1>
        <p className="mt-2 text-polished/80">Select a SACCO from Institutions to manage savings.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-forest">Savings</h1>
      <p className="mt-2 text-polished/80">Savings products, member accounts, and transactions.</p>

      {error && <p className="mt-4 text-red-600">{error}</p>}
      {success && <p className="mt-4 text-emerald-600">{success}</p>}

      {/* ——— Member accounts & transactions (products exist per category from member registration) ——— */}
      <section className="mt-8">
        <h2 className="text-xl font-bold text-forest">{isMember ? 'Your savings accounts' : 'Member savings accounts'}</h2>
        <p className="mt-1 text-sm text-polished/80">
          {isMember
            ? 'Your accounts (one per category chosen at signup). View balance and recent transactions.'
            : 'Select a member to see their accounts. Record deposits or withdrawals. Use “Open new account” only to add another category for that member.'}
        </p>
        {!isMember && (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-polished mb-1">Member</label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="rounded-lg border border-bronze/30 px-3 py-2 min-w-[200px]"
            >
              <option value="">— Select member —</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.memberNumber} – {m.fullName}</option>
              ))}
            </select>
          </div>
          {canManage && selectedMemberId && (
            <button
              type="button"
              onClick={() => {
                setOpenAccountForm({ memberId: selectedMemberId, savingsProductId: '' });
                setShowOpenAccount(true);
              }}
              className="mt-6 rounded-lg bg-forest px-4 py-2 font-semibold text-offwhite hover:bg-emerald"
            >
              Open new account
            </button>
          )}
        </div>
        )}

        {showOpenAccount && canManage && (
          <form onSubmit={handleOpenAccount} className="mt-4 rounded-xl border border-champagne/20 bg-white p-6 shadow-md">
            <h3 className="font-bold text-forest mb-4">Open savings account</h3>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-polished mb-1">Product *</label>
                <select
                  value={openAccountForm.savingsProductId}
                  onChange={(e) => setOpenAccountForm((f) => ({ ...f, savingsProductId: e.target.value }))}
                  className="rounded-lg border border-bronze/30 px-3 py-2 min-w-[200px]"
                  required
                >
                  <option value="">— Select product —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="mt-6 rounded-lg bg-forest px-4 py-2 font-semibold text-offwhite hover:bg-emerald">Open account</button>
              <button type="button" onClick={() => setShowOpenAccount(false)} className="mt-6 rounded-lg border border-bronze/30 px-4 py-2 text-polished">Cancel</button>
            </div>
          </form>
        )}

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-champagne/20 bg-white shadow-md overflow-hidden">
            <h3 className="px-6 py-4 border-b border-champagne/20 font-semibold text-forest">Accounts</h3>
            {!selectedMemberId ? (
              <p className="px-6 py-8 text-polished/70">Select a member above.</p>
            ) : accounts.length === 0 ? (
              <p className="px-6 py-8 text-polished/70">No savings accounts. Open one for this member.</p>
            ) : (
              <ul className="divide-y divide-champagne/10">
                {accounts.map((a) => (
                  <li
                    key={a.id}
                    className={`px-6 py-4 flex justify-between items-center ${selectedAccountId === String(a.id) ? 'bg-forest/5' : ''}`}
                  >
                    <div>
                      <button
                        type="button"
                        onClick={() => setSelectedAccountId(String(a.id))}
                        className="text-left font-medium text-forest hover:underline"
                      >
                        {a.productName} ({a.productCategory})
                      </button>
                      <p className="text-sm font-mono text-polished/90 mt-0.5">
                        Account # {a.accountNumber || `SAV-${String(a.id).padStart(6, '0')}`}
                      </p>
                      <p className="text-sm text-polished/80">Balance: {Number(a.balance).toLocaleString()}</p>
                    </div>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => {
                          setTxnForm({ memberSavingsAccountId: a.id, type: 'DEPOSIT', amount: '' });
                          setShowTransaction(true);
                        }}
                        className="rounded bg-forest/90 px-3 py-1.5 text-sm text-offwhite hover:bg-emerald"
                      >
                        Deposit / Withdraw
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-champagne/20 bg-white shadow-md overflow-hidden">
            <h3 className="px-6 py-4 border-b border-champagne/20 font-semibold text-forest">Recent transactions</h3>
            {!selectedAccountId ? (
              <p className="px-6 py-8 text-polished/70">Select an account to see transactions.</p>
            ) : transactions.length === 0 ? (
              <p className="px-6 py-8 text-polished/70">No transactions yet.</p>
            ) : (
              <ul className="divide-y divide-champagne/10">
                {transactions.map((t) => (
                  <li key={t.id} className="px-6 py-3 flex justify-between text-sm">
                    <span className={t.type === 'DEPOSIT' ? 'text-emerald-700' : 'text-amber-700'}>
                      {t.type} {Number(t.amount).toLocaleString()}
                    </span>
                    <span className="text-polished/80">{t.transactionDate}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {showTransaction && canManage && (
          <form onSubmit={handleRecordTransaction} className="mt-6 rounded-xl border border-champagne/20 bg-white p-6 shadow-md max-w-md">
            <h3 className="font-bold text-forest mb-4">Record transaction</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-polished mb-1">Type</label>
                <select
                  value={txnForm.type}
                  onChange={(e) => setTxnForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full rounded-lg border border-bronze/30 px-3 py-2"
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
                  className="w-full rounded-lg border border-bronze/30 px-3 py-2"
                  required
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit" className="rounded-lg bg-forest px-4 py-2 font-semibold text-offwhite hover:bg-emerald">
                Submit
              </button>
              <button type="button" onClick={() => setShowTransaction(false)} className="rounded-lg border border-bronze/30 px-4 py-2 text-polished">Cancel</button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
