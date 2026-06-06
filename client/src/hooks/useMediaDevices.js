import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Manages camera/mic permissions, streams, and track toggling.
 * 
 * Design notes:
 * - Uses both a ref (streamRef) and state (localStream) to avoid race conditions.
 * - The ref is updated synchronously, while the state triggers re-renders.
 * - Text mode creates a dummy black+silence stream so WebRTC has tracks to negotiate.
 */
const useMediaDevices = () => {
  const streamRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const startMedia = useCallback(async ({ video = true, audio = true } = {}) => {
    // Stop any existing tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    // Text-only mode: no real camera/mic needed,
    // but we still create a dummy stream for WebRTC track negotiation
    if (!video && !audio) {
      const fallback = createBlackSilence();
      streamRef.current = fallback;
      setLocalStream(fallback);
      setVideoEnabled(false);
      setAudioEnabled(false);
      return fallback;
    }

    try {
      const constraints = {};
      if (video) constraints.video = { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" };
      if (audio) constraints.audio = { echoCancellation: true, noiseSuppression: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setLocalStream(stream);
      setVideoEnabled(!!video);
      setAudioEnabled(!!audio);
      console.log("📷 Media started:", stream.getTracks().map(t => `${t.kind}(${t.readyState})`).join(", "));
      return stream;
    } catch (err) {
      console.error("Media access error:", err.message);
      // Fallback to black+silence
      const fallback = createBlackSilence();
      streamRef.current = fallback;
      setLocalStream(fallback);
      setVideoEnabled(false);
      setAudioEnabled(false);
      return fallback;
    }
  }, []);

  const stopMedia = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setLocalStream(null);
    }
  }, []);

  const toggleVideo = useCallback(() => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setVideoEnabled(track.enabled);
    }
  }, []);

  const toggleAudio = useCallback(() => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setAudioEnabled(track.enabled);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return {
    localStream,
    streamRef,
    videoEnabled,
    audioEnabled,
    startMedia,
    stopMedia,
    toggleVideo,
    toggleAudio,
  };
};

/**
 * Creates a dummy black-video + silent-audio MediaStream.
 * Used as fallback when camera access fails or in text-only mode.
 */
function createBlackSilence() {
  // Black video track from canvas
  const canvas = Object.assign(document.createElement("canvas"), {
    width: 640,
    height: 480,
  });
  const ctx2d = canvas.getContext("2d");
  ctx2d.fillStyle = "#000000";
  ctx2d.fillRect(0, 0, 640, 480);
  const videoTrack = canvas.captureStream(1).getVideoTracks()[0]; // 1 FPS to save CPU

  // Silent audio track
  const audioCtx = new AudioContext();
  const destination = audioCtx.createMediaStreamDestination();
  const oscillator = audioCtx.createOscillator();
  oscillator.connect(destination);
  oscillator.start();
  const audioTrack = destination.stream.getAudioTracks()[0];
  audioTrack.enabled = false; // Mute it

  return new MediaStream([videoTrack, audioTrack]);
}

export default useMediaDevices;
