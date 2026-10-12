import { NextRequest, NextResponse } from "next/server";
import { getVouchers } from "@/lib/storeData";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vouchers = await getVouchers();
    const voucher = vouchers.find((item) => item.id === id);

    if (!voucher) {
      return NextResponse.json({ error: "Gift voucher not found." }, { status: 404 });
    }

    return NextResponse.json({ voucher }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load gift voucher." },
      { status: 500 }
    );
  }
}
