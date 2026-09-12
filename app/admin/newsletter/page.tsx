import { NewsletterRow } from "@/components/admin/newsletter-row";
import { prisma } from "@/lib/prisma";

export default async function AdminNewsletterPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({ orderBy: { subscribedAt: "desc" } });

  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">Marketing</p>
        <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b120d]">Newsletter subscribers</h1>
        <p className="mt-1 text-sm text-[#7a6356]">{subscribers.length} subscriber{subscribers.length === 1 ? "" : "s"}</p>
      </div>

      <div className="overflow-x-auto rounded-[1.5rem] border border-[#eadac2] bg-white">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#eadac2] text-xs uppercase tracking-[0.1em] text-[#8a7469]">
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Subscribed</th>
              <th className="px-5 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <NewsletterRow key={s.id} id={s.id} email={s.email} subscribedAt={s.subscribedAt.toLocaleDateString()} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
