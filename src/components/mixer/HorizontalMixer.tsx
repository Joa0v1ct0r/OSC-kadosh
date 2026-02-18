import React from 'react';
import { ChannelStrip } from './ChannelStrip';
import { useReaperState } from '../../hooks/useReaperState';

export const HorizontalMixer: React.FC = () => {
    const { tracks, setTrackParam } = useReaperState();

    if (tracks.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-white/20">
                <div className="w-12 h-12 border-2 border-white/10 border-t-brand-active animate-spin rounded-full" />
                <span className="uppercase tracking-[0.3em] font-bold text-sm">Waiting for REAPER Configuration...</span>
                <span className="text-[10px] font-mono lowercase">Bridge active. Check OSC patterns in Reaper.</span>
            </div>
        );
    }

    return (
        <div className="flex flex-1 overflow-x-auto overflow-y-hidden bg-black/20 scroll-smooth">
            {tracks.map((track) => (
                <ChannelStrip
                    key={track.id}
                    id={track.id}
                    name={track.name}
                    level={track.volume}
                    meterLevel={track.meter || 0}
                    isMuted={Boolean(track.mute)}
                    isSoloed={Boolean(track.solo)}
                    isSelected={false} // Can be added later with global store
                    onLevelChange={(val) => setTrackParam(track.id, "volume", val)}
                    onToggleMute={() => setTrackParam(track.id, "mute", track.mute ? 0 : 1)}
                    onToggleSolo={() => setTrackParam(track.id, "solo", track.solo ? 0 : 1)}
                    onSelect={() => { }}
                />
            ))}
        </div>
    );
};
