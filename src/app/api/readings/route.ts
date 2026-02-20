import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAccessTier, getReadingLimit } from "@/lib/access";
import type { TempUserWithSubscription } from "@/types/temp-user";

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all readings for this user (no profile filtering in v2)
    const readings = await db.reading.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ readings });
  } catch (error) {
    console.error("[READINGS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch readings. Please try again later." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId },
      include: { subscription: true },
    }) as TempUserWithSubscription | null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has confirmed palm data
    if (!user.palmConfirmed || !user.palmPhotoUrl) {
      return NextResponse.json(
        { error: "Palm not confirmed. Please complete palm setup first." },
        { status: 400 }
      );
    }

    const tier = getAccessTier(user, user.subscription);

    // Check if user has active subscription
    if (tier === "expired") {
      return NextResponse.json(
        { error: "No active subscription. Please subscribe to create readings." },
        { status: 402 }
      );
    }

    // Check monthly reading quota
    const limit = getReadingLimit(tier);
    if (limit !== Infinity) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const count = await db.reading.count({
        where: {
          userId: user.id,
          createdAt: { gte: startOfMonth },
        },
      });

      if (count >= limit) {
        return NextResponse.json(
          { 
            error: "Monthly reading quota exceeded.", 
            upgradeRequired: true,
            currentPlan: tier 
          },
          { status: 429 }
        );
      }
    }

    // Create reading using user's confirmed palm photo
    // @ts-ignore - Temporary ignore during schema migration
    const reading = await db.reading.create({
      data: {
        userId: user.id,
        imageUrl: user.palmPhotoUrl, // Use user's confirmed palm photo
      },
    });

    // Enqueue AI analysis job
    const { enqueueAnalysisJob } = await import("@/lib/queue");
    await enqueueAnalysisJob({
      readingId: reading.id,
      imageUrl: user.palmPhotoUrl!,
      userId: user.id,
    });

    return NextResponse.json({ reading }, { status: 201 });
  } catch (error) {
    console.error("[READINGS_POST_ERROR]", error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    
    if (error instanceof Error && error.message.includes("R2")) {
      return NextResponse.json(
        { error: "Failed to upload image. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create reading. Please try again later." },
      { status: 500 }
    );
  }
}
