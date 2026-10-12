import { NextRequest, NextResponse } from "next/server";
import { getVouchers, saveVouchers } from "@/lib/storeData";

export async function GET() {
  try {
    const vouchers = await getVouchers();
    return NextResponse.json({ vouchers }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load gift vouchers." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body?.name || "").trim();
    const description = String(body?.description || "").trim();
    const amount = Number(body?.amount);
    const image = String(body?.image || "").trim();

    if (!name || !image || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Voucher name, a positive amount, and an image are required." },
        { status: 400 }
      );
    }

    const vouchers = await getVouchers();
    const now = new Date().toISOString();
    const voucher = {
      id: crypto.randomUUID(),
      name,
      description,
      amount,
      image,
      createdAt: now,
      updatedAt: now,
    };

    await saveVouchers([voucher, ...vouchers]);
    return NextResponse.json(
      { voucher, message: "Gift voucher created successfully." },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create gift voucher." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const id = String(body?.id || "").trim();

    if (!id) {
      return NextResponse.json({ error: "Voucher id is required." }, { status: 400 });
    }

    const vouchers = await getVouchers();
    const index = vouchers.findIndex((voucher) => voucher.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Gift voucher not found." }, { status: 404 });
    }

    const name = String(body?.name || "").trim();
    const description = String(body?.description || "").trim();
    const amount = Number(body?.amount);
    const image = String(body?.image || "").trim();

    if (!name || !image || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Voucher name, a positive amount, and an image are required." },
        { status: 400 }
      );
    }

    const voucher = {
      ...vouchers[index],
      name,
      description,
      amount,
      image,
      updatedAt: new Date().toISOString(),
    };
    vouchers[index] = voucher;

    await saveVouchers(vouchers);
    return NextResponse.json({ voucher, message: "Gift voucher updated successfully." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update gift voucher." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const id = String(body?.id || "").trim();

    if (!id) {
      return NextResponse.json({ error: "Voucher id is required." }, { status: 400 });
    }

    const vouchers = await getVouchers();
    const nextVouchers = vouchers.filter((voucher) => voucher.id !== id);

    if (nextVouchers.length === vouchers.length) {
      return NextResponse.json({ error: "Gift voucher not found." }, { status: 404 });
    }

    await saveVouchers(nextVouchers);
    return NextResponse.json({ message: "Gift voucher deleted successfully." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete gift voucher." },
      { status: 500 }
    );
  }
}
