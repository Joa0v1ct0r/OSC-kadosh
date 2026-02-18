import React, { useState } from 'react';
import { ChannelStrip } from './ChannelStrip';

export const HorizontalMixer: React.FC = () => {
    const [channels, setChannels] = useState(
        Array.from({ length: 12 }).map((_, i) => ({
            id: i + 1,
            name: `Channel ${i + 1}`,
            level: 0.7 - (i * 0.05),
            meterLevel: Math.random() * 0.5,
            isMuted: false,
            isSoloed: false,
        }))
    );
    const [selectedId, setSelectedId] = useState<number | null>(1);

    const updateChannel = (id: number, patch: any) => {
        setChannels(prev => prev.map(ch => ch.id === id ? { ...ch, ...patch } : ch));
    };

    return (
        <div className="flex flex-1 overflow-x-auto overflow-y-hidden bg-black/20 scroll-smooth px-8">
            {channels.map((ch) => (
                <ChannelStrip
                    key={ch.id}
                    {...ch}
                    isSelected={selectedId === ch.id}
                    onLevelChange={(val) => updateChannel(ch.id, { level: val })}
                    onToggleMute={() => updateChannel(ch.id, { isMuted: !ch.isMuted })}
                    onToggleSolo={() => updateChannel(ch.id, { isSoloed: !ch.isSoloed })}
                    onSelect={() => setSelectedId(ch.id)}
                />
            ))}
        </div>
    );
};
