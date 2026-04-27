import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("limit") ?? "20")),
  );
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        categories: {
          include: { category: true },
        },
        seller: {
          select: {
            id: true,
            sellerProfile: {
              select: { shopName: true },
            },
          },
        },
      },
    }),
    prisma.product.count(),
  ]);

  return NextResponse.json({
    products,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}
