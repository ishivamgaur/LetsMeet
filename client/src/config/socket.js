import { io } from "socket.io-client";

const SERVER_URL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    let sessionId = sessionStorage.getItem("letsmeet_session");
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15) + "-" + Date.now();
      sessionStorage.setItem("letsmeet_session", sessionId);
    }

    socket = io(SERVER_URL, {
      query: { sessionId },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    // Instantly disconnect on page reload/close to drop counts accurately
    window.addEventListener("beforeunload", () => {
      if (socket) {
        socket.emit("leave-queue");
        socket.disconnect();
      }
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null; // Force new instance on next connect
  }
};

export { SERVER_URL };
