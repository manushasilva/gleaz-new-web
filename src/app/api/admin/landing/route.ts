import { NextRequest, NextResponse } from "next/server";
import { getLandingSettings, saveLandingSettings } from "@/lib/storeData";

export async function GET() {
  try {
    const landing = await getLandingSettings();
    return NextResponse.json({ landing }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unable to load landing page settings." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const landing = await saveLandingSettings({
      heroTitle: String(body?.heroTitle ?? "").trim(),
      heroSubtitle: String(body?.heroSubtitle ?? "").trim(),
      heroImage: String(body?.heroImage ?? "").trim(),
      heroBadge: String(body?.heroBadge ?? "").trim(),
      ctaText: String(body?.ctaText ?? "").trim(),
      ctaLink: String(body?.ctaLink ?? "").trim(),
      womenSectionTitle: String(body?.womenSectionTitle ?? "").trim(),
      menSectionTitle: String(body?.menSectionTitle ?? "").trim(),
    });

    return NextResponse.json({ landing, message: "Landing page updated successfully." }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unable to save landing page settings." }, { status: 500 });
  }
}
