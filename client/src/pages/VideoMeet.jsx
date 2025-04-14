import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const server_url = "http://localhost:8000";

const connections = {};

const peerConfigConnections = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const VideoMeet = () => {
  let socketRef = useRef();

  let socketIdRef = useRef();

  let localVideoRef = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);

  let [audioAvailable, setAudioAvailable] = useState(true);

  let [screenAvailable, setScreenAvailable] = useState();

  let [video, setVideo] = useState([]);

  let [audio, setAudio] = useState();

  let [screen, setScreen] = useState();

  let [messages, setMessages] = useState([]);

  let [message, setMessage] = useState("");

  let [newMessages, setNewMessages] = useState(0);

  let [askForUsername, setAskForUsername] = useState(true);

  let [username, setUsername] = useState("");

  const videoRef = useRef([]);

  let [videos, setVideos] = useState([]);

  //* TODO
  // if (isChrome() === false) {

  // }

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      if (videoPermission) {
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      if (audioPermission) {
        setAudioAvailable(true);
      } else {
        setAudioAvailable(false);
      }

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      //* USER MEDIA
      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });

        if (userMediaStream) {
          window.localStream = userMediaStream;

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (error) {
      console.log("Error🚫: ", error);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  let getUserMediaSuccess = (stream) => {};

  const getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess) //* getUserMediaSuccess
        .then((stream) => {})
        .catch((error) => console.log(error));
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    if (video !== undefined || audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  //* TODO
  let gotMessageFromServer = (fromId, mesage) => {};

  //* TODO
  let addMessage = () => {};

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);

      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideo((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          
          connections[socketListId] = new RTCPeerConnection(peerConfigConnections);


        })
      })
    });
  };

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(videoAvailable);

    connectToSocketServer();
  };

  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  return (
    <div className="w-full h-screen">
      {/* Video meet component {window.location.href} */}

      {askForUsername === true ? (
        <div className=" w-full h-full p-10 ">
          <h1 className="text-4xl">Enter into Lobby</h1>
          <div className="flex w-1/4  flex-col gap-1 overflow-hidden mt-4">
            <label htmlFor="username" className="text-gray-500 text-md">
              Enter Username:
            </label>
            <input
              type="text"
              id="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-2 border-gray-800 focus:border-gray-500 transition-all duration-300 rounded-md outline-none px-5 py-2"
            />
          </div>
          <button
            className="bg-blue-600 mt-4 hover:bg-blue-700 px-5 py-2 rounded-md cursor-pointer text-gray-200 transition-all duration-300"
            onClick={connect}
          >
            Connnect
          </button>

          {/* Video div */}

          <div className="mt-5">
            <video
              className="bg-[#1872d182] scale-x-[-1] w-[450px] h-[340px] rounded-md object-cover "
              ref={localVideoRef}
              muted
              autoPlay
            ></video>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default VideoMeet;
