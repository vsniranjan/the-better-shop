import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";

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

// POST

export async function POST(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  const sellerId = req.headers.get("x-user-id");

  if (role !== "SELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!sellerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: sellerId },
  });

  if (!sellerProfile?.isApproved) {
    return NextResponse.json(
      { error: "Your seller account is not approved yet" },
      { status: 403 },
    );
  }

  const formData = await req.formData();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string | null;
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string);
  const categoriesRaw = formData.get("categories") as string;

  if (!title || isNaN(price) || price < 0 || isNaN(stock) || stock < 0) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const imageFiles = formData.getAll("images") as File[];

  if (imageFiles.length === 0) {
    return NextResponse.json(
      { error: "At least one image is required" },
      { status: 400 },
    );
  }
  try {
    const imageUrls = await Promise.all(
      imageFiles.map((file) => uploadImage(file)),
    );

    const categoriesRaw = (formData.get("categories") as string) || "";

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

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price,
        stock,
        images: imageUrls,
        sellerId,
        categories: {
          create: categories.map((cat) => ({
            categoryId: cat.id,
          })),
        },
      },
      include: {
        categories: {
          include: { category: true },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Product created successfully",
        product,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Product creation failed:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
