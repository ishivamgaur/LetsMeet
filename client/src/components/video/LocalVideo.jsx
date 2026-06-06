import { useEffect, useRef } from "react";

const LocalVideo = ({ stream, videoEnabled }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    // Always reassign srcObject and force play
    video.srcObject = stream;
    video.play().catch(() => {
      // Autoplay might be blocked, that's okay for muted local preview
    });
  }, [stream]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#1a1a1a]">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover scale-x-[-1]"
        style={{ minHeight: "100%", minWidth: "100%" }}
      />
      {!videoEnabled && (
        <div className="absolute inset-0 bg-[#1a1a1a] flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-white/30 flex items-center justify-center">
            <span className="text-3xl">🙈</span>
          </div>
        </div>
      )}
      <span className="absolute bottom-2 left-2 text-xs bg-[#1a1a1a] text-white px-2 py-1 border border-white/40 font-bold uppercase tracking-wider">
        You
      </span>
    </div>
  );
};

export default LocalVideo;
