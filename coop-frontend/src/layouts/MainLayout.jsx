import { useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path d="M4 4h7v7H4zM13 4h7v5h-7zM4 13h5v7H4zM11 13h9v7h-9z" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function MembersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <circle cx="9" cy="9" r="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5.5 15.5C6 13.8 7.2 13 9 13s3 .8 3.5 2.5M14 14.5c.7-.4 1.4-.6 2.3-.6 1.3 0 2.3.5 2.7 1.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SavingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <rect x="4" y="8" width="16" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12.5" r="1" fill="currentColor" />
    </svg>
  );
}

function TransferIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        d="M5 9h11M13 6l3 3-3 3M19 15H8m3-3-3 3 3 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LoansIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <rect x="4" y="5" width="10" height="14" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 9h3.5L16 5.5V9Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function AccountingIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path d="M4 19V5h10v14H4Zm10-9h6v9h-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7.5 9.5h3M7.5 12.5h2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path d="M4 19V6m0 13h16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M7 14l3-3 3 2.5 4-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InstitutionsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        d="M4 10h16L12 4 4 10Zm1 2v6m4-6v6m6-6v6m4-6v6M3 20h18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5 12.5h-1m16 0h-1M12.5 5V4m0 16v-1M7.2 7.2 6.5 6.5m11 11-.7-.7M7.2 16.8l-.7.7m11-11-.7.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RepaymentIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TransactionsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path d="M3 3h18v18H3z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 9h18M9 3v18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const SIDEBAR_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon, roles: null },
  { to: '/members', label: 'Members', icon: MembersIcon, roles: ['SACCO_ADMIN', 'SACCO_EMPLOYEE'] },
  { to: '/savings', label: 'Savings', icon: SavingsIcon, roles: ['SACCO_ADMIN', 'SACCO_EMPLOYEE', 'MEMBER'] },
  { to: '/transfer', label: 'Transfer', icon: TransferIcon, roles: ['SACCO_ADMIN', 'SACCO_EMPLOYEE', 'MEMBER'] },
  { to: '/transactions', label: 'Transactions', icon: TransactionsIcon, roles: ['SACCO_ADMIN', 'SACCO_EMPLOYEE', 'MEMBER'] },
  { to: '/loans', label: 'Loans', icon: LoansIcon, roles: ['SACCO_ADMIN', 'SACCO_EMPLOYEE', 'MEMBER'] },
  { to: '/repayment', label: 'Repayment', icon: RepaymentIcon, roles: ['MEMBER'] },
  { to: '/accounting', label: 'Accounting', icon: AccountingIcon, roles: ['SUPER_ADMIN', 'UNION_ADMIN', 'SACCO_ADMIN'] },
  { to: '/reports', label: 'Reports', icon: ReportsIcon, roles: ['SUPER_ADMIN', 'UNION_ADMIN', 'SACCO_ADMIN'] },
  { to: '/institutions', label: 'Institutions', icon: InstitutionsIcon, roles: ['SUPER_ADMIN', 'UNION_ADMIN'] },
  { to: '/settings', label: 'Settings', icon: SettingsIcon, roles: ['SACCO_ADMIN', 'SACCO_EMPLOYEE', 'UNION_ADMIN'] },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (user?.mustChangePassword && !location.pathname.endsWith('/change-password')) {
    return <Navigate to="/change-password" replace />;
  }

  const navItems = SIDEBAR_ITEMS.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role))
  );

  return (
    <div className="min-h-screen bg-offwhite flex">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-20 bg-polished/40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-56' : 'w-20'
        } flex-shrink-0 border-r border-champagne/25 bg-white transition-all duration-300 ease-out flex flex-col z-30
          fixed md:relative inset-y-0 left-0 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-champagne/20">
          <Link
            to="/dashboard"
            className="font-bold tracking-tight text-forest hover:text-emerald transition-colors truncate"
          >
            {sidebarOpen ? (
              <>ቀርሺ<span className="text-emerald">Link</span></>
            ) : (
              <span className="text-xl">ቀር</span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            className="p-2 rounded-lg text-polished/60 hover:bg-offwhite hover:text-forest transition-colors"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <span className="text-lg">{sidebarOpen ? '‹' : '›'}</span>
          </button>
        </div>
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-forest text-offwhite'
                        : 'text-polished/80 hover:bg-forest/10 hover:text-forest'
                    }`}
                  >
                    <span className="flex-shrink-0 w-7 flex items-center justify-center text-forest" aria-hidden>
                      <Icon />
                    </span>
                    {sidebarOpen && <span>{label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        {sidebarOpen && (
          <div className="p-3 border-t border-champagne/20">
            <p className="text-xs text-polished/60 truncate" title={user?.institutionName}>
              {user?.institutionName || '—'}
            </p>
            <p className="text-xs text-forest/80 font-medium mt-0.5">{user?.role?.replace(/_/g, ' ')}</p>
          </div>
        )}
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navbar */}
        <header className="h-14 flex-shrink-0 border-b border-champagne/20 bg-white flex items-center justify-between px-4 md:px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-polished/70 hover:bg-offwhite"
              aria-label="Open menu"
            >
              <span className="text-xl">☰</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-polished/70">
              {user?.username}
            </span>
            <Link
              to="/change-password"
              className="text-sm font-medium text-forest hover:text-emerald transition-colors"
            >
              Password
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-champagne/40 px-3 py-1.5 text-sm font-medium text-polished/80 hover:bg-champagne/15 hover:border-champagne/50 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
