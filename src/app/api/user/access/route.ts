import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAccessTier, getProfileLimit, getReadingLimit } from "@/lib/access";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await db.user.findUnique({
      where: { clerkId },
      include: { subscription: true },
    });

    if (!user) {
      // User not in DB — try to auto-create from Clerk (webhook may have failed)
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
        const newUser = await db.user.create({
          data: {
            clerkId,
            email,
            name,
            profiles: { create: { name: "Me", isDefault: true } },
          },
          include: { subscription: true },
        });
        const tier = getAccessTier(newUser, newUser.subscription);
        return NextResponse.json({
          tier,
          accessTier: tier,
          profileLimit: getProfileLimit(tier),
          readingLimit: getReadingLimit(tier),
          palmConfirmed: newUser.palmConfirmed,
          dob: null,
          subscription: null,
        });
      } catch {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    const tier = getAccessTier(user, user.subscription);
    const profileLimit = getProfileLimit(tier);
    const readingLimit = getReadingLimit(tier);

    return NextResponse.json({
      tier,
      accessTier: tier,
      profileLimit,
      readingLimit,
      palmConfirmed: user.palmConfirmed,
      dob: user.dob ? user.dob.toISOString() : null,
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
