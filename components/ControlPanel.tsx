import React from 'react';
import { MaterialType } from '../types';
import { MATERIALS } from '../constants';
import { Settings2, RotateCcw, Play, MousePointer2, Save, Droplets, ArrowLeftRight } from 'lucide-react';

interface ControlPanelProps {
  mass: number;
  setMass: (m: number) => void;
  materialId: MaterialType;
  setMaterialId: (m: MaterialType) => void;
  onMeasure: () => void;
  isSimulating: boolean;
  onReset: () => void;
  placementStatus: string;
  canRecord: boolean;
  onRecord: () => void;
  isWet: boolean;
  toggleWet: () => void;
  blockOrientation: 'wide' | 'narrow';
  toggleOrientation: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  mass,
  setMass,
  materialId,
  setMaterialId,
  onMeasure,
  isSimulating,
  onReset,
  placementStatus,
  canRecord,
  onRecord,
  isWet,
  toggleWet,
  blockOrientation,
  toggleOrientation
}) => {
  
  let buttonText = "Bắt đầu";
  if (placementStatus === 'weighing_station') buttonText = "CÂN TRỌNG LƯỢNG (P)";
  if (placementStatus === 'sliding_station') buttonText = "KÉO VẬT (F_mst)";

  return (
    <div className="bg-orange-600 p-5 rounded-3xl shadow-2xl border-4 border-orange-700 h-full flex flex-col gap-5 text-white">
      <div className="flex items-center gap-3 border-b-2 border-orange-500 pb-3">
        <div className="bg-white text-orange-600 p-2 rounded-xl shadow-sm">
            <Settings2 size={24} />
        </div>
        <h2 className="text-xl font-black uppercase tracking-wider">Thiết Lập</h2>
      </div>

      {/* Mass Slider */}
      <div className="bg-orange-700/50 p-4 rounded-2xl border border-orange-500 shadow-inner">
        <div className="flex justify-between items-center mb-3">
            <label className="text-xs font-bold uppercase tracking-wide opacity-80">Khối lượng (m)</label>
            <span className="text-xl font-black bg-white text-orange-600 px-3 py-1 rounded-lg shadow-sm">{mass} kg</span>
        </div>
        <input
          type="range"
          min="1.0"
          max="5.0"
          step="0.5"
          value={mass}
          onChange={(e) => setMass(parseFloat(e.target.value))}
          disabled={isSimulating}
          className="w-full h-3 bg-orange-900/40 rounded-full appearance-none cursor-pointer accent-white hover:accent-orange-100 transition-all"
        />
        <div className="flex justify-between text-[10px] opacity-60 mt-2 font-bold uppercase">
            <span>Nhẹ (1kg)</span>
            <span>Nặng (5kg)</span>
        </div>
      </div>

      {/* Surface Conditions & Shape */}
      <div className="bg-orange-700/50 p-4 rounded-2xl border border-orange-500 shadow-inner">
        <label className="text-xs font-bold uppercase tracking-wide opacity-80 block mb-3">Điều kiện thí nghiệm</label>
        
        <div className="flex gap-2 mb-3">
            {/* Rotate Button */}
            <button
                onClick={toggleOrientation}
                disabled={isSimulating}
                className={`flex-1 py-2 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all border-b-4 active:border-b-0 active:translate-y-1 ${
                    blockOrientation === 'narrow'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-orange-500 border-orange-800 hover:bg-orange-400'
                }`}
                title="Xoay vật để đổi diện tích tiếp xúc"
            >
                <ArrowLeftRight size={18} />
                <span>{blockOrientation === 'wide' ? 'Mặt lớn' : 'Mặt nhỏ'}</span>
            </button>

            {/* Wet Button */}
            <button
                onClick={toggleWet}
                disabled={isSimulating}
                className={`flex-1 py-2 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all border-b-4 active:border-b-0 active:translate-y-1 ${
                    isWet
                        ? 'bg-blue-500 text-white border-blue-700 shadow-lg shadow-blue-500/30'
                        : 'bg-orange-500 border-orange-800 hover:bg-orange-400'
                }`}
                title="Làm ướt bề mặt sàn"
            >
                <Droplets size={18} />
                <span>{isWet ? 'Đã ướt' : 'Làm ướt'}</span>
            </button>
        </div>

        {/* Material Selection */}
        <div className="grid grid-cols-2 gap-2">
            {(Object.values(MATERIALS) as any[]).map((mat) => (
                <button
                    key={mat.id}
                    onClick={() => setMaterialId(mat.id)}
                    disabled={isSimulating}
                    className={`px-2 py-2 text-[10px] rounded-lg font-bold transition-all border-b-4 active:border-b-0 active:translate-y-1 truncate ${
                        materialId === mat.id 
                            ? 'bg-white text-orange-700 border-orange-900 shadow-lg scale-105' 
                            : 'bg-orange-500 text-orange-100 border-orange-800 hover:bg-orange-400'
                    }`}
                >
                    {mat.name}
                </button>
            ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-auto flex flex-col gap-3">
         {canRecord ? (
            <button
                onClick={onRecord}
                className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black shadow-[0_6px_0_rgb(88,28,135)] active:shadow-none active:translate-y-[6px] transition-all flex items-center justify-center gap-2 text-xl uppercase tracking-wider animate-pulse"
            >
                <Save fill="currentColor" size={24} />
                GHI KẾT QUẢ
            </button>
         ) : null}

         {placementStatus === 'shelf' ? (
             <div className="bg-orange-800/80 p-4 rounded-2xl text-center text-orange-100 text-sm font-bold border-2 border-dashed border-orange-400 animate-pulse flex flex-col items-center gap-2">
                <MousePointer2 className="animate-bounce" />
                <span>Kéo vật vào Lực Kế 1 (Cân) hoặc Lực Kế 2 (Kéo)!</span>
             </div>
         ) : !isSimulating ? (
            <button
                onClick={onMeasure}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-black shadow-[0_6px_0_rgb(13,148,136)] active:shadow-none active:translate-y-[6px] transition-all flex items-center justify-center gap-2 text-lg uppercase tracking-wider"
            >
                <Play fill="currentColor" size={20} />
                {buttonText}
            </button>
         ) : !canRecord ? (
            <button
                onClick={onReset}
                className="w-full py-4 bg-slate-700 text-white rounded-2xl font-bold shadow-[0_6px_0_rgb(30,41,59)] active:shadow-none active:translate-y-[6px] flex items-center justify-center gap-2 hover:bg-slate-800 transition-all text-lg"
            >
                <RotateCcw size={20} /> LÀM LẠI
            </button>
         ) : null}
      </div>
    </div>
  );
};

export default ControlPanel;