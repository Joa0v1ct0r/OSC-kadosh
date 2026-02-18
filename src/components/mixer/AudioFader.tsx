import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

interface AudioFaderProps {
    label: string;
    value: number; // 0 to 1
    onChange: (value: number) => void;
    color?: string;
    height?: number;
}

export const AudioFader: React.FC<AudioFaderProps> = ({
    label,
    value,
    onChange,
    color = "#1DB954",
    height = 340,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isChanging, setIsChanging] = useState(false);

    // Map 0-1 to height
    const handleMove = (clientY: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const relativeY = clientY - rect.top;
        const clampedY = Math.max(0, Math.min(height, relativeY));
        const newValue = 1 - clampedY / height;
        onChange(newValue);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        handleMove(e.touches[0].clientY);
    };

    const onMouseDown = () => {
        setIsChanging(true);
        const onMouseMove = (e: MouseEvent) => handleMove(e.clientY);
        const onMouseUp = () => {
            setIsChanging(false);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    const thumbPos = (1 - value) * height;

    return (
        <div className="flex flex-col items-center gap-4 w-20">
            <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest h-4 overflow-hidden text-center w-full">
                {label}
            </div>

            <div
                ref={containerRef}
                className="relative w-12 group cursor-ns-resize select-none"
                style={{ height: height }}
                onMouseDown={onMouseDown}
                onTouchMove={onTouchMove}
                onTouchStart={() => setIsChanging(true)}
                onTouchEnd={() => setIsChanging(false)}
            >
                {/* Track Slot */}
                <div className="absolute left-1/2 -translate-x-1/2 w-1.5 h-full bg-black border border-white/5 rounded-full overflow-hidden">
                    {/* Active Level */}
                    <div
                        className="absolute bottom-0 w-full transition-all duration-75"
                        style={{
                            height: `${value * 100}%`,
                            backgroundColor: color,
                            opacity: isChanging ? 0.8 : 0.4
                        }}
                    />
                </div>

                {/* Tick Marks */}
                <div className="absolute left-0 w-full h-full pointer-events-none px-2 flex flex-col justify-between py-1 opacity-20">
                    {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(tick => (
                        <div key={tick} className="w-full h-px bg-white/50" style={{ width: tick % 20 === 0 ? '100%' : '50%' }} />
                    ))}
                </div>

                {/* Fader Cap (Thumb) */}
                <motion.div
                    className="absolute left-0 w-full h-12 -mt-6 bg-[#2A2A2A] border-t-2 border-b-2 border-white/10 shadow-2xl flex items-center justify-center"
                    animate={{ top: thumbPos }}
                    transition={{ type: "spring", damping: 25, stiffness: 400, mass: 0.5 }}
                >
                    {/* Cap Visuals (Digital Pro Look) */}
                    <div className="w-8 h-1 bg-white/50 rounded-full mb-1" />
                    <div className="absolute right-[-24px] text-[9px] font-mono text-white/30 tracking-tighter">
                        {Math.round(value * 100)}
                    </div>
                </motion.div>
            </div>

            <div className="bg-black/40 px-2 py-1 rounded border border-white/5 min-w-[50px] text-center">
                <span className="text-xs font-mono tabular-nums text-white/80">
                    {(value * 10).toFixed(1)}
                    <span className="text-[8px] ml-0.5 text-white/30">dB</span>
                </span>
            </div>
        </div>
    );
};
