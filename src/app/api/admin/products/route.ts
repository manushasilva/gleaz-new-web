import { NextRequest, NextResponse } from "next/server";
import { getProducts, saveProducts } from "@/lib/storeData";
import type { ProductColorVariant, ProductSizeVariant } from "@/types/product";

function parseSizeVariants(value: unknown): ProductSizeVariant[] | undefined {
  if (!Array.isArray(value)) return undefined;

  return value.map((item) => ({
    size: String(item?.size || "").trim(),
    price: String(item?.price || "").trim(),
    quantity: Number(item?.quantity),
  }));
}

function parseColorVariants(value: unknown): ProductColorVariant[] | undefined {
  if (!Array.isArray(value)) return undefined;

  return value.map((variant) => ({
    itemCode: String(variant?.itemCode || variant?.name || "").trim(),
    name: String(variant?.name || "").trim(),
    color: String(variant?.color || "#d9b0a8").trim(),
    price: String(variant?.price || "").trim(),
    images: Array.isArray(variant?.images)
      ? variant.images.map((image: unknown) => String(image || "").trim()).filter(Boolean)
      : [],
    ...(Array.isArray(variant?.sizeVariants)
      ? { sizeVariants: parseSizeVariants(variant.sizeVariants) }
      : {}),
  }));
}

function hasInvalidColorVariant(variants: ProductColorVariant[]) {
  const itemCodes = variants.map((variant) => variant.itemCode?.toLowerCase());
  return new Set(itemCodes).size !== itemCodes.length || variants.some((variant) => {
    if (
      !variant.itemCode ||
      (!variant.sizeVariants?.length && !variant.price) ||
      variant.images.length === 0
    ) {
      return true;
    }

    if (!variant.sizeVariants?.length) return false;
    const sizeNames = variant.sizeVariants.map((item) => item.size.toLowerCase());
    return (
      new Set(sizeNames).size !== sizeNames.length ||
      variant.sizeVariants.some((item) =>
        !item.size ||
        !item.price ||
        !Number.isFinite(Number(item.price.replace(/[^\d.]/g, ""))) ||
        Number(item.price.replace(/[^\d.]/g, "")) <= 0 ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 0
      )
    );
  });
}

function getProductSizes(colorVariants: ProductColorVariant[] | undefined, fallbackSizes: string[]) {
  if (!colorVariants) return fallbackSizes;
  const seenSizes = new Set<string>();
  return colorVariants.flatMap((variant) =>
    (variant.sizeVariants || []).flatMap((item) => {
      const normalizedSize = item.size.toLowerCase();
      if (seenSizes.has(normalizedSize)) return [];
      seenSizes.add(normalizedSize);
      return [item.size];
    })
  );
}

function getPrimaryPrice(colorVariants: ProductColorVariant[] | undefined, fallbackPrice: unknown) {
  return (
    colorVariants?.find((variant) => variant.sizeVariants?.[0]?.price)?.sizeVariants?.[0]?.price ||
    colorVariants?.find((variant) => variant.price)?.price ||
    String(fallbackPrice || "")
  ).trim();
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
        { error: "Each item variant needs a unique item code and photos, plus a valid price and stock quantity for every selected size." },
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
      price: getPrimaryPrice(colorVariants, body?.price),
      image: primaryImage,
      images: productImages.length ? productImages : primaryImage ? [primaryImage] : [],
      badge: String(body?.badge || "In stock").trim(),
      tone: colorVariants?.[0]?.color || colors[0] || String(body?.tone || "#d9b0a8").trim(),
      slug: String(body?.slug || body?.name || "product").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: String(body?.description || "").trim(),
      sizes: getProductSizes(colorVariants, sizes),
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
        { error: "Each item variant needs a unique item code and photos, plus a valid price and stock quantity for every selected size." },
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
      price: getPrimaryPrice(colorVariants, body?.price || products[index]?.price),
      image: primaryImage,
      images: productImages.length ? productImages : primaryImage ? [primaryImage] : [],
      slug:
        String(body?.slug || products[index].slug || products[index].name)
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-"),
      sizes: getProductSizes(colorVariants, sizes),
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
