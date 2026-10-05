import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

const uploadDir = path.join(process.cwd(), "public", "images", "products");

function sanitizeFileName(fileName: string) {
  const normalized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return normalized || `product-${Date.now()}`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No image file uploaded." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const safeName = sanitizeFileName(file.name);
    const fileName = `${Date.now()}-${safeName}`;

    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, fileName), bytes);

    const publicUrl = `/images/products/${fileName}`;

    return NextResponse.json(
      {
        url: publicUrl,
        message: "Image uploaded successfully.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unable to upload image." },
      { status: 500 }
    );
  }
}
