import { useState, useEffect } from 'react';
import { reaperWS } from '../api/websocket';

export const useReaperState = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [latency, setLatency] = useState(0);
    const [bridgeIp] = useState(() => localStorage.getItem('reaper_bridge_ip') || "192.168.1.100");

    useEffect(() => {
        // Connect to current IP
        reaperWS.connect(`ws://${bridgeIp}:8080`);

        const cleanup = reaperWS.addListener((msg) => {
            if (msg.type === "connection") {
                setIsConnected(msg.status === "open");
            }
            if (msg.type === "pong") {
                setLatency(Date.now() - msg.timestamp);
            }
        });

        // Simple ping for latency
        const pingInterval = setInterval(() => {
            reaperWS.send("ping", { timestamp: Date.now() });
        }, 2000);

        return () => {
            cleanup();
            clearInterval(pingInterval);
        };
    }, [bridgeIp]);

    return { isConnected, latency };
};
