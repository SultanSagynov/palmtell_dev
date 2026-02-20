import type { TempUserWithSubscription, TempSubscription } from "@/types/temp-user";

export type AccessTier = "basic" | "pro" | "ultimate" | "expired";

export function getAccessTier(user: TempUserWithSubscription, subscription: TempSubscription | null): AccessTier {
  // Check if user has an active subscription
  if (subscription && subscription.status === "active") {
    return subscription.plan as AccessTier;
  }

  return "expired";
}

export function isSectionAccessible(section: string, tier: AccessTier): boolean {
  const accessMatrix = {
    personality: ["basic", "pro", "ultimate"],
    life_path: ["basic", "pro", "ultimate"], 
    career: ["basic", "pro", "ultimate"],
    relationships: ["pro", "ultimate"],
    health: ["pro", "ultimate"],
    lucky: ["pro", "ultimate"],
  };

  return accessMatrix[section as keyof typeof accessMatrix]?.includes(tier) ?? false;
}

export function getReadingLimit(tier: AccessTier): number {
  const limits = {
    basic: 1,
    pro: 5,
    ultimate: Infinity,
    expired: 0,
  };

  return limits[tier];
}

export function canAccessDailyHoroscope(tier: AccessTier): boolean {
  return ["pro", "ultimate"].includes(tier);
}

export function canAccessMonthlyHoroscope(tier: AccessTier): boolean {
  return tier === "ultimate";
}

export function canExportPDF(tier: AccessTier): boolean {
  return tier === "ultimate";
}
