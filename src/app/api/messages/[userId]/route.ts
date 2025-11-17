import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: any) {
  const { userId } = params; // receiver user ID

  const currentUserEmail = req.headers.get("x-user-email");

  const currentUser = await prisma.user.findUnique({
    where: { email: currentUserEmail }
  });

  if (!currentUser) return NextResponse.json([]);

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: currentUser.id, receiverId: userId },
        { senderId: userId, receiverId: currentUser.id }
      ]
    },
    orderBy: { createdAt: "asc" }
  });

  return NextResponse.json(messages);
}