import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Power } from 'lucide-react';
import { clsx } from 'clsx';

export const TransportBar: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [stopProgress, setStopProgress] = useState(0);
    const stopTimer = useRef<number | null>(null);

    const startStopHold = () => {
        const startTime = Date.now();
        stopTimer.current = window.setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(100, (elapsed / 1000) * 100);
            setStopProgress(progress);
            if (progress >= 100) {
                handleStop();
                cancelStopHold();
            }
        }, 16);
    };

    const cancelStopHold = () => {
        if (stopTimer.current) {
            clearInterval(stopTimer.current);
            stopTimer.current = null;
        }
        setStopProgress(0);
    };

    const handleStop = () => {
        setIsPlaying(false);
        console.log("STOPPED (Confirmed)");
    };

    return (
        <header className="h-24 border-b border-white/5 flex items-center px-8 justify-between bg-bg-surface/50 backdrop-blur-xl sticky top-0 z-50">
            <div className="flex items-center gap-10">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-white/30 font-mono uppercase tracking-[0.2em]">Master Clock</span>
                    <div className="flex items-baseline gap-1 font-mono">
                        <span className="text-3xl font-bold tabular-nums">01:24:12</span>
                        <span className="text-lg text-brand-active tabular-nums">08</span>
                    </div>
                </div>

                <div className="flex items-center gap-1 bg-black/40 p-1.5 rounded-lg border border-white/5">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={clsx(
                            "w-16 h-14 flex items-center justify-center rounded transition-all active:scale-95",
                            isPlaying ? "bg-brand-active text-black shadow-[0_0_20px_rgba(29,185,84,0.4)]" : "bg-white/5 text-white/40 hover:bg-white/10"
                        )}
                    >
                        {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                    </button>

                    {/* STOP BUTTON WITH HOLD PROGRESS */}
                    <div className="relative group">
                        <button
                            onMouseDown={startStopHold}
                            onMouseUp={cancelStopHold}
                            onMouseLeave={cancelStopHold}
                            onTouchStart={startStopHold}
                            onTouchEnd={cancelStopHold}
                            className="w-16 h-14 flex items-center justify-center rounded bg-white/5 text-brand-mute hover:bg-brand-mute/10 transition-colors relative overflow-hidden"
                        >
                            <Square size={24} fill="currentColor" className="relative z-10" />

                            {/* Radial Progress Overlay (Simplified as bottom-up for now or CSS border) */}
                            <div
                                className="absolute bottom-0 left-0 w-full bg-brand-mute/20 transition-all duration-75 pointer-events-none"
                                style={{ height: `${stopProgress}%` }}
                            />
                        </button>

                        {/* Radial CSS Indicator */}
                        {stopProgress > 0 && (
                            <svg className="absolute -top-1 -left-1 w-[72px] h-[64px] pointer-events-none">
                                <circle
                                    cx="36" cy="32" r="30"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    className="text-brand-mute opacity-40"
                                    strokeDasharray="188.4"
                                    strokeDashoffset={188.4 - (188.4 * stopProgress) / 100}
                                    transform="rotate(-90 36 32)"
                                />
                            </svg>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="text-right flex flex-col items-end">
                    <span className="text-[9px] text-white/30 font-mono uppercase">Bridge Latency</span>
                    <span className="text-xs font-mono text-brand-active">4.2ms</span>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-active/10 border border-brand-active/30 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-brand-active animate-pulse" />
                        <span className="text-[10px] font-bold text-brand-active uppercase tracking-widest">Live Engine</span>
                    </div>
                </div>
            </div>
        </header>
    );
};
