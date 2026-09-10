import { getServerSession } from "next-auth";
import Link from "next/link";
import { Bell } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!notifications.length) {
    return <p className="rounded-[1.75rem] border border-[#eadac2] bg-white p-10 text-center text-[#5d4d45]">No notifications yet.</p>;
  }

  return (
    <div className="space-y-3">
      {notifications.map((n) => (
        <Link
          key={n.id}
          href={n.href ?? "#"}
          className={`flex items-start gap-3 rounded-[1.25rem] border p-4 ${n.isRead ? "border-[#eadac2] bg-white" : "border-[#c49242] bg-[#faf3e9]"}`}
        >
          <Bell size={16} className="mt-0.5 text-[#c49242]" />
          <div>
            <p className="font-medium text-[#1b120d]">{n.title}</p>
            <p className="mt-1 text-sm text-[#5d4d45]">{n.body}</p>
            <p className="mt-1 text-xs text-[#8a7469]">{n.createdAt.toLocaleDateString()}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
