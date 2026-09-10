"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";

const schema = z.string().email();

export async function subscribeNewsletterAction(email: string) {
  const parsed = schema.safeParse(email);
  if (!parsed.success) return { success: false, error: "Please enter a valid email address." };

  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data },
    update: {},
    create: { email: parsed.data },
  });

  return { success: true };
}
