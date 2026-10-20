export interface SubscriptionPlan {
  id: number;
  planName: string;
  price: number;
  durationDays: number;
  active: boolean;
}

export interface CreateSubscriptionRequest {
  planId: number;
  garageId: number;
}