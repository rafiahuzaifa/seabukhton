import "server-only";

export type MailPayload = { to: string; subject: string; html: string };

/**
 * Transactional email sender. Swap the body for a real Resend/SES call once
 * RESEND_API_KEY is set — every caller (register, password reset, order
 * lifecycle emails) stays unchanged.
 */
export async function sendMail({ to, subject, html }: MailPayload) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`\n[dev email] To: ${to}\nSubject: ${subject}\n${html}\n`);
    return { delivered: false, dev: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: process.env.MAILER_FROM ?? "hello@berriva.com", to, subject, html }),
  });

  return { delivered: res.ok, dev: false };
}

export const emailTemplates = {
  welcome: (name: string) => ({
    subject: "Welcome to BERRIVA",
    html: `<p>Hi ${name},</p><p>Welcome to BERRIVA — The Golden Berry of Wellness. We're glad you're here.</p>`,
  }),
  verifyEmail: (link: string) => ({
    subject: "Verify your BERRIVA account",
    html: `<p>Please verify your email address by visiting the link below:</p><p><a href="${link}">${link}</a></p>`,
  }),
  passwordReset: (link: string) => ({
    subject: "Reset your BERRIVA password",
    html: `<p>You requested a password reset. Visit the link below to choose a new password (valid for 1 hour):</p><p><a href="${link}">${link}</a></p>`,
  }),
  orderConfirmation: (orderNumber: string) => ({
    subject: `Your BERRIVA order ${orderNumber} is confirmed`,
    html: `<p>Thank you for your order! We've received order ${orderNumber} and will begin preparing it shortly.</p>`,
  }),
  orderShipped: (orderNumber: string, trackingCode?: string | null) => ({
    subject: `Your BERRIVA order ${orderNumber} has shipped`,
    html: `<p>Your order ${orderNumber} is on its way.${trackingCode ? ` Tracking code: ${trackingCode}.` : ""}</p>`,
  }),
  orderDelivered: (orderNumber: string) => ({
    subject: `Your BERRIVA order ${orderNumber} has been delivered`,
    html: `<p>Your order ${orderNumber} has been delivered. We hope you love it.</p>`,
  }),
  orderCancelled: (orderNumber: string) => ({
    subject: `Your BERRIVA order ${orderNumber} was cancelled`,
    html: `<p>Your order ${orderNumber} has been cancelled. If this is unexpected, please contact us.</p>`,
  }),
  refundProcessed: (orderNumber: string) => ({
    subject: `Refund processed for order ${orderNumber}`,
    html: `<p>Your refund for order ${orderNumber} has been processed.</p>`,
  }),
  abandonedCart: (name: string) => ({
    subject: "You left something in your bag",
    html: `<p>Hi ${name}, your BERRIVA ritual is still waiting for you. Come back and complete your order.</p>`,
  }),
};
