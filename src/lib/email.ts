import "server-only"

// Transactional email through Resend's HTTP API.
//
// No mail dependency is installed on purpose: the app only needs one POST
// request, so `fetch` keeps the bundle small. When `RESEND_API_KEY` is not
// configured the helpers below become no-ops instead of throwing, which means
// a missing mail key can never break an order decision.
const RESEND_ENDPOINT = "https://api.resend.com/emails"

const DEFAULT_FROM = "PizzaHub <onboarding@resend.dev>"

type SendEmailInput = {
  to: string
  subject: string
  html: string
  text?: string
}

export type EmailResult = { ok: true } | { ok: false; error: string }

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY)
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailInput): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY is missing; skipped:", subject)
    return { ok: false, error: "Email is not configured" }
  }

  const recipient = to.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    return { ok: false, error: "Invalid recipient email" }
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || DEFAULT_FROM,
        to: [recipient],
        subject,
        html,
        ...(text ? { text } : {}),
      }),
      cache: "no-store",
    })

    if (!res.ok) {
      const details = await res.text().catch(() => "")
      console.error("[email] Resend rejected the message:", res.status, details)
      return { ok: false, error: "The email service rejected the message" }
    }

    return { ok: true }
  } catch (error) {
    console.error("[email] Could not reach Resend:", error)
    return { ok: false, error: "Could not reach the email service" }
  }
}

// ---------------------------------------------------------------------------
// Order decision notification
// ---------------------------------------------------------------------------

export type OrderDecisionEmail = {
  to: string
  status: "accepted" | "rejected"
  orderId: string
  customerName?: string
  businessName?: string
  items?: { name?: string; quantity?: number; price?: number }[]
  total?: number
  delivery?: { address?: string; date?: string; note?: string }
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) => HTML_ESCAPES[char] ?? char
  )
}

function money(value?: number) {
  const amount = Number(value ?? 0)
  return `BDT ${Number.isFinite(amount) ? amount.toFixed(2) : "0.00"}`
}

function formatDeliveryDate(value?: string) {
  if (!value) return ""
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function buildOrderDecisionEmail(input: OrderDecisionEmail) {
  const accepted = input.status === "accepted"
  const shop = input.businessName?.trim() || "The restaurant"
  const greeting = input.customerName?.trim()
    ? `Hi ${input.customerName.trim()},`
    : "Hi there,"

  const subject = accepted
    ? `Your order from ${shop} was accepted`
    : `Your order from ${shop} could not be accepted`

  const intro = accepted
    ? `${shop} accepted your order and will start preparing it soon.`
    : `${shop} is unable to fulfil your order. If you were charged, the amount will be refunded.`

  const itemRows = (input.items ?? [])
    .map((item) => {
      const quantity = Number(item.quantity ?? 0)
      const price = Number(item.price ?? 0)
      return `<tr>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;">${escapeHtml(item.name)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;">${quantity}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">${escapeHtml(money(price * quantity))}</td>
      </tr>`
    })
    .join("")

  const deliveryBits = [
    input.delivery?.address
      ? `<p style="margin:4px 0;color:#7A6258;">Delivery address: ${escapeHtml(input.delivery.address)}</p>`
      : "",
    input.delivery?.date
      ? `<p style="margin:4px 0;color:#7A6258;">Delivery date: ${escapeHtml(formatDeliveryDate(input.delivery.date))}</p>`
      : "",
    input.delivery?.note
      ? `<p style="margin:4px 0;color:#7A6258;">Note: ${escapeHtml(input.delivery.note)}</p>`
      : "",
  ].join("")

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#FFF8EC;font-family:Arial,Helvetica,sans-serif;color:#2B1B14;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px;">
      <p style="margin:0 0 16px;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#2F6B3A;font-weight:bold;">
        PizzaHub
      </p>
      <h1 style="margin:0 0 12px;font-size:22px;color:${accepted ? "#2F6B3A" : "#B3261E"};">
        ${accepted ? "Order accepted" : "Order not accepted"}
      </h1>
      <p style="margin:0 0 16px;line-height:1.6;">${escapeHtml(greeting)}</p>
      <p style="margin:0 0 20px;line-height:1.6;">${escapeHtml(intro)}</p>

      <p style="margin:0 0 6px;font-size:13px;color:#7A6258;">Order reference</p>
      <p style="margin:0 0 20px;font-family:monospace;font-size:13px;">${escapeHtml(input.orderId)}</p>

      ${
        itemRows
          ? `<table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:12px;">
              <thead>
                <tr>
                  <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #eee;">Item</th>
                  <th style="text-align:center;padding:6px 8px;border-bottom:2px solid #eee;">Qty</th>
                  <th style="text-align:right;padding:6px 8px;border-bottom:2px solid #eee;">Price</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>`
          : ""
      }

      <p style="margin:0 0 20px;font-size:16px;font-weight:bold;">
        Total: ${escapeHtml(money(input.total))}
      </p>

      ${
        deliveryBits
          ? `<div style="padding:12px 14px;background:#FFF8EC;border-radius:12px;font-size:14px;">${deliveryBits}</div>`
          : ""
      }

      <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#7A6258;">
        You can always review your orders in your PizzaHub dashboard.
      </p>
    </div>
  </body>
</html>`

  const text = [
    greeting,
    "",
    intro,
    "",
    `Order reference: ${input.orderId}`,
    ...(input.items ?? []).map(
      (item) =>
        `- ${item.name} x${Number(item.quantity ?? 0)} (${money(
          Number(item.price ?? 0) * Number(item.quantity ?? 0)
        )})`
    ),
    `Total: ${money(input.total)}`,
    ...(input.delivery?.address
      ? [`Delivery address: ${input.delivery.address}`]
      : []),
    ...(input.delivery?.date
      ? [`Delivery date: ${formatDeliveryDate(input.delivery.date)}`]
      : []),
    "",
    "You can always review your orders in your PizzaHub dashboard.",
  ].join("\n")

  return { subject, html, text }
}

export async function sendOrderDecisionEmail(
  input: OrderDecisionEmail
): Promise<EmailResult> {
  if (!input.to) return { ok: false, error: "The order has no customer email" }

  const { subject, html, text } = buildOrderDecisionEmail(input)

  return sendEmail({ to: input.to, subject, html, text })
}
