import { NextRequest, NextResponse } from "next/server";
import { sendOrderEmail } from "@/utils/sendOrderEmail";
import { sendOrderWhatsApp } from "@/utils/sendOrderWhatsApp";
import { OrderValidationError, saveOrder } from "@/lib/storeData";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      customerName,
      email,
      phone,
      address,
      city,
      postalCode,
      country,
      notes,
      items,
      orderTotal,
    } = body;

    if (!customerName || !email || !phone || !address || !city || !postalCode || !country || !items?.length) {
      return NextResponse.json(
        { error: "Please complete all checkout details and add at least one item." },
        { status: 400 }
      );
    }

    const order = {
      id: crypto.randomUUID(),
      customerName,
      email,
      phone,
      address,
      city,
      postalCode,
      country,
      notes,
      items,
      orderTotal: Number(orderTotal || 0),
      createdAt: new Date().toISOString(),
    };

    const savedOrder = await saveOrder(order);

    let emailNotification = { customerSent: false, storeSent: false };
    try {
      emailNotification = await sendOrderEmail({
        customerName: savedOrder.customerName,
        email: savedOrder.email,
        phone: savedOrder.phone,
        address: savedOrder.address,
        city: savedOrder.city,
        postalCode: savedOrder.postalCode,
        country: savedOrder.country,
        notes: savedOrder.notes,
        items: savedOrder.items,
        orderTotal: savedOrder.orderTotal,
      });
    } catch (emailError) {
      console.warn("Order saved, but email notification failed:", emailError);
    }

    let whatsappSent = false;
    try {
      await sendOrderWhatsApp({
        customerName: savedOrder.customerName,
        email: savedOrder.email,
        phone: savedOrder.phone,
        address: savedOrder.address,
        city: savedOrder.city,
        postalCode: savedOrder.postalCode,
        country: savedOrder.country,
        notes: savedOrder.notes,
        items: savedOrder.items,
        orderTotal: savedOrder.orderTotal,
      });
      whatsappSent = true;
    } catch (whatsappError) {
      console.warn("Order saved, but WhatsApp notification failed:", whatsappError);
    }

    return NextResponse.json(
      {
        success: true,
        whatsappSent,
        emailNotification,
        message: "Order sent successfully.",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Order failed:", error);
    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : "Unable to send order right now. Please update your Gmail app password in the environment settings.",
      },
      { status: error instanceof OrderValidationError ? 409 : 500 }
    );
  }
}
