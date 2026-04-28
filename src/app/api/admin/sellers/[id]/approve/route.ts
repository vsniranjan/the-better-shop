import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const role = req.headers.get("x-user-role");

  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = params;

  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: id },
  });

  if (!sellerProfile) {
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });
  }

  const updated = await prisma.sellerProfile.update({
    where: { userId: id },
    data: { isApproved: true },
  });

  return NextResponse.json(updated);
}
