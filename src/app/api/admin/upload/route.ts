import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function sanitizeFileName(fileName: string) {
  const normalized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return normalized || `product-${Date.now()}`;
}

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Image storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No image file uploaded." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "product-images";
    const objectPath = `products/${Date.now()}-${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(objectPath, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Supabase Storage upload failed: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);

    return NextResponse.json(
      {
        url: data.publicUrl,
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
