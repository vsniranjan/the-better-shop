import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      categories: {
        include: {
          category: true,
        },
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
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const role = req.headers.get("x-user-role");
  const userId = req.headers.get("x-user-id");

  if (role !== "SELLER" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (role === "SELLER" && product.sellerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await req.formData();

    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
    const priceRaw = formData.get("price") as string | null;
    const stockRaw = formData.get("stock") as string | null;
    const categoriesRaw = formData.get("categories") as string | null;
    const imageFiles = (formData.getAll("images") as File[]).filter(
      (f) => f.size > 0,
    );
    const price = priceRaw ? parseFloat(priceRaw) : undefined;
    const stock = stockRaw ? parseInt(stockRaw) : undefined;

    if (
      (price !== undefined && (isNaN(price) || price < 0)) ||
      (stock !== undefined && (isNaN(stock) || stock < 0))
    ) {
      return NextResponse.json(
        { error: "Price and stock must be positive numbers" },
        { status: 400 },
      );
    }

    const imageUrls =
      imageFiles.length > 0
        ? await Promise.all(imageFiles.map((f) => uploadImage(f)))
        : undefined;

    if (categoriesRaw !== null) {
      const categoryNames = [
        ...new Set(
          categoriesRaw
            .split(",")
            .map((c) => c.trim().toLowerCase())
            .filter(Boolean),
        ),
      ];

      if (categoryNames.length === 0) {
        return NextResponse.json(
          { error: "At least one category is required" },
          { status: 400 },
        );
      }

      const categories = await Promise.all(
        categoryNames.map((name) =>
          prisma.category.upsert({
            where: { name },
            update: {},
            create: { name },
          }),
        ),
      );

      await prisma.$transaction([
        prisma.productCategory.deleteMany({ where: { productId: id } }),
        prisma.productCategory.createMany({
          data: categories.map((cat) => ({
            productId: id,
            categoryId: cat.id,
          })),
        }),
      ]);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(title !== null && { title }),
        ...(description !== null && { description }),
        ...(price !== undefined && { price }),
        ...(stock !== undefined && { stock }),
        ...(imageUrls && { images: imageUrls }),
      },
      include: {
        categories: { include: { category: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Product update failed:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const role = req.headers.get("x-user-role");
  const userId = req.headers.get("x-user-id");

  if (role !== "SELLER" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (role === "SELLER" && product.sellerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Product deletion failed:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
