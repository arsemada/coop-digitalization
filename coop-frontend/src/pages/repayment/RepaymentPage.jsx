import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RepaymentPage() {
  const navigate = useNavigate();
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Sample loan data
  const activeLoans = [
    {
      id: 1,
      loanNumber: 'LN-2024-001',
      principalAmount: 15000,
      paidAmount: 6000,
      remainingAmount: 9000,
      monthlyPayment: 1200,
      nextDueDate: 'Dec 15, 2024',
      interestRate: 12,
      status: 'Active'
    }
  ];

  const paymentHistory = [
    { id: 1, date: 'Nov 15, 2024', amount: 1200, status: 'Completed', method: 'Bank Transfer' },
    { id: 2, date: 'Oct 15, 2024', amount: 1200, status: 'Completed', method: 'Cash' },
    { id: 3, date: 'Sep 15, 2024', amount: 1200, status: 'Completed', method: 'Bank Transfer' },
    { id: 4, date: 'Aug 15, 2024', amount: 1200, status: 'Completed', method: 'Cash' },
    { id: 5, date: 'Jul 15, 2024', amount: 1200, status: 'Completed', method: 'Bank Transfer' },
  ];

  const handlePayment = (e) => {
    e.preventDefault();
    // Handle payment logic here
    alert(`Payment of ETB ${paymentAmount} submitted successfully!`);
    setPaymentAmount('');
    setSelectedLoan(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-forest">Loan Repayment</h1>
        <p className="mt-1 text-polished/60">Manage your loan payments and view payment history</p>
      </div>

      {/* Active Loans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loan Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-champagne/30 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-forest mb-4">Active Loans</h2>
            
            {activeLoans.map((loan) => {
              const progress = (loan.paidAmount / loan.principalAmount) * 100;
              
              return (
                <div key={loan.id} className="space-y-4">
                  {/* Loan Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-champagne/20">
                    <div>
                      <p className="text-sm text-polished/60">Loan Number</p>
                      <p className="font-semibold text-forest">{loan.loanNumber}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald/20 text-emerald">
                      {loan.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-polished/70">Repayment Progress</span>
                      <span className="text-sm font-bold text-forest">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-champagne/30 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-forest to-emerald rounded-full transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Loan Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-forest/5">
                      <p className="text-xs text-polished/60 mb-1">Principal Amount</p>
                      <p className="text-lg font-bold text-forest">ETB {loan.principalAmount.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald/10">
                      <p className="text-xs text-polished/60 mb-1">Amount Paid</p>
                      <p className="text-lg font-bold text-emerald">ETB {loan.paidAmount.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gold/10">
                      <p className="text-xs text-polished/60 mb-1">Remaining</p>
                      <p className="text-lg font-bold text-gold">ETB {loan.remainingAmount.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-champagne/30">
                      <p className="text-xs text-polished/60 mb-1">Monthly Payment</p>
                      <p className="text-lg font-bold text-forest">ETB {loan.monthlyPayment.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Next Payment */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-forest/5 to-emerald/5 border border-forest/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-polished/70">Next Payment Due</p>
                        <p className="text-xl font-bold text-forest mt-1">{loan.nextDueDate}</p>
                        <p className="text-xs text-polished/60 mt-1">Interest Rate: {loan.interestRate}% per annum</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLoan(loan);
                          setPaymentAmount(loan.monthlyPayment.toString());
                        }}
                        className="px-4 py-2 bg-forest text-white rounded-lg font-medium hover:bg-forest-deep transition-colors"
                      >
                        Pay Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-2xl border border-champagne/30 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-forest mb-4">Make Payment</h2>
          
          {selectedLoan ? (
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-polished/70 mb-2">
                  Loan Number
                </label>
                <input
                  type="text"
                  value={selectedLoan.loanNumber}
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-champagne/30 bg-champagne/10 text-polished"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-polished/70 mb-2">
                  Payment Amount (ETB)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  min="1"
                  max={selectedLoan.remainingAmount}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-champagne/30 focus:border-forest focus:ring-2 focus:ring-forest/20 outline-none"
                  placeholder="Enter amount"
                />
                <p className="text-xs text-polished/60 mt-1">
                  Minimum: ETB 1 • Maximum: ETB {selectedLoan.remainingAmount.toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-polished/70 mb-2">
                  Payment Method
                </label>
                <select className="w-full px-4 py-2 rounded-lg border border-champagne/30 focus:border-forest focus:ring-2 focus:ring-forest/20 outline-none">
                  <option>Bank Transfer</option>
                  <option>Cash</option>
                  <option>Mobile Money</option>
                </select>
              </div>

              <div className="p-4 rounded-xl bg-champagne/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-polished/70">Payment Amount</span>
                  <span className="font-semibold text-forest">ETB {paymentAmount || '0'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-polished/70">Remaining After Payment</span>
                  <span className="font-semibold text-gold">
                    ETB {(selectedLoan.remainingAmount - (parseFloat(paymentAmount) || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLoan(null);
                    setPaymentAmount('');
                  }}
                  className="flex-1 px-4 py-2 border-2 border-forest/20 text-forest rounded-lg font-medium hover:bg-forest/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-forest text-white rounded-lg font-medium hover:bg-forest-deep transition-colors"
                >
                  Submit Payment
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-polished/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-polished/60">Select a loan to make a payment</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl border border-champagne/30 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-forest mb-4">Payment History</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-champagne/30">
                <th className="text-left py-3 px-4 text-sm font-semibold text-polished/70">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-polished/70">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-polished/70">Method</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-polished/70">Status</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((payment) => (
                <tr key={payment.id} className="border-b border-champagne/20 hover:bg-champagne/10 transition-colors">
                  <td className="py-3 px-4 text-sm text-polished">{payment.date}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-forest">ETB {payment.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-polished/70">{payment.method}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-emerald/20 text-emerald">
                      {payment.status}
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

export default RepaymentPage;
