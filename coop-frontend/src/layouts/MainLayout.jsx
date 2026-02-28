import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (user?.mustChangePassword && !location.pathname.endsWith('/change-password')) {
    return <Navigate to="/change-password" replace />;
  }

  const nav = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/members', label: 'Members', roles: ['SACCO_ADMIN', 'SACCO_EMPLOYEE'] },
    { to: '/savings', label: 'Savings', roles: ['SACCO_ADMIN', 'SACCO_EMPLOYEE', 'MEMBER'] },
    { to: '/loans', label: 'Loans', roles: ['SACCO_ADMIN', 'SACCO_EMPLOYEE', 'MEMBER'] },
    { to: '/accounting', label: 'Accounting', roles: ['SUPER_ADMIN', 'UNION_ADMIN', 'SACCO_ADMIN'] },
    { to: '/reports', label: 'Reports', roles: ['SUPER_ADMIN', 'UNION_ADMIN', 'SACCO_ADMIN'] },
    { to: '/institutions', label: 'Institutions', roles: ['SUPER_ADMIN', 'UNION_ADMIN'] },
    { to: '/settings', label: 'Settings', roles: ['SACCO_ADMIN', 'SACCO_EMPLOYEE', 'UNION_ADMIN'] },
  ].filter((item) => !item.roles || (user?.role && item.roles.includes(user.role)));

  return (
    <div className="min-h-screen bg-offwhite">
      <header className="border-b border-champagne/20 bg-forest text-offwhite shadow-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/dashboard" className="font-bold tracking-tight text-offwhite hover:text-champagne transition-colors">
            Coop<span className="text-champagne">Digital</span>
          </Link>
          <nav className="flex items-center gap-6">
            {nav.map(({ to, label }) => (
              <Link key={to} to={to} className="text-sm font-medium text-offwhite/90 hover:text-champagne transition-colors">
                {label}
              </Link>
            ))}
            <span className="text-sm text-offwhite/70">
              {user?.username} <span className="text-champagne/80">({user?.role})</span>
              {user?.institutionName && ` · ${user.institutionName}`}
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-champagne/40 px-4 py-1.5 text-sm font-medium hover:bg-champagne/20 transition-colors"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
