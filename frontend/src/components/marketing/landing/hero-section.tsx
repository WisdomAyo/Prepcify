"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Play, Search, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { fadeUp } from "./motion";
import { landingImages, tutorAvatars, } from "./data";
import { Reveal } from "./motion";







function HeroTutorMedia() {
  return (
    <div className="relative mx-auto w-full max-w-[580px] lg:ml-auto">
      <div className="relative overflow-hidden rounded-[2rem] bg-emerald-800 p-4 pb-0 shadow-[0_34px_90px_-44px_rgba(6,78,59,0.75)] ring-1 ring-emerald-950/5">
        <div className="pointer-events-none absolute inset-0 opacity-35">
          <div className="absolute -right-24 top-10 h-72 w-72 rounded-full border border-white/20" />
          <div className="absolute bottom-24 left-8 h-40 w-40 rounded-full border border-white/15" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12)_0_1px,transparent_1px_18px)]" />
        </div>

        <div className="relative h-72 overflow-hidden rounded-[1.4rem] sm:h-80 lg:h-[22rem]">
          <Image
            src={landingImages.hero}
            alt="Student learning online with prepcify"
            fill
            priority
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/10" />
          <button
            type="button"
            aria-label="Play exam prep preview"
            className="absolute left-1/2 top-1/2 flex h-[4.35rem] w-[4.35rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/80 text-white shadow-[0_20px_48px_-18px_rgba(15,23,42,0.75)] ring-1 ring-white/20 backdrop-blur"
          >
            <Play className="ml-1 h-8 w-8 fill-white" />
          </button>
        </div>

        <div className="relative -mt-20 min-h-56 px-8 pb-10 pt-28 text-white">
          <div className="absolute inset-0 bg-emerald-800 [clip-path:polygon(0_35%,100%_0,100%_100%,0_100%)]" />
          <svg
            viewBox="0 0 360 190"
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-full w-full text-white/20"
          >
            <path
              d="M22 156 C74 118 104 75 142 58 C174 44 198 72 174 103 C151 132 178 154 221 124 C256 100 284 62 338 35"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M88 190 L151 76 L206 160 L278 58 L346 190"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              opacity="0.85"
            />
            <path
              d="M132 190 L181 118 L224 174 L274 103"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              opacity="0.55"
            />
          </svg>

          <div className="relative ml-28 max-w-sm text-base font-bold leading-7">
            Build a daily study rhythm with past questions, AI explanations,
            and realistic mocks before exam day.
          </div>

          <div className="absolute bottom-5 left-5 flex h-[6.6rem] w-[6.6rem] items-center justify-center rounded-full border border-white/45 bg-white/10 text-center text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_18px_45px_-26px_rgba(0,0,0,0.55)] backdrop-blur-xl">
            <motion.svg
              viewBox="0 0 120 120"
              aria-hidden="true"
              className="absolute inset-0 h-full w-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            >
              <defs>
                <path
                  id="hero-seal-path"
                  d="M60 60 m -43 0 a 43 43 0 1 1 86 0 a 43 43 0 1 1 -86 0"
                />
              </defs>
              <text className="fill-white text-[9px] font-bold uppercase tracking-[0.22em]">
                <textPath href="#hero-seal-path" startOffset="0%">
                  Mock exams - AI tutor - Past questions -
                </textPath>
              </text>
            </motion.svg>
            <span className="relative rounded-full bg-white p-4 text-orange-500 shadow-[0_10px_24px_-16px_rgba(0,0,0,0.55)]">
              <Sparkles className="h-6 w-6 fill-orange-500" />
            </span>
          </div>
        </div>
      </div>

      <motion.div
        className="absolute -left-16 top-8 hidden rounded-2xl border border-white/50 bg-white/35 p-3 text-slate-950 shadow-[0_22px_55px_-30px_rgba(15,23,42,0.65)] ring-1 ring-white/35 backdrop-blur-2xl sm:block"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <p className="px-1 text-xs font-bold">42k+ Students preparing</p>
        <div className="mt-2 flex items-center">
          {["/assets/onboard-1.jpg", "/assets/onboard-2.jpg", "/assets/auth-student-1.jpg", "/assets/auth-detail-1.jpg"].map((avatar, index) => (
            <Image
              key={avatar}
              src={avatar}
              alt=""
              width={34}
              height={34}
              className="h-9 w-9 rounded-full border-2 border-white object-cover"
              style={{ marginLeft: index === 0 ? 0 : -8 }}
            />
          ))}
          <span className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/80 bg-orange-500 text-white shadow-[0_12px_26px_-16px_rgba(249,115,22,0.9)]">
            <Plus className="h-5 w-5" />
          </span>
        </div>
      </motion.div>

      <motion.div
        className="absolute -right-14 bottom-36 hidden items-center gap-3 rounded-xl border border-white/50 bg-white/40 p-3 text-slate-950 shadow-[0_22px_55px_-30px_rgba(15,23,42,0.65)] ring-1 ring-white/35 backdrop-blur-2xl sm:flex"
        animate={{ x: [0, 8, 0] }}
        transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/assets/onboard-2.jpg"
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 rounded-lg object-cover"
        />
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold">Chiamaka O.</p>
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
              <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
              4.8/5.0
            </div>
          </div>
          <p className="mt-1 text-xs text-slate-600">WAEC Science</p>
          <p className="mt-1 text-[11px] font-medium text-slate-500">Lagos, Nigeria</p>
        </div>
      </motion.div>
    </div>
  );
}

export function HeroSection() {
   const avatars = [
    "/assets/auth-detail-1.jpg",
    "/assets/onboard-1.jpg",
    "/assets/onboard-2.jpg",
    "/assets/auth-student-1.jpg",
    "/assets/onboard-3.jpg",
  ];
  return (
    <section className="relative overflow-hidden bg-[#fbfaf8] pb-20 pt-12 text-slate-950 md:pb-28 md:pt-20">
      <div className="relative mx-auto max-w-[1474px] px-2 sm:px-6">
        <div className="grid items-center gap-14 lg:grid-cols-[0.98fr_0.9fr]">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-[0_12px_35px_-24px_rgba(15,23,42,0.6)] ring-1 ring-slate-950/5"
            >
              <Sparkles className="h-4 w-4 fill-orange-500 text-orange-500" />
              <span>AI-guided exam prep for WAEC, JAMB, NECO and more</span>
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="mt-7 font-display text-3xl font-bold leading-tight text-emerald-800"
            >
              Build your exam confidence:
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="mt-3 max-w-2xl text-balance font-display text-5xl font-medium leading-[1.06] tracking-tight text-black sm:text-6xl lg:text-7xl"
            >
              Practice better for the exams that matter
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-8 max-w-xl text-xl leading-8 text-slate-700"
            >
              prepcify gives each student a daily study plan, instant AI
              explanations, past questions, and mock exams that feel close to
              the real paper.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-12">
              <Button
                asChild
                className="h-14 rounded-xl bg-orange-600 px-7 text-sm font-bold text-white shadow-[0_18px_42px_-20px_rgba(249,115,22,0.95)] hover:bg-orange-500"
              >
                <Link href="/onboarding">
                  <Search className="h-4 w-4" />
                  Get Started Now
                </Link>
              </Button>
            </motion.div>

            {/* <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center"
            >
              <motion.div
                aria-hidden="true"
                className="relative h-24 w-28 shrink-0 sm:h-28 sm:w-32"
                animate={{ y: [0, -6, 0], rotate: [-2, 2, -2] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="absolute left-3 top-2 h-20 w-20 rotate-[-16deg] rounded-[2rem] bg-gradient-to-br from-red-400 via-red-500 to-rose-600 shadow-[0_18px_40px_-18px_rgba(244,63,94,0.8)]" />
                <Sparkles className="absolute left-0 top-1 h-8 w-8 fill-amber-300 text-amber-300" />
                <Sparkles className="absolute bottom-3 right-3 h-7 w-7 fill-amber-300 text-amber-300" />
                <Sparkles className="absolute right-1 top-10 h-5 w-5 fill-amber-200 text-amber-200" />
              </motion.div>

              <div className="flex max-w-2xl flex-col gap-3 rounded-full bg-white px-5 py-4 shadow-[0_18px_48px_-36px_rgba(15,23,42,0.55)] ring-1 ring-slate-950/5 sm:flex-row sm:items-center sm:px-7">
                <div className="flex w-fit items-center gap-1 rounded-full bg-orange-500 px-4 py-2 text-white">
                  {[...Array(5)].map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-white text-white" />
                  ))}
                </div>
                <p className="text-sm leading-6 text-slate-500 sm:text-base">
                  <span className="font-bold text-slate-950">Over 2,500 happy students</span>{" "}
                  have shared their exam-prep wins with prepcify.
                </p>
              </div>
            </motion.div> */}

            <section className="bg-white px-5 pb-12 text-slate-950">
                  <Reveal>
                    <motion.div
                      className="mx-auto flex w-fit max-w-full flex-col items-center gap-3 rounded-full bg-slate-100/90 px-5 py-3 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.55)] ring-1 ring-slate-950/5 sm:flex-row"
                      whileHover={{ y: -4 }}
                      transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    >
                      <div className="flex">
                        {avatars.map((avatar, index) => (
                          <Image
                            key={avatar}
                            src={avatar}
                            alt=""
                            width={42}
                            height={42}
                            className="h-10 w-10 rounded-full border-2 border-slate-100 object-cover"
                            style={{ marginLeft: index === 0 ? 0 : -10 }}
                          />
                        ))}
                      </div>
                      <div className="text-center sm:text-left">
                        <div className="flex justify-center gap-0.5 text-orange-400 sm:justify-start">
                          {[...Array(5)].map((_, index) => (
                            <Star key={index} className="h-4 w-4 fill-orange-400 text-orange-400" />
                          ))}
                        </div>
                        <p className="mt-1 text-sm font-bold text-slate-950">
                          Trusted by 2,500+ successful students
                        </p>
                      </div>
                    </motion.div>
                  </Reveal>
                </section>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 45 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroTutorMedia />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
