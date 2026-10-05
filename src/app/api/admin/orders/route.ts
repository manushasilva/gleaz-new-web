import { NextResponse } from "next/server";
import { readStore } from "@/lib/storeData";

export const runtime = "nodejs";

export async function GET() {
  try {
    const store = await readStore();
    return NextResponse.json({ orders: store.orders || [] }, { status: 200 });
  } catch (error: any) {
    console.error("Failed to load orders", error);
    return NextResponse.json({ error: error?.message || "Unable to load orders." }, { status: 500 });
  }
}
