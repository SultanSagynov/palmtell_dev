import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAccessTier, getReadingLimit } from "@/lib/access";
import type { TempUserWithSubscription } from "@/types/temp-user";

/**
 * DEBUG endpoint for subscription status
 * Shows detailed subscription information
 */
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
    
    return NextResponse.json({
      userId: user.id,
      clerkId: user.clerkId,
      email: user.email,
      createdAt: user.createdAt,
      tier,
      readingLimit: getReadingLimit(tier),
      palmConfirmed: user.palmConfirmed || false,
      palmPhotoUrl: user.palmPhotoUrl || null,
      dob: user.dob?.toISOString() || null,
      subscription: user.subscription ? {
        id: user.subscription.id,
        plan: user.subscription.plan,
        status: user.subscription.status,
        lsCustomerId: user.subscription.lsCustomerId,
        lsSubscriptionId: user.subscription.lsSubscriptionId,
        renewsAt: user.subscription.renewsAt?.toISOString(),
        endsAt: user.subscription.endsAt?.toISOString(),
      } : null,
    });
  } catch (error) {
    console.error("Failed to fetch debug info:", error);
    return NextResponse.json(
      { error: "Failed to fetch debug information" },
      { status: 500 }
    );
  }
}
