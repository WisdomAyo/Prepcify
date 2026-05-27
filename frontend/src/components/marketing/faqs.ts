/**
 * Marketing FAQ content.
 *
 * Kept in a plain (non-`"use client"`) module so it can be imported by both
 * the `Landing` Client Component *and* the Server Component that emits FAQ
 * JSON-LD. Exporting data from a `"use client"` file turns it into a client
 * reference, which cannot be read on the server.
 */
export const faqs = [
  {
    q: "Which exams do you cover?",
    a: "WAEC, NECO, JAMB, ICAN, Cambridge IGCSE, A-Levels, O-Levels and the Nigerian SSCE. More boards added every term.",
  },
  {
    q: "Is it really free?",
    a: "Yes — the core experience is free forever. prepcify Pro adds unlimited mock exams, full AI tutor, and the past papers archive.",
  },
  {
    q: "Do I need internet to use it?",
    a: "Most lessons cache for offline use. AI tutor and live leaderboards need a connection.",
  },
  {
    q: "Can my school use prepcify with a class?",
    a: "Yes. prepcify for Schools gives teachers dashboards, assignments, and class leaderboards. Get in touch.",
  },
];
