'use strict';
const { Server } = require("socket.io");

let io;
const userSockets = new Map(); // userId -> socketId

module.exports = {
  initSocket: (server) => {
    io = new Server(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173', 'http://127.0.0.1:5173'],
        credentials: true
      }
    });

    io.on("connection", (socket) => {
      // Extract userId from query
      const userId = socket.handshake.query.userId;
      if (userId) {
        userSockets.set(String(userId), socket.id);
      }

      socket.on("disconnect", () => {
        if (userId) {
          userSockets.delete(String(userId));
        }
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
  getUserSocket: (userId) => {
    return userSockets.get(String(userId));
  }
};
