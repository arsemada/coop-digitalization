import { Link } from 'react-router-dom';

export default function ReportsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-forest">Reports</h1>
      <p className="mt-2 text-polished/80">Financial reports, trial balance, income statement, balance sheet, loan portfolio, and savings summary.</p>
      <div className="mt-6 rounded-xl border border-forest/20 bg-champagne/5 p-6">
        <p className="text-polished/90 mb-2">
          Full reporting and accounting (ledgers, journal, chart of accounts, and all financial reports) are available in the <strong>Accounting</strong> section.
        </p>
        <Link to="/accounting" className="inline-flex items-center rounded-lg bg-forest px-4 py-2 font-semibold text-offwhite hover:bg-emerald transition-colors">
          Open Accounting →
        </Link>
      </div>
      <div className="mt-8 rounded-xl border border-champagne/20 bg-white p-8 shadow-md">
        <h2 className="text-xl font-bold text-forest mb-2">Report types available</h2>
        <ul className="list-disc pl-6 space-y-1 text-polished/80">
          <li><strong>Ledgers:</strong> Member Ledger (per-member transaction history with running balance), General Ledger (per-account)</li>
          <li><strong>Journal:</strong> All double-entry postings with expandable lines</li>
          <li><strong>Chart of Accounts:</strong> List of GL accounts (Cash, Member Savings, etc.)</li>
          <li><strong>Savings by Product:</strong> Deposits, withdrawals, net by product category</li>
          <li><strong>Loan Summary:</strong> Disbursed, repaid, outstanding, interest collected</li>
          <li><strong>Member Financial Summary:</strong> Per-member savings, loans, outstanding, interest paid</li>
          <li><strong>Cash Flow:</strong> Opening balance, movements, closing balance</li>
          <li><strong>Income Statement:</strong> Income, expenses, net income</li>
          <li><strong>Balance Sheet:</strong> Assets, liabilities, equity</li>
        </ul>
      </div>
    </div>
  );
}
