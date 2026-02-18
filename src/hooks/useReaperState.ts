import { useState, useEffect } from 'react';
import { reaperWS } from '../api/websocket';

export const useReaperState = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [latency, setLatency] = useState(0);
    // Busca o IP, mas só tenta conectar se ele for válido
    const [bridgeIp] = useState(() => localStorage.getItem('reaper_bridge_ip') || "");

    useEffect(() => {
        if (!bridgeIp) return;

        console.log(`[HOOK] Iniciar conexão com ${bridgeIp}`);
        reaperWS.connect(`ws://${bridgeIp}:8080`);

        const cleanup = reaperWS.addListener((msg) => {
            if (msg.type === "connection") {
                setIsConnected(msg.status === "open");
            }
            if (msg.type === "pong") {
                setLatency(Date.now() - msg.timestamp);
            }
        });

        const pingInterval = setInterval(() => {
            if (reaperWS.isConnected) {
                reaperWS.send("ping", { payload: { timestamp: Date.now() } });
            }
        }, 3000);

        return () => {
            console.log("[HOOK] Limpando conexão anterior...");
            cleanup();
            clearInterval(pingInterval);
        };
    }, [bridgeIp]); // Só re-executa se o IP mudar

    return { isConnected, latency };
};
