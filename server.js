

import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create the HTTP server
  const server = createServer((req, res) => {
    handle(req, res);
  });

  // Initialize Socket.io
  const io = new Server(server, {
    path: "/socket/io",
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("chat message", async (msg) => {
      // msg = { text, user: senderEmail, to: receiverEmail }

      const sender = await prisma.user.findUnique({
        where: { email: msg.user },
      });

      const receiver = await prisma.user.findUnique({
        where: { email: msg.to },
      });

      if (!sender || !receiver) return;

      // Save to DB
      await prisma.message.create({
        data: {
          text: msg.text,
          senderId: sender.id,
          receiverId: receiver.id,
        },
      });

      // Send to both users
      io.emit("chat message", msg);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
