/**
 * REAPER WebSocket Service - V3 (Anti-Churn)
 * Handles low-latency bidirectional OSC communication.
 */

type Listener = (data: any) => void;

class WebSocketService {
    private socket: WebSocket | null = null;
    private listeners: Set<Listener> = new Set();
    private reconnectTimeout: number | null = null;
    private url: string = "";
    public isConnected: boolean = false;
    private isManuallyClosing: boolean = false;

    connect(url: string) {
        // Prevent redundant connections to the same URL
        if (this.socket && this.url === url && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            console.log("[WS] Already connected or connecting to this URL.");
            return;
        }

        if (this.socket) {
            console.log("[WS] Closing existing connection for new URL/Retry...");
            this.isManuallyClosing = true;
            this.socket.close();
            this.socket = null;
        }

        this.url = url;
        this.isManuallyClosing = false;
        console.log(`[WS] Attempting connection to: ${url}`);

        try {
            this.socket = new WebSocket(url);

            this.socket.onopen = () => {
                console.log("%c[WS] CONNECTED TO REAPER BRIDGE", "color: #1DB954; font-weight: bold");
                this.isConnected = true;
                this.isManuallyClosing = false;
                this.notifyListeners({ type: "connection", status: "open" });
            };

            this.socket.onclose = (event) => {
                this.isConnected = false;
                this.notifyListeners({ type: "connection", status: "closed" });

                if (!this.isManuallyClosing) {
                    console.warn(`[WS] Connection Lost (Code: ${event.code}). Retrying...`);
                    this.attemptReconnect();
                } else {
                    console.log("[WS] Connection closed manually.");
                }
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
        this.reconnectTimeout = window.setTimeout(() => {
            this.reconnectTimeout = null;
            if (!this.isConnected) {
                this.connect(this.url);
            }
        }, 5000); // 5s wait to be safe
    }

    send(type: string, payload: any) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type, payload }));
        }
    }

    private lastSend: number = 0;
    sendFXParam(track: number, fx: number, param: number, value: number) {
        const now = Date.now();
        if (now - this.lastSend < 30) return;
        this.lastSend = now;
        this.send("fxparam", { track, fx, param, value: Math.min(1, Math.max(0, value)) });
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
