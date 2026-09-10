import { ReviewModerationRow } from "@/components/admin/review-moderation-row";
import { prisma } from "@/lib/prisma";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: { product: true, user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">Community</p>
        <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b120d]">Reviews</h1>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewModerationRow
            key={review.id}
            id={review.id}
            productName={review.product.name}
            userName={review.user.name}
            rating={review.rating}
            content={review.content}
            verified={review.verified}
            approved={review.approved}
            featured={review.featured}
          />
        ))}
        {!reviews.length ? <p className="text-sm text-[#7a6356]">No reviews yet.</p> : null}
      </div>
    </div>
  );
}
