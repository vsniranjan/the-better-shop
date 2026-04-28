import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  const sellerId = req.headers.get("x-user-id");

  if (role !== "SELLER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const products = await prisma.product.findMany({
    where: { sellerId: sellerId! },
    orderBy: { createdAt: "desc" },
    include: {
      categories: {
        include: { category: true },
      },
    },
  });

  return NextResponse.json(products);
}
