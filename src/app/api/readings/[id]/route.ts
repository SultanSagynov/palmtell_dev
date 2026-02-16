import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const reading = await db.reading.findFirst({
      where: {
        id,
        userId: user.id, // Ensure user can only access their own readings
      },
      include: {
        profile: {
          select: {
            name: true,
            avatarEmoji: true,
          },
        },
      },
    });

    if (!reading) {
      return NextResponse.json({ error: "Reading not found" }, { status: 404 });
    }

    return NextResponse.json({ reading });
  } catch (error) {
    console.error("Failed to fetch reading:", error);
    return NextResponse.json(
      { error: "Failed to fetch reading" },
      { status: 500 }
    );
  }
}
