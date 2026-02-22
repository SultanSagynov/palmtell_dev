import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createLemonSqueezyCheckout } from "@/lib/lemonsqueezy";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { plan, interval } = body as { plan: 'basic' | 'pro' | 'ultimate', interval: 'month' | 'year' | 'onetime' };

  let user = await db.user.findUnique({
    where: { clerkId },
    include: { subscription: true },
  });

  if (!user) {
    // User not in DB — Clerk webhook may have failed; create user now
    try {
      const { clerkClient } = await import("@clerk/nextjs/server");
      const clerkUser = await (await clerkClient()).users.getUser(clerkId);
      const email = clerkUser.emailAddresses[0]?.emailAddress;

      if (!email) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const name = [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join(" ") || null;

      user = await db.user.create({
        data: {
          clerkId,
          email,
          name,
          profiles: {
            create: {
              name: "Me",
              isDefault: true,
            },
          },
        },
        include: { subscription: true },
      });
    } catch (createError) {
      console.error("Failed to auto-create user for checkout:", createError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  }

  try {
    // Block re-purchase of basic if already bought
    if (plan === 'basic' && user.subscription?.plan === 'basic' && user.subscription.status === 'active') {
      return NextResponse.json({
        error: "You already have the Basic reading. Upgrade to Pro or Ultimate for more features.",
        alreadyOwned: true,
      }, { status: 409 });
    }

    // Handle existing subscription - Lemon Squeezy requires manual cancellation for plan changes
    if (user.subscription?.lsSubscriptionId && user.subscription.status === 'active' && plan !== 'basic') {
      const planHierarchy = { pro: 1, ultimate: 2 };
      const currentTier = planHierarchy[user.subscription.plan as keyof typeof planHierarchy] || 0;
      const newTier = planHierarchy[plan as keyof typeof planHierarchy] || 0;

      if (currentTier !== newTier) {
        return NextResponse.json({
          error: "Plan change requires canceling current subscription first",
          requiresCancellation: true,
          currentPlan: user.subscription.plan,
          newPlan: plan
        }, { status: 409 });
      }
    }

    const checkoutUrl = await createLemonSqueezyCheckout({
      plan,
      interval,
      userId: user.id,
      userEmail: user.email,
    });

    return NextResponse.json({ checkoutUrl, url: checkoutUrl }); // Return both for compatibility
  } catch (error) {
    console.error("Lemon Squeezy checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
