/**
 * Database schema is managed by Prisma (`npm run db:init`).
 *
 * Pages keep calling this helper so the app can evolve without touching every
 * route, but MySQL deployments should initialize tables before starting the
 * application. The Docker app service does that automatically in its startup
 * command.
 */
export async function ensureDatabase() {
  return;
}
