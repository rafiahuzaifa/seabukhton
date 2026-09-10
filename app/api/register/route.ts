import crypto from "crypto";

import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { emailTemplates, sendMail } from "@/lib/mail";

const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      role: "CUSTOMER",
    },
  });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.userToken.create({
    data: { userId: user.id, type: "EMAIL_VERIFICATION", token, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
  });

  const verifyLink = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/verify-email?token=${token}`;
  await sendMail({ to: normalizedEmail, ...emailTemplates.welcome(name) });
  await sendMail({ to: normalizedEmail, ...emailTemplates.verifyEmail(verifyLink) });

  return NextResponse.json({ success: true });
}
