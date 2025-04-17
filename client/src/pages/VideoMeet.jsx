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

  let getUserMediaSuccess = (stream) => {
    try {
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }
    } catch (error) {
      console.log(error);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id]
        .createOffer()
        .then((description) => {
          connections[id]
            .setLocalDescription(description)
            .then(() => {
              socketRef.current.emit(
                "signal",
                id,
                JSON.stringify({ sdp: connections[id].localDescription })
              );
            })
            .catch((error) => console.log(error));
        })
        .catch((error) => console.log(error));
    }

    stream.getTracks().forEach(
      (tracks) =>
        (tracks.onended = () => {
          setVideo(false);
          setAudio(false);

          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (error) {
            console.log(error);
          }

          //* TODO BlackSilence
          // let blackSilence

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);

          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          for (let id in connections) {
            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description) => {
              connections[id].setLocalDescription(description).then(() => {
                socketRef.current.emit(
                  "signal",
                  id,
                  JSON.stringify({ sdp: connections[id].localDescription })
                );
              });
            });
          }
        })
    );
  };

  //* Silence func Audio
  let silence = () => {
    let context = new AudioContext();
    let oscillator = context.createOscillator();

    let destination = oscillator.connect(
      context.createMediaStreamDestination()
    );

    oscillator.start();
    context.resume();

    return Object.assign(destination.stream.getAudioTracks()[0], {
      enabled: false,
    });
  };

  //* Black canvas
  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });

    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], {
      enabled: false,
    });
  };

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

  //* Accepting and sending offer for connection
  let gotMessageFromServer = (fromId, message) => {
    const signal = JSON.parse(message);
    const peer = connections[fromId];

    if (fromId === socketIdRef.current || !peer) return;

    // Handle SDP
    if (signal.sdp) {
      const desc = new RTCSessionDescription(signal.sdp);

      if (desc.type === "offer") {
        if (peer.signalingState !== "stable") {
          console.warn("Skipping offer because signaling is not stable.");
          return;
        }

        peer
          .setRemoteDescription(desc)
          .then(() => peer.createAnswer())
          .then((answer) => peer.setLocalDescription(answer))
          .then(() => {
            socketRef.current.emit(
              "signal",
              fromId,
              JSON.stringify({ sdp: peer.localDescription })
            );
          })
          .catch((err) => console.error("Error handling offer & answer:", err));
      } else if (desc.type === "answer") {
        peer
          .setRemoteDescription(desc)
          .catch((err) => console.error("Error setting remote answer:", err));
      }
    }

    // Handle ICE
    if (signal.ice) {
      if (peer.remoteDescription && peer.remoteDescription.type) {
        peer
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((err) => console.error("Error adding ICE candidate:", err));
      } else {
        console.warn("ICE received before remote description was set.");
      }
    }
  };

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
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          );

          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          connections[socketListId].onaddstream = (event) => {
            let videoExists = videoRef.current.find(
              (video) => video.socketId === socketListId
            );

            if (videoExists) {
              setVideos((videos) => {
                const updatedVideos = videos.map((video) =>
                  video.socketId === socketListId
                    ? { ...video, stream: event.stream }
                    : video
                );

                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoPlay: true,
                playsinline: true,
              };

              setVideos((videos) => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };

          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            //* TODO BLACKSILENCE
            // let blackSilence

            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);

            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            try {
              connections[id2].addStream(window.localStream);
            } catch (error) {
              console.log("Error.: ", error);
            }

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({
                      sdp: connections[id2].localDescription,
                    })
                  );
                })
                .catch((error) => console.log(error));
            });
          }
        }
      });
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

  console.log(videos);

  return (
    <div className="w-full h-screen">
      {/* Video meet component {window.location.href} */}

      {askForUsername === true ? (
        <div className=" w-full h-full ">
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
              className="bg-[#1871d124] border-2 scale-x-[-1] w-[450px] h-[340px] rounded-md object-cover "
              ref={localVideoRef}
              muted
              autoPlay
            ></video>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full ">
          <video
            className="bg-[#1871d124] absolute bottom-0 left-0 border-2 scale-x-[-1] h-[200px] rounded-md object-cover "
            ref={localVideoRef}
            autoPlay
            muted
          ></video>

          <div className="absolute top-0 w-full h-[610px] bg-[#010713ab] ">
            {videos.map((video) => (
              <div key={video.socketId} className="">
                <h1 className="text-3xl">Remote Video</h1>
                <h2>{video.socketId}</h2>
                <video
                  className="bg-[#000000] border-2 border-red-400 scale-x-[-1]  h-[520px] rounded-md object-cover"
                  ref={(ref) => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream;
                    }
                  }}
                  autoPlay
                  muted
                ></video>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoMeet;
