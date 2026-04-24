import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { z } from "zod";

// Schema for proper body
const registerSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters")
    .max(16, "Password must be lower than 16 characters"),

  role: z.enum(["BUYER", "SELLER"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validation using Zod
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }
    const { email, password, role } = parsed.data;

    // Normalising email for checking and making role safe (no ADMIN)
    const normalizedEmail = email.trim().toLowerCase();
    const safeRole = role === "SELLER" ? "SELLER" : "BUYER";

    // Check if email is already existing
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 },
      );
    }

    // hashing password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user in db
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        role: safeRole,
      },
    });

    // sign token
    const token = signToken({ id: user.id, role: user.role });

    return NextResponse.json({ token, role: user.role }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
