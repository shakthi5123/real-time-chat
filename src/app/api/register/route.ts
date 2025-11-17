// src/app/api/register/route.ts
// This route:
// 	•	Receives name, email, password
// 	•	Validates them
// 	•	Hashes the password
// 	•	Saves the user in MongoDB

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email }});
        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists"},
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await hash(password, 10);

        // Save the new user
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            }
        })
        return NextResponse.json({ message: "User created successfully"}, { status: 201});
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error"}, { status: 500 });
    }
}