import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { validateCoupon } from "@/lib/coupons";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const subtotal = Number(searchParams.get("subtotal") ?? 0);

  if (!code) return NextResponse.json({ valid: false, error: "Enter a coupon code." });

  const session = await getServerSession(authOptions);
  const result = await validateCoupon(code, subtotal, session?.user?.id);

  if (!result.valid) return NextResponse.json({ valid: false, error: result.error });

  return NextResponse.json({ valid: true, discount: result.discount, code: result.coupon.code, type: result.coupon.type });
}
