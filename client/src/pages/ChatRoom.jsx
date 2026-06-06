import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { connectSocket, disconnectSocket } from "../config/socket.js";
import useMediaDevices from "../hooks/useMediaDevices.js";
import useMatchmaking from "../hooks/useMatchmaking.js";
import useWebRTC from "../hooks/useWebRTC.js";
import useChat from "../hooks/useChat.js";
import LocalVideo from "../components/video/LocalVideo.jsx";
import StrangerVideo from "../components/video/StrangerVideo.jsx";
import VideoControls from "../components/video/VideoControls.jsx";
import ChatPanel from "../components/chat/ChatPanel.jsx";
import SearchingOverlay from "../components/matching/SearchingOverlay.jsx";

const ChatRoom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode = "video", interests = [], name = "Stranger", gender = "Any", country = "Any Country" } = location.state || {};

  const [socket, setSocket] = useState(null);
  const [chatOpen, setChatOpen] = useState(mode === "text");
  const [newMessages, setNewMessages] = useState(0);
  const joinedRef = useRef(false);

  const { localStream, videoEnabled, audioEnabled, startMedia, stopMedia, toggleVideo, toggleAudio } =
    useMediaDevices();
  const { status, partnerId, isInitiator, partnerInfo, next, stop } =
    useMatchmaking(socket);
  const { remoteStream, cleanup: cleanupWebRTC } = useWebRTC({ socket, partnerId, isInitiator, localStream });
  const { messages, isPartnerTyping, sendMessage, sendTyping, clearMessages } = useChat(socket);

  // ── Track new messages when chat is closed ──
  const messagesEndIndexRef = useRef(0);

  useEffect(() => {
    // Automatically reset tracking if messages are cleared (e.g., new stranger)
    if (messages.length === 0) {
      messagesEndIndexRef.current = 0;
      setNewMessages(0);
      return;
    }

    if (chatOpen) {
      // If chat is open, clear counter and update the "seen" marker
      setNewMessages(0);
      messagesEndIndexRef.current = messages.length;
    } else {
      // If chat is closed, count how many new stranger messages arrived since we last looked
      const unseenMessages = messages.slice(messagesEndIndexRef.current);
      const newStrangerMessages = unseenMessages.filter((m) => m.sender === "stranger").length;
      setNewMessages(newStrangerMessages);
    }
  }, [messages, chatOpen]);

  // Step 1: Start media on mount
  useEffect(() => {
    if (mode === "video") {
      startMedia({ video: true, audio: true });
    } else {
      startMedia({ video: false, audio: false });
    }
    return () => stopMedia();
  }, []); // eslint-disable-line

  // Step 2: Connect socket on mount
  useEffect(() => {
    const s = connectSocket();
    setSocket(s);
    return () => {
      s.emit("leave-queue");
      s.emit("stop");
      disconnectSocket();
    };
  }, []); // eslint-disable-line

  // Step 3: Join queue ONLY when BOTH socket is connected AND localStream is ready
  useEffect(() => {
    if (!socket || !localStream || joinedRef.current) return;

    const doJoin = () => {
      if (joinedRef.current) return;
      joinedRef.current = true;
      console.log("🚀 Joining queue — socket & media both ready");
      socket.emit("join-queue", { mode, interests, name, gender, country });
    };

    if (socket.connected) {
      doJoin();
    } else {
      socket.on("connect", doJoin);
      return () => socket.off("connect", doJoin);
    }
  }, [socket, localStream]); // eslint-disable-line

  const handleNext = useCallback(() => {
    cleanupWebRTC();
    clearMessages();
    setNewMessages(0);
    messagesEndIndexRef.current = 0;
    joinedRef.current = false; // allow re-join
    next({ mode, interests, name, gender, country });
  }, [cleanupWebRTC, clearMessages, next, mode, interests, name, gender, country]);

  const handleStop = useCallback(() => {
    cleanupWebRTC();
    stop();
    stopMedia();
    disconnectSocket();
    navigate("/");
  }, [cleanupWebRTC, stop, stopMedia, navigate]);

  useEffect(() => {
    if (status === "idle" && partnerId === null) {
      cleanupWebRTC();
      clearMessages();
    }
  }, [status, partnerId, cleanupWebRTC, clearMessages]);

  const isConnected = status === "matched";
  const isSearching = status === "searching";

  return (
    <div className="relative w-full h-screen bg-[#f4f0ec] overflow-hidden flex flex-col font-sans text-[#1a1a1a]">
      {isSearching && <SearchingOverlay />}

      <header className="bg-white border-b-4 border-[#1a1a1a] py-3 px-4 md:px-6 z-20 shrink-0">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Let'sMeet<span className="text-[#ff6b6b]">_</span>
            </h1>
            {isConnected && partnerInfo && (
              <div className="hidden sm:flex items-center gap-2 bg-[#ffe66d] px-3 py-1 border-2 border-[#1a1a1a] font-bold uppercase text-xs shadow-[2px_2px_0_0_#1a1a1a]">
                <span>🗣️ {partnerInfo.name || "Stranger"}</span>
                {partnerInfo.gender !== "Any" && <span>• {partnerInfo.gender}</span>}
                {partnerInfo.country !== "Any Country" && <span>• {partnerInfo.country}</span>}
              </div>
            )}
          </div>
          <div>
            {isConnected ? (
              <div className="bg-[#4ecdc4] border-2 border-[#1a1a1a] px-3 py-1 flex items-center gap-2 shadow-[2px_2px_0_0_#1a1a1a]">
                <span className="w-2 h-2 bg-[#1a1a1a] rounded-full animate-pulse" />
                <span className="text-xs md:text-sm font-bold uppercase">Connected</span>
              </div>
            ) : isSearching ? (
              <div className="bg-[#c8b6ff] border-2 border-[#1a1a1a] px-3 py-1 flex items-center gap-2 shadow-[2px_2px_0_0_#1a1a1a]">
                <span className="w-2 h-2 bg-[#1a1a1a] rounded-full animate-pulse" />
                <span className="text-xs md:text-sm font-bold uppercase">Searching...</span>
              </div>
            ) : (
              <div className="bg-gray-300 border-2 border-[#1a1a1a] px-3 py-1 flex items-center gap-2 shadow-[2px_2px_0_0_#1a1a1a]">
                <span className="w-2 h-2 bg-[#1a1a1a] rounded-full" />
                <span className="text-xs md:text-sm font-bold uppercase">Disconnected</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {mode === "video" && (
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 p-3 md:p-6 gap-3 md:gap-6 overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0 gap-3 md:gap-6">
            <div className="flex-1 min-h-0 relative border-4 border-[#1a1a1a] bg-[#1a1a1a] shadow-[8px_8px_0_0_#1a1a1a] overflow-hidden">
              <StrangerVideo stream={remoteStream} />
            </div>
            <div className="flex gap-3 md:gap-6 shrink-0" style={{ height: "clamp(120px, 20vh, 200px)" }}>
              <div className="w-32 md:w-48 lg:w-56 shrink-0 border-4 border-[#1a1a1a] bg-[#1a1a1a] shadow-[4px_4px_0_0_#1a1a1a] overflow-hidden">
                <LocalVideo stream={localStream} videoEnabled={videoEnabled} />
              </div>
              <div className="flex-1 bg-white border-4 border-[#1a1a1a] shadow-[4px_4px_0_0_#1a1a1a] flex items-center justify-center p-2">
                <VideoControls mode={mode} videoEnabled={videoEnabled} audioEnabled={audioEnabled}
                  onToggleVideo={toggleVideo} onToggleAudio={toggleAudio} onNext={handleNext} onStop={handleStop}
                  onToggleChat={() => { setChatOpen(p => !p); if (!chatOpen) setNewMessages(0); }}
                  newMessages={newMessages} isConnected={isConnected} />
              </div>
            </div>
          </div>
          <div className={`transition-all duration-300 flex flex-col shrink-0 ${chatOpen ? "w-full lg:w-[380px]" : "w-0 overflow-hidden"}`}>
            <div className="flex-1 border-4 border-[#1a1a1a] shadow-[6px_6px_0_0_#1a1a1a] bg-white w-full min-h-0">
              <ChatPanel messages={messages} onSendMessage={sendMessage} onTyping={sendTyping}
                isPartnerTyping={isPartnerTyping} isOpen={chatOpen} />
            </div>
          </div>
        </div>
      )}

      {mode === "text" && (
        <div className="flex-1 flex flex-col min-h-0 p-3 md:p-6 gap-3 md:gap-6 overflow-hidden">
          <div className="flex-1 min-h-0 w-full max-w-4xl mx-auto border-4 border-[#1a1a1a] shadow-[8px_8px_0_0_#1a1a1a] bg-white">
            <ChatPanel messages={messages} onSendMessage={sendMessage} onTyping={sendTyping}
              isPartnerTyping={isPartnerTyping} isOpen={true} />
          </div>
          <div className="shrink-0 p-3 bg-white border-4 border-[#1a1a1a] shadow-[4px_4px_0_0_#1a1a1a] flex justify-center max-w-4xl mx-auto w-full">
            <VideoControls mode={mode} videoEnabled={videoEnabled} audioEnabled={audioEnabled}
              onToggleVideo={toggleVideo} onToggleAudio={toggleAudio} onNext={handleNext} onStop={handleStop}
              onToggleChat={() => {}} newMessages={0} isConnected={isConnected} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
