import Link from "next/link";
import { ArrowRight, Building2, Mail, MapPin, MessageCircle, Phone, School } from "lucide-react";
import { MarketingPill, PerspectiveGrid } from "../shared/perspective-grid";

const contactCards = [
  {
    icon: Mail,
    title: "Email support",
    body: "Get help with billing, login, study plans, or your learner account.",
    value: "hello@prepcify.com",
    href: "mailto:hello@prepcify.com",
  },
  {
    icon: School,
    title: "Schools & tutors",
    body: "Ask about class dashboards, assignments, reporting, and onboarding.",
    value: "Book a school demo",
    href: "/pricing",
  },
  {
    icon: MessageCircle,
    title: "Student onboarding",
    body: "Create an account, choose your exam body, and start focused prep.",
    value: "Start free",
    href: "/signup",
  },
] as const;

export function ContactPageSection() {
  return (
    <section className="relative overflow-hidden bg-white text-slate-950">
      <PerspectiveGrid />

      <div className="relative mx-auto max-w-9xl px-5 pb-24 pt-24 sm:px-6 lg:pt-28">
        <div className="text-center">
          <MarketingPill label="Contact" text="Let's make prep easier." />
          <h1 className="mx-auto mt-16 max-w-4xl text-balance text-5xl font-medium leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl">
            Talk to Us.
            <br />
            We&apos;re Here to Help.
          </h1>
          <p className="mx-auto mt-9 max-w-2xl text-base leading-6 text-slate-700">
            Whether you&apos;re a student, parent, tutor, or school administrator,
            reach out and we&apos;ll help you choose the right exam-prep path.
          </p>
        </div>

        <div className="mx-auto mt-24 grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[1.35rem] bg-slate-50 p-5 sm:p-8">
            <div className="grid gap-4">
              {contactCards.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group rounded-2xl bg-white p-6 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.55)] transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <card.icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-base font-bold">{card.title}</span>
                      <span className="mt-2 block text-sm leading-6 text-slate-600">{card.body}</span>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-emerald-700">
                        {card.value} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
              <p className="flex items-center gap-2 text-sm font-bold">
                <MapPin className="h-4 w-4 text-emerald-700" />
                Built for African students
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                prepcify supports learners preparing for WAEC, JAMB, NECO,
                Cambridge, professional exams, and school assessments.
              </p>
            </div>
          </div>

          <div className="rounded-[1.35rem] bg-slate-50 p-5 sm:p-8">
            <div className="rounded-2xl bg-white p-6 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.55)] sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Send a message</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Tell us what you need. We&apos;ll route your message to the right team.
                  </p>
                </div>
                <span className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white sm:flex">
                  <Building2 className="h-5 w-5" />
                </span>
              </div>

              <form className="mt-8 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-bold">
                    Name
                    <input className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-500" placeholder="Your name" />
                  </label>
                  <label className="grid gap-2 text-sm font-bold">
                    Email
                    <input className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-500" placeholder="you@example.com" type="email" />
                  </label>
                </div>
                <label className="grid gap-2 text-sm font-bold">
                  What do you need help with?
                  <select className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-500">
                    <option>Student support</option>
                    <option>School plan</option>
                    <option>Billing question</option>
                    <option>Partnership</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  Message
                  <textarea className="min-h-36 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="Share a few details..." />
                </label>
                <button
                  type="button"
                  className="mt-2 inline-flex h-12 w-fit items-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-bold text-white transition-colors hover:bg-emerald-800"
                >
                  Send message <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-8 grid gap-3 border-t border-slate-100 pt-6 text-sm text-slate-600 sm:grid-cols-2">
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-emerald-700" />
                  Response within 1 business day
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-emerald-700" />
                  hello@prepcify.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
