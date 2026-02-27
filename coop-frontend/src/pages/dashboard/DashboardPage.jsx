import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSacco = user?.role === 'SACCO_ADMIN' || user?.role === 'SACCO_EMPLOYEE';
  const isUnion = user?.role === 'UNION_ADMIN';

  return (
    <div>
      <h1 className="text-3xl font-bold text-forest">Dashboard</h1>
      <p className="mt-2 text-polished/80">
        Welcome, <span className="font-medium text-forest">{user?.username}</span>. Role: <span className="text-bronze">{user?.role}</span>
        {user?.institutionName && <span> · {user.institutionName}</span>}
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-champagne/20 bg-white p-6 shadow-md">
          <div className="text-sm font-medium text-champagne">Overview</div>
          <p className="mt-2 text-polished/80">System overview and key metrics will appear here.</p>
        </div>
        <div className="rounded-xl border border-champagne/20 bg-white p-6 shadow-md">
          <div className="text-sm font-medium text-champagne">Quick Actions</div>
          <p className="mt-2 text-polished/80">Shortcuts to common tasks.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {isSacco && (
              <button
                type="button"
                onClick={() => navigate('/members?create=1')}
                className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-offwhite hover:bg-emerald"
              >
                Create Member
              </button>
            )}
            {isUnion && (
              <button
                type="button"
                onClick={() => navigate('/institutions?create=1')}
                className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-offwhite hover:bg-emerald"
              >
                Create SACCO
              </button>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-champagne/20 bg-white p-6 shadow-md">
          <div className="text-sm font-medium text-champagne">Activity</div>
          <p className="mt-2 text-polished/80">Recent activity feed.</p>
        </div>
      </div>
    </div>
  );
}
