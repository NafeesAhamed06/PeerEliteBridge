const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { ExpressPeerServer } = require("peer");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Peer.js server
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
app.use("/peerjs", peerServer);

let users = {};

// Serve static files (client-side)
app.use(express.static("public"));

function generateRandomId() {
  return Math.floor(Math.random() * 10 ** 12)
    .toString()
    .padStart(12, "0");
}

// Socket.io connection
io.on("connection", (socket) => {
  console.log("a user connected");

  // Example of future use (emit event to all clients)
  socket.emit("message", "Welcome to the Peer.js app!");

  socket.on("my-peerID", (peerId) => {

    console.log("peerId:", peerId.myPeerIDD);
    if(!peerId.phoneNUMB){
      const userId = generateRandomId();
      users[userId] = { num: userId, peer: peerId, socket: socket.id };
      console.log("users:", users);
      socket.emit("socketID", { socketID: socket.id, num: userId });
    }else{
      const userId = peerId.phoneNUMB
      users[userId] = { num: userId, peer: peerId, socket: socket.id };
      console.log("users:", users);
      socket.emit("socketID", { socketID: socket.id, num: userId });
    }
  });

  socket.on("INITcall", (data) => {
    console.log("INITcall", data);
    let user = users[data].peer;
    console.log("RCall-user:", user);
    socket.emit("call-initiate", { userID: user, userSID: users[data].socket });
  });

  socket.on("INITend", (data) => {
    console.log(data);
    console.log(data.remoteId);
    console.log(data.mySocket);
    io.to(data.remoteId).emit("endthecall");
    io.to(data.mySocket).emit("endthecall");
  });

  socket.on("disconnect", () => {
    if (socket.id) {
      let usersa = Object.keys(users).find(
        (key) => users[key].socket === socket.id
      );
      delete users[usersa];
      console.log("users:", users);
    }
  });
});

// Start the server
server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
