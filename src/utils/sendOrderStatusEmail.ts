import nodemailer from "nodemailer";

type OrderStatus = "confirmed" | "cancelled";

export async function sendOrderStatusEmail(order: {
  id: string;
  customerName: string;
  email: string;
  status: OrderStatus;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const host = process.env.EMAIL_SERVER_HOST || "smtp.gmail.com";
  const port = Number(process.env.EMAIL_SERVER_PORT || 465);
  const user = process.env.EMAIL_SERVER_USER || "gleaz.fashion@gmail.com";
  const password = process.env.EMAIL_SERVER_PASSWORD;
  const sender = process.env.EMAIL_FROM || user;

  if (!resendApiKey && (!password || password === "your_gmail_app_password")) {
    throw new Error("Order status email was not sent: email settings are not configured.");
  }

  const statusLabel = order.status === "confirmed" ? "confirmed" : "cancelled";
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111827;">
      <h1 style="color:#111827;">Your GLEAZ order has been ${statusLabel}</h1>
      <p>Hi ${escapeHtml(order.customerName)},</p>
      <p>Your order <strong>${escapeHtml(order.id)}</strong> has been ${statusLabel} by our team.</p>
      <p>If you have questions, please reply to this email.</p>
    </div>
  `;

  if (resendApiKey) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender,
        to: order.email,
        subject: `Your GLEAZ order has been ${statusLabel}`,
        html,
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
    to: order.email,
    subject: `Your GLEAZ order has been ${statusLabel}`,
    html,
  });
}
