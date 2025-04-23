// RemoteVideo.jsx
import React, { useRef, useEffect } from "react";

const RemoteVideo = React.memo(
  ({ stream, socketId, isFullScreen, onClick }) => {
    const videoRef = useRef();

    useEffect(() => {
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }
    }, [stream]);

    return (
      <div
        className={`cursor-pointer  transition-all duration-300 ${
          isFullScreen
            ? "fixed top-0 right-0 bottom-0 z-[1000000] w-full h-full flex items-center justify-center object-cover"
            : ""
        }`}
        onClick={onClick}
      >
        <video
          ref={videoRef}
          className={`border-2 bg-black border-red-400 ${
            isFullScreen ? "w-[96%] h-[95%]" : "h-[350px] w-[450px]"
          } rounded-md object-contain`}
          autoPlay
          muted
        />
      </div>
    );
  }
);

export default RemoteVideo;
