import type { OrderEmailPayload } from "@/utils/sendOrderEmail";

const WHATSAPP_RECIPIENT = "94754081108";

export async function sendOrderWhatsApp(order: OrderEmailPayload) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    throw new Error("WhatsApp Cloud API is not configured. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID.");
  }

  const graphApiVersion = process.env.WHATSAPP_GRAPH_API_VERSION || "v23.0";
  const itemLines = order.items.map((item) =>
    `• ${item.name} × ${item.quantity}${item.color ? ` | Color: ${item.color}` : ""}${item.size ? ` | Size: ${item.size}` : ""} — ${(item.price * item.quantity).toFixed(2)}`
  );
  const orderDetails = [
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    `Delivery address: ${order.address}, ${order.city}, ${order.postalCode}, ${order.country}`,
    order.notes ? `Notes: ${order.notes}` : "",
    "",
    "Items:",
    ...itemLines,
    `Total: ${order.orderTotal.toFixed(2)}`,
  ].filter(Boolean).join("\n");

  const templateName = process.env.WHATSAPP_ORDER_TEMPLATE_NAME;
  const payload = templateName
    ? {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: WHATSAPP_RECIPIENT,
        type: "template",
        template: {
          name: templateName,
          language: { code: process.env.WHATSAPP_ORDER_TEMPLATE_LANGUAGE || "en_US" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: order.customerName },
                { type: "text", text: order.phone },
                { type: "text", text: order.orderTotal.toFixed(2) },
                { type: "text", text: orderDetails },
              ],
            },
          ],
        },
      }
    : {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: WHATSAPP_RECIPIENT,
        type: "text",
        text: {
          preview_url: false,
          body: `New GLEAZ website order\n\n${orderDetails}`,
        },
      };

  const response = await fetch(`https://graph.facebook.com/${graphApiVersion}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(result?.error?.message || `WhatsApp Cloud API request failed (${response.status}).`);
  }

  return result;
}
