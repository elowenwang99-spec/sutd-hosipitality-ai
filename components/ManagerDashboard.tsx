
import React, { useMemo } from 'react';
import { BedAnalysisResult, PerformanceStat } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie
} from 'recharts';

interface ManagerDashboardProps {
  history: BedAnalysisResult[];
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ history }) => {
  const stats = useMemo(() => {
    const total = history.length;
    const madeCount = history.filter(h => h.status === 'MADE').length;
    const unmadeCount = total - madeCount;
    
    const madeRate = total > 0 ? Math.round((madeCount / total) * 100) : 0;

    // Reason tracking
    const reasonMap: Record<string, number> = {};
    history.forEach(h => {
      if (h.unmadeReasons) {
        h.unmadeReasons.forEach(r => {
          reasonMap[r] = (reasonMap[r] || 0) + 1;
        });
      }
    });
    const reasonData = Object.entries(reasonMap).map(([name, value]) => ({ 
      name: name.replace(/_/g, ' ').toUpperCase(), 
      value 
    })).sort((a, b) => b.value - a.value);

    const staffMap: Record<string, { total: number; made: number }> = {};
    history.forEach(h => {
      if (!staffMap[h.housekeeperName]) staffMap[h.housekeeperName] = { total: 0, made: 0 };
      staffMap[h.housekeeperName].total++;
      if (h.status === 'MADE') staffMap[h.housekeeperName].made++;
    });

    const performanceStats: PerformanceStat[] = Object.entries(staffMap).map(([name, s]) => ({
      name,
      madeRate: Math.round((s.made / s.total) * 100),
      totalRooms: s.total
    }));

    const pieData = [
      { name: 'Made', value: madeCount },
      { name: 'Unmade', value: unmadeCount }
    ];

    return { total, madeCount, unmadeCount, madeRate, performanceStats, pieData, reasonData };
  }, [history]);

  const PIE_COLORS = ['#10b981', '#f43f5e'];
  const BAR_COLOR = '#6366f1';

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Operations Analytics</h2>
        <p className="text-slate-500">Summary of bedding quality and common issues</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Compliance Rate</p>
          <p className="text-4xl font-black text-indigo-600">{stats.madeRate}%</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Passed</p>
          <p className="text-4xl font-black text-emerald-500">{stats.madeCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Needs Fixing</p>
          <p className="text-4xl font-black text-rose-500">{stats.unmadeCount}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Status Chart */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
          <h3 className="font-bold text-slate-800 self-start mb-4">Inspection Result Split</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-8 mt-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /> <span className="text-xs font-bold">Ready</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500" /> <span className="text-xs font-bold">Requires Action</span></div>
          </div>
        </div>

        {/* Reasons Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Common Unmade Reasons</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.reasonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  width={140}
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" fill={BAR_COLOR} radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 uppercase text-center font-bold tracking-widest">Frequency of detected issues</p>
        </div>

        {/* Staff Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="font-bold text-slate-800 mb-6">Housekeeping Compliance Ranking</h3>
          <div className="space-y-6">
            {stats.performanceStats.sort((a,b) => b.madeRate - a.madeRate).map(staff => (
              <div key={staff.name}>
                <div className="flex justify-between text-sm font-bold mb-1.5">
                  <span className="text-slate-700">{staff.name} <span className="text-[10px] text-slate-400 font-medium uppercase ml-2">({staff.totalRooms} rooms)</span></span>
                  <span className={staff.madeRate >= 90 ? 'text-emerald-600' : 'text-indigo-600'}>{staff.madeRate}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${staff.madeRate >= 90 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                    style={{ width: `${staff.madeRate}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
