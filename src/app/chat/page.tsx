"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<{ text: string; user?: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);


  // Store socket in a ref so it doesn't reinitialize or get undefined
  const socketRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io({
      path: "/api/socket/io",
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to socket:", socketRef.current.id);
    });

    socketRef.current.on("chat message", (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Cleanup when unmounting
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

   // 2) LOAD OLD MESSAGES FROM DB (PLACE HERE)
  useEffect(() => {
    async function loadOldMessages() {
      if (!session?.user?.email || !selectedUserId) return;

      const res = await fetch(`/api/messages/${selectedUserId}`, {
        headers: {
          "x-user-email": session.user.email,
        },
      });

      const data = await res.json();
      setMessages(data);
    }

    loadOldMessages();
  }, [selectedUserId, session]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() && socketRef.current) {
      const msg = {
        text: input,
        user: session?.user?.email, // correct sender
      };

      socketRef.current.emit("chat message", msg);
      setInput("");
    }
  };

  // Redirect if not logged in
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (status === "loading") {
    return <p className="text-center mt-10">Loading....</p>;
  }

  const userName = session?.user?.name || "User";

  return (
    <main className="flex h-screen bg-gray-100">
      <aside className="w-full sm:w-1/3 md:w-1/4 bg-white border-r border-gray-100 shadow-md p-4">
        <h2 className="text-xl font-semibold mb-3">Chats</h2>

        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Image
              src={
                session?.user?.image ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  userName
                )}&background=random`
              }
              alt={userName}
              width={40}
              height={40}
              unoptimized
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />

            <div className="min-w-0">
              <p className="text-gray-800 text-sm sm:text-base truncate">
                {session?.user?.name}
              </p>
              <p className="text-gray-600 text-xs sm:text-sm truncate max-w-[9rem] sm:max-w-[10rem] md:max-w-[12rem]">
                {session?.user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-red-500 text-white text-xs px-4 py-2 rounded-lg hover:bg-red-600 w-full sm:w-auto"
          >
            Logout
          </button>
        </div>

        <ul>
          <li className="p-2 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer mb-2">
            Shakthi
          </li>
          <li className="p-2 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer mb-2">
            Muthuraj
          </li>
          <li className="p-2 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer mb-2">
            Vignesh
          </li>
          <li className="p-2 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer mb-2">
            Mukesh
          </li>
        </ul>
      </aside>

      <section className="flex flex-col flex-1">
        {/* <div className="flex-1 overflow-y-auto space-y-2 p-4">
          {messages.map((m, i) => (
            <div key={i} className="p-2 bg-gray-100 rounded-lg">
              {m}
            </div>
          ))}
        </div> */}

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-chatBg">
          {messages.map((m, i) => {
            const isMe = m.user === session?.user?.email;

            return (
              <div
                key={i}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs sm:max-w-sm md:max-w-md px-4 py-2 rounded-xl shadow 
            ${
              isMe
                ? "bg-blue-500 text-white rounded-br-none"
                : "bg-gray-200 text-gray-800 rounded-bl-none"
            }`}
                >
                  <p className="break-words">{m.text}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 flex items-center gap-2 border-t bg-white">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 border p-2 rounded-lg"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Send
          </button>
        </div>
      </section>
    </main>
  );
}
