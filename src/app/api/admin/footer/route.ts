import { NextRequest, NextResponse } from "next/server";
import { getLandingSettings, saveLandingSettings } from "@/lib/storeData";
import { readStore, writeStore } from "@/lib/storeData";

export async function GET() {
  try {
    const store = await readStore();
    return NextResponse.json({ footer: store.footer || {} }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unable to load footer settings." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const store = await readStore();
    const nextStore = { ...store, footer: { ...(store.footer || {}), ...(body || {}) } };
    await writeStore(nextStore as any);
    return NextResponse.json({ footer: nextStore.footer, message: "Footer updated successfully." }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unable to save footer settings." }, { status: 500 });
  }
}
