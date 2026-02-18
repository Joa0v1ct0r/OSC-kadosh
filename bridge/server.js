/**
 * REAPER OSC BRIDGE SERVER - V3 (STABLE)
 */

const osc = require("osc");
const { WebSocketServer, WebSocket } = require("ws");

const CONFIG = {
    WS_PORT: 8080,
    OSC_LOCAL_PORT: 9000,
    OSC_REMOTE_PORT: 8000,
    REAPER_IP: "127.0.0.1",
    THROTTLE_MS: 30
};

console.clear();
console.log("=========================================");
console.log("   🚀 REAPER OSC BRIDGE - STABLE MODE");
console.log("=========================================");

const udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: CONFIG.OSC_LOCAL_PORT,
    remoteAddress: CONFIG.REAPER_IP,
    remotePort: CONFIG.OSC_REMOTE_PORT,
    metadata: true
});

const wss = new WebSocketServer({
    port: CONFIG.WS_PORT,
    host: "0.0.0.0",
    clientTracking: true
});

let lastOscSend = 0;

udpPort.open();

udpPort.on("ready", () => {
    console.log(`[UDP] ✅ OSC Active on port ${CONFIG.OSC_LOCAL_PORT}`);
    console.log(`[WS]  ✅ Server listening on port ${CONFIG.WS_PORT}`);
});

udpPort.on("message", (oscMsg) => {
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
    const rawIp = req.socket.remoteAddress;
    const cleanIp = rawIp.includes("::ffff:") ? rawIp.split("::ffff:")[1] : rawIp;

    console.log(`[WS]  📱 Client Connected: ${cleanIp}`);

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
                udpPort.send({
                    address: `/track/${track}/fx/${fx}/fxparam/${param}/value`,
                    args: [{ type: "f", value: parseFloat(value) }]
                });
            }
        } catch (e) { }
    });

    ws.on("close", () => console.log(`[WS]  ❌ Client Disconnected: ${cleanIp}`));
    ws.on("error", () => { });
});

wss.on("error", (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n[FATAL] A porta ${CONFIG.WS_PORT} já está ocupada!`);
        console.error(`[DICA] Feche o outro servidor ou use: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${CONFIG.WS_PORT}).OwningProcess -Force\n`);
    } else {
        console.error("[WS] Error:", err.message);
    }
});

udpPort.on("error", (err) => console.error("[UDP] Error:", err.message));
