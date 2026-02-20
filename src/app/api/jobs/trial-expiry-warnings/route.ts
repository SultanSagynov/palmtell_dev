import { NextResponse } from "next/server";

// Trial expiry warnings are no longer needed in concept v2
// All plans are paid from day 1, no free trials
export async function POST(req: Request) {
  return NextResponse.json({
    success: true,
    message: "Trial expiry warnings disabled in PalmSight v2 - no free trials",
    usersFound: 0,
    emailsSent: 0,
    emailsFailed: 0,
  });
}
