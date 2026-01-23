
import React, { useState, useRef } from 'react';
import { analyzeBedImage } from '../services/geminiService';
import { BedAnalysisResult } from '../types';

interface HousekeeperViewProps {
  onAnalysisComplete: (result: BedAnalysisResult) => void;
}

const HousekeeperView: React.FC<HousekeeperViewProps> = ({ onAnalysisComplete }) => {
  const [image, setImage] = useState<string | null>(null);
  const [room, setRoom] = useState('101');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastResult, setLastResult] = useState<BedAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setLastResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatReason = (reason: string) => reason.replace(/_/g, ' ').toUpperCase();

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeBedImage(image, room, "Maria Garcia");
      setLastResult(result);
      onAnalysisComplete(result);
    } catch (err: any) {
      console.error("Analysis failed", err);
      // 提取更具体的错误信息
      const errorMsg = err.message || "Unknown error occurred";
      setError(`Analysis Error: ${errorMsg}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Inspection Camera</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Room Number</label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Room #"
            />
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden relative ${
              image ? 'border-indigo-400 bg-white' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            {image ? (
              <img src={image} alt="Bed" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-4">
                <svg className="w-10 h-10 text-slate-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
                <p className="text-sm font-medium text-slate-600">Snap Bed Photo</p>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg">
              <p className="text-xs text-rose-600 font-medium">{error}</p>
              <p className="text-[10px] text-rose-400 mt-1">Tip: Check if VITE_API_KEY is set in Vercel and redeploy.</p>
            </div>
          )}

          <button
            disabled={!image || isAnalyzing}
            onClick={handleAnalyze}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all flex items-center justify-center gap-2 ${
              !image || isAnalyzing ? 'bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md'
            }`}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Checking...
              </>
            ) : 'Verify Bed Status'}
          </button>
        </div>
      </div>

      {lastResult && (
        <div className={`rounded-2xl border p-8 animate-in zoom-in-95 duration-300 ${
          lastResult.status === 'MADE' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-900' 
            : 'bg-rose-50 border-rose-100 text-rose-900'
        }`}>
          <div className="flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-full mb-4 flex items-center justify-center ${
              lastResult.status === 'MADE' ? 'bg-emerald-500' : 'bg-rose-500 shadow-lg shadow-rose-200'
            }`}>
              {lastResult.status === 'MADE' ? (
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
            </div>
            <h3 className="text-2xl font-black mb-1">
              {lastResult.status === 'MADE' ? 'READY FOR GUEST' : 'RE-CLEAN REQUIRED'}
            </h3>
            <p className="text-xs font-bold opacity-60 uppercase tracking-widest mb-6">
              AI Confidence: {(lastResult.confidence * 100).toFixed(0)}%
            </p>
          </div>

          {lastResult.status === 'UNMADE' && lastResult.unmadeReasons && lastResult.unmadeReasons.length > 0 && (
            <div className="bg-white/50 rounded-xl p-4 border border-rose-100">
              <p className="text-xs font-black text-rose-800 uppercase mb-3 tracking-wider">Detected Issues:</p>
              <div className="space-y-2">
                {lastResult.unmadeReasons.map(reason => (
                  <div key={reason} className="flex items-center gap-2 text-sm font-bold text-rose-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    {formatReason(reason)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HousekeeperView;
