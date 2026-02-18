import { useState, useEffect } from 'react';
import { reaperWS } from '../api/websocket';

export interface Track {
    id: number;
    name: string;
    volume: number;
    mute: number;
    solo: number;
    meter?: number;
}

export interface MixerState {
    tracks: Record<string, Track>;
    connected: boolean;
}

export const useReaperState = () => {
    const [state, setState] = useState<MixerState>({
        tracks: {},
        connected: reaperWS.isConnected
    });

    const [bridgeIp] = useState(() => localStorage.getItem('reaper_bridge_ip') || "");

    useEffect(() => {
        if (!bridgeIp) {
            return;
        }

        const unsubscribe = reaperWS.addListener((msg) => {
            if (msg.type === "connection") {
                const isOpen = msg.status === "open";
                setState(prev => ({ ...prev, connected: isOpen }));
                if (isOpen) {
                    reaperWS.send("request_sync", {});
                }
            }
            if (msg.type === "full_sync") {
                setState(prev => ({ ...prev, tracks: msg.state.tracks }));
            }
            if (msg.type === "track_update") {
                setState(prev => {
                    const trackId = String(msg.trackId);
                    const existingTrack = prev.tracks[trackId] || {
                        id: Number(trackId),
                        name: `Track ${trackId}`,
                        volume: 0,
                        mute: 0,
                        solo: 0
                    };

                    return {
                        ...prev,
                        tracks: {
                            ...prev.tracks,
                            [trackId]: { ...existingTrack, ...msg.data }
                        }
                    };
                });
            }
        });

        reaperWS.connect(`ws://${bridgeIp}:8080`);

        if (reaperWS.isConnected) {
            reaperWS.send("request_sync", {});
        }

        return () => {
            unsubscribe();
        };
    }, [bridgeIp]);

    const setTrackParam = (trackId: number, param: string, value: any) => {
        console.log(`[UI -> REAPER] ${param} track ${trackId} -> ${value}`);

        reaperWS.send("control", {
            payload: {
                address: `/track/${trackId}/${param}`,
                value: value,
                type: typeof value === "number" ? "f" : "i"
            }
        });
    };

    return {
        tracks: Object.values(state.tracks).sort((a, b) => a.id - b.id),
        isConnected: state.connected,
        setTrackParam
    };
};
