import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Lazy initialize OpenAI client only when needed (server-side only)
let openai: any = null;

function getOpenAIClient() {
  if (typeof window !== "undefined") {
    // Running in browser - should never happen for these functions
    throw new Error("OpenAI functions should not be called from browser");
  }
  if (!openai) {
    try {
      const OpenAI = require("openai").default;
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || "",
      });
    } catch (error) {
      console.error("Failed to initialize OpenAI:", error);
      throw error;
    }
  }
  return openai;
}

const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
];

export function getZodiacSign(dob: Date): string {
  const month = dob.getMonth() + 1;
  const day = dob.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "aquarius";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "pisces";
  
  return "aries"; // fallback
}

export async function getDailyHoroscope(sign: string): Promise<any> {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `horoscope:daily:${sign}:${today}`;
  
  try {
    // Check if Redis is configured
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.warn("Redis not configured, skipping cache");
    } else {
      // Try to get from cache first
      const cached = await redis.get(cacheKey);
      if (cached) {
        return cached;
      }
    }
  } catch (error) {
    console.error("Error checking cache:", error);
  }

  try {
    // Call Aztro API via RapidAPI
    const response = await fetch(`https://aztro.sameerkumar.website/?sign=${sign}&day=today`, {
      method: 'POST',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || "",
        'X-RapidAPI-Host': 'aztro.sameerkumar.website'
      }
    });

    if (!response.ok) {
      throw new Error(`Aztro API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform to our format
    const horoscope = {
      sign,
      date: today,
      description: data.description,
      compatibility: data.compatibility,
      mood: data.mood,
      color: data.color,
      luckyNumber: data.lucky_number,
      luckyTime: data.lucky_time,
      dateRange: data.date_range,
    };

    // Cache for 24 hours
    await redis.set(cacheKey, horoscope, { ex: 86400 });
    
    return horoscope;
  } catch (error) {
    console.error("Daily horoscope error:", error);
    
    // Return fallback horoscope
    const fallback = {
      sign,
      date: today,
      description: "The stars are aligned in your favor today. Trust your intuition and embrace new opportunities.",
      compatibility: "Cancer",
      mood: "Optimistic",
      color: "Blue",
      luckyNumber: "7",
      luckyTime: "2pm to 3pm",
      dateRange: getSignDateRange(sign),
    };
    
    return fallback;
  }
}

export async function getMonthlyHoroscope(profileId: string, dob: Date): Promise<any> {
  const currentDate = new Date();
  const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const cacheKey = `horoscope:monthly:${profileId}:${monthKey}`;
  
  // Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const sign = getZodiacSign(dob);
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();
    
    const prompt = `Generate a personalized monthly horoscope for ${monthName} ${year} for someone born on ${dob.toDateString()} (${sign.charAt(0).toUpperCase() + sign.slice(1)}). 

Include specific predictions for:
- Career and work life
- Love and relationships  
- Health and wellness
- Financial outlook
- Key dates to watch
- Overall theme for the month

Return ONLY valid JSON with this structure:
{
  "sign": "${sign}",
  "month": "${monthName}",
  "year": ${year},
  "overview": "string",
  "career": "string", 
  "love": "string",
  "health": "string",
  "finance": "string",
  "keyDates": ["string"],
  "theme": "string"
}`;

    const openaiClient = getOpenAIClient();
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 800
    });

    const horoscope = JSON.parse(response.choices[0].message.content || "{}");
    
    // Cache for 30 days
    await redis.set(cacheKey, horoscope, { ex: 2592000 });
    
    return horoscope;
  } catch (error) {
    console.error("Monthly horoscope error:", error);
    throw new Error("Failed to generate monthly horoscope");
  }
}

function getSignDateRange(sign: string): string {
  const ranges: Record<string, string> = {
    aries: "Mar 21 - Apr 19",
    taurus: "Apr 20 - May 20", 
    gemini: "May 21 - Jun 20",
    cancer: "Jun 21 - Jul 22",
    leo: "Jul 23 - Aug 22",
    virgo: "Aug 23 - Sep 22",
    libra: "Sep 23 - Oct 22",
    scorpio: "Oct 23 - Nov 21",
    sagittarius: "Nov 22 - Dec 21",
    capricorn: "Dec 22 - Jan 19",
    aquarius: "Jan 20 - Feb 18",
    pisces: "Feb 19 - Mar 20"
  };
  
  return ranges[sign] || "Unknown";
}
