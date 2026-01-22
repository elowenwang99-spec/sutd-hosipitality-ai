
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setLastResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeBedImage(image, room, "Maria Garcia");
      setLastResult(result);
      onAnalysisComplete(result);
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Analysis failed. Please try again.");
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

          <button
            disabled={!image || isAnalyzing}
            onClick={handleAnalyze}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all flex items-center justify-center gap-2 ${
              !image || isAnalyzing ? 'bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
            }`}
          >
            {isAnalyzing ? 'Analyzing...' : 'Check Status'}
          </button>
        </div>
      </div>

      {lastResult && (
        <div className={`rounded-2xl border p-8 text-center animate-in zoom-in-95 duration-300 ${
          lastResult.status === 'MADE' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-900' 
            : 'bg-rose-50 border-rose-100 text-rose-900'
        }`}>
          <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
            lastResult.status === 'MADE' ? 'bg-emerald-500' : 'bg-rose-500'
          }`}>
             {lastResult.status === 'MADE' ? (
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
          </div>
          <h3 className="text-2xl font-black mb-1">
            {lastResult.status === 'MADE' ? 'BED IS MADE' : 'BED IS UNMADE'}
          </h3>
          <p className="text-sm font-medium opacity-70">
            Confidence: {(lastResult.confidence * 100).toFixed(0)}%
          </p>
        </div>
      )}
    </div>
  );
};

export default HousekeeperView;
