/** @format */

let io = null;

// HTTP server ke saath socket.io attach karo (server.js se call hoga)
const initSocket = (server) => {
  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: {
      // Apna frontend URL yahan daal do (Vite dev server default 5173 hai)
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Employee login hone ke baad frontend se apni role/room bhej dega
    // Isse hum sirf HR/manager sockets ko approval-related events bhej sakte hain
    socket.on("join", ({ role }) => {
      if (role === "admin" || role === "manager") {
        socket.join("hr-room");
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};

// Controllers me isse use karke event emit karte hain
const getIO = () => {
  if (!io) {
    throw new Error("Socket.io initialize nahi hua - initSocket() pehle call karo");
  }
  return io;
};

module.exports = { initSocket, getIO };