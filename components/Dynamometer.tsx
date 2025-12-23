import React from 'react';
import { SCALE_MAX_LOAD } from '../constants';

interface DynamometerProps {
  label: string;
  value: number;
  orientation: 'vertical' | 'horizontal';
  isOverloaded: boolean;
  isActive: boolean; // Is currently measuring?
}

const Dynamometer: React.FC<DynamometerProps> = ({ label, value, orientation, isOverloaded, isActive }) => {
  // Visual calculation
  const MAX_EXTENSION = 40; // Reduced physical extension for digital load cell look
  const extension = (Math.min(value, SCALE_MAX_LOAD) / SCALE_MAX_LOAD) * MAX_EXTENSION;
  
  const rotation = orientation === 'horizontal' ? 'rotate(0deg)' : 'rotate(0deg)';
  const containerStyle = orientation === 'horizontal' 
    ? { width: '140px', height: '60px', transform: 'none' }
    : { width: '80px', height: '180px', transform: 'none' };

  return (
    <div 
      className="relative flex flex-col items-center justify-center transition-all duration-300"
      style={containerStyle}
    >
      {/* --- VERTICAL DESIGN (Hanging Scale) --- */}
      {orientation === 'vertical' && (
          <>
            {/* Top Loop */}
            <div className="w-4 h-4 rounded-full border-4 border-slate-700 -mb-2 z-0"></div>
            
            {/* Main Body */}
            <div className="relative z-10 w-full h-32 bg-slate-800 rounded-xl shadow-2xl border-2 border-slate-600 flex flex-col items-center p-2">
                {/* Brand / Label */}
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{label}</span>
                
                {/* LCD Screen */}
                <div className={`w-full h-12 rounded border-2 border-slate-700 flex items-center justify-end px-2 font-mono font-black text-xl overflow-hidden relative
                    ${isActive ? 'bg-[#d1fae5] text-slate-900 shadow-[inset_0_0_10px_rgba(0,0,0,0.1)]' : 'bg-[#9ca3af] text-slate-600'}
                `}>
                    {isOverloaded ? "ERR" : value.toFixed(2)} <span className="text-[10px] ml-1 mt-1">N</span>
                    {/* Glossy overlay */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20"></div>
                </div>

                {/* Buttons decoration */}
                <div className="flex gap-2 mt-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                </div>
            </div>

            {/* Bottom Hook Stem (Extends) */}
            <div 
                className="w-2 bg-slate-400 transition-all duration-100 ease-linear rounded-b"
                style={{ height: `${20 + extension}px` }}
            ></div>
            {/* Hook */}
            <div className="w-6 h-6 border-b-4 border-l-4 border-slate-700 rounded-bl-full transform -rotate-45 -mt-1"></div>
          </>
      )}

      {/* --- HORIZONTAL DESIGN (Load Cell / Force Gauge) --- */}
      {orientation === 'horizontal' && (
          <div className="flex items-center w-full">
             {/* Main Body */}
             <div className="relative z-10 flex-1 h-16 bg-slate-800 rounded-lg shadow-xl border-b-4 border-slate-900 flex items-center justify-between px-3">
                {/* LCD Screen */}
                <div className={`w-24 h-10 rounded border-2 border-slate-700 flex items-center justify-center font-mono font-black text-lg
                    ${isActive ? 'bg-[#d1fae5] text-slate-900' : 'bg-[#9ca3af] text-slate-600'}
                `}>
                    {isOverloaded ? "ERR" : value.toFixed(2)} <span className="text-[10px] ml-1 mt-1">N</span>
                </div>
                 
                {/* Label & Decor */}
                <div className="flex flex-col items-end ml-2">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">{label}</span>
                    <div className="w-3 h-3 rounded-full bg-red-500 mt-1 shadow-lg shadow-red-500/50"></div>
                </div>
             </div>
             
             {/* Probe/Hook connecting to string */}
             <div className="w-4 h-2 bg-slate-400 border-y border-slate-600"></div>
             <div className="w-3 h-3 rounded-full border-2 border-slate-400 bg-transparent"></div>
          </div>
      )}
    </div>
  );
};

export default Dynamometer;
