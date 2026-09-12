import { SettingsForm } from "@/components/admin/settings-form";
import { prisma } from "@/lib/prisma";

export default async function AdminSettingsPage() {
  const rows = await prisma.siteSetting.findMany();
  const initial = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">Configuration</p>
        <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b120d]">Site settings</h1>
      </div>
      <SettingsForm initial={initial} />
    </div>
  );
}
