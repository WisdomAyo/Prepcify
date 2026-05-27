"use client";

import dynamic from "next/dynamic";

export const LazyCtaSection = dynamic(
  () => import("./landing/sections").then((module) => module.CtaSection),
  { ssr: false },
);

export const LazyExamMarquee = dynamic(
  () => import("./landing/sections").then((module) => module.ExamMarquee),
  { ssr: false },
);

export const LazyFeaturesSection = dynamic(
  () => import("./landing/sections").then((module) => module.FeaturesSection),
  { ssr: false },
);

export const LazyHabitSection = dynamic(
  () => import("./landing/sections").then((module) => module.HabitSection),
  { ssr: false },
);

export const LazyMarketplaceSection = dynamic(
  () => import("./landing/sections").then((module) => module.MarketplaceSection),
  { ssr: false },
);

export const LazyPricingSection = dynamic(
  () => import("./landing/sections").then((module) => module.PricingSection),
  { ssr: false },
);

export const LazyStatsSection = dynamic(
  () => import("./landing/sections").then((module) => module.StatsSection),
  { ssr: false },
);
