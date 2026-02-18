/**
 * REAPER WebSocket Service
 * Handles low-latency bidirectional OSC communication.
 */

type WSMessage = {
    type: string;
    payload: any;
};

type Listener = (data: any) => void;

class WebSocketService {
    private socket: WebSocket | null = null;
    private listeners: Set<Listener> = new Set();
    private reconnectTimeout: number | null = null;
    private url: string = "";
    public isConnected: boolean = false;

    constructor() { }

    connect(url: string) {
        if (this.socket) {
            console.log("[WS] Closing existing connection...");
            this.socket.close();
        }

        this.url = url;
        console.log(`[WS] Attempting connection to: ${url}`);

        try {
            this.socket = new WebSocket(url);

            this.socket.onopen = () => {
                console.log("%c[WS] CONNECTED TO REAPER BRIDGE", "color: #1DB954; font-weight: bold");
                this.isConnected = true;
                this.notifyListeners({ type: "connection", status: "open" });
            };

            this.socket.onclose = (event) => {
                console.warn(`[WS] Connection Closed (Code: ${event.code})`);
                this.isConnected = false;
                this.notifyListeners({ type: "connection", status: "closed" });
                this.attemptReconnect();
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.notifyListeners(data);
                } catch (e) {
                    console.error("[WS] Parse Error", e);
                }
            };

            this.socket.onerror = (error) => {
                console.error("%c[WS] CONNECTION ERROR", "color: #FF3B3B", error);
            };
        } catch (err) {
            console.error("[WS] Initialization Critical Error", err);
        }
    }

    private attemptReconnect() {
        if (this.reconnectTimeout) return;
        console.log("[WS] Reconnect scheduled in 3s...");
        this.reconnectTimeout = window.setTimeout(() => {
            this.reconnectTimeout = null;
            console.log("Attempting Reconnect...");
            this.connect(this.url);
        }, 3000);
    }

    send(type: string, payload: any) {
        if (this.socket && this.isConnected) {
            this.socket.send(JSON.stringify({ type, payload }));
        }
    }

    /**
     * Specifically for FX Parameters as requested
     */
    private lastSend: number = 0;
    sendFXParam(track: number, fx: number, param: number, value: number) {
        const now = Date.now();
        if (now - this.lastSend < 30) return; // 30ms throttle
        this.lastSend = now;

        this.send("fxparam", {
            track,
            fx,
            param,
            value: Math.min(1, Math.max(0, value)) // Clamp 0-1
        });
    }

    addListener(callback: Listener) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    private notifyListeners(data: any) {
        this.listeners.forEach(cb => cb(data));
    }
}

export const reaperWS = new WebSocketService();
