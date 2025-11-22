import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { Users, FileCheck, AlertTriangle, Activity, GraduationCap, Clock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const initialData = [
  { name: 'Mon', issued: 400, verified: 240 },
  { name: 'Tue', issued: 300, verified: 139 },
  { name: 'Wed', issued: 200, verified: 980 },
  { name: 'Thu', issued: 278, verified: 390 },
  { name: 'Fri', issued: 189, verified: 480 },
  { name: 'Sat', issued: 239, verified: 380 },
  { name: 'Sun', issued: 349, verified: 430 },
];

const monthData = [
  { name: 'Week 1', issued: 1200, verified: 800 },
  { name: 'Week 2', issued: 1500, verified: 1100 },
  { name: 'Week 3', issued: 900, verified: 1200 },
  { name: 'Week 4', issued: 1800, verified: 1600 },
];

const fraudData = [
  { name: 'Phishing', value: 35 },
  { name: 'Tampering', value: 20 },
  { name: 'Fake ID', value: 15 },
  { name: 'Other', value: 10 },
];

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 ease-out">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500 ${color}`}>
        <Icon size={80} />
    </div>
    <div className="flex items-center gap-4 mb-4 relative z-10">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-20 group-hover:bg-opacity-30 transition-all`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <span className="text-slate-400 font-medium group-hover:text-slate-200 transition-colors">{title}</span>
    </div>
    <div className="flex items-end gap-3 relative z-10">
        <h3 className="text-4xl font-display font-bold text-white tracking-tight">{value}</h3>
        <span className={`text-sm font-medium mb-1.5 ${trend.includes('decrease') || trend.includes('Requires') ? 'text-orange-400' : 'text-green-400'}`}>{trend}</span>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('Last 7 Days');

  const currentData = useMemo(() => {
    return timeRange === 'Last 7 Days' ? initialData : monthData;
  }, [timeRange]);

  const stats = useMemo(() => {
    if (user?.role === UserRole.INSTITUTION) {
      return [
        { title: "Issued This Month", value: "156", icon: FileCheck, color: "bg-indigo-500", trend: "+12 this week" },
        { title: "Pending Verifications", value: "8", icon: Clock, color: "bg-orange-500", trend: "Requires review" },
        { title: "Total Graduates", value: "3,420", icon: GraduationCap, color: "bg-emerald-500", trend: "+240 this year" },
        { title: "Integrity Score", value: "99.8%", icon: ShieldCheck, color: "bg-blue-500", trend: "High Trust" },
      ];
    }
    
    // Default / Guest / Student Stats (Global Network View)
    return [
        { title: "Total Issued", value: timeRange === 'Last 7 Days' ? "12,450" : "48,200", icon: Users, color: "bg-blue-500", trend: "+12% this week" },
        { title: "Verified Today", value: "892", icon: FileCheck, color: "bg-purple-500", trend: "+5% today" },
        { title: "Fraud Alerts", value: "15", icon: AlertTriangle, color: "bg-red-500", trend: "-2% decrease" },
        { title: "Active Nodes", value: "24", icon: Activity, color: "bg-cyan-500", trend: "Stable" }
    ];
  }, [user, timeRange]);

  return (
    <div className="space-y-6 animate-slide-up pb-8">
      
      {/* Welcome Message for Guests */}
      {!user && (
         <div className="glass-card p-6 rounded-3xl bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 mb-2 animate-in fade-in slide-in-from-top-4 duration-700">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to BBACV Network</h2>
            <p className="text-slate-300">Global Blockchain Verification Standard. Login to issue certificates or view your student wallet.</p>
         </div>
      )}

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Issuance Trend */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl flex flex-col min-h-[400px] hover:border-white/10 transition-colors duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-display font-semibold text-white">
                {user?.role === UserRole.INSTITUTION ? 'My Institution Activity' : 'Global Network Activity'}
            </h3>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-slate-300 outline-none focus:border-blue-500 transition-colors cursor-pointer hover:bg-white/10"
            >
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last Month">Last Month</option>
            </select>
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData}>
                <defs>
                  <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
                <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="issued" name="Certificates Issued" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorIssued)" animationDuration={1500} />
                <Area type="monotone" dataKey="verified" name="Verifications" stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#colorVerified)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fraud Breakdown */}
        <div className="glass-card p-6 rounded-3xl flex flex-col min-h-[400px] hover:border-white/10 transition-colors duration-300">
          <h3 className="text-xl font-display font-semibold text-white mb-6">
              {user?.role === UserRole.INSTITUTION ? 'Fraud Prevention Metrics' : 'Global Fraud Prevention'}
          </h3>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fraudData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} stroke="#94a3b8" tick={{fontSize: 11}} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}/>
                <Bar dataKey="value" fill="#f43f5e" radius={[0, 10, 10, 0]} barSize={20} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-auto p-4 rounded-xl bg-red-500/10 border border-red-500/20 animate-pulse">
            <div className="flex items-center gap-2 text-red-400 mb-1">
                <AlertTriangle size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Live AI Insight</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
                Anomaly detected in recent issuances. 15% spike in hash mismatches detected by AI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;