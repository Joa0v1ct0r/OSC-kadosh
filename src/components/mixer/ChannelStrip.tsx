import React from 'react';
import { AudioFader } from './AudioFader';
import { LevelMeter } from './LevelMeter';
import { clsx } from 'clsx';

interface ChannelStripProps {
    id: number;
    name: string;
    level: number;
    meterLevel: number;
    isMuted: boolean;
    isSoloed: boolean;
    isSelected: boolean;
    onLevelChange: (val: number) => void;
    onToggleMute: () => void;
    onToggleSolo: () => void;
    onSelect: () => void;
}

export const ChannelStrip: React.FC<ChannelStripProps> = ({
    name,
    level,
    meterLevel,
    isMuted,
    isSoloed,
    isSelected,
    onLevelChange,
    onToggleMute,
    onToggleSolo,
    onSelect,
}) => {
    return (
        <div
            className={clsx(
                "flex flex-col flex-shrink-0 w-44 border-r border-white/5 bg-bg-surface/10 transition-colors",
                isSelected && "bg-brand-active/5 border-r-brand-active/20"
            )}
            onClick={onSelect}
        >
            <div className="h-10 border-b border-white/5 flex items-center justify-center px-4 overflow-hidden">
                <span className={clsx(
                    "text-[10px] font-bold uppercase tracking-widest truncate",
                    isSelected ? "text-brand-active" : "text-white/60"
                )}>
                    {name}
                </span>
            </div>

            <div className="flex-1 flex py-6 px-4 gap-4 justify-center items-start">
                <LevelMeter level={meterLevel} />
                <AudioFader
                    label=""
                    value={level}
                    onChange={onLevelChange}
                    color={isMuted ? "#333" : undefined}
                />
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 border-t border-white/5">
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleSolo(); }}
                    className={clsx(
                        "h-12 rounded border font-bold text-[10px] tracking-[0.2em] transition-all active:scale-95",
                        isSoloed
                            ? "bg-brand-solo text-black border-brand-solo shadow-[0_0_15px_rgba(255,212,0,0.3)]"
                            : "bg-white/5 text-white/40 border-white/10"
                    )}
                >
                    SOLO
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
                    className={clsx(
                        "h-12 rounded border font-bold text-[10px] tracking-[0.2em] transition-all active:scale-95",
                        isMuted
                            ? "bg-brand-mute text-white border-brand-mute shadow-[0_0_15px_rgba(255,59,59,0.3)]"
                            : "bg-white/5 text-white/40 border-white/10"
                    )}
                >
                    MUTE
                </button>
            </div>
        </div>
    );
};
