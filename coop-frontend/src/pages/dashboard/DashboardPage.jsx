import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
      <p className="mt-2 text-slate-600">
        Welcome, {user?.username}. Role: {user?.role}.
        {user?.institutionName && ` Institution: ${user.institutionName}`}
      </p>
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-slate-600">System overview and key metrics will appear here.</p>
      </div>
    </div>
  );
}
