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
        if (this.socket && this.url === url && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            // Already active, but we must notify the new listener 
            // This is handled by the hook calling getStatus()
            return;
        }

        if (this.socket) {
            this.isManuallyClosing = true;
            this.socket.close();
        }

        this.url = url;
        this.isManuallyClosing = false;

        try {
            this.socket = new WebSocket(url);

            this.socket.onopen = () => {
                const logStyle = "color: #1DB954; font-weight: bold; background: #000; padding: 2px 5px; border-radius: 3px;";
                console.log("%c[WS] CONNECTED TO REAPER BRIDGE", logStyle);
                this.isConnected = true;
                this.notifyListeners({ type: "connection", status: "open" });
            };

            this.socket.onclose = (event) => {
                this.isConnected = false;
                this.notifyListeners({ type: "connection", status: "closed" });
                if (!this.isManuallyClosing) this.attemptReconnect();
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
