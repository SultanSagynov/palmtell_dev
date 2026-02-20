import { NextRequest, NextResponse } from "next/server";
import { getPalmSession, confirmPalmSession } from "@/lib/session-storage";
import { validatePalmImage } from "@/lib/palm-validation";

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('palm_session')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: "No palm session found. Please start over." },
        { status: 400 }
      );
    }

    // Get temp data from Redis
    const tempData = await getPalmSession(sessionToken);
    if (!tempData) {
      return NextResponse.json(
        { error: "Session expired. Please start over." },
        { status: 400 }
      );
    }

    // Run GPT-4o palm validation
    const validation = await validatePalmImage(`${process.env.R2_PUBLIC_URL}/${tempData.photo_key}`);
    
    if (!validation.is_valid) {
      return NextResponse.json(
        { error: validation.reason || "Palm validation failed" },
        { status: 400 }
      );
    }

    // Mark session as confirmed
    const confirmed = await confirmPalmSession(sessionToken);
    if (!confirmed) {
      return NextResponse.json(
        { error: "Failed to confirm palm session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "Palm confirmed successfully" 
    });
  } catch (error) {
    console.error("Palm confirmation error:", error);
    return NextResponse.json(
      { error: "Failed to confirm palm" },
      { status: 500 }
    );
  }
}
