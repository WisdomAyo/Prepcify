"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { billingApi } from "@/lib/api/billing";

export const billingKeys = {
  plans: ["plans"] as const,
  subscription: ["me", "subscription"] as const,
};

export function usePlans() {
  return useQuery({
    queryKey: billingKeys.plans,
    queryFn: () => billingApi.listPlans(),
    staleTime: 60 * 60_000, // 1h — plans rarely change
  });
}

export function useSubscription() {
  return useQuery({
    queryKey: billingKeys.subscription,
    queryFn: () => billingApi.currentSubscription(),
    staleTime: 60_000,
  });
}

export function useStartSubscription() {
  return useMutation({
    mutationFn: (input: {
      plan_code: string;
      currency: string;
      interval: "monthly" | "yearly";
    }) => billingApi.startSubscription(input),
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => billingApi.cancelSubscription(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: billingKeys.subscription }),
  });
}
