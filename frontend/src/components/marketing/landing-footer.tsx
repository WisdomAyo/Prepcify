import Link from "next/link";
import {
  Facebook,
  GraduationCap,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const additionalLinks = [
  ["Login", "/login"],
  ["Register", "/signup"],
  ["Contact", "/contact"],
  ["Certificate Validation", "/exams"],
  ["Become Instructor", "/contact"],
  ["About", "/features"],
  ["Terms and Policies", "/contact"],
] as const;

const categories = [
  ["Exam Preparation", "/exams"],
  ["Past Questions", "/app/past-questions"],
  ["AI Tutor", "/app/tutor"],
  ["Study Planning", "/app/study-plan"],
  ["Scholarship Prep", "/exams"],
  ["School Plans", "/contact"],
] as const;

const socials = [
  { icon: Instagram, label: "Instagram" },
  { icon: MessageCircle, label: "WhatsApp" },
  { icon: Mail, label: "Email" },
  { icon: Facebook, label: "Facebook" },
] as const;

function NewsletterCard() {
  return (
    <div className="relative z-20 mx-auto max-w-[1352px] px-4 sm:px-6">
      <div className="grid min-h-[104px] gap-5 rounded-[22px] bg-white px-4 py-5 text-slate-950 shadow-[0_28px_80px_-48px_rgba(15,23,42,0.55)] sm:px-7 lg:grid-cols-[1fr_440px] lg:items-center lg:px-4 lg:pl-4 lg:pr-4">
        <div>
          <h2 className="text-[20px] font-bold leading-tight text-[#001a42]">
            Subscribe to Our Newsletter 😊
          </h2>
          <p className="mt-2 text-[14px] leading-5 text-[#8b9cc2]">
            Receive expert insights, exam updates, and learning resources directly in your inbox and get notified
          </p>
        </div>

        <form className="flex h-[74px] flex-col gap-3 rounded-[14px] border border-[#e7edf5] bg-white p-3 sm:flex-row sm:items-center sm:pl-5">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <div className="flex min-w-0 flex-1 items-center gap-3 text-[#8aa0c6]">
            <Mail className="h-5 w-5 shrink-0 stroke-[1.8]" />
            <input
              id="newsletter-email"
              type="email"
              placeholder="Enter your email address here"
              className="h-12 min-w-0 flex-1 bg-transparent text-[14px] text-[#001a42] outline-none placeholder:text-[#3f4a5f]"
            />
          </div>
          <Button className="h-12 rounded-[8px] bg-[#0d73ff] px-7 text-[14px] font-medium text-white hover:bg-[#0b65df]">
            Join
          </Button>
        </form>
      </div>
    </div>
  );
}

export function LandingFooter({ showNewsletter = false }: { showNewsletter?: boolean }) {
  return (
    <footer id="contact" className="relative bg-[#f3f8fb] text-white">
      {showNewsletter && (
        <div className="relative z-20 pt-[52px]">
          <NewsletterCard />
        </div>
      )}

      <div className={showNewsletter ? "relative -mt-[54px] overflow-hidden bg-[#13284c] pt-[140px]" : "relative overflow-hidden bg-[#13284c] pt-14"}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.065)_1px,transparent_0)] bg-[size:13px_13px]" />
        <div className="pointer-events-none absolute -left-[17rem] top-[7.8rem] h-[34rem] w-[34rem] rounded-full bg-white/[0.035]" />
        <div className="pointer-events-none absolute -right-[13rem] top-[-4rem] h-[35rem] w-[35rem] rounded-full bg-white/[0.035]" />
        <div className="pointer-events-none absolute -right-[4rem] top-[-7rem] h-[32rem] w-[32rem] rounded-full border border-white/[0.025]" />

        <div className="relative mx-auto max-w-[1352px] px-4 sm:px-6">
          <div className="grid gap-12 pb-[50px] pt-0 md:grid-cols-2 lg:grid-cols-[1.18fr_0.62fr_0.68fr_1.05fr] lg:gap-16">
            <div>
              <Link
                href="/signup"
                className="inline-flex h-[52px] items-center gap-3 rounded-full border-2 border-white/85 px-5 text-[14px] font-medium text-white transition-colors hover:bg-white hover:text-[#13284c]"
              >
                💪 Let&apos;s get started now!
              </Link>
              <h2 className="mt-7 max-w-[470px] text-[40px] font-bold leading-[1.34] tracking-[-0.02em] text-white sm:text-[46px]">
                Take the First Step Towards Mastery!
              </h2>
              <Button asChild className="mt-8 h-16 rounded-[18px] bg-[#0d73ff] px-8 text-[14px] font-medium text-white hover:bg-[#0b65df]">
                <Link href="/onboarding">
                  <GraduationCap className="h-5 w-5 fill-white/20" />
                  Enroll on Courses
                </Link>
              </Button>
            </div>

            <div>
              <h3 className="text-[16px] font-bold text-white">Additional Links</h3>
              <ul className="mt-4 space-y-3 text-[16px] leading-5 text-[#b4bfd4]">
                {additionalLinks.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="transition-colors hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[16px] font-bold text-white">Popular Categories</h3>
              <ul className="mt-4 space-y-3 text-[16px] leading-5 text-[#b4bfd4]">
                {categories.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="transition-colors hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[16px] font-bold text-white">Contact US</h3>
              <ul className="mt-5 space-y-4 text-[16px] leading-5 text-[#b4bfd4]">
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 stroke-[1.8] text-white" />
                  <span>Available for learners, parents, tutors, and schools across Africa.</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 stroke-[1.8] text-white" />
                  <span>+234 000 000 0000</span>
                </li>
                <li className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 stroke-[1.8] text-white" />
                  <span>+234 000 000 0001</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 stroke-[1.8] text-white" />
                  <span>hello@prepcify.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex min-h-[72px] flex-col gap-5 border-t border-white/[0.08] py-5 text-[14px] text-[#b4bfd4] sm:flex-row sm:items-center sm:justify-between">
            <p className="leading-5">
              © {new Date().getFullYear()} prepcify Learning. Empowering exam success worldwide.
            </p>
            <div className="flex gap-5">
              {socials.map(({ icon: Icon, label }) => (
                <Link
                  key={label}
                  href="/contact"
                  aria-label={label}
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-white/25 text-[#8290ad] transition-colors hover:border-white/50 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
