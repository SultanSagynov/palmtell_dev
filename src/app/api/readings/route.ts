import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAccessTier, getReadingLimit } from "@/lib/access";

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

    const profileId = req.nextUrl.searchParams.get("profile_id");

    // Validate profile ID if provided
    if (profileId && profileId.trim().length === 0) {
      return NextResponse.json(
        { error: "Invalid profile ID" },
        { status: 400 }
      );
    }

    const readings = await db.reading.findMany({
      where: {
        userId: user.id,
        ...(profileId ? { profileId } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { profile: { select: { name: true, avatarEmoji: true } } },
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
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const tier = getAccessTier(user, user.subscription);

    // Check quota
    if (tier === "expired") {
      return NextResponse.json(
        { error: "Trial expired. Please upgrade." },
        { status: 402 }
      );
    }

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
          { error: "Reading quota reached for this period." },
          { status: 429 }
        );
      }
    }

    // Check if this is a JSON request (temp image flow) or FormData (direct upload)
    const contentType = req.headers.get("content-type");
    let profileId: string;
    let image: File | null = null;
    let tempImageUrl: string | null = null;
    let tempImageKey: string | null = null;

    if (contentType?.includes("application/json")) {
      // Handle temp image flow from Session 5 onboarding
      const body = await req.json();
      profileId = body.profileId;
      tempImageUrl = body.tempImageUrl;
      tempImageKey = body.tempImageKey;

      if (!profileId || profileId.trim().length === 0) {
        return NextResponse.json(
          { error: "Profile ID is required" },
          { status: 400 }
        );
      }

      if (!tempImageUrl || !tempImageKey) {
        return NextResponse.json(
          { error: "Temporary image data is required" },
          { status: 400 }
        );
      }
    } else {
      // Handle direct upload flow
      const formData = await req.formData();
      profileId = formData.get("profileId") as string;
      image = formData.get("image") as File;

      if (!profileId || profileId.trim().length === 0) {
        return NextResponse.json(
          { error: "Profile ID is required" },
          { status: 400 }
        );
      }

      if (!image) {
        return NextResponse.json(
          { error: "Image is required" },
          { status: 400 }
        );
      }
    }

    // Validate image file (only for direct upload)
    if (image) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
      if (!allowedTypes.includes(image.type)) {
        return NextResponse.json(
          { error: "Invalid image type. Please upload JPG, PNG, WEBP, or HEIC." },
          { status: 400 }
        );
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (image.size > maxSize) {
        return NextResponse.json(
          { error: "Image too large. Please upload an image under 10MB." },
          { status: 400 }
        );
      }
    }

    // Verify profile belongs to user
    const profile = await db.profile.findFirst({
      where: { id: profileId, userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Create reading in pending state with placeholder imageUrl
    const reading = await db.reading.create({
      data: {
        userId: user.id,
        profileId,
        imageUrl: "", // Placeholder, will be updated after upload
        status: "pending",
      },
    });

    // Handle image upload or use temp image
    let imageUrl: string;
    
    if (tempImageUrl) {
      // Use existing temp image
      imageUrl = tempImageUrl;
      
      // Move temp image to permanent location
      const { uploadToR2, generateImageKey } = await import("@/lib/r2");
      const imageKey = generateImageKey(user.id, reading.id);
      
      // Copy from temp location to permanent location
      // For now, we'll use the temp URL as-is and clean up later
      imageUrl = tempImageUrl;
    } else if (image) {
      // Upload new image to R2
      const { uploadToR2, generateImageKey } = await import("@/lib/r2");
      const buffer = Buffer.from(await image.arrayBuffer());
      const imageKey = generateImageKey(user.id, reading.id);
      imageUrl = await uploadToR2(buffer, imageKey, image.type);
    } else {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Update reading with image URL
    await db.reading.update({
      where: { id: reading.id },
      data: { imageUrl },
    });

    // Enqueue AI analysis job
    const { enqueueAnalysisJob } = await import("@/lib/queue");
    await enqueueAnalysisJob({
      readingId: reading.id,
      imageUrl,
      userId: user.id,
    });

    return NextResponse.json({ reading: { ...reading, imageUrl } }, { status: 201 });
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
