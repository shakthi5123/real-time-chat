import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text"},
                password: { label: "Password", type: "password"},
            },
            async authorize(credentials){
                // Simple dummy for now
                // const user = { id: "1", name: "shakthivel", email: "shakthivel@gmail.com", password: "1234"};

               if(!credentials?.email || !credentials?.password)
                 throw new Error("Invalid credentials");

               const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
               });
               if(!user) throw new Error("No user found");

               const isValid = await compare(credentials.password, user.password!);
                if(!isValid) throw new Error("Invalid password");

                return user;
            },
        }),

        // Google OAuth 
        GoogleProvider({
              clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST}