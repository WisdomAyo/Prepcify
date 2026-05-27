"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const FaqSection = dynamic(
  () => import("./landing/sections").then((module) => module.FaqSection),
  { ssr: false },
);

export function FaqController() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return <FaqSection openFaq={openFaq} setOpenFaq={setOpenFaq} />;
}
