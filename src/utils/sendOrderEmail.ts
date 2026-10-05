import nodemailer from "nodemailer";

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
  const host = process.env.EMAIL_SERVER_HOST || "smtp.gmail.com";
  const port = Number(process.env.EMAIL_SERVER_PORT || 465);
  const user = process.env.EMAIL_SERVER_USER || "gleaz.fashion@gmail.com";
  const password = process.env.EMAIL_SERVER_PASSWORD;
  const sender = process.env.EMAIL_FROM || user;
  const adminEmailsRaw = process.env.ADMIN_EMAILS || user;
  const adminEmails = adminEmailsRaw.split(",").map((s) => s.trim()).filter(Boolean);

  if (!password || password === "your_gmail_app_password") {
    throw new Error("Set EMAIL_SERVER_PASSWORD to your Gmail app password before sending orders.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass: password,
    },
  });

  const itemRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 8px;border-bottom:1px solid #f1f5f9;">${item.name}</td>
          <td style="padding:12px 8px;border-bottom:1px solid #f1f5f9;">${item.quantity}</td>
          <td style="padding:12px 8px;border-bottom:1px solid #f1f5f9;">${item.color || "-"}</td>
          <td style="padding:12px 8px;border-bottom:1px solid #f1f5f9;">${item.size || "-"}</td>
          <td style="padding:12px 8px;border-bottom:1px solid #f1f5f9;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;padding:24px;color:#111827;">
      <h1 style="margin-bottom:16px;color:#111827;">New GLEAZ Order</h1>
      <p style="margin:0 0 20px;">A new order has been placed from the website.</p>

      <h2 style="margin-bottom:12px;font-size:18px;">Customer details</h2>
      <p><strong>Name:</strong> ${order.customerName}</p>
      <p><strong>Email:</strong> ${order.email}</p>
      <p><strong>Phone:</strong> ${order.phone}</p>
      <p><strong>Address:</strong> ${order.address}</p>
      <p><strong>City:</strong> ${order.city}</p>
      <p><strong>Postal code:</strong> ${order.postalCode}</p>
      <p><strong>Country:</strong> ${order.country}</p>
      <p><strong>Notes:</strong> ${order.notes || "None"}</p>

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

      <p style="margin-top:20px;font-size:18px;font-weight:700;">Total: $${order.orderTotal.toFixed(2)}</p>
    </div>
  `;

  // send to admin recipients
  try {
    await transporter.sendMail({
      from: sender,
      to: adminEmails.join(", "),
      replyTo: order.email,
      subject: `New GLEAZ Order from ${order.customerName}`,
      html,
    });
  } catch (err) {
    console.warn("Failed sending order email to admin:", err);
    throw err;
  }

  // also send confirmation email to customer
  try {
    const customerHtml = `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;padding:24px;color:#111827;">
        <h1 style="margin-bottom:16px;color:#111827;">Order confirmation</h1>
        <p>Hi ${order.customerName},</p>
        <p>Thanks for your order! Here are your order details:</p>
        ${html}
      </div>
    `;

    await transporter.sendMail({
      from: sender,
      to: order.email,
      subject: `Your GLEAZ order (${order.customerName})`,
      html: customerHtml,
    });
  } catch (err) {
    console.warn("Failed sending order confirmation to customer:", err);
    // don't block order saving if customer email fails; rethrow if you prefer
  }
}
