"use server";

import crypto from "crypto";

import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { emailTemplates, sendMail } from "@/lib/mail";

export async function requestPasswordResetAction(email: string) {
  const parsed = z.string().email().safeParse(email);
  if (!parsed.success) return { success: false, error: "Enter a valid email address." };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.toLowerCase().trim() } });

  // Always report success to avoid leaking which emails are registered.
  if (!user) return { success: true };

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.userToken.create({
    data: { userId: user.id, type: "PASSWORD_RESET", token, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
  });

  const link = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/reset-password/${token}`;
  await sendMail({ to: user.email, ...emailTemplates.passwordReset(link) });

  return { success: true, devLink: process.env.RESEND_API_KEY ? undefined : link };
}

const resetSchema = z.object({ token: z.string(), password: z.string().min(8) });

export async function resetPasswordAction(input: z.infer<typeof resetSchema>) {
  const parsed = resetSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Please choose a password with at least 8 characters." };

  const record = await prisma.userToken.findUnique({ where: { token: parsed.data.token } });
  if (!record || record.type !== "PASSWORD_RESET" || record.expiresAt < new Date()) {
    return { success: false, error: "This reset link is invalid or has expired." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.update({ where: { id: record.userId }, data: { passwordHash } });
  await prisma.userToken.delete({ where: { id: record.id } });

  return { success: true };
}
