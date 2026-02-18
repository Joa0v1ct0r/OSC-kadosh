import React, { useState } from 'react';
import { EQVisualizer } from './EQVisualizer';
import { clsx } from 'clsx';

interface BandState {
    freq: number;
    gain: number;
    q: number;
}

export const EQPanel: React.FC = () => {
    const [bands, setBands] = useState<BandState[]>([
        { freq: 80, gain: 0, q: 0.7 },
        { freq: 400, gain: 0, q: 0.7 },
        { freq: 2500, gain: 0, q: 0.7 },
        { freq: 10000, gain: 0, q: 0.7 },
    ]);

    const updateBand = (index: number, patch: Partial<BandState>) => {
        setBands(prev => prev.map((b, i) => i === index ? { ...b, ...patch } : b));
    };

    return (
        <div className="flex flex-col gap-6 p-8 bg-bg-surface/20 rounded-xl border border-white/5 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold uppercase tracking-widest text-white/80">Parametric EQ <span className="text-brand-active text-sm ml-2">ReaEQ Mode</span></h2>
                <div className="flex gap-2">
                    {["BYPASS", "RESET", "ANALYZE"].map(btn => (
                        <button key={btn} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded text-[9px] font-bold text-white/40 hover:text-white transition-colors">{btn}</button>
                    ))}
                </div>
            </div>

            <EQVisualizer bands={bands.map(b => ({ ...b, type: 'peak' }))} />

            <div className="grid grid-cols-4 gap-6">
                {bands.map((band, i) => (
                    <div key={i} className="flex flex-col gap-6 p-4 bg-black/40 rounded-lg border border-white/5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-brand-active tracking-tighter">BAND {i + 1}</span>
                            <div className="w-2 h-2 rounded-full bg-brand-active opacity-40 shadow-[0_0_8px_#1DB954]" />
                        </div>

                        <div className="flex flex-col gap-4">
                            {/* FREQ */}
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-[9px] font-mono text-white/30">
                                    <span>FREQ</span>
                                    <span>{Math.round(band.freq)}Hz</span>
                                </div>
                                <input
                                    type="range" min="20" max="20000" step="1"
                                    value={band.freq}
                                    onChange={(e) => updateBand(i, { freq: Number(e.target.value) })}
                                    className="w-full accent-brand-active opacity-60 hover:opacity-100 transition-opacity"
                                />
                            </div>

                            {/* GAIN */}
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-[9px] font-mono text-white/30">
                                    <span>GAIN</span>
                                    <span className={clsx(band.gain > 0 ? "text-brand-active" : band.gain < 0 ? "text-brand-mute" : "")}>
                                        {band.gain.toFixed(1)}dB
                                    </span>
                                </div>
                                <input
                                    type="range" min="-24" max="24" step="0.1"
                                    value={band.gain}
                                    onChange={(e) => updateBand(i, { gain: Number(e.target.value) })}
                                    className="w-full accent-brand-active opacity-60 hover:opacity-100 transition-opacity"
                                />
                            </div>

                            {/* Q */}
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-[9px] font-mono text-white/30">
                                    <span>Q</span>
                                    <span>{band.q.toFixed(2)}</span>
                                </div>
                                <input
                                    type="range" min="0.1" max="10" step="0.01"
                                    value={band.q}
                                    onChange={(e) => updateBand(i, { q: Number(e.target.value) })}
                                    className="w-full accent-brand-active opacity-60 hover:opacity-100 transition-opacity"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
