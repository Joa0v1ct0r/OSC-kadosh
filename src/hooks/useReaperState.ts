import { useState, useEffect } from 'react';
import { reaperWS } from '../api/websocket';

export const useReaperState = () => {
    // Inicializa com o estado atual do Singleton para evitar loops
    const [state, setState] = useState({
        tracks: {},
        connected: reaperWS.isConnected
    });

    const [bridgeIp] = useState(() => localStorage.getItem('reaper_bridge_ip') || "");

    useEffect(() => {
        if (!bridgeIp) return;

        // Registrar o listener ANTES de conectar
        const cleanup = reaperWS.addListener((msg) => {
            if (msg.type === "connection") {
                const isOpen = msg.status === "open";
                setState(prev => ({ ...prev, connected: isOpen }));
                if (isOpen) {
                    console.log("[HOOK] Connection established, syncing...");
                    reaperWS.send("request_sync", {});
                }
            }
            if (msg.type === "full_sync") {
                console.log("[HOOK] Received full sync snapshot");
                setState(prev => ({ ...prev, tracks: msg.state.tracks }));
            }
            if (msg.type === "track_update") {
                setState(prev => ({
                    ...prev,
                    tracks: { ...prev.tracks, [msg.trackId]: { ...prev.tracks[msg.trackId], ...msg.data } }
                }));
            }
        });

        // Tentar conectar (o serviço ignora se já estiver conectado)
        reaperWS.connect(`ws://${bridgeIp}:8080`);

        // Se já estivermos conectados (mount tardio), pedimos o sync manualmente
        if (reaperWS.isConnected) {
            console.log("[HOOK] Already connected on mount, requesting sync...");
            reaperWS.send("request_sync", {});
        }

        return () => cleanup();
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
        setTrackParam
    };
};
