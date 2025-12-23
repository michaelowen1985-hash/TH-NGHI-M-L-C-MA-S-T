import React from 'react';
import { MaterialData, BlockPlacement } from '../types';
import Dynamometer from './Dynamometer';

interface ExperimentSceneProps {
  mass: number;
  material: MaterialData;
  forceScale1: number; // For Vertical Scale
  forceScale2: number; // For Horizontal Scale
  isSimulating: boolean;
  isOverloaded: boolean;
  placement: BlockPlacement;
  onDrop: (zone: BlockPlacement) => void;
  isWet: boolean;
  blockOrientation: 'wide' | 'narrow';
}

const ExperimentScene: React.FC<ExperimentSceneProps> = ({
  mass,
  material,
  forceScale1,
  forceScale2,
  isSimulating,
  isOverloaded,
  placement,
  onDrop,
  isWet,
  blockOrientation
}) => {
  const baseSize = 60 + (mass * 8); 
  
  // Calculate dimensions based on orientation to simulate area change
  // Wide: Large contact area. Narrow: Small contact area.
  // We keep volume roughly visual consistent, just changing aspect ratio.
  const blockWidth = blockOrientation === 'wide' ? baseSize * 1.3 : baseSize * 0.6;
  const blockHeight = blockOrientation === 'wide' ? baseSize * 0.7 : baseSize * 1.3;

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('type', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, zone: BlockPlacement) => {
    e.preventDefault();
    onDrop(zone);
  };

  // --- Visual Components ---

  const ForceVector = ({ label, color, rotation = 0 }: { label: string, color: string, rotation?: number }) => (
     <div 
        className="absolute flex items-center justify-start pop-in origin-left z-30"
        style={{ 
            width: '70px', 
            transform: `rotate(${rotation}deg)`,
            top: '50%',
            left: '50%'
        }}
     >
        <div className="h-1.5 w-full rounded-l-full" style={{ backgroundColor: color }}></div>
        <div className="w-0 h-0 border-t-[8px] border-b-[8px] border-l-[12px] border-t-transparent border-b-transparent" style={{ borderLeftColor: color }}></div>
        <div className="absolute left-full ml-2 font-black text-sm whitespace-nowrap bg-white/90 px-1 rounded shadow text-slate-800" style={{ transform: `rotate(${-rotation}deg)` }}>
            {label}
        </div>
     </div>
  );

  const DraggableBlock = () => (
    <div 
      draggable={!isSimulating}
      onDragStart={(e) => !isSimulating && handleDragStart(e, 'block')}
      className={`
        flex flex-col items-center justify-center 
        bg-gradient-to-br from-amber-600 to-amber-700
        rounded shadow-xl text-white font-extrabold text-lg
        border-2 border-amber-900
        ${!isSimulating ? 'cursor-grab active:cursor-grabbing hover:scale-105' : 'cursor-default'}
        transition-all duration-300 z-20 relative
      `}
      style={{
        width: `${blockWidth}px`,
        height: `${blockHeight}px`,
      }}
    >
      {/* 3D-ish Edge Effect */}
      <div className="absolute top-1 right-1 bottom-1 left-1 border border-amber-500/30 rounded-sm"></div>
      
      {/* Side Label to indicate orientation */}
      <div className="absolute top-1 right-1 text-[8px] uppercase opacity-50 font-mono">
         {blockOrientation === 'wide' ? 'Mặt lớn' : 'Mặt nhỏ'}
      </div>
      
      <span className="relative z-10 drop-shadow-md">{mass} kg</span>
    </div>
  );

  return (
    <div className="w-full h-full bg-slate-200 rounded-3xl overflow-hidden relative shadow-inner border-4 border-slate-300 flex">
      
      {/* --- STATION 1: WEIGHING (Left 35%) --- */}
      <div 
        className={`relative w-[35%] h-full border-r-2 border-slate-300 transition-colors duration-300
            ${placement === 'shelf' ? 'bg-indigo-50 hover:bg-indigo-100' : 'bg-slate-100'}
        `}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'weighing_station')}
      >
        <div className="absolute top-2 w-full text-center text-xs font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
            Trạm Cân (P)
        </div>

        {/* The Stand */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-800 rounded-b-lg shadow-lg z-10"></div>
        
        {/* Lực kế 1 (Cố định) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <Dynamometer 
                label="Lực kế 1" 
                value={forceScale1} 
                orientation="vertical" 
                isOverloaded={isOverloaded && placement === 'weighing_station'}
                isActive={placement === 'weighing_station'}
            />
        </div>

        {/* Block at Weighing Station */}
        {placement === 'weighing_station' && (
            <div className="absolute top-[240px] left-1/2 -translate-x-1/2 flex flex-col items-center origin-top">
                <div className="w-1 h-8 bg-slate-800 -mt-2"></div>
                <div className="relative">
                    <DraggableBlock />
                    {isSimulating && (
                        <>
                            <ForceVector label="P" color="#ef4444" rotation={90} />
                            <ForceVector label="F_đh" color="#22c55e" rotation={-90} />
                        </>
                    )}
                </div>
            </div>
        )}

        {/* Drop hint */}
        {placement === 'shelf' && (
            <div className="absolute bottom-10 left-0 w-full text-center text-indigo-400 font-bold animate-pulse">
                Thả vào đây để cân
            </div>
        )}
      </div>

      {/* --- STATION 2: SLIDING (Right 65%) --- */}
      <div 
        className={`relative w-[65%] h-full flex flex-col justify-end transition-colors duration-300
             ${placement === 'shelf' ? 'bg-emerald-50 hover:bg-emerald-100' : 'bg-slate-200'}
        `}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'sliding_station')}
      >
        <div className="absolute top-2 w-full text-center text-xs font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
            Trạm Đo Ma Sát (F)
        </div>

        {/* Drop hint */}
        {placement === 'shelf' && (
            <div className="absolute top-1/2 left-0 w-full text-center text-emerald-500 font-bold animate-pulse z-10">
                Thả xuống sàn để kéo
            </div>
        )}

        {/* Floor Surface */}
        <div 
            className="absolute bottom-0 w-full h-[140px] border-t-4 border-slate-400 shadow-xl transition-all duration-500"
            style={{ 
                backgroundColor: material.color,
                backgroundImage: material.texturePattern,
                backgroundSize: material.id === 'concrete' ? '24px 24px' : 'auto'
            }}
        >
             {/* Wet Overlay */}
             {isWet && (
                 <div className="absolute inset-0 bg-blue-400/30 backdrop-blur-[1px] flex items-center justify-center">
                     <div className="absolute top-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/water.png')] opacity-50 animate-pulse"></div>
                 </div>
             )}

             <div className="absolute top-2 right-4 flex flex-col items-end gap-1">
                 <div className="bg-white/80 px-2 py-1 rounded text-[10px] font-bold text-slate-600 shadow-sm border border-slate-300">
                    SÀN: {material.name}
                 </div>
                 {isWet && (
                    <div className="bg-blue-500 text-white px-2 py-1 rounded text-[10px] font-bold shadow-sm animate-bounce">
                        💧 ĐANG ƯỚT
                    </div>
                 )}
             </div>
        </div>

        {/* Block & Scale Assembly */}
        <div 
            className="absolute bottom-[140px] left-10 flex items-end transition-transform duration-[1500ms] ease-in-out z-20"
            style={{
                // Reduced translational distance to 60px so it is very short and scale stays visible
                transform: isSimulating && placement === 'sliding_station' ? 'translateX(60px)' : 'translateX(0px)',
            }}
        >
             {/* Block sits exactly on bottom border of the container which aligns with floor top */}
             <div className="relative">
                 {placement === 'sliding_station' && (
                     <>
                        <DraggableBlock />
                        {isSimulating && (
                            <>
                                <ForceVector label="P" color="#ef4444" rotation={90} />
                                <ForceVector label="N" color="#eab308" rotation={-90} />
                                <ForceVector label="F_ms" color="#f97316" rotation={180} />
                                <ForceVector label="F_kéo" color="#22c55e" rotation={0} />
                            </>
                        )}
                     </>
                 )}
             </div>

             {/* Connection String */}
             {placement === 'sliding_station' && (
                <div 
                    className="h-0.5 bg-slate-800 mb-[30px] mx-1 transition-all duration-300"
                    style={{ width: blockOrientation === 'wide' ? '64px' : '80px' }} // Adjust string length visually based on block width
                ></div>
             )}

             {/* Lực kế 2 (Di chuyển cùng vật) */}
             <div className="mb-[10px]"> {/* Lift slightly to align with string */}
                <Dynamometer 
                    label="Lực kế 2" 
                    value={forceScale2} 
                    orientation="horizontal" 
                    isOverloaded={isOverloaded && placement === 'sliding_station'}
                    isActive={placement === 'sliding_station'}
                />
             </div>
             
             {/* Hand Pulling Icon */}
             {placement === 'sliding_station' && !isSimulating && (
                 <div className="mb-[20px] ml-4 text-3xl animate-bounce cursor-pointer opacity-80" title="Sẵn sàng kéo">
                    👉
                 </div>
             )}
        </div>
      </div>

      {/* --- Initial Block on Shelf (Overlay) --- */}
      {placement === 'shelf' && (
        <div className="absolute top-10 left-[45%] z-50 animate-bounce">
           <div className="relative cursor-grab active:cursor-grabbing" 
                draggable="true" 
                onDragStart={(e) => handleDragStart(e, 'block')}
           >
               <div 
                    className="flex items-center justify-center bg-gradient-to-br from-amber-600 to-amber-800 rounded shadow-2xl text-white font-extrabold border-2 border-amber-900 transition-all duration-300"
                    style={{ width: `${blockWidth}px`, height: `${blockHeight}px` }}
                >
                    {mass} kg
               </div>
               <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded-full">
                   Kéo tôi đi!
               </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default ExperimentScene;