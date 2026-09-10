import Link from "next/link";
import { getServerSession } from "next-auth";
import { Star } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AccountReviewsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const reviews = await prisma.review.findMany({
    where: { userId: session.user.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  if (!reviews.length) {
    return <p className="rounded-[1.75rem] border border-[#eadac2] bg-white p-10 text-center text-[#5d4d45]">You haven&apos;t written any reviews yet.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
          <div className="flex items-center justify-between">
            <Link href={`/product/${review.product.slug}`} className="font-medium text-[#1b120d]">
              {review.product.name}
            </Link>
            <span
              className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.1em] ${review.approved ? "bg-[#eaf3e6] text-[#3e5c37]" : "bg-[#f5e7d7] text-[#7a5a2e]"}`}
            >
              {review.approved ? "Published" : "Pending approval"}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[#d4aa67]">
            {[...Array(review.rating)].map((_, i) => (
              <Star key={i} size={13} fill="currentColor" />
            ))}
          </div>
          <p className="mt-2 text-sm text-[#5d4d45]">{review.content}</p>
        </div>
      ))}
    </div>
  );
}
