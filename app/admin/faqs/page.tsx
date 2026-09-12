import { FaqManager } from "@/components/admin/faq-manager";
import { prisma } from "@/lib/prisma";

export default async function AdminFaqsPage() {
  const faqs = await prisma.fAQ.findMany({ where: { productId: null }, orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">Content</p>
        <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b120d]">Site FAQs</h1>
      </div>
      <FaqManager faqs={faqs} />
    </div>
  );
}
