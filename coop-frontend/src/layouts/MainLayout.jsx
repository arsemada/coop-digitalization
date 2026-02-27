import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const { user, logout } = useAuth();

  const nav = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/members', label: 'Members', roles: ['SACCO_ADMIN', 'SACCO_EMPLOYEE', 'MEMBER'] },
    { to: '/savings', label: 'Savings', roles: ['SACCO_ADMIN', 'SACCO_EMPLOYEE', 'MEMBER'] },
    { to: '/loans', label: 'Loans', roles: ['SACCO_ADMIN', 'SACCO_EMPLOYEE', 'MEMBER'] },
    { to: '/accounting', label: 'Accounting', roles: ['SUPER_ADMIN', 'UNION_ADMIN', 'SACCO_ADMIN'] },
    { to: '/reports', label: 'Reports', roles: ['SUPER_ADMIN', 'UNION_ADMIN', 'SACCO_ADMIN'] },
    { to: '/institutions', label: 'Institutions', roles: ['SUPER_ADMIN', 'UNION_ADMIN'] },
  ].filter((item) => !item.roles || (user?.role && item.roles.includes(user.role)));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-800 text-white shadow">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <span className="font-semibold">Coop Digitalization</span>
          <nav className="flex items-center gap-4">
            {nav.map(({ to, label }) => (
              <Link key={to} to={to} className="hover:text-slate-200">
                {label}
              </Link>
            ))}
            <span className="text-slate-400">
              {user?.username} ({user?.role})
              {user?.institutionName && ` · ${user.institutionName}`}
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded bg-slate-600 px-3 py-1 text-sm hover:bg-slate-500"
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
