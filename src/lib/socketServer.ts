import { Server } from "socket.io";
import type { NextApiResponseServerIO } from "@/types/next";

let io: Server | null = null;

export function getIO(server: any) {
  if (!io) {
    io = new Server(server, {
      path: "/socket/io",
      cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("chat message", (msg) => {
        io?.emit("chat message", msg);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });
  }
  return io;
}