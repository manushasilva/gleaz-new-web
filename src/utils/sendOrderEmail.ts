import nodemailer from "nodemailer";
import { formatPrice } from "@/utils/formatePrice";

export type OrderEmailPayload = {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  notes?: string;
  orderTotal: number;
  items: Array<{
    id: string | number;
    name: string;
    quantity: number;
    price: number;
    color?: string;
    size?: string;
  }>;
};

export async function sendOrderEmail(order: OrderEmailPayload) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const host = process.env.EMAIL_SERVER_HOST || "smtp.gmail.com";
  const port = Number(process.env.EMAIL_SERVER_PORT || 465);
  const user = process.env.EMAIL_SERVER_USER || "gleaz.fashion@gmail.com";
  const password = process.env.EMAIL_SERVER_PASSWORD;
  const sender = process.env.EMAIL_FROM || user;
  const storeEmailsRaw = process.env.ORDER_NOTIFICATION_EMAILS || process.env.ADMIN_EMAILS || user;
  const storeEmails = storeEmailsRaw.split(",").map((s) => s.trim()).filter(Boolean);

  if (!resendApiKey && (!password || password === "your_gmail_app_password")) {
    console.warn("Order emails were not sent: EMAIL_SERVER_PASSWORD is not configured.");
    return { customerSent: false, storeSent: false };
  }

  const sendEmail = async (message: {
    to: string | string[];
    subject: string;
    html: string;
    replyTo?: string;
  }) => {
    if (resendApiKey) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: sender,
          to: message.to,
          subject: message.subject,
          html: message.html,
          ...(message.replyTo ? { reply_to: message.replyTo } : {}),
        }),
      });

      if (!response.ok) {
        const responseBody = await response.text();
        throw new Error(`Resend rejected the email (${response.status}): ${responseBody}`);
      }
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: password },
    });
    await transporter.sendMail({
      from: sender,
      to: message.to,
      subject: message.subject,
      html: message.html,
      ...(message.replyTo ? { replyTo: message.replyTo } : {}),
    });
  };

  const escapeHtml = (value: unknown) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const itemRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 8px;border-bottom:1px solid #f1f5f9;">${escapeHtml(item.name)}</td>
          <td style="padding:12px 8px;border-bottom:1px solid #f1f5f9;">${escapeHtml(item.quantity)}</td>
          <td style="padding:12px 8px;border-bottom:1px solid #f1f5f9;">${escapeHtml(item.color || "-")}</td>
          <td style="padding:12px 8px;border-bottom:1px solid #f1f5f9;">${escapeHtml(item.size || "-")}</td>
          <td style="padding:12px 8px;border-bottom:1px solid #f1f5f9;">${formatPrice(item.price * item.quantity)}</td>
        </tr>
      `
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;padding:24px;color:#111827;">
      <h1 style="margin-bottom:16px;color:#111827;">New GLEAZ Order</h1>
      <p style="margin:0 0 20px;">A new order has been placed from the website.</p>

      <h2 style="margin-bottom:12px;font-size:18px;">Customer details</h2>
      <p><strong>Name:</strong> ${escapeHtml(order.customerName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(order.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(order.phone)}</p>
      <p><strong>Address:</strong> ${escapeHtml(order.address)}</p>
      <p><strong>City:</strong> ${escapeHtml(order.city)}</p>
      <p><strong>Postal code:</strong> ${escapeHtml(order.postalCode)}</p>
      <p><strong>Country:</strong> ${escapeHtml(order.country)}</p>
      <p><strong>Notes:</strong> ${escapeHtml(order.notes || "None")}</p>

      <h2 style="margin:24px 0 12px;font-size:18px;">Order summary</h2>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;">
        <thead>
          <tr style="background:#f8fafc;">
            <th align="left" style="padding:12px 8px;">Item</th>
            <th align="left" style="padding:12px 8px;">Qty</th>
            <th align="left" style="padding:12px 8px;">Color</th>
            <th align="left" style="padding:12px 8px;">Size</th>
            <th align="left" style="padding:12px 8px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <p style="margin-top:20px;font-size:18px;font-weight:700;">Total: ${formatPrice(order.orderTotal)}</p>
    </div>
  `;

  let storeSent = false;
  let customerSent = false;

  try {
    await sendEmail({
      to: storeEmails,
      replyTo: order.email,
      subject: `New GLEAZ Order from ${order.customerName}`,
      html,
    });
    storeSent = true;
  } catch (err) {
    console.warn("Failed sending order notification to store:", err);
  }

  try {
    const customerHtml = `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;padding:24px;color:#111827;">
        <h1 style="margin-bottom:16px;color:#111827;">Order confirmation</h1>
        <p>Hi ${escapeHtml(order.customerName)},</p>
        <p>Thanks for your order! Here are your order details:</p>
        ${html}
      </div>
    `;

    await sendEmail({
      to: order.email,
      subject: `Your GLEAZ order confirmation`,
      html: customerHtml,
    });
    customerSent = true;
  } catch (err) {
    console.warn("Failed sending order confirmation to customer:", err);
  }

  return { customerSent, storeSent };
}
