import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAccessTier, getProfileLimit } from "@/lib/access";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ profiles: [] });
    }

    const profiles = await db.profile.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      include: { _count: { select: { readings: true } } },
    });

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error("[PROFILES_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
  }
}

export async function POST(req: Request) {
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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const tier = getAccessTier(user, user.subscription);
    const limit = getProfileLimit(tier);

    const existingCount = await db.profile.count({ where: { userId: user.id } });

    if (existingCount >= limit) {
      return NextResponse.json(
        { error: `Profile limit reached (${limit}). Upgrade your plan to add more profiles.` },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, dob, avatarEmoji } = body as {
      name: string;
      dob?: string | null;
      avatarEmoji?: string | null;
    };

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const profile = await db.profile.create({
      data: {
        userId: user.id,
        name: name.trim(),
        dob: dob ? new Date(dob) : null,
        avatarEmoji: avatarEmoji ?? null,
        isDefault: existingCount === 0,
      },
      include: { _count: { select: { readings: true } } },
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error("[PROFILES_POST_ERROR]", error);
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }
}
