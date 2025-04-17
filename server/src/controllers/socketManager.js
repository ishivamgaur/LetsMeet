import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("SOMETHING CONNECTED 📞")
    //* JOIN-CALL
    socket.on("join-call", (path) => {
      if (connections[path] === undefined) {
        connections[path] = [];
      }

      connections[path].push(socket.id);

      timeOnline[socket.id] = new Date();

      // connections[path].forEach((p) => {
      //   io.to(p)
      // })

      for (let a = 0; a < connections[path].length; a++) {
        io.to(connections[path][a]).emit(
          "user-joined",
          socket.id,
          connections[path]
        );
      }

      if (messages[path] !== undefined) {
        for (let a = 0; a < messages[path].length; a++) {
          io.to(socket.id).emit(
            "chat-message",
            messages[path][a]["data"],
            messages[path][a]["sender"],
            messages[path][a]["socket-id-sender"]
          );
        }
      }
    });
 
    //* SIGNAL
    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    //* CHAT-MESSAGE
    socket.on("chat-message", (data, sender) => {
      const [matchingRoom, found] = Object.entries().reduce(
        ([room, isFound], [roomKey, roomValue]) => {
          if (!isFound && roomValue.includes(socket.id)) {
            return [roomKey, true];
          }

          return [room, isFound];
        },
        ["", false]
      );

      if (found === true) {
        if (messages[matchingRoom === undefined]) {
          messages[matchingRoom] = [];
        }

        messages[matchingRoom].push({
          sender: sender,
          data: data,
          "socket-id-sender": socket.id,
        });

        console.log("message", matchingRoom, ":", sender, data);

        connections[matchingRoom].forEach((elem) => {
          io.to(elem).emit("chat-message", data, sender, socket.id);
        });
      }
    });

    //* DISCONNECT
    socket.on("disconnect", () => {
      let diffTime = Math.abs(timeOnline[socket.id] - Date.now());

      let key = null;

      // Loop over deep copy of connections to avoid mutation issues
      let allRooms = JSON.parse(JSON.stringify(Object.entries(connections)));

      for (let [room, allSocketIds] of allRooms) {
        for (let i = 0; i < allSocketIds.length; i++) {
          if (allSocketIds[i] === socket.id) {
            key = room;

            for (let i = 0; i < connections[key].length; i++) {
              io.to(connections[key][i]).emit("user-left", socket.id);
            }

            let index = connections[key].indexOf(socket.id);

            connections[key].splice(index, 1);

            if (connections[key].length === 0) {
              delete connections[key];
            }
          }
        }
      }
    });
  });

  return io;
};
