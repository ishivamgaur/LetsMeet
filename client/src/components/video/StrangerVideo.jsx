import { useEffect, useRef } from "react";

const StrangerVideo = ({ stream }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;
    video.play().catch((err) => {
      console.warn("Stranger video play blocked:", err.message);
    });
  }, [stream]);

  if (!stream) {
    return (
      <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 border-4 border-white/20 flex items-center justify-center">
            <span className="text-4xl">👤</span>
          </div>
          <p className="text-white/60 text-sm font-bold uppercase tracking-wider">Waiting for connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#1a1a1a]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
        style={{ minHeight: "100%", minWidth: "100%" }}
      />
      <span className="absolute bottom-3 left-3 text-xs bg-[#1a1a1a] text-white px-2 py-1 border border-white/40 font-bold uppercase tracking-wider">
        Stranger
      </span>
    </div>
  );
};

export default StrangerVideo;
