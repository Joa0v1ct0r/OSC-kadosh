/**
 * REAPER OSC BRIDGE SERVER - V2 (STABLE)
 * WebSocket <-> OSC (UDP) Bidirectional Translator
 */

const osc = require("osc");
const { WebSocketServer, WebSocket } = require("ws");

// --- CONFIGURATION ---
const CONFIG = {
    WS_PORT: 8080,
    OSC_LOCAL_PORT: 9000,    // Port to receive feedback from Reaper
    OSC_REMOTE_PORT: 8000,   // Port to send commands to Reaper
    REAPER_IP: "127.0.0.1",  // If Reaper is on the same PC
    THROTTLE_MS: 16          // Rate limit for OSC sending
};

console.clear();
console.log("=========================================");
console.log("   🚀 REAPER OSC BRIDGE - ACTIVE");
console.log("=========================================");

// --- OSC UDP SETUP ---
const udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: CONFIG.OSC_LOCAL_PORT,
    remoteAddress: CONFIG.REAPER_IP,
    remotePort: CONFIG.OSC_REMOTE_PORT,
    metadata: true
});

// --- WEBSOCKET SETUP ---
// host: "0.0.0.0" allows any device on your Wi-Fi to connect
const wss = new WebSocketServer({
    port: CONFIG.WS_PORT,
    host: "0.0.0.0"
});

let lastOscSend = 0;

udpPort.open();

udpPort.on("ready", () => {
    console.log(`[UDP] ✅ OSC Active`);
    console.log(`      - Listening for Reaper feedback on: 9000`);
    console.log(`      - Sending commands to Reaper at: ${CONFIG.REAPER_IP}:8000`);
});

wss.on("listening", () => {
    console.log(`[WS]  ✅ Server listening on port: ${CONFIG.WS_PORT}`);
    console.log(`      - ACCESS URL: ws://[YOUR_PC_IP]:${CONFIG.WS_PORT}`);
});

// Broadcast Reaper changes to all connected Tablets
udpPort.on("message", (oscMsg) => {
    console.log(`[REAPER -> WS] ${oscMsg.address} : ${oscMsg.args.map(a => a.value).join(", ")}`);

    const payload = JSON.stringify({
        type: "osc_feedback",
        address: oscMsg.address,
        args: oscMsg.args.map(a => a.value)
    });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });
});

wss.on("connection", (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    console.log(`[WS]  📱 Client Connected: ${clientIp}`);

    ws.on("message", (data) => {
        try {
            const msg = JSON.parse(data.toString());

            if (msg.type === "ping") {
                ws.send(JSON.stringify({ type: "pong", timestamp: msg.payload?.timestamp }));
                return;
            }

            if (msg.type === "fxparam") {
                const now = Date.now();
                if (now - lastOscSend < CONFIG.THROTTLE_MS) return;
                lastOscSend = now;

                const { track, fx, param, value } = msg.payload;
                const addr = `/track/${track}/fx/${fx}/fxparam/${param}/value`;

                console.log(`[WS -> REAPER] ${addr} -> ${value.toFixed(3)}`);

                udpPort.send({
                    address: addr,
                    args: [{ type: "f", value: parseFloat(value) }]
                });
            }
        } catch (e) {
            console.error("[WS]  ❌ Message error:", e.message);
        }
    });

    ws.on("close", () => console.log(`[WS]  ❌ Client Disconnected: ${clientIp}`));
    ws.on("error", (err) => console.error(`[WS]  ❌ Client Socket Error:`, err.message));
});

wss.on("error", (err) => console.error("[WS]  ❌ Server Fatal Error:", err.message));
udpPort.on("error", (err) => console.error("[UDP] ❌ OSC Error:", err.message));
