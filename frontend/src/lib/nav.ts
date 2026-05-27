/**
 * Returns true when `href` is the active route for `pathname`.
 * With `end`, only an exact match counts; otherwise nested routes
 * (`/app/settings/account` under `/app/settings`) also match.
 *
 * Pure function — safe to call inside a `.map()`. For component-level use,
 * see the `useActivePath` hook.
 */
export function isActivePath(
  pathname: string,
  href: string,
  end = false,
): boolean {
  return end
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}
