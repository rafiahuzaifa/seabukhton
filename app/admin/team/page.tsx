import { getServerSession } from "next-auth";

import { TeamManager } from "@/components/admin/team-manager";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminTeamPage() {
  const session = await getServerSession(authOptions);
  const users = await prisma.user.findMany({
    where: { OR: [{ role: "ADMIN" }, { role: "STAFF" }] },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">People</p>
        <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b120d]">Team & roles</h1>
      </div>
      <TeamManager
        users={users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, isActive: u.isActive }))}
        currentUserId={session?.user?.id ?? ""}
        canManage={session?.user?.role === "ADMIN"}
      />
    </div>
  );
}
