import { useState, useEffect, useCallback } from "react";

/**
 * Manages the matchmaking lifecycle: queue → match → next → stop.
 *
 * Status: "idle" | "searching" | "matched"
 */
const useMatchmaking = (socket) => {
  const [status, setStatus] = useState("searching"); // searching | matched | idle
  const [partnerId, setPartnerId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [isInitiator, setIsInitiator] = useState(false);
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (!socket) return;

    const onMatched = ({ partnerId, roomId, isInitiator, partnerInfo }) => {
      setPartnerId(partnerId);
      setRoomId(roomId);
      setIsInitiator(isInitiator);
      setPartnerInfo(partnerInfo);
      setStatus("matched");
    };

    const onPartnerDisconnected = () => {
      setPartnerId(null);
      setRoomId(null);
      setIsInitiator(false);
      setPartnerInfo(null);
      setStatus("idle");
    };

    const onQueueStatus = () => {
      setStatus("searching");
    };

    const onOnlineCount = ({ count }) => {
      setOnlineCount(count);
    };

    socket.on("matched", onMatched);
    socket.on("partner-disconnected", onPartnerDisconnected);
    socket.on("queue-status", onQueueStatus);
    socket.on("online-count", onOnlineCount);

    return () => {
      socket.off("matched", onMatched);
      socket.off("partner-disconnected", onPartnerDisconnected);
      socket.off("queue-status", onQueueStatus);
      socket.off("online-count", onOnlineCount);
    };
  }, [socket]);

  const joinQueue = useCallback(
    (preferences = {}) => {
      if (!socket) return;
      setStatus("searching");
      socket.emit("join-queue", preferences);
    },
    [socket]
  );

  const leaveQueue = useCallback(() => {
    if (!socket) return;
    socket.emit("leave-queue");
    setStatus("idle");
  }, [socket]);

  const next = useCallback(
    (preferences = {}) => {
      if (!socket) return;
      setPartnerId(null);
      setRoomId(null);
      setIsInitiator(false);
      setPartnerInfo(null);
      setStatus("searching");
      socket.emit("next", preferences);
    },
    [socket]
  );

  const stop = useCallback(() => {
    if (!socket) return;
    socket.emit("stop");
    setPartnerId(null);
    setRoomId(null);
    setIsInitiator(false);
    setPartnerInfo(null);
    setStatus("idle");
  }, [socket]);

  return {
    status,
    partnerId,
    roomId,
    isInitiator,
    partnerInfo,
    onlineCount,
    joinQueue,
    leaveQueue,
    next,
    stop,
  };
};

export default useMatchmaking;
