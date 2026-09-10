import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddressManager } from "@/components/account/address-manager";

export default async function AddressesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return <AddressManager addresses={addresses} />;
}
