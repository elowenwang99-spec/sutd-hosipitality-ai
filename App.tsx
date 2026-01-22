
import React, { useState, useEffect } from 'react';
import { UserRole, BedAnalysisResult } from './types';
import HousekeeperView from './components/HousekeeperView';
import SupervisorView from './components/SupervisorView';
import ManagerDashboard from './components/ManagerDashboard';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.HOUSEKEEPER);
  const [history, setHistory] = useState<BedAnalysisResult[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('linenGuard_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    } else {
      const initial: BedAnalysisResult[] = [
        {
          id: '1',
          roomNumber: '402',
          timestamp: Date.now() - 1000 * 60 * 60 * 2,
          housekeeperName: 'Maria Garcia',
          status: 'UNMADE',
          confidence: 0.95,
          imageUrl: 'https://picsum.photos/seed/bed1/600/400',
        },
        {
          id: '2',
          roomNumber: '105',
          timestamp: Date.now() - 1000 * 60 * 30,
          housekeeperName: 'John Doe',
          status: 'MADE',
          confidence: 0.99,
          imageUrl: 'https://picsum.photos/seed/bed2/600/400',
        }
      ];
      setHistory(initial);
      localStorage.setItem('linenGuard_history', JSON.stringify(initial));
    }
  }, []);

  const addResult = (res: BedAnalysisResult) => {
    const newHistory = [res, ...history];
    setHistory(newHistory);
    localStorage.setItem('linenGuard_history', JSON.stringify(newHistory));
  };

  const updateResult = (id: string, updates: Partial<BedAnalysisResult>) => {
    const newHistory = history.map(h => h.id === id ? { ...h, ...updates } : h);
    setHistory(newHistory);
    localStorage.setItem('linenGuard_history', JSON.stringify(newHistory));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">LinenGuard AI</h1>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {(Object.values(UserRole) as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  role === r 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {r.charAt(0) + r.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {role === UserRole.HOUSEKEEPER && (
            <HousekeeperView onAnalysisComplete={addResult} />
          )}
          {role === UserRole.SUPERVISOR && (
            <SupervisorView history={history} onReview={updateResult} />
          )}
          {role === UserRole.MANAGER && (
            <ManagerDashboard history={history} />
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
          © 2024 LinenGuard AI - Hospitality Venture Challenge
        </div>
      </footer>
    </div>
  );
};

export default App;
