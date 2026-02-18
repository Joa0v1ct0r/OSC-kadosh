/**
 * REAPER OSC BRIDGE - v4.5 SECURE & STABLE
 * 🧪 Senior Engineer Architecture: Fail-safe OSC Transmission
 */

const osc = require("osc");
const { WebSocketServer, WebSocket } = require("ws");

const CONFIG = {
    WS_PORT: 8080,
    WS_HOST: "0.0.0.0",
    OSC_LOCAL_PORT: 9000,
    OSC_REMOTE_PORT: 8000,
    REAPER_IP: "127.0.0.1"
};

const ALLOWED_PARAMS = ["volume", "pan", "mute", "solo"];

console.clear();
console.log("\x1b[35m%s\x1b[0m", "=====================================================");
console.log("\x1b[35m%s\x1b[0m", "   🎚️  REAPER OSC BRIDGE | v4.5 (SECURE & STABLE)");
console.log("\x1b[35m%s\x1b[0m", "=====================================================");

let mixerState = {
    connected: false,
    tracks: {}
};

// --- UDP INTERFACE ---
const udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: CONFIG.OSC_LOCAL_PORT,
    remoteAddress: CONFIG.REAPER_IP,
    remotePort: CONFIG.OSC_REMOTE_PORT,
    metadata: true
});

// --- WS INTERFACE ---
const wss = new WebSocketServer({ port: CONFIG.WS_PORT, host: CONFIG.WS_HOST });

const broadcast = (data) => {
    const payload = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(payload);
    });
};

const sendOsc = (address, value, type = "f") => {
    // 1. Validate Socket Readiness
    // In osc.js, we check if the underlying socket exists and is in a state to send.
    if (!udpPort || !udpPort.socket) {
        console.warn(`\x1b[33m[UDP WAIT]\x1b[0m Port not fully ready. Blocking: ${address}`);
        return;
    }

    try {
        // 2. SECURITY: Strictly forbid writing to track names or non-control paths
        if (address.includes("/name")) {
            console.warn(`\x1b[31m[SECURITY BLOCK]\x1b[0m Blocked write to read-only parameter: ${address}`);
            return;
        }

        const isMaster = address.startsWith("/master/");
        const isTrack = address.startsWith("/track/");
        const isDevice = address === "/device/track/count";
        const isAction = address === "/action";

        if (isTrack || isMaster) {
            const parts = address.split("/");
            const param = parts[parts.length - 1];
            if (!ALLOWED_PARAMS.includes(param) && !isMaster) {
                console.warn(`\x1b[31m[SECURITY BLOCK]\x1b[0m Parameter not allowed for writing: ${param}`);
                return;
            }
        } else if (!isDevice && !isAction) {
            console.warn(`\x1b[31m[SECURITY BLOCK]\x1b[0m Address not in whitelist: ${address}`);
            return;
        }

        // 3. VALIDATION: Prevent empty string crashes
        if (type === "s" && (!value || value === "")) {
            console.warn(`\x1b[31m[VALIDATION BLOCK]\x1b[0m Empty string packets are unsafe for REAPER. Blocked.`);
            return;
        }

        const safeValue = (value === undefined || value === null) ? 0 : value;

        console.log(`\x1b[34m[OSC OUT]\x1b[0m ${address} = ${safeValue} (${type})`);

        udpPort.send({
            address: address,
            args: [{ type: type, value: safeValue }]
        });
    } catch (e) {
        console.error(`\x1b[31m[UDP SEND ERROR]\x1b[0m Failed to encode/send ${address}:`, e.message);
    }
};

const requestFullSync = () => {
    console.log("\x1b[33m[SYNC]\x1b[0m Refreshing REAPER Surface State...");
    // Only send valid handshake commands. Names will be pushed by REAPER.
    sendOsc("/device/track/count", 32, "i");
    sendOsc("/action", 41743, "i");
};

// --- DATA PROCESSING ---

// REAPER -> BRIDGE -> WS
udpPort.on("message", (msg) => {
    const addr = msg.address;
    const value = (msg.args && msg.args[0]) ? msg.args[0].value : null;

    if (addr.startsWith("/master/")) {
        const param = addr.split("/")[2];
        if (!mixerState.tracks["0"]) mixerState.tracks["0"] = { id: 0, name: "MASTER", volume: 0, mute: 0, solo: 0 };
        mixerState.tracks["0"][param] = value;
        broadcast({ type: "track_update", trackId: "0", data: mixerState.tracks["0"] });
        return;
    }

    const parts = addr.split("/");
    if (parts[1] === "track") {
        const trackId = parts[2];
        const param = parts[3];

        if (!mixerState.tracks[trackId]) {
            mixerState.tracks[trackId] = { id: parseInt(trackId), name: `Track ${trackId}`, volume: 0, mute: 0, solo: 0 };
        }

        const track = mixerState.tracks[trackId];
        let hasChanged = false;

        switch (param) {
            case "name":
                if (track.name !== value) {
                    track.name = value;
                    hasChanged = true;
                    console.log(`\x1b[32m[REAPER]\x1b[0m Detected Track Name -> \x1b[1m${value}\x1b[0m`);
                }
                break;
            case "volume": if (track.volume !== value) { track.volume = value; hasChanged = true; } break;
            case "mute": if (track.mute !== value) { track.mute = value; hasChanged = true; } break;
            case "solo": if (track.solo !== value) { track.solo = value; hasChanged = true; } break;
        }

        if (hasChanged) {
            broadcast({ type: "track_update", trackId, data: track });
        }
    }
});

// WS -> BRIDGE -> REAPER
wss.on("connection", (ws, req) => {
    console.log(`\x1b[36m[WS]\x1b[0m Tablet Connected: ${req.socket.remoteAddress}`);
    ws.send(JSON.stringify({ type: "full_sync", state: mixerState }));

    ws.on("message", (raw) => {
        try {
            const msg = JSON.parse(raw.toString());
            if (msg.type === "control") {
                sendOsc(msg.payload.address, msg.payload.value, msg.payload.type || "f");
            }
            if (msg.type === "request_sync") {
                requestFullSync();
            }
            if (msg.type === "ping") {
                ws.send(JSON.stringify({ type: "pong", timestamp: msg.payload?.timestamp }));
            }
        } catch (e) {
            console.error("\x1b[31m[WS PARSE ERROR]\x1b[0m", e.message);
        }
    });

    ws.on("close", () => console.log(`\x1b[31m[WS]\x1b[0m Tablet Disconnected`));
});

udpPort.on("ready", () => {
    console.log(`\x1b[32m[UDP]\x1b[0m Bridge Ready. Connection to REAPER established.`);
    mixerState.connected = true;
    requestFullSync();
});

udpPort.open();
wss.on("listening", () => console.log(`\x1b[32m[WS]\x1b[0m Server active on 0.0.0.0:${CONFIG.WS_PORT}`));

udpPort.on("error", (err) => console.error("\x1b[31m[UDP ERROR]\x1b[0m", err.message));
wss.on("error", (err) => console.error("\x1b[31m[WS ERROR]\x1b[0m", err.message));
