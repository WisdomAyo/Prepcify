import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/**
 * MSW Node server used in unit tests. Started/stopped from `vitest.setup.ts`.
 * Tests can call `server.use(...)` to override a handler for a single test.
 */
export const server = setupServer(...handlers);
