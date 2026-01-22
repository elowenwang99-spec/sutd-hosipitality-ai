
import React, { useState } from 'react';
import { BedAnalysisResult } from '../types';

interface SupervisorViewProps {
  history: BedAnalysisResult[];
  onReview: (id: string, updates: Partial<BedAnalysisResult>) => void;
}

const SupervisorView: React.FC<SupervisorViewProps> = ({ history, onReview }) => {
  const [selectedResult, setSelectedResult] = useState<BedAnalysisResult | null>(null);

  const pendingReviews = history.filter(h => h.reviewStatus === 'PENDING' || h.status === 'UNMADE');

  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-8">
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Queue</h2>
            <p className="text-slate-500">Unmade or uncertain inspections</p>
          </div>
          <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold">
            {pendingReviews.length} Pending
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-4">
          {pendingReviews.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelectedResult(item)}
              className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
                selectedResult?.id === item.id ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200'
              }`}
            >
              <div className="flex gap-4">
                <img src={item.imageUrl} className="w-20 h-20 rounded-lg object-cover" />
                <div>
                  <h3 className="font-bold text-slate-900">Room {item.roomNumber}</h3>
                  <p className="text-xs text-slate-500">{item.housekeeperName}</p>
                  <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded font-black ${
                    item.status === 'UNMADE' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 sticky top-24 overflow-hidden">
        {selectedResult ? (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold">Room {selectedResult.roomNumber}</h3>
            </div>
            <div className="p-6 space-y-6">
              <img src={selectedResult.imageUrl} className="w-full aspect-square rounded-lg object-cover border" />
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">AI Prediction</p>
                <p className="text-lg font-black text-indigo-600">{selectedResult.status}</p>
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3 mt-auto">
              <button 
                onClick={() => {
                  onReview(selectedResult.id, { reviewStatus: 'REJECTED', status: 'UNMADE' });
                  setSelectedResult(null);
                }}
                className="flex-1 py-3 bg-white border border-rose-200 text-rose-600 font-bold rounded-xl"
              >
                Set Unmade
              </button>
              <button 
                onClick={() => {
                  onReview(selectedResult.id, { reviewStatus: 'APPROVED', status: 'MADE' });
                  setSelectedResult(null);
                }}
                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl"
              >
                Set Made
              </button>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">Select an item to review</div>
        )}
      </div>
    </div>
  );
};

export default SupervisorView;
