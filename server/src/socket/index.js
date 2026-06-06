import { Server } from "socket.io";
import MatchmakingQueue from "./matchmaking.js";
import RoomManager from "./rooms.js";

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"], credentials: true },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  const queue = new MatchmakingQueue();
  const rooms = new RoomManager();

  // Track active users (only those who joined queue or are chatting)
  const activeUsers = new Set();
  
  // Track all Tab Sessions to prevent counting inflation on reload while allowing multiple tabs
  const onlineSessions = new Map(); // socketId -> sessionId

  // WebRTC ready state & signal buffering
  const readyUsers = new Set();       // users who have set up their WebRTC listeners
  const signalBuffer = new Map();     // socketId → [{ from, data }]

  const broadcastCount = () => {
    const uniqueSessionsCount = new Set(onlineSessions.values()).size;
    io.emit("online-count", {
      count: uniqueSessionsCount,
      chatting: rooms.getActiveRoomCount() * 2,
    });
  };

  const tryMatch = (socket, preferences) => {
    activeUsers.add(socket.id);
    const result = queue.addToQueue(socket.id, preferences);

    if (result.matched) {
      const { partnerId, roomId, partnerInfo } = result;
      rooms.createRoom(roomId, socket.id, partnerId);

      // Reset WebRTC state for both
      readyUsers.delete(socket.id);
      readyUsers.delete(partnerId);
      signalBuffer.set(socket.id, []);
      signalBuffer.set(partnerId, []);

      io.to(socket.id).emit("matched", {
        partnerId, roomId, isInitiator: true,
        partnerInfo,
      });
      io.to(partnerId).emit("matched", {
        partnerId: socket.id, roomId, isInitiator: false,
        partnerInfo: { name: preferences.name, gender: preferences.gender, country: preferences.country },
      });

      console.log(`🤝 Matched: ${socket.id} ↔ ${partnerId} [${preferences.mode}]`);
      broadcastCount();
    } else {
      socket.emit("queue-status", { waiting: true, queueSize: queue.getQueueSize(preferences.mode) });
    }
  };

  const cleanup = (socketId) => {
    queue.removeFromQueue(socketId);
    activeUsers.delete(socketId);
    readyUsers.delete(socketId);
    signalBuffer.delete(socketId);

    const partner = rooms.getPartner(socketId);
    if (partner) {
      io.to(partner).emit("partner-disconnected");
      rooms.removeUserFromRoom(socketId);
      readyUsers.delete(partner);
      signalBuffer.delete(partner);
    }
  };

  io.on("connection", (socket) => {
    const sessionId = socket.handshake.query.sessionId || socket.id;
    onlineSessions.set(socket.id, sessionId);
    console.log(`✅ Connected: ${socket.id} (Session: ${sessionId})`);
    broadcastCount();

    // ── Matchmaking ──
    socket.on("join-queue", (prefs = {}) => {
      const { mode = "video", interests = [], name = "Stranger", gender = "Any", country = "Any Country" } = prefs;
      tryMatch(socket, { mode, interests: interests.map(i => i.toLowerCase().trim()), name, gender, country });
    });

    socket.on("leave-queue", () => {
      queue.removeFromQueue(socket.id);
    });

    // ── WebRTC Ready + Buffered Signaling ──
    socket.on("webrtc-ready", () => {
      console.log(`🔧 webrtc-ready: ${socket.id}`);
      readyUsers.add(socket.id);
      // Flush any buffered signals
      const buffered = signalBuffer.get(socket.id) || [];
      if (buffered.length > 0) {
        console.log(`📦 Flushing ${buffered.length} buffered signals to ${socket.id}`);
        for (const sig of buffered) {
          socket.emit("signal", sig);
        }
        signalBuffer.set(socket.id, []);
      }
    });

    socket.on("signal", ({ to, data }) => {
      if (readyUsers.has(to)) {
        // Target is ready — deliver immediately
        io.to(to).emit("signal", { from: socket.id, data });
      } else {
        // Target not ready yet — buffer it
        const buf = signalBuffer.get(to) || [];
        buf.push({ from: socket.id, data });
        signalBuffer.set(to, buf);
      }
    });

    // ── Chat ──
    socket.on("chat-message", ({ text }) => {
      const partner = rooms.getPartner(socket.id);
      if (partner) io.to(partner).emit("chat-message", { text, timestamp: Date.now() });
    });

    socket.on("typing", ({ isTyping }) => {
      const partner = rooms.getPartner(socket.id);
      if (partner) io.to(partner).emit("typing", { isTyping });
    });

    // ── Next ──
    socket.on("next", (prefs = {}) => {
      const partner = rooms.getPartner(socket.id);
      if (partner) {
        io.to(partner).emit("partner-disconnected");
        rooms.removeUserFromRoom(socket.id);
        readyUsers.delete(socket.id);
        readyUsers.delete(partner);
        signalBuffer.delete(socket.id);
        signalBuffer.delete(partner);
      }
      const { mode = "video", interests = [], name = "Stranger", gender = "Any", country = "Any Country" } = prefs;
      tryMatch(socket, { mode, interests: interests.map(i => i.toLowerCase().trim()), name, gender, country });
    });

    // ── Stop / Disconnect ──
    socket.on("stop", () => { cleanup(socket.id); broadcastCount(); });
    socket.on("disconnect", () => {
      cleanup(socket.id);
      onlineSessions.delete(socket.id);
      console.log(`❌ Disconnected: ${socket.id}`);
      broadcastCount();
    });
  });

  // Attach rooms to io for HTTP endpoint access
  io._rooms = rooms;
  return io;
};
