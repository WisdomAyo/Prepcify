import Image from "next/image";
import {
  Layers3,
  Star,
} from "lucide-react";

export function FeaturesHeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_96%_58%,rgba(236,178,255,0.30),transparent_25%),radial-gradient(circle_at_8%_93%,rgba(21,128,61,0.08),transparent_24%),linear-gradient(135deg,#eefbf0_0%,#def6e4_43%,#f3e9ff_100%)] px-5 py-24 text-emerald-950 sm:px-6 lg:min-h-[46.7rem] lg:py-0">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.30)_0_130px,transparent_130px_250px)] opacity-30" />
        <div className="absolute -right-44 bottom-[-8rem] h-[42rem] w-[42rem] rounded-full bg-fuchsia-300/22 blur-3xl" />

       
      </div>

      <div className="relative mx-auto grid h-full max-w-[1596px] items-center gap-8 lg:min-h-[46.7rem] lg:grid-cols-[0.43fr_0.57fr]">
        <div className="relative z-10 animate-in fade-in slide-in-from-left-6 duration-700 lg:pl-12 xl:pl-16">
          <div className="flex flex-wrap gap-24 text-sm font-bold uppercase tracking-wide text-emerald-950/88">
            <div>
              <div className="flex gap-1 text-orange-500" aria-label="Rated 5 stars">
                {[...Array(5)].map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-orange-500" />
                ))}
              </div>
              <p className="mt-3">42000+ ACTIVE STUDENTS</p>
            </div>
            <div>
              <div className="flex h-5 w-5 items-center justify-center rounded bg-orange-500 text-white">
                <Layers3 className="h-3.5 w-3.5" />
              </div>
              <p className="mt-3">EXAM PREP TOOLKIT</p>
            </div>
          </div>

          <h1 className="mt-10 max-w-3xl text-balance font-display text-5xl font-medium leading-[1.06] tracking-tight text-[#16203d] sm:text-6xl lg:text-7xl">
            Have your exam prep ready in minutes for{" "}
            <span className="bg-gradient-to-r from-emerald-700 via-lime-500 to-emerald-600 bg-clip-text text-transparent">
              Every Exam.
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-lg font-medium leading-8 text-emerald-950/55">
            The most <span className="border-b border-emerald-800/35 font-bold text-emerald-950/65">powerful</span> yet the{" "}
            <span className="border-b border-emerald-800/35 font-bold text-emerald-950/65">easiest</span> exam prep workspace ever.
          </p>
        </div>

        <div className="relative -mx-4 min-h-[34rem] sm:mx-0 lg:-mr-14 lg:h-[41rem] xl:-mr-24">
          <div className="absolute inset-0 flex animate-[float-slow_8s_ease-in-out_infinite_alternate] items-center justify-center">
            <Image
              src="/assets/banner-group-image.webp"
              alt="prepcify feature hub showing study planning, past questions, AI tutor, mock exams, progress, and achievements"
              width={1180}
              height={787}
              priority
              sizes="(min-width: 1280px) 62vw, (min-width: 1024px) 58vw, 100vw"
              className="h-auto w-full max-w-[980px] object-contain drop-shadow-[0_34px_70px_rgba(6,78,59,0.18)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
