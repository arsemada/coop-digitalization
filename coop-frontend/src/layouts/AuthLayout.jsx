import { Link, Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-offwhite px-4">
      <Link to="/landing" className="mb-6 text-lg font-bold text-forest hover:text-emerald">
        Coop<span className="text-emerald">Digital</span>
      </Link>
      <div className="w-full max-w-2xl">
        <Outlet />
      </div>
    </div>
  );
}
