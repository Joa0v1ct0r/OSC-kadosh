import { useState, useEffect } from 'react';
import { reaperWS } from '../api/websocket';

export const useReaperState = () => {
    const [state, setState] = useState({ tracks: {}, connected: false });
    const [latency, setLatency] = useState(0);
    const [bridgeIp] = useState(() => localStorage.getItem('reaper_bridge_ip') || "");

    useEffect(() => {
        if (!bridgeIp) return;

        reaperWS.connect(`ws://${bridgeIp}:8080`);

        const cleanup = reaperWS.addListener((msg) => {
            if (msg.type === "connection") {
                setState(prev => ({ ...prev, connected: msg.status === "open" }));
                if (msg.status === "open") reaperWS.send("request_sync", {});
            }
            if (msg.type === "full_sync") setState(msg.state);
            if (msg.type === "track_update") {
                setState(prev => ({
                    ...prev,
                    tracks: { ...prev.tracks, [msg.trackId]: { ...prev.tracks[msg.trackId], ...msg.data } }
                }));
            }
            if (msg.type === "pong") setLatency(Date.now() - msg.timestamp);
        });

        const pingInterval = setInterval(() => {
            if (reaperWS.isConnected) reaperWS.send("ping", { payload: { timestamp: Date.now() } });
        }, 5000);

        return () => { cleanup(); clearInterval(pingInterval); };
    }, [bridgeIp]);

    const setTrackParam = (trackId: number, param: string, value: any) => {
        reaperWS.send("control", {
            payload: {
                address: `/track/${trackId}/${param}`,
                value: value,
                type: typeof value === "number" ? "f" : "i"
            }
        });
    };

    return {
        tracks: Object.values(state.tracks).sort((a: any, b: any) => a.id - b.id),
        isConnected: state.connected,
        latency,
        setTrackParam
    };
};
