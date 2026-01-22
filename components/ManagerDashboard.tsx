
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

    return { total, madeCount, unmadeCount, madeRate, performanceStats, pieData };
  }, [history]);

  const COLORS = ['#10b981', '#f43f5e'];

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Analytics</h2>
        <p className="text-slate-500">Made vs Unmade performance summary</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Overall Compliance</p>
          <p className="text-4xl font-black text-indigo-600">{stats.madeRate}%</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Total Made</p>
          <p className="text-4xl font-black text-emerald-500">{stats.madeCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Total Unmade</p>
          <p className="text-4xl font-black text-rose-500">{stats.unmadeCount}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 flex flex-col items-center">
          <h3 className="font-bold text-slate-800 self-start mb-4">Status Distribution</h3>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-8 mt-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /> <span className="text-xs font-bold">Made</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500" /> <span className="text-xs font-bold">Unmade</span></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-6">Staff Ranking (Made Rate)</h3>
          <div className="space-y-6">
            {stats.performanceStats.map(staff => (
              <div key={staff.name}>
                <div className="flex justify-between text-sm font-bold mb-1">
                  <span>{staff.name}</span>
                  <span>{staff.madeRate}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${staff.madeRate}%` }} />
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
