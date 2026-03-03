import { useState } from 'react';

function TransactionsPage() {
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  // Sample transaction data
  const transactions = [
    { id: 1, type: 'Deposit', amount: 2000, date: '2024-11-28', time: '10:30 AM', status: 'Completed', account: 'Regular Savings', reference: 'TXN-001' },
    { id: 2, type: 'Transfer Out', amount: -500, date: '2024-11-25', time: '02:15 PM', status: 'Completed', account: 'Regular Savings', reference: 'TXN-002', recipient: 'Abebe Kebede' },
    { id: 3, type: 'Loan Payment', amount: -1200, date: '2024-11-15', time: '09:00 AM', status: 'Completed', account: 'Regular Savings', reference: 'TXN-003' },
    { id: 4, type: 'Deposit', amount: 1500, date: '2024-11-10', time: '11:45 AM', status: 'Completed', account: 'Regular Savings', reference: 'TXN-004' },
    { id: 5, type: 'Transfer In', amount: 800, date: '2024-11-08', time: '03:20 PM', status: 'Completed', account: 'Regular Savings', reference: 'TXN-005', sender: 'Tigist Lemma' },
    { id: 6, type: 'Withdrawal', amount: -300, date: '2024-11-05', time: '01:10 PM', status: 'Completed', account: 'Regular Savings', reference: 'TXN-006' },
    { id: 7, type: 'Deposit', amount: 2500, date: '2024-10-28', time: '10:00 AM', status: 'Completed', account: 'Fixed Deposit', reference: 'TXN-007' },
    { id: 8, type: 'Transfer Out', amount: -400, date: '2024-10-20', time: '04:30 PM', status: 'Completed', account: 'Regular Savings', reference: 'TXN-008', recipient: 'Hanna Demisse' },
  ];

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'deposits') return t.amount > 0;
    if (filter === 'withdrawals') return t.amount < 0;
    return true;
  });

  const getTransactionIcon = (type) => {
    if (type.includes('Deposit') || type.includes('Transfer In')) {
      return (
        <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    );
  };

  const totalDeposits = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
  const netBalance = totalDeposits - totalWithdrawals;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-forest">Transaction History</h1>
        <p className="mt-1 text-polished/60">View all your account transactions and transfers</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-champagne/30 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-polished/60">Total Deposits</p>
            <div className="w-10 h-10 rounded-full bg-emerald/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald">ETB {totalDeposits.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-2xl border border-champagne/30 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-polished/60">Total Withdrawals</p>
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gold">ETB {totalWithdrawals.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-2xl border border-champagne/30 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-polished/60">Net Balance</p>
            <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-forest">ETB {netBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-champagne/30 p-6 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-polished/70 mb-2">Filter by Type</label>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-champagne/30 focus:border-forest focus:ring-2 focus:ring-forest/20 outline-none"
            >
              <option value="all">All Transactions</option>
              <option value="deposits">Deposits Only</option>
              <option value="withdrawals">Withdrawals Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-polished/70 mb-2">Date Range</label>
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 rounded-lg border border-champagne/30 focus:border-forest focus:ring-2 focus:ring-forest/20 outline-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <div className="ml-auto">
            <label className="block text-sm font-medium text-polished/70 mb-2">&nbsp;</label>
            <button
              type="button"
              className="px-4 py-2 bg-forest text-white rounded-lg font-medium hover:bg-forest-deep transition-colors"
            >
              Export to PDF
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-champagne/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-champagne/20">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-polished/70">Date & Time</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-polished/70">Type</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-polished/70">Details</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-polished/70">Account</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-polished/70">Amount</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-polished/70">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-champagne/20 hover:bg-champagne/10 transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-sm font-medium text-polished">{transaction.date}</p>
                      <p className="text-xs text-polished/60">{transaction.time}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.amount > 0 ? 'bg-emerald/20' : 'bg-gold/20'
                      }`}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <span className="text-sm font-medium text-polished">{transaction.type}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-polished/70">
                      <p>Ref: {transaction.reference}</p>
                      {transaction.recipient && <p className="text-xs">To: {transaction.recipient}</p>}
                      {transaction.sender && <p className="text-xs">From: {transaction.sender}</p>}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-polished/70">{transaction.account}</td>
                  <td className="py-4 px-6 text-right">
                    <span className={`text-sm font-bold ${transaction.amount > 0 ? 'text-emerald' : 'text-polished'}`}>
                      {transaction.amount > 0 ? '+' : ''}ETB {Math.abs(transaction.amount).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-emerald/20 text-emerald">
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TransactionsPage;
