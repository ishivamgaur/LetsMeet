import { useState, useRef, useCallback, useEffect } from "react";

const TURN_USERNAME = import.meta.env.VITE_TURN_USERNAME;
const TURN_CREDENTIAL = import.meta.env.VITE_TURN_CREDENTIAL;

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun.relay.metered.ca:80" },
    ...(TURN_USERNAME && TURN_CREDENTIAL ? [
      {
        urls: "turn:global.relay.metered.ca:80",
        username: TURN_USERNAME,
        credential: TURN_CREDENTIAL
      },
      {
        urls: "turn:global.relay.metered.ca:80?transport=tcp",
        username: TURN_USERNAME,
        credential: TURN_CREDENTIAL
      },
      {
        urls: "turn:global.relay.metered.ca:443",
        username: TURN_USERNAME,
        credential: TURN_CREDENTIAL
      },
      {
        urls: "turns:global.relay.metered.ca:443?transport=tcp",
        username: TURN_USERNAME,
        credential: TURN_CREDENTIAL
      }
    ] : [])
  ],
};

const useWebRTC = ({ socket, partnerId, isInitiator, localStream }) => {
  const peerRef = useRef(null);
  const iceBuffer = useRef([]);
  const activePartnerRef = useRef(null);
  
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionState, setConnectionState] = useState("new");

  const flushIce = async (peer) => {
    const q = [...iceBuffer.current];
    iceBuffer.current = [];
    for (const c of q) {
      try { await peer.addIceCandidate(new RTCIceCandidate(c)); }
      catch (e) { console.error("ICE flush err:", e.message); }
    }
  };

  useEffect(() => {
    if (!socket || !partnerId || !localStream) return;

    // 1. If partner changed, destroy old peer
    if (activePartnerRef.current !== partnerId) {
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
      setRemoteStream(null);
      setConnectionState("new");
      iceBuffer.current = [];
      activePartnerRef.current = partnerId;
    }

    let peer = peerRef.current;
    let isNewPeer = false;

    // 2. Initialize new peer if needed (survives Strict Mode unmount/remount)
    if (!peer) {
      isNewPeer = true;
      peer = new RTCPeerConnection(ICE_SERVERS);
      peerRef.current = peer;

      peer.onicecandidate = (e) => {
        if (e.candidate && socket) {
          socket.emit("signal", { to: partnerId, data: JSON.stringify({ ice: e.candidate }) });
        }
      };

      peer.ontrack = (e) => {
        console.log("🎥 Remote track:", e.track.kind);
        const newStream = e.streams && e.streams[0] 
          ? new MediaStream(e.streams[0].getTracks()) 
          : new MediaStream([e.track]);
        
        setRemoteStream(prev => {
          if (prev) {
            const allTracks = new Set([...prev.getTracks(), ...newStream.getTracks()]);
            return new MediaStream(Array.from(allTracks));
          }
          return newStream;
        });
      };

      peer.onconnectionstatechange = () => {
        setConnectionState(peer.connectionState);
        if (peer.connectionState === "failed") peer.restartIce();
      };

      peer.oniceconnectionstatechange = () => {
        if (peer.iceConnectionState === "failed") peer.restartIce();
      };

      // Add local tracks
      localStream.getTracks().forEach((t) => peer.addTrack(t, localStream));
    }

    // 3. Attach signaling handler (always do this, in case Strict Mode re-runs)
    const onSignal = async ({ from, data }) => {
      if (from !== partnerId) return;
      const sig = JSON.parse(data);

      try {
        if (sig.sdp) {
          const desc = new RTCSessionDescription(sig.sdp);
          if (desc.type === "offer" && peer.signalingState === "stable") {
            await peer.setRemoteDescription(desc);
            await flushIce(peer);
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            socket.emit("signal", { to: partnerId, data: JSON.stringify({ sdp: peer.localDescription }) });
          } else if (desc.type === "answer" && peer.signalingState === "have-local-offer") {
            await peer.setRemoteDescription(desc);
            await flushIce(peer);
          }
        }
        if (sig.ice) {
          if (peer.remoteDescription?.type) {
            await peer.addIceCandidate(new RTCIceCandidate(sig.ice));
          } else {
            iceBuffer.current.push(sig.ice);
          }
        }
      } catch (err) {
        console.error("Signal error:", err.message);
      }
    };

    socket.on("signal", onSignal);

    // 4. If this is a completely new peer, begin negotiation
    if (isNewPeer) {
      socket.emit("webrtc-ready");

      if (isInitiator) {
        (async () => {
          try {
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            socket.emit("signal", { to: partnerId, data: JSON.stringify({ sdp: peer.localDescription }) });
            console.log("📨 Offer sent");
          } catch (err) {
            console.error("Offer error:", err);
          }
        })();
      }
    }

    // 5. Cleanup: detach listener, but leave peer ALIVE for Strict Mode
    return () => {
      socket.off("signal", onSignal);
    };
  }, [socket, partnerId, isInitiator, localStream]);

  // Explicit cleanup when "Stop" or "Next" is clicked
  const cleanup = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    activePartnerRef.current = null;
    iceBuffer.current = [];
    setRemoteStream(null);
    setConnectionState("new");
  }, []);

  return { remoteStream, connectionState, cleanup, peerRef };
};

export default useWebRTC;
