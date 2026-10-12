import { NextRequest, NextResponse } from "next/server";
import { getProducts, saveProducts } from "@/lib/storeData";
import type { ProductColorVariant } from "@/types/product";

function parseColorVariants(value: unknown): ProductColorVariant[] | undefined {
  if (!Array.isArray(value)) return undefined;

  return value.map((variant) => ({
    name: String(variant?.name || "").trim(),
    color: String(variant?.color || "").trim(),
    price: String(variant?.price || "").trim(),
    images: Array.isArray(variant?.images)
      ? variant.images.map((image: unknown) => String(image || "").trim()).filter(Boolean)
      : [],
  }));
}

function hasInvalidColorVariant(variants: ProductColorVariant[]) {
  return variants.some((variant) =>
    !variant.name || !variant.color || !variant.price || variant.images.length === 0
  );
}

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json({ products }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unable to load products." },
      { status: 503 }
    );
  }
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
    const images = Array.isArray(body?.images)
      ? body.images.map((image: unknown) => String(image || "").trim()).filter(Boolean)
      : [];
    const colorVariants = parseColorVariants(body?.colorVariants);

    if (colorVariants && (!colorVariants.length || hasInvalidColorVariant(colorVariants))) {
      return NextResponse.json(
        { error: "Every color needs a name, color, price, and at least one image." },
        { status: 400 }
      );
    }

    const variantImages = colorVariants?.flatMap((variant) => variant.images) || [];
    const productImages = variantImages.length ? Array.from(new Set(variantImages)) : images;
    const primaryImage = productImages[0] || String(body?.image || "").trim();

    const product = {
      id: body?.id || crypto.randomUUID(),
      name: String(body?.name || "").trim(),
      category: body?.category || "women",
      price: String(colorVariants?.[0]?.price || body?.price || "").trim(),
      image: primaryImage,
      images: productImages.length ? productImages : primaryImage ? [primaryImage] : [],
      badge: String(body?.badge || "In stock").trim(),
      tone: colorVariants?.[0]?.color || colors[0] || String(body?.tone || "#d9b0a8").trim(),
      slug: String(body?.slug || body?.name || "product").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: String(body?.description || "").trim(),
      sizes,
      colors: colorVariants?.map((variant) => variant.color) || (colors.length ? colors : [String(body?.tone || "#d9b0a8").trim()]),
      ...(colorVariants ? { colorVariants } : {}),
      discountPercentage: Number.isFinite(discountPercentage) && discountPercentage > 0 ? Math.min(discountPercentage, 100) : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!product.name || !product.price || !product.image) {
      return NextResponse.json({ error: "Name, price, and at least one image are required." }, { status: 400 });
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
    const colorVariants = parseColorVariants(
      body?.colorVariants ?? products[index]?.colorVariants
    );

    if (colorVariants && (!colorVariants.length || hasInvalidColorVariant(colorVariants))) {
      return NextResponse.json(
        { error: "Every color needs a name, color, price, and at least one image." },
        { status: 400 }
      );
    }

    const images = Array.isArray(body?.images)
      ? body.images.map((image: unknown) => String(image || "").trim()).filter(Boolean)
      : Array.isArray(products[index]?.images) && products[index].images!.length
        ? products[index].images!
        : products[index]?.image
          ? [products[index].image]
          : [];
    const variantImages = colorVariants?.flatMap((variant) => variant.images) || [];
    const productImages = variantImages.length ? Array.from(new Set(variantImages)) : images;
    const primaryImage = productImages[0] || String(body?.image || products[index]?.image || "").trim();

    const updatedProduct = {
      ...products[index],
      ...body,
      id: productId,
      price: String(colorVariants?.[0]?.price || body?.price || products[index]?.price || "").trim(),
      image: primaryImage,
      images: productImages.length ? productImages : primaryImage ? [primaryImage] : [],
      slug:
        String(body?.slug || products[index].slug || products[index].name)
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-"),
      sizes,
      colors: colorVariants?.map((variant) => variant.color) || (colors.length ? colors : [String(body?.tone || products[index]?.tone || "#d9b0a8").trim()]),
      ...(colorVariants ? { colorVariants } : {}),
      tone: colorVariants?.[0]?.color || colors[0] || String(body?.tone || products[index]?.tone || "#d9b0a8").trim(),
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
