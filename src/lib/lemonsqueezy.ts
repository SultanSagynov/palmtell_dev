import { lemonSqueezySetup, createCheckout, getSubscription, cancelSubscription } from "@lemonsqueezy/lemonsqueezy.js";

// Initialize Lemon Squeezy
lemonSqueezySetup({
  apiKey: process.env.LEMON_SQUEEZY_API_KEY!,
});

// Build variant maps safely to avoid undefined keys
const PRO_MONTHLY = process.env.LS_PRO_MONTHLY_ID;
const PRO_ANNUAL = process.env.LS_PRO_ANNUAL_ID;
const ULTIMATE_MONTHLY = process.env.LS_ULTIMATE_MONTHLY_ID;
const ULTIMATE_ANNUAL = process.env.LS_ULTIMATE_ANNUAL_ID;

export const VARIANT_MAP: Record<string, string | undefined> = {
  pro_monthly: PRO_MONTHLY,
  pro_annual: PRO_ANNUAL,
  ultimate_monthly: ULTIMATE_MONTHLY,
  ultimate_annual: ULTIMATE_ANNUAL,
};

// Only add to map if the key exists
export const VARIANT_TO_PLAN: Record<string, string> = {};
if (PRO_MONTHLY) VARIANT_TO_PLAN[PRO_MONTHLY] = 'pro';
if (PRO_ANNUAL) VARIANT_TO_PLAN[PRO_ANNUAL] = 'pro';
if (ULTIMATE_MONTHLY) VARIANT_TO_PLAN[ULTIMATE_MONTHLY] = 'ultimate';
if (ULTIMATE_ANNUAL) VARIANT_TO_PLAN[ULTIMATE_ANNUAL] = 'ultimate';

export interface CheckoutData {
  plan: 'pro' | 'ultimate';
  interval: 'month' | 'year';
  userId: string;
  userEmail: string;
}

export async function createLemonSqueezyCheckout(data: CheckoutData) {
  const { plan, interval, userId, userEmail } = data;
  
  // Map plan and interval to variant ID
  const variantKey = `${plan}_${interval === 'month' ? 'monthly' : 'annual'}`;
  const variantId = VARIANT_MAP[variantKey];
  
  if (!variantId) {
    throw new Error(`Invalid plan or interval: ${plan} ${interval}`);
  }

  const checkout = await createCheckout(process.env.LS_STORE_ID!, variantId, {
    checkoutData: {
      email: userEmail,
      custom: {
        user_id: userId,
      },
    },
    productOptions: {
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || 'https://palmtell.com'}/dashboard?success=true`,
    },
  });

  if (!checkout.data) {
    throw new Error('Failed to create checkout session');
  }

  return checkout.data.data.attributes.url;
}

export async function getLemonSqueezySubscription(subscriptionId: string) {
  try {
    const subscription = await getSubscription(subscriptionId);
    if (!subscription.data) {
      throw new Error('Failed to fetch subscription');
    }
    return subscription.data.data;
  } catch (error) {
    console.error('Error fetching Lemon Squeezy subscription:', error);
    throw error;
  }
}

export async function cancelLemonSqueezySubscription(subscriptionId: string) {
  try {
    const result = await cancelSubscription(subscriptionId);
    if (!result.data) {
      throw new Error('Failed to cancel subscription');
    }
    return result.data.data;
  } catch (error) {
    console.error('Error canceling Lemon Squeezy subscription:', error);
    throw error;
  }
}

export function getCustomerPortalUrl(): string {
  // Lemon Squeezy provides a general customer portal
  return 'https://app.lemonsqueezy.com/my-orders';
}

export function getPlanFromVariantId(variantId: string | number): string | null {
  if (!variantId) {
    console.warn("getPlanFromVariantId called with empty variantId");
    return null;
  }
  // Lemon Squeezy webhooks may send variant_id as a number; normalise to string
  const key = String(variantId);
  const plan = VARIANT_TO_PLAN[key];
  if (!plan) {
    console.warn(`Unknown variant ID: ${key}. Available variants:`, Object.keys(VARIANT_TO_PLAN));
  }
  return plan || null;
}
