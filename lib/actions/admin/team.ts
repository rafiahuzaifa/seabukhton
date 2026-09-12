"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

const roleSchema = z.enum(["CUSTOMER", "STAFF", "ADMIN"]);

export async function updateUserRoleAction(userId: string, role: string) {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Only admins can change roles." };

  if (userId === session.user.id) return { success: false, error: "You can't change your own role." };

  const parsed = roleSchema.safeParse(role);
  if (!parsed.success) return { success: false, error: "Invalid role." };

  await prisma.user.update({ where: { id: userId }, data: { role: parsed.data } });
  await prisma.auditLog.create({
    data: { userId: session.user.id, action: "USER_ROLE_UPDATED", entityType: "User", entityId: userId, details: { role: parsed.data } },
  });

  revalidatePath("/admin/team");
  return { success: true };
}

const inviteSchema = z.object({ name: z.string().min(2), email: z.string().email(), role: roleSchema });

export async function inviteStaffAction(input: z.infer<typeof inviteSchema>) {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Only admins can add team members." };

  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Please complete all fields." };

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({ where: { email }, data: { role: parsed.data.role } });
  } else {
    const crypto = await import("crypto");
    const bcrypt = await import("bcryptjs");
    const tempPassword = crypto.randomBytes(9).toString("base64url");
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email,
        role: parsed.data.role,
        passwordHash: await bcrypt.hash(tempPassword, 12),
      },
    });
    revalidatePath("/admin/team");
    return { success: true, tempPassword };
  }

  revalidatePath("/admin/team");
  return { success: true };
}
