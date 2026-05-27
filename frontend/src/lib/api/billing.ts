import { api } from "./client";

/** GET /api/v1/plans. */
export interface PlanPrice {
  currency: string;        // ISO-4217 (e.g. NGN, USD)
  amount_minor: number;    // smallest unit (kobo, cents)
  interval: "monthly" | "yearly";
}

export interface Plan {
  code: string;
  name: string;
  description: string | null;
  entitlements: Record<string, unknown>;
  sort_order: number;
  prices: PlanPrice[];
}

/** GET /api/v1/me/subscription. */
export interface Subscription {
  id: number;
  status: string;
  started_at: string;
  current_period_start: string;
  current_period_end: string;
  cancelled_at: string | null;
  plan: { code: string; name: string; entitlements: Record<string, unknown> } | null;
}

export interface PaystackCheckout {
  authorization_url: string;
  reference: string;
  access_code: string;
}

export const billingApi = {
  listPlans(): Promise<Plan[]> {
    return api.get<Plan[]>("/plans");
  },
  currentSubscription(): Promise<{ subscription: Subscription | null }> {
    return api.get<{ subscription: Subscription | null }>("/me/subscription");
  },
  startSubscription(input: {
    plan_code: string;
    currency: string;
    interval: "monthly" | "yearly";
  }): Promise<PaystackCheckout> {
    return api.post<PaystackCheckout>("/me/subscription/start", input);
  },
  cancelSubscription(id: number): Promise<Subscription> {
    return api.post<Subscription>(`/me/subscription/${id}/cancel`);
  },
};
