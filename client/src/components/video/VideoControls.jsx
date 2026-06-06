import { FaVideo, FaVideoSlash } from "react-icons/fa";
import { IoMdMic, IoMdMicOff } from "react-icons/io";
import { IoChatboxEllipsesSharp } from "react-icons/io5";

const VideoControls = ({
  mode = "video",
  videoEnabled,
  audioEnabled,
  onToggleVideo,
  onToggleAudio,
  onNext,
  onStop,
  onToggleChat,
  newMessages,
  isConnected,
}) => {
  const isVideoMode = mode === "video";

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {/* Mic — only in video mode */}
      {isVideoMode && (
        <button
          onClick={onToggleAudio}
          className={`w-12 h-12 border-2 border-black flex items-center justify-center text-xl transition-all duration-200 cursor-pointer shadow-[2px_2px_0_0_#000] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] ${
            audioEnabled
              ? "bg-white text-black"
              : "bg-red-400 text-black"
          }`}
          title={audioEnabled ? "Mute" : "Unmute"}
        >
          {audioEnabled ? <IoMdMic /> : <IoMdMicOff />}
        </button>
      )}

      {/* Camera — only in video mode */}
      {isVideoMode && (
        <button
          onClick={onToggleVideo}
          className={`w-12 h-12 border-2 border-black flex items-center justify-center text-xl transition-all duration-200 cursor-pointer shadow-[2px_2px_0_0_#000] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] ${
            videoEnabled
              ? "bg-white text-black"
              : "bg-red-400 text-black"
          }`}
          title={videoEnabled ? "Turn off camera" : "Turn on camera"}
        >
          {videoEnabled ? <FaVideo /> : <FaVideoSlash />}
        </button>
      )}

      {/* Stop */}
      <button
        onClick={onStop}
        className="px-6 h-12 bg-[#ff6b6b] border-2 border-black flex items-center justify-center text-xl font-black text-black uppercase transition-all duration-200 shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-y-[2px] cursor-pointer"
        title="Stop"
      >
        Stop
      </button>

      {/* Next */}
      {isConnected && (
        <button
          onClick={onNext}
          className="px-6 h-12 bg-[#ffe66d] border-2 border-black flex items-center justify-center text-xl font-black text-black uppercase transition-all duration-200 shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-y-[2px] cursor-pointer"
          title="Next stranger"
        >
          Next
        </button>
      )}

      {/* Chat toggle — only in video mode */}
      {isVideoMode && (
        <button
          onClick={onToggleChat}
          className="relative w-12 h-12 bg-[#4ecdc4] border-2 border-black flex items-center justify-center text-xl text-black transition-all duration-200 cursor-pointer shadow-[2px_2px_0_0_#000] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px]"
          title="Toggle chat"
        >
          <IoChatboxEllipsesSharp />
          {newMessages > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 border-2 border-black bg-[#ff6b6b] text-black text-xs flex items-center justify-center font-black">
              {newMessages > 9 ? "9+" : newMessages}
            </span>
          )}
        </button>
      )}
    </div>
  );
};

export default VideoControls;
