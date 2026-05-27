import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "./src/test/msw/server";

// React Testing Library does not auto-clean between tests in Vitest.
afterEach(() => cleanup());

// MSW lifecycle — every fetch in tests is intercepted; unhandled requests
// throw so we never silently hit the real network.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// jsdom does not implement matchMedia — required by the `useIsMobile` hook
// and any component relying on responsive media queries.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

// jsdom lacks ResizeObserver / IntersectionObserver — used by Radix + framer-motion.
class MockObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("ResizeObserver", MockObserver);
vi.stubGlobal("IntersectionObserver", MockObserver);
