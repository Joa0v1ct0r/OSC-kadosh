/**
 * REAPER OSC BRIDGE - PROFESSIONAL CONTROL SURFACE ENGINE (V4)
 * 🔬 Senior Engineer Architecture: Source of Truth & Real-time Synchronization
 */

const osc = require("osc");
const { WebSocketServer, WebSocket } = require("ws");

// --- SYSTEM CONFIGURATION ---
const CONFIG = {
    WS_PORT: 8080,
    WS_HOST: "0.0.0.0",      // LAN Accessibility
    OSC_LOCAL_PORT: 9000,    // Receiving from REAPER
    OSC_REMOTE_PORT: 8000,   // Sending to REAPER
    REAPER_IP: "127.0.0.1",
    SYNC_INTERVAL: 5000,     // Periodically check for new tracks
    UPDATE_THROTTLE: 16      // 60fps Broadcast limit
};

console.clear();
console.log("\x1b[35m%s\x1b[0m", "=====================================================");
console.log("\x1b[35m%s\x1b[0m", "   🎚️  REAPER OSC PRO BRIDGE | v4.0 (SR. ENGINE)");
console.log("\x1b[35m%s\x1b[0m", "=====================================================");

// --- CENTRAL STATE (SOURCE OF TRUTH) ---
let mixerState = {
    connected: false,
    lastUpdate: Date.now(),
    tracks: {} // Map object: { "1": { name: "Vox", volume: 0.7, ... } }
};

// --- OSC UDP INTERFACE ---
const udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: CONFIG.OSC_LOCAL_PORT,
    remoteAddress: CONFIG.REAPER_IP,
    remotePort: CONFIG.OSC_REMOTE_PORT,
    metadata: true
});

// --- WEBSOCKET SERVER ---
const wss = new WebSocketServer({ port: CONFIG.WS_PORT, host: CONFIG.WS_HOST });

// --- UTILITIES ---
const broadcast = (data) => {
    const payload = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(payload);
    });
};

const sendOsc = (address, value, type = "f") => {
    console.log(`\x1b[34m[OSC OUT]\x1b[0m ${address} = ${value}`);
    udpPort.send({
        address: address,
        args: [{ type: type, value: value }]
    });
};

// --- REAPER DISCOVERY ENGINE ---
const requestFullSync = () => {
    console.log("\x1b[33m[SYNC]\x1b[0m Requesting global state from REAPER...");
    // Force Reaper to send all current values (standard OSC patterns)
    sendOsc("/device/track/count", 0, "i");
    sendOsc("/action", 40297, "i"); // Optional: Trigger action to refresh all
};

// --- OSC INPUT HANDLING ---
udpPort.on("message", (msg) => {
    const addr = msg.address;
    const value = msg.args[0].value;

    // Detect Track patterns: /track/X/volume, /track/X/name, etc.
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
            case "name": if (track.name !== value) { track.name = value; hasChanged = true; } break;
            case "volume": if (track.volume !== value) { track.volume = value; hasChanged = true; } break;
            case "mute": if (track.mute !== value) { track.mute = value; hasChanged = true; } break;
            case "solo": if (track.solo !== value) { track.solo = value; hasChanged = true; } break;
            case "meter": track.meter = value; hasChanged = true; break;
        }

        if (hasChanged) {
            console.log(`\x1b[32m[REAPER -> STATE]\x1b[0m Track ${trackId} ${param}: ${value}`);
            broadcast({ type: "track_update", trackId, data: track });
        }
    } else if (addr === "/track/count") {
        console.log(`\x1b[33m[SYNC]\x1b[0m Reaper reports ${value} tracks.`);
    }
});

// --- WEBSOCKET INPUT HANDLING ---
wss.on("connection", (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`\x1b[36m[WS]\x1b[0m Client Attached: ${ip}`);

    // Immediately send current state snapshot
    ws.send(JSON.stringify({ type: "full_sync", state: mixerState }));

    ws.on("message", (raw) => {
        try {
            const msg = JSON.parse(raw);

            if (msg.type === "control") {
                const { address, value, type } = msg.payload;
                sendOsc(address, value, type || "f");
            }

            if (msg.type === "request_sync") {
                requestFullSync();
            }

        } catch (e) {
            console.error("\x1b[31m[WS ERROR]\x1b[0m Payload violation:", e.message);
        }
    });

    ws.on("close", () => console.log(`\x1b[31m[WS]\x1b[0m Client Detached: ${ip}`));
});

// --- LIFECYCLE ---
udpPort.on("ready", () => {
    console.log(`\x1b[32m[UDP]\x1b[0m Reaper interface listening on :${CONFIG.OSC_LOCAL_PORT}`);
    requestFullSync();
});

udpPort.open();

wss.on("listening", () => {
    console.log(`\x1b[32m[WS]\x1b[0m Bridge Protocol streaming on http://0.0.0.0:${CONFIG.WS_PORT}`);
});

udpPort.on("error", (err) => console.error("\x1b[31m[UDP ERROR]\x1b[0m", err.message));
wss.on("error", (err) => console.error("\x1b[31m[WS ERROR]\x1b[0m", err.message));
