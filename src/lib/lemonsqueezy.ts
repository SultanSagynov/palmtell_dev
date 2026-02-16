import { lemonSqueezySetup, createCheckout, getSubscription, cancelSubscription } from "@lemonsqueezy/lemonsqueezy.js";

// Initialize Lemon Squeezy
lemonSqueezySetup({
  apiKey: process.env.LEMON_SQUEEZY_API_KEY!,
});

export const VARIANT_MAP: Record<string, string | undefined> = {
  pro_monthly: process.env.LS_PRO_MONTHLY_ID,
  pro_annual: process.env.LS_PRO_ANNUAL_ID,
  ultimate_monthly: process.env.LS_ULTIMATE_MONTHLY_ID,
  ultimate_annual: process.env.LS_ULTIMATE_ANNUAL_ID,
};

export const VARIANT_TO_PLAN: Record<string, string> = {
  [process.env.LS_PRO_MONTHLY_ID!]: 'pro',
  [process.env.LS_PRO_ANNUAL_ID!]: 'pro',
  [process.env.LS_ULTIMATE_MONTHLY_ID!]: 'ultimate',
  [process.env.LS_ULTIMATE_ANNUAL_ID!]: 'ultimate',
};

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
      redirectUrl: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
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
    return subscription.data.data;
  } catch (error) {
    console.error('Error fetching Lemon Squeezy subscription:', error);
    throw error;
  }
}

export async function cancelLemonSqueezySubscription(subscriptionId: string) {
  try {
    const result = await cancelSubscription(subscriptionId);
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

export function getPlanFromVariantId(variantId: string): string | null {
  return VARIANT_TO_PLAN[variantId] || null;
}
