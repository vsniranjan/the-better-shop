import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { z } from "zod";

const registerSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters")
    .max(16, "Password must be lower than 16 characters"),
  role: z.enum(["BUYER", "SELLER"]).optional(),
  shopName: z.string().min(1).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { email, password, role, shopName } = parsed.data;

    const normalizedEmail = email.trim().toLowerCase();
    const safeRole = role === "SELLER" ? "SELLER" : "BUYER";

    if (safeRole === "SELLER" && !shopName) {
      return NextResponse.json(
        { error: "Shop name is required for sellers" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          role: safeRole,
        },
      });

      await tx.profile.create({
        data: { userId: user.id },
      });

      if (safeRole === "SELLER") {
        await tx.sellerProfile.create({
          data: {
            userId: user.id,
            shopName: shopName!,
          },
        });
      }

      return user;
    });

    const token = signToken({ id: user.id, role: user.role });

    const response = NextResponse.json({ role: user.role }, { status: 201 });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
