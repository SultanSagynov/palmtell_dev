import { Client } from "@upstash/qstash";

const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export interface AnalysisJobPayload {
  readingId: string;
  imageUrl: string;
  userId: string;
}

export async function enqueueAnalysisJob(payload: AnalysisJobPayload): Promise<void> {
  const callbackUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/jobs/analyze-palm`;
  
  await qstash.publishJSON({
    url: callbackUrl,
    body: payload,
    delay: 2, // 2 second delay to allow for image upload completion
  });
}

export async function updateReadingStatus(
  readingId: string,
  status: "processing" | "completed" | "failed",
  analysisJson?: any,
  error?: string
): Promise<void> {
  const { db } = await import("@/lib/db");
  
  await db.reading.update({
    where: { id: readingId },
    data: {
      status,
      analysisJson,
      ...(error && { error }),
    },
  });
}
