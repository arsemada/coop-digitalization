import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ----- Super Admin Dashboard: system-wide, dark accent -----
function SuperAdminDashboard() {
  const navigate = useNavigate();
  const stats = [
    { label: 'Total Institutions', value: '—', sub: 'Unions + SACCOs', valueClass: 'text-forest' },
    { label: 'Unions', value: '—', sub: 'Active', valueClass: 'text-emerald' },
    { label: 'SACCOs', value: '—', sub: 'Across network', valueClass: 'text-gold' },
    { label: 'System Status', value: 'Live', sub: 'All services', valueClass: 'text-emerald' },
  ];
  const quickLinks = [
    { label: 'Manage Institutions', path: '/institutions', icon: '🏛' },
    { label: 'Accounting', path: '/accounting', icon: '📊' },
    { label: 'Reports', path: '/reports', icon: '📈' },
  ];
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-polished/15 bg-gradient-to-br from-polished/5 to-white p-6">
        <h1 className="text-2xl font-bold text-polished">Super Admin Dashboard</h1>
        <p className="mt-1 text-sm text-polished/60">System-wide overview and controls</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-polished/10 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-polished/55">{s.label}</p>
            <p className={`mt-2 text-2xl font-bold ${s.valueClass}`}>{s.value}</p>
            <p className="mt-1 text-xs text-polished/50">{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-polished/10 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-polished mb-4">Quick links</h2>
        <div className="flex flex-wrap gap-3">
          {quickLinks.map(({ label, path, icon }) => (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className="inline-flex items-center gap-2 rounded-xl bg-forest px-4 py-3 text-sm font-semibold text-white hover:bg-forest-deep transition-colors"
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-polished/10 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-polished mb-2">System info</h2>
        <p className="text-sm text-polished/70">
          Use Institutions to manage unions and SACCOs. Reports and Accounting provide financial oversight across the network.
        </p>
      </div>
    </div>
  );
}

// ----- Union Dashboard: network / SACCOs focus -----
function UnionDashboard() {
  const navigate = useNavigate();
  const stats = [
    { label: 'SACCOs in union', value: '—', trend: null },
    { label: 'Total members', value: '—', trend: null },
    { label: 'Active reports', value: '—', trend: null },
  ];
  const quickLinks = [
    { label: 'Institutions', path: '/institutions', desc: 'Manage SACCOs' },
    { label: 'Create SACCO', path: '/institutions?create=1', desc: 'Register new SACCO' },
    { label: 'Reports', path: '/reports', desc: 'Union reports' },
  ];
  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-br from-forest to-emerald/90 px-6 py-8 text-white shadow-lg">
        <h1 className="text-2xl font-bold">Union Dashboard</h1>
        <p className="mt-1 text-white/85 text-sm">Manage your union and member SACCOs</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-champagne/30 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-forest/70">{s.label}</p>
            <p className="mt-2 text-2xl font-bold text-forest">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-champagne/25 bg-offwhite/50 p-6">
        <h2 className="text-lg font-semibold text-forest mb-4">Quick links</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {quickLinks.map(({ label, path, desc }) => (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className="rounded-xl border-2 border-forest/20 bg-white p-4 text-left hover:border-forest/50 hover:bg-forest/5 transition-all"
            >
              <p className="font-semibold text-forest">{label}</p>
              <p className="mt-1 text-xs text-polished/65">{desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----- SACCO Dashboard: members, savings, loans -----
function SaccoDashboard() {
  const navigate = useNavigate();
  const stats = [
    { label: 'Members', value: '—', icon: '👥', link: '/members' },
    { label: 'Total savings', value: '—', icon: '💳', link: '/savings' },
    { label: 'Active loans', value: '—', icon: '💰', link: '/loans' },
  ];
  const quickLinks = [
    { label: 'Create member', path: '/members?create=1' },
    { label: 'Transfer', path: '/transfer' },
    { label: 'Reports', path: '/reports' },
    { label: 'USSD Simulator', external: '/ussd-simulator.html' },
  ];
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-forest">SACCO Dashboard</h1>
          <p className="mt-1 text-sm text-polished/70">Your cooperative at a glance</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => navigate(s.link)}
            className="rounded-2xl border border-champagne/25 bg-white p-6 text-left shadow-sm hover:shadow-lg hover:border-forest/20 transition-all group"
          >
            <span className="text-3xl" aria-hidden>{s.icon}</span>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-polished/60">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-forest">{s.value}</p>
            <p className="mt-2 text-xs text-emerald font-medium group-hover:underline">View →</p>
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-champagne/25 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-forest mb-4">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          {quickLinks.map((l) =>
            l.external ? (
              <a
                key={l.external}
                href={l.external}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-offwhite px-4 py-3 text-sm font-semibold text-forest hover:bg-champagne/20 transition-colors"
              >
                {l.label}
              </a>
            ) : (
              <button
                key={l.path}
                type="button"
                onClick={() => navigate(l.path)}
                className="rounded-xl bg-forest px-4 py-3 text-sm font-semibold text-white hover:bg-emerald transition-colors"
              >
                {l.label}
              </button>
            )
          )}
        </div>
      </div>
      <div className="rounded-2xl border border-gold/20 bg-gold/5 p-5">
        <p className="text-sm font-medium text-polished/80">
          <span className="text-gold">Tip:</span> Use Members to register new savers. Savings and Loans show balances and applications.
        </p>
      </div>
    </div>
  );
}

// ----- Member Dashboard: personal savings & loans -----
function MemberDashboard() {
  const navigate = useNavigate();
  const stats = [
    { label: 'My savings balance', value: '—', to: '/savings' },
    { label: 'My loans', value: '—', to: '/loans' },
  ];
  const quickLinks = [
    { label: 'Transfer money', path: '/transfer' },
    { label: 'Savings', path: '/savings' },
    { label: 'Loans', path: '/loans' },
  ];
  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-white border border-champagne/20 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-forest">My dashboard</h1>
        <p className="mt-1 text-sm text-polished/70">Your savings and loans in one place</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => navigate(s.to)}
            className="rounded-2xl border border-champagne/25 bg-white p-6 text-left shadow-sm hover:shadow-md hover:border-emerald/30 transition-all"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-polished/55">{s.label}</p>
            <p className="mt-2 text-2xl font-bold text-forest">{s.value}</p>
            <p className="mt-2 text-sm text-emerald font-medium">View details →</p>
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-emerald/20 bg-emerald/5 p-6">
        <h2 className="text-lg font-semibold text-forest mb-3">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          {quickLinks.map(({ label, path }) => (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className="rounded-xl bg-forest px-4 py-3 text-sm font-semibold text-white hover:bg-emerald transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-xl bg-offwhite/80 border border-champagne/20 p-4">
        <p className="text-sm text-polished/70">
          Use <strong>Transfer</strong> to send money to another member. Check Savings and Loans for your balances and history.
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === 'SUPER_ADMIN') return <SuperAdminDashboard />;
  if (user?.role === 'UNION_ADMIN') return <UnionDashboard />;
  if (user?.role === 'MEMBER') return <MemberDashboard />;
  if (user?.role === 'SACCO_ADMIN' || user?.role === 'SACCO_EMPLOYEE') return <SaccoDashboard />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-forest">Dashboard</h1>
      <p className="mt-2 text-polished/80">Welcome, {user?.username}. No dashboard configured for your role.</p>
    </div>
  );
}
