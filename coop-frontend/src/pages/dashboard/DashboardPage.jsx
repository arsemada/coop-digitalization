import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Icon components
function TrendUpIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function UsersIcon({ className = "w-8 h-8" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function FileTextIcon({ className = "w-8 h-8" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="10 9 9 9 8 9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function DollarIcon({ className = "w-8 h-8" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CreditCardIcon({ className = "w-8 h-8" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="1" y1="10" x2="23" y2="10" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function BuildingIcon({ className = "w-8 h-8" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21h18M3 7v14M21 7v14M9 21V7M15 21V7M9 7V3h6v4M5 10h4M5 14h4M5 18h4M15 10h4M15 14h4M15 18h4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CheckCircleIcon({ className = "w-8 h-8" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Simple bar chart component
function BarChart({ data, labels, height = 200 }) {
  const max = Math.max(...data, 1);
  
  return (
    <div className="flex items-end justify-between gap-3" style={{ height: `${height}px` }}>
      {data.map((value, index) => {
        const barHeight = (value / max) * (height - 40);
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex flex-col items-center justify-end" style={{ height: `${height - 40}px` }}>
              <div className="text-xs font-medium text-polished/70 mb-1">{value}</div>
              <div 
                className="w-full bg-gradient-to-t from-forest to-emerald rounded-t-lg transition-all duration-500"
                style={{ height: `${Math.max(barHeight, 4)}px` }}
              />
            </div>
            <div className="text-xs font-medium text-polished/60">{labels[index]}</div>
          </div>
        );
      })}
    </div>
  );
}

// Donut chart component
function DonutChart({ percentage, label, color = "#004B33" }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <svg width="180" height="180" className="transform -rotate-90">
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke="#E8E0D5"
            strokeWidth="20"
            fill="none"
          />
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke={color}
            strokeWidth="20"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-forest">{percentage}%</div>
          <div className="text-sm text-polished/60">{label}</div>
        </div>
      </div>
    </div>
  );
}

// Modern stat card with icon
function StatCard({ label, value, change, changeLabel, IconComponent, color = 'forest', onClick }) {
  const colorClasses = {
    forest: 'bg-forest text-white',
    emerald: 'bg-emerald text-white',
    gold: 'bg-gold text-white',
    white: 'bg-white text-forest border border-champagne/30'
  };

  const iconColor = color === 'white' ? 'text-forest' : 'text-white';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${colorClasses[color]} rounded-2xl p-6 text-left shadow-sm hover:shadow-lg transition-all relative overflow-hidden group`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${color === 'white' ? 'text-polished/60' : 'text-white/80'}`}>
            {label}
          </p>
          <p className={`mt-3 text-3xl font-bold ${color === 'white' ? 'text-forest' : 'text-white'}`}>
            {value}
          </p>
          {change && (
            <div className={`mt-2 flex items-center gap-1 text-sm ${color === 'white' ? 'text-emerald' : 'text-white/90'}`}>
              <TrendUpIcon />
              <span className="font-medium">{change}</span>
              <span className={color === 'white' ? 'text-polished/60' : 'text-white/70'}>{changeLabel}</span>
            </div>
          )}
        </div>
        {IconComponent && (
          <div className={`${iconColor} opacity-80 group-hover:opacity-100 transition-opacity`}>
            <IconComponent className="w-10 h-10" />
          </div>
        )}
      </div>
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl ${
        color === 'white' ? 'bg-forest/5' : 'bg-white/10'
      } -mr-16 -mt-16`} />
    </button>
  );
}

// Activity item
function ActivityItem({ title, subtitle, status, time }) {
  const statusColors = {
    completed: 'bg-emerald/20 text-emerald',
    pending: 'bg-gold/20 text-gold',
    progress: 'bg-blue-500/20 text-blue-600'
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-champagne/10 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-polished truncate">{title}</p>
        <p className="text-sm text-polished/60 truncate">{subtitle}</p>
      </div>
      {status && (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      )}
      {time && <span className="text-xs text-polished/50 whitespace-nowrap">{time}</span>}
    </div>
  );
}

// ----- SACCO Dashboard -----
function SaccoDashboard() {
  const navigate = useNavigate();

  // Realistic small numbers
  const weeklyTransactions = [3, 5, 2, 7, 4, 6, 5]; // Last 7 days
  const loanDisbursementRate = 67; // 67% of loans disbursed

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-forest">Dashboard</h1>
          <p className="mt-1 text-polished/60">Plan, prioritize, and accomplish your tasks with ease.</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/members?create=1')}
            className="px-5 py-2.5 bg-forest text-white rounded-xl font-medium hover:bg-forest-deep transition-colors"
          >
            + Add Member
          </button>
          <button
            type="button"
            onClick={() => navigate('/transfer')}
            className="px-5 py-2.5 border-2 border-forest/20 text-forest rounded-xl font-medium hover:bg-forest/5 transition-colors"
          >
            Import Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Members"
          value="12"
          change="+2"
          changeLabel="from last month"
          IconComponent={UsersIcon}
          color="forest"
          onClick={() => navigate('/members')}
        />
        <StatCard
          label="Pending Loans"
          value="3"
          change="+1"
          changeLabel="new applications"
          IconComponent={FileTextIcon}
          color="white"
          onClick={() => navigate('/loans')}
        />
        <StatCard
          label="Active Loans"
          value="8"
          change="+2"
          changeLabel="this month"
          IconComponent={DollarIcon}
          color="white"
          onClick={() => navigate('/loans')}
        />
        <StatCard
          label="Total Savings"
          value="ETB 145K"
          change="+12%"
          changeLabel="growth"
          IconComponent={CreditCardIcon}
          color="white"
          onClick={() => navigate('/savings')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Analytics */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-champagne/30 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-forest">Transaction Analytics</h2>
            <span className="text-sm text-polished/60">Last 7 days</span>
          </div>
          <BarChart 
            data={weeklyTransactions} 
            labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
            height={220}
          />
        </div>

        {/* Loan Progress */}
        <div className="bg-white rounded-2xl border border-champagne/30 p-6 shadow-sm flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-forest mb-4 w-full">Loan Portfolio</h2>
          <DonutChart 
            percentage={loanDisbursementRate} 
            label="Disbursed"
            color="#0A7A54"
          />
          <div className="mt-4 text-center">
            <p className="text-sm text-polished/60">8 of 12 loans disbursed</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transfers */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-champagne/30 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-forest">Recent Transfers</h2>
            <button
              type="button"
              onClick={() => navigate('/transfer')}
              className="text-sm text-emerald font-medium hover:underline"
            >
              View all →
            </button>
          </div>
          <div className="space-y-2">
            <ActivityItem
              title="Abebe Kebede"
              subtitle="Transfer to Tigist Lemma • ETB 1,200"
              status="completed"
              time="2h ago"
            />
            <ActivityItem
              title="Hanna Demisse"
              subtitle="Transfer to Yonas Tadele • ETB 800"
              status="completed"
              time="5h ago"
            />
            <ActivityItem
              title="Getachew Hailu"
              subtitle="Transfer to Sara Abebe • ETB 500"
              status="pending"
              time="1d ago"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-champagne/30 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-forest mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => navigate('/members?create=1')}
              className="w-full p-4 rounded-xl border-2 border-forest/20 hover:border-forest/40 hover:bg-forest/5 transition-all text-left"
            >
              <p className="font-semibold text-forest">Register Member</p>
              <p className="text-xs text-polished/60 mt-1">Add new member to SACCO</p>
            </button>
            <button
              type="button"
              onClick={() => navigate('/loans')}
              className="w-full p-4 rounded-xl border-2 border-forest/20 hover:border-forest/40 hover:bg-forest/5 transition-all text-left"
            >
              <p className="font-semibold text-forest">Process Loan</p>
              <p className="text-xs text-polished/60 mt-1">Review loan applications</p>
            </button>
            <button
              type="button"
              onClick={() => navigate('/savings')}
              className="w-full p-4 rounded-xl border-2 border-forest/20 hover:border-forest/40 hover:bg-forest/5 transition-all text-left"
            >
              <p className="font-semibold text-forest">Manage Savings</p>
              <p className="text-xs text-polished/60 mt-1">View savings accounts</p>
            </button>
            <button
              type="button"
              onClick={() => navigate('/reports')}
              className="w-full p-4 rounded-xl border-2 border-forest/20 hover:border-forest/40 hover:bg-forest/5 transition-all text-left"
            >
              <p className="font-semibold text-forest">Generate Report</p>
              <p className="text-xs text-polished/60 mt-1">Financial reports</p>
            </button>
            <a
              href="/ussd-simulator.html"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-4 rounded-xl border-2 border-emerald/30 bg-emerald/5 hover:border-emerald/50 hover:bg-emerald/10 transition-all text-left block"
            >
              <p className="font-semibold text-emerald">USSD Simulator</p>
              <p className="text-xs text-polished/60 mt-1">Test USSD functionality</p>
            </a>
          </div>
        </div>
      </div>

      {/* Loan Applications & Savings Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-champagne/30 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-forest">Loan Applications</h2>
            <button
              type="button"
              onClick={() => navigate('/loans')}
              className="text-sm text-emerald font-medium hover:underline"
            >
              View all →
            </button>
          </div>
          <div className="space-y-2">
            <ActivityItem
              title="Hanna Demisse"
              subtitle="Loan amount: ETB 15,000"
              status="pending"
            />
            <ActivityItem
              title="Yonas Tadele"
              subtitle="Loan amount: ETB 8,000"
              status="progress"
            />
            <ActivityItem
              title="Sara Abebe"
              subtitle="Loan amount: ETB 12,000"
              status="completed"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-champagne/30 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-forest mb-6">Savings Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-forest/5">
              <div>
                <p className="text-sm text-polished/60">Total Deposits</p>
                <p className="text-2xl font-bold text-forest mt-1">ETB 145K</p>
              </div>
              <div className="text-emerald text-sm font-medium">+12%</div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-champagne/20">
              <div>
                <p className="text-sm text-polished/60">Active Accounts</p>
                <p className="text-2xl font-bold text-forest mt-1">12</p>
              </div>
              <div className="text-emerald text-sm font-medium">+2</div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-gold/10">
              <div>
                <p className="text-sm text-polished/60">Avg. Balance</p>
                <p className="text-2xl font-bold text-forest mt-1">ETB 12,083</p>
              </div>
              <div className="text-emerald text-sm font-medium">+8%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----- Union Dashboard -----
function UnionDashboard() {
  const navigate = useNavigate();

  const weeklyMembers = [2, 1, 3, 2, 4, 1, 2]; // New members per day

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-forest">Union Dashboard</h1>
          <p className="mt-1 text-polished/60">Manage your union and member SACCOs</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/institutions?create=1')}
            className="px-5 py-2.5 bg-forest text-white rounded-xl font-medium hover:bg-forest-deep transition-colors"
          >
            + Add SACCO
          </button>
          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="px-5 py-2.5 border-2 border-forest/20 text-forest rounded-xl font-medium hover:bg-forest/5 transition-colors"
          >
            View Reports
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="SACCOs in Union"
          value="4"
          change="+1"
          changeLabel="this quarter"
          IconComponent={BuildingIcon}
          color="forest"
          onClick={() => navigate('/institutions')}
        />
        <StatCard
          label="Total Members"
          value="48"
          change="+15"
          changeLabel="this month"
          IconComponent={UsersIcon}
          color="white"
          onClick={() => navigate('/members')}
        />
        <StatCard
          label="Pending Loans"
          value="11"
          change="+3"
          changeLabel="new"
          IconComponent={FileTextIcon}
          color="white"
          onClick={() => navigate('/loans')}
        />
        <StatCard
          label="Total Savings"
          value="ETB 580K"
          change="+18%"
          changeLabel="growth"
          IconComponent={DollarIcon}
          color="white"
          onClick={() => navigate('/savings')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Member Growth Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-champagne/30 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-forest">Member Growth</h2>
            <span className="text-sm text-polished/60">Last 7 days</span>
          </div>
          <BarChart 
            data={weeklyMembers} 
            labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
            height={220}
          />
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-champagne/30 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-forest mb-4">Quick Links</h2>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => navigate('/institutions')}
              className="w-full p-4 rounded-xl border-2 border-forest/20 hover:border-forest/40 hover:bg-forest/5 transition-all text-left"
            >
              <p className="font-semibold text-forest">Manage SACCOs</p>
              <p className="text-xs text-polished/60 mt-1">View all institutions</p>
            </button>
            <button
              type="button"
              onClick={() => navigate('/reports')}
              className="w-full p-4 rounded-xl border-2 border-forest/20 hover:border-forest/40 hover:bg-forest/5 transition-all text-left"
            >
              <p className="font-semibold text-forest">Union Reports</p>
              <p className="text-xs text-polished/60 mt-1">Financial reports</p>
            </button>
            <button
              type="button"
              onClick={() => navigate('/accounting')}
              className="w-full p-4 rounded-xl border-2 border-forest/20 hover:border-forest/40 hover:bg-forest/5 transition-all text-left"
            >
              <p className="font-semibold text-forest">Accounting</p>
              <p className="text-xs text-polished/60 mt-1">View ledgers</p>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-champagne/30 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-forest">Member SACCOs</h2>
          <button
            type="button"
            onClick={() => navigate('/institutions')}
            className="text-sm text-emerald font-medium hover:underline"
          >
            View all →
          </button>
        </div>
        <div className="space-y-2">
          <ActivityItem
            title="Arba Minch Farmers SACCO"
            subtitle="Members: 15 • Savings: ETB 180K"
            status="completed"
          />
          <ActivityItem
            title="Hawassa Teachers SACCO"
            subtitle="Members: 12 • Savings: ETB 145K"
            status="completed"
          />
          <ActivityItem
            title="Gamo Traders SACCO"
            subtitle="Members: 10 • Savings: ETB 120K"
            status="completed"
          />
          <ActivityItem
            title="Wolaita Women SACCO"
            subtitle="Members: 11 • Savings: ETB 135K"
            status="pending"
          />
        </div>
      </div>
    </div>
  );
}

// ----- Super Admin Dashboard -----
function SuperAdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-forest">Super Admin Dashboard</h1>
          <p className="mt-1 text-polished/60">System-wide overview and controls</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Institutions"
          value="7"
          IconComponent={BuildingIcon}
          color="forest"
          onClick={() => navigate('/institutions')}
        />
        <StatCard
          label="Unions"
          value="3"
          IconComponent={BuildingIcon}
          color="white"
          onClick={() => navigate('/institutions')}
        />
        <StatCard
          label="SACCOs"
          value="4"
          IconComponent={BuildingIcon}
          color="white"
          onClick={() => navigate('/institutions')}
        />
        <StatCard
          label="System Status"
          value="Live"
          IconComponent={CheckCircleIcon}
          color="white"
        />
      </div>

      <div className="bg-white rounded-2xl border border-champagne/30 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-forest mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => navigate('/institutions')}
            className="p-4 rounded-xl border-2 border-forest/20 hover:border-forest/40 hover:bg-forest/5 transition-all text-left"
          >
            <p className="font-semibold text-forest">Manage Institutions</p>
            <p className="text-xs text-polished/60 mt-1">View all unions and SACCOs</p>
          </button>
          <button
            type="button"
            onClick={() => navigate('/accounting')}
            className="p-4 rounded-xl border-2 border-forest/20 hover:border-forest/40 hover:bg-forest/5 transition-all text-left"
          >
            <p className="font-semibold text-forest">Accounting</p>
            <p className="text-xs text-polished/60 mt-1">System-wide ledgers</p>
          </button>
          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="p-4 rounded-xl border-2 border-forest/20 hover:border-forest/40 hover:bg-forest/5 transition-all text-left"
          >
            <p className="font-semibold text-forest">Reports</p>
            <p className="text-xs text-polished/60 mt-1">Generate reports</p>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-champagne/30 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-forest mb-4">Recent Activity</h2>
        <div className="space-y-2">
          <ActivityItem
            title="New SACCO Application"
            subtitle="Gamo SACCO • Pending review"
            status="pending"
          />
          <ActivityItem
            title="Union Approved"
            subtitle="South Region Union • Active"
            status="completed"
          />
          <ActivityItem
            title="Report Generated"
            subtitle="Network balance sheet • This week"
            status="completed"
          />
        </div>
      </div>
    </div>
  );
}

// ----- Member Dashboard -----
function MemberDashboard() {
  const navigate = useNavigate();

  // Sample data for member
  const savingsBalance = 12450;
  const loanAmount = 15000;
  const loanPaid = 6000;
  const loanRemaining = 9000;
  const loanProgress = (loanPaid / loanAmount) * 100;
  const monthlyPayment = 1200;
  const nextPaymentDate = "Dec 15, 2024";

  // Recent transactions
  const recentTransactions = [
    { type: 'Deposit', amount: 2000, date: '2 days ago', status: 'completed' },
    { type: 'Transfer Sent', amount: -500, date: '5 days ago', status: 'completed' },
    { type: 'Loan Payment', amount: -1200, date: '1 week ago', status: 'completed' },
    { type: 'Deposit', amount: 1500, date: '2 weeks ago', status: 'completed' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-forest">My Dashboard</h1>
        <p className="mt-1 text-polished/60">Your financial overview at a glance</p>
      </div>

      {/* Main Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          label="Total Savings Balance"
          value={`ETB ${savingsBalance.toLocaleString()}`}
          change="+8%"
          changeLabel="this month"
          IconComponent={CreditCardIcon}
          color="forest"
          onClick={() => navigate('/savings')}
        />
        <StatCard
          label="Active Loan"
          value={`ETB ${loanRemaining.toLocaleString()}`}
          change={`${Math.round(loanProgress)}%`}
          changeLabel="repaid"
          IconComponent={DollarIcon}
          color="white"
          onClick={() => navigate('/loans')}
        />
      </div>

      {/* Loan Repayment Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loan Details with Progress */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-champagne/30 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-forest mb-6">Loan Repayment Progress</h2>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-polished/70">Repayment Progress</span>
              <span className="text-sm font-bold text-forest">{Math.round(loanProgress)}%</span>
            </div>
            <div className="w-full bg-champagne/30 rounded-full h-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-forest to-emerald rounded-full transition-all duration-1000"
                style={{ width: `${loanProgress}%` }}
              />
            </div>
          </div>

          {/* Loan Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-forest/5">
              <p className="text-xs text-polished/60 mb-1">Loan Amount</p>
              <p className="text-lg font-bold text-forest">ETB {loanAmount.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald/10">
              <p className="text-xs text-polished/60 mb-1">Amount Paid</p>
              <p className="text-lg font-bold text-emerald">ETB {loanPaid.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl bg-gold/10">
              <p className="text-xs text-polished/60 mb-1">Remaining</p>
              <p className="text-lg font-bold text-gold">ETB {loanRemaining.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl bg-champagne/30">
              <p className="text-xs text-polished/60 mb-1">Monthly Payment</p>
              <p className="text-lg font-bold text-forest">ETB {monthlyPayment.toLocaleString()}</p>
            </div>
          </div>

          {/* Next Payment Info */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-forest/5 to-emerald/5 border border-forest/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-polished/70">Next Payment Due</p>
                <p className="text-xl font-bold text-forest mt-1">{nextPaymentDate}</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/loans')}
                className="px-4 py-2 bg-forest text-white rounded-lg font-medium hover:bg-forest-deep transition-colors"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>

        {/* Savings Breakdown */}
        <div className="bg-white rounded-2xl border border-champagne/30 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-forest mb-6">Savings Breakdown</h2>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-forest/5 border border-forest/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-polished/70">Regular Savings</span>
                <CreditCardIcon className="w-5 h-5 text-forest" />
              </div>
              <p className="text-2xl font-bold text-forest">ETB 8,450</p>
              <p className="text-xs text-emerald mt-1">+5% this month</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald/5 border border-emerald/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-polished/70">Fixed Deposit</span>
                <CreditCardIcon className="w-5 h-5 text-emerald" />
              </div>
              <p className="text-2xl font-bold text-emerald">ETB 4,000</p>
              <p className="text-xs text-polished/60 mt-1">Locked until Jan 2025</p>
            </div>

            <div className="p-4 rounded-xl bg-champagne/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-polished/70">Total Balance</span>
              </div>
              <p className="text-2xl font-bold text-forest">ETB {savingsBalance.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-champagne/30 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-forest">Recent Transactions</h2>
            <button
              type="button"
              onClick={() => navigate('/savings')}
              className="text-sm text-emerald font-medium hover:underline"
            >
              View all →
            </button>
          </div>
          <div className="space-y-2">
            {recentTransactions.map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl hover:bg-champagne/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.amount > 0 ? 'bg-emerald/20' : 'bg-gold/20'
                  }`}>
                    {transaction.amount > 0 ? (
                      <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-polished">{transaction.type}</p>
                    <p className="text-xs text-polished/60">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${transaction.amount > 0 ? 'text-emerald' : 'text-polished'}`}>
                    {transaction.amount > 0 ? '+' : ''}ETB {Math.abs(transaction.amount).toLocaleString()}
                  </p>
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-emerald/20 text-emerald">
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-champagne/30 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-forest mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => navigate('/transfer')}
              className="w-full p-4 rounded-xl border-2 border-forest/20 hover:border-forest/40 hover:bg-forest/5 transition-all text-left"
            >
              <p className="font-semibold text-forest">Transfer Money</p>
              <p className="text-xs text-polished/60 mt-1">Send to another member</p>
            </button>
            <button
              type="button"
              onClick={() => navigate('/savings')}
              className="w-full p-4 rounded-xl border-2 border-forest/20 hover:border-forest/40 hover:bg-forest/5 transition-all text-left"
            >
              <p className="font-semibold text-forest">Deposit Money</p>
              <p className="text-xs text-polished/60 mt-1">Add to your savings</p>
            </button>
            <button
              type="button"
              onClick={() => navigate('/loans')}
              className="w-full p-4 rounded-xl border-2 border-emerald/30 bg-emerald/5 hover:border-emerald/50 hover:bg-emerald/10 transition-all text-left"
            >
              <p className="font-semibold text-emerald">Apply for Loan</p>
              <p className="text-xs text-polished/60 mt-1">Submit new application</p>
            </button>
            <button
              type="button"
              onClick={() => navigate('/loans')}
              className="w-full p-4 rounded-xl border-2 border-gold/30 bg-gold/5 hover:border-gold/50 hover:bg-gold/10 transition-all text-left"
            >
              <p className="font-semibold text-gold">Make Payment</p>
              <p className="text-xs text-polished/60 mt-1">Pay loan installment</p>
            </button>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-gradient-to-r from-forest to-emerald rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm mb-2">Your Financial Health Score</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold">Good</p>
              <p className="text-white/80">85/100</p>
            </div>
            <p className="text-white/70 text-sm mt-2">Keep up the great work! Your savings are growing steadily.</p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 rounded-full border-4 border-white/30 flex items-center justify-center">
              <CheckCircleIcon className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
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
