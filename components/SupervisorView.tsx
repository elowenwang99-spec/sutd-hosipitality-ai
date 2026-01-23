
import React, { useState } from 'react';
import { BedAnalysisResult } from '../types';

interface SupervisorViewProps {
  history: BedAnalysisResult[];
  onReview: (id: string, updates: Partial<BedAnalysisResult>) => void;
}

const SupervisorView: React.FC<SupervisorViewProps> = ({ history, onReview }) => {
  const [selectedResult, setSelectedResult] = useState<BedAnalysisResult | null>(null);

  const pendingReviews = history.filter(h => h.reviewStatus === 'PENDING' || h.status === 'UNMADE');

  const formatReason = (reason: string) => reason.replace(/_/g, ' ').toUpperCase();

  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-8">
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Task Queue</h2>
            <p className="text-slate-500">Unmade or uncertain inspections</p>
          </div>
          <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold">
            {pendingReviews.length} Tasks
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-4">
          {pendingReviews.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelectedResult(item)}
              className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
                selectedResult?.id === item.id ? 'border-indigo-500 ring-4 ring-indigo-50/50' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex gap-4">
                <img src={item.imageUrl} className="w-20 h-20 rounded-lg object-cover border border-slate-100" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-900">Room {item.roomNumber}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-black ${
                      item.status === 'UNMADE' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">{item.housekeeperName}</p>
                  {item.unmadeReasons && item.unmadeReasons.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.unmadeReasons.slice(0, 2).map(r => (
                        <span key={r} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">
                          {r.split('_')[0]}
                        </span>
                      ))}
                      {item.unmadeReasons.length > 2 && (
                        <span className="text-[9px] text-slate-400 font-bold">+{item.unmadeReasons.length - 2} more</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 sticky top-24 overflow-hidden h-fit">
        {selectedResult ? (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">Room {selectedResult.roomNumber}</h3>
              <span className="text-xs text-slate-400">{new Date(selectedResult.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="p-6 space-y-6">
              <div className="relative group">
                <img src={selectedResult.imageUrl} className="w-full aspect-[4/3] rounded-lg object-cover border" />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-lg" />
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">AI Diagnosis</p>
                  <p className="text-lg font-black text-indigo-600 mb-3">{selectedResult.status}</p>
                  
                  {selectedResult.unmadeReasons && selectedResult.unmadeReasons.length > 0 ? (
                    <div className="space-y-2">
                      {selectedResult.unmadeReasons.map(r => (
                        <div key={r} className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100 inline-block mr-2">
                          {formatReason(r)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No specific issues flagged by AI.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => {
                  onReview(selectedResult.id, { reviewStatus: 'REJECTED', status: 'UNMADE' });
                  setSelectedResult(null);
                }}
                className="flex-1 py-3 bg-white border border-rose-200 text-rose-600 font-bold rounded-xl hover:bg-rose-50 transition-colors"
              >
                Set Unmade
              </button>
              <button 
                onClick={() => {
                  onReview(selectedResult.id, { reviewStatus: 'APPROVED', status: 'MADE' });
                  setSelectedResult(null);
                }}
                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
              >
                Approve
              </button>
            </div>
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-700">Select Task</h3>
            <p className="text-sm text-slate-400 mt-2">Click an item in the queue to begin visual inspection.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorView;
