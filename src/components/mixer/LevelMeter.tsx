import React, { useEffect, useState, useRef } from 'react';

interface LevelMeterProps {
    level: number; // 0 to 1
}

export const LevelMeter: React.FC<LevelMeterProps> = ({ level }) => {
    const [peak, setPeak] = useState(0);
    const peakTimeout = useRef<number | null>(null);

    useEffect(() => {
        if (level > peak) {
            setPeak(level);
            if (peakTimeout.current) window.clearTimeout(peakTimeout.current);
            peakTimeout.current = window.setTimeout(() => setPeak(level), 1000);
        }
    }, [level, peak]);

    return (
        <div className="flex flex-col gap-1 w-2.5 h-[340px] bg-black/60 rounded-sm overflow-hidden p-[1px] relative">
            <div className="flex-1 flex flex-col-reverse gap-[2px]">
                {Array.from({ length: 40 }).map((_, i) => {
                    const threshold = i / 40;
                    const isActive = level >= threshold;
                    const isPeak = Math.abs(peak - threshold) < 0.02;

                    let color = "bg-[#1DB954]/20";
                    if (i > 32) color = "bg-[#FF3B3B]/20";
                    else if (i > 25) color = "bg-[#FFD400]/20";

                    let activeColor = "bg-[#1DB954]";
                    if (i > 32) activeColor = "bg-[#FF3B3B] shadow-[0_0_8px_#FF3B3B]";
                    else if (i > 25) activeColor = "bg-[#FFD400] shadow-[0_0_8px_#FFD400]";

                    return (
                        <div
                            key={i}
                            className={`h-full w-full rounded-[1px] transition-all duration-75 ${isActive ? activeColor : color} ${isPeak && !isActive ? 'opacity-40 bg-white' : ''}`}
                        />
                    );
                })}
            </div>
        </div>
    );
};
