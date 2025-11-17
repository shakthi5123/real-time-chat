import { Server as IOServer } from "socket.io";
import { Socket } from "net";

export type NextApiResponseServerIO = {
  socket: Socket & {
    server: {
      io: IOServer;
    };
  };
};