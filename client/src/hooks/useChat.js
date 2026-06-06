import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Manages chat messages and typing indicators between two matched users.
 */
const useChat = (socket) => {
  const [messages, setMessages] = useState([]);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const onMessage = ({ text, timestamp }) => {
      setMessages((prev) => [
        ...prev,
        { text, timestamp, sender: "stranger" },
      ]);
    };

    const onTyping = ({ isTyping }) => {
      setIsPartnerTyping(isTyping);
    };

    socket.on("chat-message", onMessage);
    socket.on("typing", onTyping);

    return () => {
      socket.off("chat-message", onMessage);
      socket.off("typing", onTyping);
    };
  }, [socket]);

  const sendMessage = useCallback(
    (text) => {
      if (!socket || !text.trim()) return;
      socket.emit("chat-message", { text: text.trim() });
      setMessages((prev) => [
        ...prev,
        { text: text.trim(), timestamp: Date.now(), sender: "you" },
      ]);
      // Stop typing indicator
      socket.emit("typing", { isTyping: false });
    },
    [socket]
  );

  const sendTyping = useCallback(
    (isTyping) => {
      if (!socket) return;
      socket.emit("typing", { isTyping });

      // Auto-stop typing after 2s of no input
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          socket.emit("typing", { isTyping: false });
        }, 2000);
      }
    },
    [socket]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setIsPartnerTyping(false);
  }, []);

  return { messages, isPartnerTyping, sendMessage, sendTyping, clearMessages };
};

export default useChat;
