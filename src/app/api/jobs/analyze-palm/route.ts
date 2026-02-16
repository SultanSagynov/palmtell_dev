import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { validatePalmImage, analyzePalm } from "@/lib/openai";
import { updateReadingStatus, AnalysisJobPayload } from "@/lib/queue";
import { getSignedR2Url } from "@/lib/r2";

async function handler(req: NextRequest) {
  let readingId = "";
  try {
    const payload: AnalysisJobPayload = await req.json();
    readingId = payload.readingId;
    const { imageUrl, userId } = payload;

    // Update status to processing
    await updateReadingStatus(readingId, "processing");

    // Get signed URL for OpenAI API access
    const imageKey = imageUrl.split('/').pop()!;
    const signedUrl = await getSignedR2Url(`readings/${userId}/${readingId}/${imageKey}`);

    // Step 1: Validate palm image
    const validation = await validatePalmImage(signedUrl);
    
    if (!validation.valid) {
      await updateReadingStatus(readingId, "failed", null, validation.error || "no_palm_detected");
      return NextResponse.json({ success: false, error: validation.error });
    }

    // Step 2: Analyze palm (only if validation passes)
    const analysis = await analyzePalm(signedUrl);
    
    // Update reading with completed analysis
    await updateReadingStatus(readingId, "completed", analysis);

    return NextResponse.json({ success: true, readingId });
  } catch (error) {
    console.error("Analysis job error:", error);
    
    // Try to update reading status if we have the readingId
    if (readingId) {
      try {
        await updateReadingStatus(readingId, "failed", null, "analysis_error");
      } catch (e) {
        console.error("Failed to update reading status:", e);
      }
    }

    return NextResponse.json(
      { success: false, error: "Analysis failed" },
      { status: 500 }
    );
  }
}

export const POST = verifySignatureAppRouter(handler);
