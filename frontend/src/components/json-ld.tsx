import { headers } from "next/headers";

/**
 * JsonLd — renders structured data as a `<script type="application/ld+json">`.
 *
 * Server Component: the script is in the initial HTML, so crawlers see it
 * without executing JavaScript. Pass a single object or an array of objects.
 *
 * Reads the per-request `x-nonce` set by `middleware.ts` so the inline
 * `<script>` clears the strict nonce-based CSP. Without the nonce the
 * browser would refuse to render the structured-data block in production.
 *
 * `suppressHydrationWarning` is required: Next.js intentionally strips the
 * per-request nonce from the RSC payload sent to the client (echoing it
 * would defeat the purpose of a per-request secret), so React sees the
 * server-rendered `nonce="…"` but no nonce in the client tree. This is the
 * documented Next.js pattern for inline-script nonces in RSC.
 */
export async function JsonLd({ data }: { data: object | object[] }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <script
      nonce={nonce}
      suppressHydrationWarning
      type="application/ld+json"
      // Structured data is developer-authored, not user input — safe to inline.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
