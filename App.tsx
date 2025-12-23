import React, { useState, useCallback } from 'react';
import { MaterialType, ExperimentRecord, BlockPlacement } from './types';
import { MATERIALS, GRAVITY, SCALE_MAX_LOAD } from './constants';
import ExperimentScene from './components/ExperimentScene';
import ControlPanel from './components/ControlPanel';
import { ClipboardList, Trash2, Droplets } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [mass, setMass] = useState<number>(2.0);
  const [materialId, setMaterialId] = useState<MaterialType>('wood');
  const [placement, setPlacement] = useState<BlockPlacement>('shelf');
  
  // Experiment Variables
  const [isWet, setIsWet] = useState<boolean>(false);
  const [blockOrientation, setBlockOrientation] = useState<'wide' | 'narrow'>('wide');

  // Simulation State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [forceScale1, setForceScale1] = useState<number>(0); // Vertical P
  const [forceScale2, setForceScale2] = useState<number>(0); // Horizontal F
  const [isOverloaded, setIsOverloaded] = useState<boolean>(false);
  
  // Data State
  const [history, setHistory] = useState<ExperimentRecord[]>([]);
  const [tempResult, setTempResult] = useState<ExperimentRecord | null>(null);

  // Calculate physics
  const getTheoreticalValues = useCallback(() => {
    const P = mass * GRAVITY;
    let mu = MATERIALS[materialId].coefficient;
    
    // Physics Logic: 
    // 1. Friction does NOT depend on contact area (blockOrientation does not affect Fmst).
    // 2. Friction depends on surface condition (Wet decreases friction).
    if (isWet) {
        mu = mu * 0.7; // Reduce coefficient by 30% when wet
    }

    const Fmst = P * mu;
    return { P, Fmst, mu };
  }, [mass, materialId, isWet]); // Removed blockOrientation from dependency to enforce physics rule

  const handleMeasure = () => {
    setIsSimulating(true);
    setIsOverloaded(false);
    setTempResult(null);
    
    const { P, Fmst } = getTheoreticalValues();
    
    // --- INTRODUCE RANDOM ERROR (EXPERIMENTAL NOISE) ---
    // In real labs, values are never perfect.
    
    // Weight error: Small fluctuation due to scale calibration/reading error (~ +/- 0.15 N)
    const weightNoise = (Math.random() - 0.5) * 0.3;
    const measuredP = Math.max(0, P + weightNoise);

    // Friction error: Larger fluctuation due to surface irregularity (~ +/- 0.5 N)
    // Friction is naturally more chaotic than weight.
    const frictionNoise = (Math.random() - 0.5) * 1.0;
    const measuredF = Math.max(0, Fmst + frictionNoise);

    // ---------------------------------------------------

    // Determine target forces based on placement
    let targetForce1 = 0;
    let targetForce2 = 0;

    if (placement === 'weighing_station') {
        targetForce1 = measuredP;
    } else if (placement === 'sliding_station') {
        targetForce2 = measuredF;
    }

    // Check overload
    const activeTarget = placement === 'weighing_station' ? targetForce1 : targetForce2;
    const willOverload = activeTarget > SCALE_MAX_LOAD;

    // Animation loop
    let startTimestamp: number | null = null;
    const duration = 1500;

    const animate = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // Easing
        const easeOutQuad = (x: number): number => 1 - (1 - x) * (1 - x);
        const currentProgress = easeOutQuad(progress);

        // Apply forces with animation noise (visual shake only, settles on measured value)
        if (placement === 'weighing_station') {
             let f1 = targetForce1 * currentProgress;
             if (progress < 1) f1 += (Math.random() - 0.5) * 0.5; // Visual jitter
             if (willOverload && f1 > SCALE_MAX_LOAD) f1 = SCALE_MAX_LOAD + Math.random();
             setForceScale1(Math.max(0, f1));
        } else if (placement === 'sliding_station') {
             let f2 = targetForce2 * currentProgress;
             if (progress < 1) f2 += (Math.random() - 0.5) * 1.5; // Larger visual jitter for dragging
             if (willOverload && f2 > SCALE_MAX_LOAD) f2 = SCALE_MAX_LOAD + Math.random();
             setForceScale2(Math.max(0, f2));
        }

        if (willOverload) setIsOverloaded(true);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Snap to final MEASURED values (containing the random error)
            if (placement === 'weighing_station') setForceScale1(willOverload ? SCALE_MAX_LOAD : measuredP);
            if (placement === 'sliding_station') setForceScale2(willOverload ? SCALE_MAX_LOAD : measuredF);

            prepareTempResult(willOverload, measuredP, measuredF);
        }
    };
    requestAnimationFrame(animate);
  };

  const prepareTempResult = (overloaded: boolean, P: number, Fmst: number) => {
      const newRecord: ExperimentRecord = {
          id: Date.now(),
          mass: mass,
          materialName: MATERIALS[materialId].name,
          weightP: '-',
          frictionF: '-',
          isWet: isWet,
          orientation: blockOrientation
      };

      if (placement === 'weighing_station') {
          newRecord.weightP = overloaded ? 'Max!' : P.toFixed(2);
      } else {
          newRecord.weightP = `(${P.toFixed(1)})`; // Show approximate theoretical P for reference in brackets if needed, or derived
          // Better: keep previous P or just hide it. For now, showing P derived from mass for context
          const theoreticalP = mass * GRAVITY; 
          newRecord.weightP = `(~${theoreticalP.toFixed(1)})`; 
          newRecord.frictionF = overloaded ? 'Max!' : Fmst.toFixed(2);
      }

      setTempResult(newRecord);
  };

  const handleRecord = () => {
    if (tempResult) {
        setHistory(prev => [tempResult, ...prev]);
        setTempResult(null);
    }
  };

  const handleReset = () => {
    setIsSimulating(false);
    setForceScale1(0);
    setForceScale2(0);
    setIsOverloaded(false);
    setTempResult(null);
    setPlacement('shelf');
  };

  const handleDrop = (zone: BlockPlacement) => {
      if (isSimulating) return;
      setPlacement(zone);
      setForceScale1(0);
      setForceScale2(0);
  };

  return (
    <div className="min-h-screen bg-slate-200 p-6 font-nunito flex flex-col items-center justify-center">
      
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* HEADER */}
        <div className="md:col-span-12 bg-white rounded-3xl p-5 shadow-xl border-b-4 border-slate-300 flex justify-between items-center">
             <div className="flex items-center gap-4">
                <div className="bg-indigo-600 text-white p-3 rounded-xl font-bold text-2xl shadow-lg">F</div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Phòng Thí Nghiệm Ma Sát</h1>
                    <p className="text-slate-500 font-bold text-sm">Mô phỏng vật lý lớp 10</p>
                </div>
             </div>
             <div className="hidden md:flex items-center gap-3">
                 <div className="text-xs font-bold bg-slate-100 text-slate-500 px-4 py-2 rounded-xl border-2 border-slate-200">
                    Max: 100N
                 </div>
             </div>
        </div>

        {/* 1. CONTROL PANEL (ORANGE) */}
        <div className="md:col-span-3 h-[500px]">
             <ControlPanel 
                mass={mass}
                setMass={setMass}
                materialId={materialId}
                setMaterialId={setMaterialId}
                onMeasure={handleMeasure}
                isSimulating={isSimulating}
                onReset={handleReset}
                placementStatus={placement}
                canRecord={tempResult !== null}
                onRecord={handleRecord}
                isWet={isWet}
                toggleWet={() => !isSimulating && setIsWet(!isWet)}
                blockOrientation={blockOrientation}
                toggleOrientation={() => !isSimulating && setBlockOrientation(prev => prev === 'wide' ? 'narrow' : 'wide')}
             />
        </div>

        {/* 2. EXPERIMENT SCENE (CENTER) */}
        <div className="md:col-span-6 h-[500px]">
             <ExperimentScene 
                mass={mass}
                material={MATERIALS[materialId]}
                forceScale1={forceScale1}
                forceScale2={forceScale2}
                isSimulating={isSimulating}
                isOverloaded={isOverloaded}
                placement={placement}
                onDrop={handleDrop}
                isWet={isWet}
                blockOrientation={blockOrientation}
             />
        </div>

        {/* 3. RESULTS TABLE (PINK) */}
        <div className="md:col-span-3 h-[500px] bg-pink-600 rounded-3xl border-4 border-pink-700 shadow-2xl overflow-hidden flex flex-col text-white">
            <div className="p-4 bg-pink-700 border-b-2 border-pink-500 flex justify-between items-center shadow-lg z-10">
                <div className="flex items-center gap-2 font-black text-lg uppercase tracking-wide">
                    <ClipboardList size={24} /> Kết quả
                </div>
                {history.length > 0 && (
                    <button onClick={() => setHistory([])} className="text-pink-100 hover:text-white bg-pink-800 p-2 rounded-lg transition-colors shadow-sm">
                        <Trash2 size={18} />
                    </button>
                )}
            </div>
            
            <div className="overflow-y-auto flex-1 p-3 space-y-3 custom-scrollbar bg-pink-600">
                {history.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-pink-200 opacity-60">
                        <div className="text-6xl mb-2">?</div>
                        <div className="text-sm font-bold uppercase text-center">Chưa có dữ liệu</div>
                    </div>
                ) : (
                    history.map((rec, i) => (
                        <div key={rec.id} className="bg-white text-slate-800 p-3 rounded-2xl shadow-lg border-b-4 border-slate-200 transform hover:scale-[1.02] transition-transform">
                            <div className="flex justify-between mb-2 border-b border-slate-100 pb-1 items-center">
                                <span className="font-bold text-xs uppercase text-slate-500">#{history.length - i} {rec.materialName}</span>
                                <div className="flex gap-1">
                                    {rec.isWet && <Droplets size={14} className="text-blue-500" />}
                                    <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                                        {rec.mass}kg / {rec.orientation === 'wide' ? 'S.Lớn' : 'S.Nhỏ'}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-slate-100 rounded-lg py-1">
                                    <span className="block text-[9px] font-bold text-slate-400 uppercase">P (Trọng lượng)</span>
                                    <span className="font-black text-slate-800 text-lg">{rec.weightP}</span>
                                </div>
                                <div className="bg-orange-50 rounded-lg py-1 relative overflow-hidden">
                                    <span className="block text-[9px] font-bold text-orange-400 uppercase">F (Ma sát)</span>
                                    <span className="font-black text-orange-600 text-lg">{rec.frictionF}</span>
                                    {rec.isWet && (
                                        <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-bl-lg"></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default App;