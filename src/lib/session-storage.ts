import { Redis } from "@upstash/redis";
import crypto from "crypto";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

export interface TempPalmData {
  photo_key: string;
  dob: string;
  confirmed: boolean;
  created_at: number;
}

export async function createPalmSession(photoKey: string, dob: string): Promise<string> {
  const sessionToken = crypto.randomUUID();
  
  const tempData: TempPalmData = {
    photo_key: photoKey,
    dob,
    confirmed: false,
    created_at: Date.now()
  };

  // Store in Redis with 1-hour TTL (3600 seconds)
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      await redis.set(
        `temp_palm:${sessionToken}`,
        JSON.stringify(tempData),
        { ex: 3600 } // expires in 1 hour
      );
    } catch (error) {
      console.error("Failed to store palm session in Redis:", error);
      // Continue without Redis - will use fallback storage
    }
  }

  return sessionToken;
}

export async function getPalmSession(sessionToken: string): Promise<TempPalmData | null> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  try {
    const data = await redis.get(`temp_palm:${sessionToken}`);
    if (!data) return null;
    
    return typeof data === 'string' ? JSON.parse(data) : data as TempPalmData;
  } catch (error) {
    console.error("Failed to retrieve palm session:", error);
    return null;
  }
}

export async function confirmPalmSession(sessionToken: string): Promise<boolean> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return false;
  }

  try {
    const tempData = await getPalmSession(sessionToken);
    if (!tempData) return false;

    const updatedData = { ...tempData, confirmed: true };
    
    await redis.set(
      `temp_palm:${sessionToken}`,
      JSON.stringify(updatedData),
      { ex: 3600 } // keep 1-hour TTL
    );

    return true;
  } catch (error) {
    console.error("Failed to confirm palm session:", error);
    return false;
  }
}

export async function deletePalmSession(sessionToken: string): Promise<void> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return;
  }

  try {
    await redis.del(`temp_palm:${sessionToken}`);
  } catch (error) {
    console.error("Failed to delete palm session:", error);
  }
}

// --- Palm validation rate limiting ---
// After 3 failures within a window, block for 10 minutes.
const RATE_LIMIT_MAX_FAILURES = 3;
const RATE_LIMIT_WINDOW_SECONDS = 600; // 10 minutes

export async function checkPalmValidationRateLimit(
  clerkId: string
): Promise<{ limited: boolean; waitMinutes: number }> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return { limited: false, waitMinutes: 0 };
  }

  try {
    const key = `palm_validate_fails:${clerkId}`;
    const raw = await redis.get(key);
    const failures = raw ? Number(raw) : 0;

    if (failures >= RATE_LIMIT_MAX_FAILURES) {
      const ttl = await redis.ttl(key);
      const waitMinutes = Math.ceil(Math.max(ttl, 0) / 60);
      return { limited: true, waitMinutes };
    }

    return { limited: false, waitMinutes: 0 };
  } catch (error) {
    console.error("Failed to check palm validation rate limit:", error);
    return { limited: false, waitMinutes: 0 };
  }
}

export async function recordPalmValidationFailure(clerkId: string): Promise<void> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return;
  }

  try {
    const key = `palm_validate_fails:${clerkId}`;
    const current = await redis.incr(key);
    // Set/refresh the TTL only when the key is first created
    if (current === 1) {
      await redis.expire(key, RATE_LIMIT_WINDOW_SECONDS);
    }
  } catch (error) {
    console.error("Failed to record palm validation failure:", error);
  }
}
