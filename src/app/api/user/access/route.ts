import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAccessTier, getReadingLimit } from "@/lib/access";
import type { TempUserWithSubscription } from "@/types/temp-user";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await db.user.findUnique({
      where: { clerkId },
      include: { subscription: true },
    }) as TempUserWithSubscription | null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const tier = getAccessTier(user, user.subscription);
    const readingLimit = getReadingLimit(tier);
    
    return NextResponse.json({
      tier,
      accessTier: tier,
      readingLimit,
      palmConfirmed: user.palmConfirmed,
      palmPhotoUrl: user.palmPhotoUrl,
      dob: user.dob?.toISOString(),
      subscription: user.subscription ? {
        status: user.subscription.status,
        plan: user.subscription.plan,
      } : null,
    });
  } catch (error) {
    console.error("Failed to fetch user access:", error);
    return NextResponse.json(
      { error: "Failed to fetch access information" },
      { status: 500 }
    );
  }
}
