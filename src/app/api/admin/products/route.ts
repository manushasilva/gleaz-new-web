import { NextRequest, NextResponse } from "next/server";
import { getProducts, saveProducts } from "@/lib/storeData";

export async function GET() {
  const products = await getProducts();
  return NextResponse.json({ products }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sizes = Array.isArray(body?.sizes)
      ? body.sizes
          .map((item: any) => String(item || "").trim())
          .filter(Boolean)
      : String(body?.sizes || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

    const colors = Array.isArray(body?.colors)
      ? body.colors
          .map((item: any) => String(item || "").trim())
          .filter(Boolean)
      : String(body?.colors || body?.tone || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

    const discountPercentage = Number(body?.discountPercentage ?? 0);

    const product = {
      id: body?.id || crypto.randomUUID(),
      name: String(body?.name || "").trim(),
      category: body?.category || "women",
      price: String(body?.price || "").trim(),
      image: String(body?.image || "").trim(),
      badge: String(body?.badge || "In stock").trim(),
      tone: colors[0] || String(body?.tone || "#d9b0a8").trim(),
      slug: String(body?.slug || body?.name || "product").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: String(body?.description || "").trim(),
      sizes,
      colors: colors.length ? colors : [String(body?.tone || "#d9b0a8").trim()],
      discountPercentage: Number.isFinite(discountPercentage) && discountPercentage > 0 ? Math.min(discountPercentage, 100) : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!product.name || !product.price || !product.image) {
      return NextResponse.json({ error: "Name, price, and image are required." }, { status: 400 });
    }

    const products = await getProducts();
    const nextProducts = [product, ...products];
    await saveProducts(nextProducts);

    return NextResponse.json({ product, message: "Product created successfully." }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unable to save product." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const productId = String(body?.id || "").trim();

    if (!productId) {
      return NextResponse.json({ error: "Product id is required." }, { status: 400 });
    }

    const products = await getProducts();
    const index = products.findIndex((item) => item.id === productId);

    if (index === -1) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const sizes = Array.isArray(body?.sizes)
      ? body.sizes
          .map((item: any) => String(item || "").trim())
          .filter(Boolean)
      : String(body?.sizes || products[index]?.sizes || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

    const colors = Array.isArray(body?.colors)
      ? body.colors
          .map((item: any) => String(item || "").trim())
          .filter(Boolean)
      : String(body?.colors || body?.tone || products[index]?.colors || products[index]?.tone || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

    const discountPercentage = Number(body?.discountPercentage ?? products[index]?.discountPercentage ?? 0);

    const updatedProduct = {
      ...products[index],
      ...body,
      id: productId,
      slug:
        String(body?.slug || products[index].slug || products[index].name)
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-"),
      sizes,
      colors: colors.length ? colors : [String(body?.tone || products[index]?.tone || "#d9b0a8").trim()],
      tone: colors[0] || String(body?.tone || products[index]?.tone || "#d9b0a8").trim(),
      discountPercentage: Number.isFinite(discountPercentage) && discountPercentage > 0 ? Math.min(discountPercentage, 100) : 0,
      updatedAt: new Date().toISOString(),
    };

    products[index] = updatedProduct;
    await saveProducts(products);

    return NextResponse.json({ product: updatedProduct, message: "Product updated successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unable to update product." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const productId = String(body?.id || "").trim();

    if (!productId) {
      return NextResponse.json({ error: "Product id is required." }, { status: 400 });
    }

    const products = await getProducts();
    const nextProducts = products.filter((item) => item.id !== productId);
    await saveProducts(nextProducts);

    return NextResponse.json({ message: "Product deleted successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unable to delete product." }, { status: 500 });
  }
}
