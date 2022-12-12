import { Server } from "http";
import socketio from "socket.io";

let io: socketio.Server;

export const socket = {
  init: (httpServer: Server) => {
    io = new socketio.Server(httpServer);
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("socket.io not initialized");
    }
    return io;
  }
};
