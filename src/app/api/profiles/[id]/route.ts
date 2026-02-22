import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profile = await db.profile.findFirst({ where: { id, userId: user.id } });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, dob, avatarEmoji } = body as {
      name?: string;
      dob?: string | null;
      avatarEmoji?: string | null;
    };

    const updated = await db.profile.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        dob: dob !== undefined ? (dob ? new Date(dob) : null) : undefined,
        avatarEmoji: avatarEmoji !== undefined ? avatarEmoji : undefined,
      },
      include: { _count: { select: { readings: true } } },
    });

    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error("[PROFILE_PUT_ERROR]", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profile = await db.profile.findFirst({ where: { id, userId: user.id } });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.isDefault) {
      return NextResponse.json(
        { error: "Cannot delete the default profile" },
        { status: 403 }
      );
    }

    await db.profile.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PROFILE_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Failed to delete profile" }, { status: 500 });
  }
}
