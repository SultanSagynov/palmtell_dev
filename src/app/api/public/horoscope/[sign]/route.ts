import { NextRequest, NextResponse } from "next/server";
import { getDailyHoroscope } from "@/lib/horoscope";

const VALID_SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sign: string }> }
) {
  const { sign: signParam } = await params;
  const sign = signParam.toLowerCase();
  
  if (!VALID_SIGNS.includes(sign)) {
    return NextResponse.json({ error: "Invalid zodiac sign" }, { status: 400 });
  }

  try {
    const horoscope = await getDailyHoroscope(sign);
    
    return NextResponse.json({ 
      horoscope,
      meta: {
        title: `${sign.charAt(0).toUpperCase() + sign.slice(1)} Daily Horoscope`,
        description: `Today's horoscope for ${sign.charAt(0).toUpperCase() + sign.slice(1)}. ${horoscope.description?.substring(0, 150)}...`,
      }
    });
  } catch (error) {
    console.error("Public horoscope error:", error);
    return NextResponse.json(
      { error: "Failed to fetch horoscope" },
      { status: 500 }
    );
  }
}
