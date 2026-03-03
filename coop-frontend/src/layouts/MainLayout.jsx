import { useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SIDEBAR_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '▣', roles: null },
  { to: '/members', label: 'Members', icon: '👥', roles: ['SACCO_ADMIN', 'SACCO_EMPLOYEE'] },
  { to: '/savings', label: 'Savings', icon: '💳', roles: ['SACCO_ADMIN', 'SACCO_EMPLOYEE', 'MEMBER'] },
  { to: '/transfer', label: 'Transfer', icon: '↔', roles: ['SACCO_ADMIN', 'SACCO_EMPLOYEE', 'MEMBER'] },
  { to: '/loans', label: 'Loans', icon: '💰', roles: ['SACCO_ADMIN', 'SACCO_EMPLOYEE', 'MEMBER'] },
  { to: '/accounting', label: 'Accounting', icon: '📊', roles: ['SUPER_ADMIN', 'UNION_ADMIN', 'SACCO_ADMIN'] },
  { to: '/reports', label: 'Reports', icon: '📈', roles: ['SUPER_ADMIN', 'UNION_ADMIN', 'SACCO_ADMIN'] },
  { to: '/institutions', label: 'Institutions', icon: '🏛', roles: ['SUPER_ADMIN', 'UNION_ADMIN'] },
  { to: '/settings', label: 'Settings', icon: '⚙', roles: ['SACCO_ADMIN', 'SACCO_EMPLOYEE', 'UNION_ADMIN'] },
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
              <>Coop<span className="text-emerald">Digital</span></>
            ) : (
              <span className="text-xl">CD</span>
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
            {navItems.map(({ to, label, icon }) => {
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
                    <span className="text-lg flex-shrink-0 w-7 text-center" aria-hidden>
                      {icon}
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
            <h1 className="text-lg font-semibold text-polished/90 truncate">
              {navItems.find((i) => i.to === location.pathname)?.label || 'Dashboard'}
            </h1>
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
