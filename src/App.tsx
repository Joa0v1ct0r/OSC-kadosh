import React, { useState } from 'react';
import { TransportBar } from './components/transport/TransportBar';
import { HorizontalMixer } from './components/mixer/HorizontalMixer';
import { EQPanel } from './components/eq/EQPanel';
import { ConnectionOverlay } from './components/ui/ConnectionOverlay';
import { useReaperState } from './hooks/useReaperState';
import { clsx } from 'clsx';

const App: React.FC = () => {
    const { isConnected } = useReaperState();
    const [activeTab, setActiveTab] = useState<'mixer' | 'plugin'>('mixer');

    return (
        <div className="flex flex-col h-screen w-screen bg-bg-base text-white font-sans overflow-hidden">
            <ConnectionOverlay isVisible={!isConnected} onRetry={() => window.location.reload()} />

            <TransportBar />

            {/* Main Surface */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <div className={clsx(
                    "flex-1 flex transition-all duration-500",
                    activeTab === 'mixer' ? "translate-x-0" : "-translate-x-full"
                )}>
                    {/* MIXER TAB */}
                    <div className="w-full flex-shrink-0 flex overflow-hidden">
                        <HorizontalMixer />
                    </div>

                    {/* PLUGIN TAB */}
                    <div className="w-full flex-shrink-0 flex items-center justify-center p-8">
                        <EQPanel />
                    </div>
                </div>
            </main>

            {/* Tab Navigation */}
            <footer className="h-28 border-t border-white/5 flex items-center px-8 bg-bg-surface/30 justify-center gap-4">
                <button
                    onClick={() => setActiveTab('mixer')}
                    className={clsx(
                        "px-10 py-4 rounded-lg font-bold uppercase text-[10px] tracking-[0.2em] transition-all border",
                        activeTab === 'mixer'
                            ? "bg-brand-active text-black border-brand-active shadow-[0_0_30px_rgba(29,185,84,0.2)]"
                            : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"
                    )}
                >
                    MIXER SURFACE
                </button>
                <button
                    onClick={() => setActiveTab('plugin')}
                    className={clsx(
                        "px-10 py-4 rounded-lg font-bold uppercase text-[10px] tracking-[0.2em] transition-all border",
                        activeTab === 'plugin'
                            ? "bg-brand-active text-black border-brand-active shadow-[0_0_30px_rgba(29,185,84,0.2)]"
                            : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"
                    )}
                >
                    PARAMETRIC EQ
                </button>
            </footer>

            {/* Background Graphic Elements (Professional technical look) */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-[-1]" />
        </div>
    );
};

export default App;
