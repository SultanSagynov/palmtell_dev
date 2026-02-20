// Temporary types to work around Prisma generation issues during migration
// TODO: Remove after successful prisma generate

export interface TempUser {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  palmPhotoUrl: string | null;
  dob: Date | null;
  palmConfirmed: boolean;
  createdAt: Date;
}

export interface TempSubscription {
  id: string;
  userId: string;
  lsCustomerId: string | null;
  lsSubscriptionId: string | null;
  lsVariantId: string | null;
  plan: string; // 'basic' | 'pro' | 'ultimate'
  status: string; // 'active' | 'past_due' | 'canceled' | 'expired'
  renewsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
}

export interface TempReading {
  id: string;
  userId: string;
  imageUrl: string;
  analysisJson: any;
  createdAt: Date;
}

export interface TempUserWithSubscription extends TempUser {
  subscription: TempSubscription | null;
}
