import { NextRequest, NextResponse } from "next/server";
import { getUserForSession, readStore, updateOrderStatus } from "@/lib/storeData";
import { sendOrderStatusEmail } from "@/utils/sendOrderStatusEmail";

export const runtime = "nodejs";

async function getAdmin(req: NextRequest) {
  const token = req.cookies.get("gleaz-session")?.value;
  const user = token ? await getUserForSession(token) : null;
  return user?.role === "admin" ? user : null;
}

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const store = await readStore();
    return NextResponse.json({ orders: store.orders || [] }, { status: 200 });
  } catch (error: any) {
    console.error("Failed to load orders", error);
    return NextResponse.json({ error: error?.message || "Unable to load orders." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const orderId = String(body?.orderId || "").trim();
    const status = body?.status;
    if (!orderId || (status !== "confirmed" && status !== "cancelled")) {
      return NextResponse.json(
        { error: "A valid order ID and status are required." },
        { status: 400 }
      );
    }

    const store = await readStore();
    const existingOrder = store.orders.find((order) => order.id === orderId);
    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const currentStatus = existingOrder.status || "pending";
    if (
      currentStatus === "cancelled" ||
      (status === "confirmed" && currentStatus !== "pending") ||
      currentStatus === status
    ) {
      return NextResponse.json(
        { error: `This order cannot be changed from ${currentStatus} to ${status}.` },
        { status: 409 }
      );
    }

    const order = await updateOrderStatus(orderId, status);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    try {
      await sendOrderStatusEmail({
        id: order.id,
        customerName: order.customerName,
        email: order.email,
        status,
      });
      return NextResponse.json({ order, notificationSent: true });
    } catch (notificationError) {
      console.error("Order status was updated, but customer email notification failed:", notificationError);
      return NextResponse.json({
        order,
        notificationSent: false,
        notificationError:
          notificationError instanceof Error
            ? notificationError.message
            : "Unable to notify the customer.",
      });
    }
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update order status." },
      { status: 500 }
    );
  }
}
