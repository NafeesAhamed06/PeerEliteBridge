const socket = io(); // Initialize Socket.io
const startCallButton = document.getElementById("start-call");
const answerCallButton = document.getElementById("answer-call");
const endCallButton = document.getElementById("end-call");
const localVideo = document.getElementById("local-video");
const remoteVideo = document.getElementById("remote-video");
const peerIdInput = document.getElementById("peer-id");
const phoneNUMB = localStorage.getItem("phonenum");
const peerid = localStorage.getItem("mypeerid");
let myPeerIDD;
let socketIDD;
let REMsocketIDD;
let localStream;
let remoteStream;
let currentCall;

const peerIdd = peerid || undefined;

const peer = new Peer(peerIdd, {
  path: "/peerjs",
  host: "localhost",
  port: 3000,
});

peer.on("open", (id) => {
  localStorage.setItem("mypeerid", id);
  myPeerIDD = id;
  if (!phoneNUMB) {
    socket.emit("my-peerID", { myPeerIDD });
  } else {
    socket.emit("my-peerID", { myPeerIDD, phoneNUMB });
  }
});

document.getElementById("brr").addEventListener("click", () => {
  navigator.clipboard.writeText(
    document.getElementById("my-peerID").textContent
  );
});

socket.on("socketID", (id) => {
  document.getElementById("my-peerID").textContent = id.num;
  if (!phoneNUMB) {
    localStorage.setItem("phonenum", id.num);
  }
  socketIDD = id.socketID;
  console.log(id.socketID);
});

// Get user media
navigator.mediaDevices
  .getUserMedia({ video: false, audio: true })
  .then((stream) => {
    localStream = stream;
    localVideo.srcObject = stream;
  });

// Socket.io event example (receive message from server)
socket.on("message", (message) => {
  console.log(message); // Log server message
});

// Initiate a call
startCallButton.addEventListener("click", () => {
  const otherPeerId = peerIdInput.value.trim();
  if (!otherPeerId) {
    alert("Please enter the peer ID of the other user!");
    return;
  }
  socket.emit("INITcall", otherPeerId);
});

socket.on("call-initiate", (data) => {
  console.log(data);
  REMsocketIDD = data.userSID;
  startCall(data.userID.myPeerIDD);
});

function startCall(idd) {
  const call = peer.call(idd, localStream);
  call.on("stream", (stream) => {
    remoteStream = stream;
    remoteVideo.srcObject = stream;
  });
  call.on("close", () => {
    console.log("Call ended");
    remoteVideo.srcObject = null;
  });
  currentCall = call;
  startCallButton.style.display = "none";
  endCallButton.style.display = "block";
}

// Answer an incoming call
answerCallButton.addEventListener("click", () => {
  currentCall.answer(localStream);
  currentCall.on("stream", (stream) => {
    remoteStream = stream;
    remoteVideo.srcObject = stream;
  });
  currentCall.on("close", () => {
    console.log("Call ended");
    remoteVideo.srcObject = null;
  });
  answerCallButton.style.display = "none";
  endCallButton.style.display = "block";
});

// End the call
endCallButton.addEventListener("click", () => {
  socket.emit("INITend", { remoteId: REMsocketIDD, mySocket: socketIDD });
});

socket.on("endthecall", () => {
  endTHEcall();
});

function endTHEcall() {
  currentCall.close();
  remoteVideo.srcObject = null;
  endCallButton.style.display = "none";
  startCallButton.style.display = "block";
}

// When Peer.js is ready
peer.on("open", (id) => {
  console.log("My peer ID is:", id);
});

// Listen for incoming calls
peer.on("call", (call) => {
  currentCall = call;
  answerCallButton.style.display = "block";
});
