import React from 'react';
import { WifiOff, Loader2 } from 'lucide-react';

interface ConnectionOverlayProps {
    isVisible: boolean;
    onRetry: () => void;
}

export const ConnectionOverlay: React.FC<ConnectionOverlayProps> = ({ isVisible, onRetry }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
            <div className="w-24 h-24 rounded-full bg-brand-mute/10 flex items-center justify-center mb-8 border border-brand-mute/20 shadow-[0_0_50px_rgba(255,59,59,0.1)]">
                <WifiOff size={48} className="text-brand-mute animate-pulse" />
            </div>

            <h1 className="text-3xl font-bold uppercase tracking-[0.2em] mb-4 text-center">Connection Lost</h1>
            <p className="text-white/40 font-mono text-center max-w-md mb-8">
                The link between the control surface and REAPER Bridge has been severed. Check your network or the bridge status.
            </p>

            <div className="flex flex-col items-center gap-4 mb-12 w-full max-w-sm">
                <span className="text-[10px] text-white/30 font-mono uppercase tracking-widest">Server Bridge IP Address</span>
                <input
                    type="text"
                    defaultValue={localStorage.getItem('reaper_bridge_ip') || "192.168.1.100"}
                    placeholder="e.g. 192.168.1.5"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-6 py-4 text-center font-mono text-xl focus:border-white/30 outline-none transition-all"
                    onChange={(e) => localStorage.setItem('reaper_bridge_ip', e.target.value)}
                />
            </div>

            <button
                onClick={onRetry}
                className="group relative flex items-center justify-center gap-4 px-12 py-5 bg-white text-black font-bold uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            >
                <Loader2 className="animate-spin group-hover:block" />
                RECONNECT NOW
            </button>

            <div className="absolute bottom-12 left-0 w-full flex justify-center opacity-20">
                <span className="text-[10px] font-mono tracking-widest">ERROR_WS_CONNECTION_REFUSED_RETRYING</span>
            </div>
        </div>
    );
};
