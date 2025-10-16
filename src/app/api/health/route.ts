// src/app/api/health/route.ts

// Force Node runtime to avoid any edge-specific quirks in dev
export const runtime = 'nodejs';
// Mark as dynamic so it never gets cached during dev
export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 * Simple health check endpoint for uptime/monitoring and quick smoke tests.
 * Returns a minimal JSON payload `{ ok: true }`.
 */
export async function GET() {
  // Always return JSON (not HTML) with an explicit content-type header
  return new Response(
    JSON.stringify({ ok: true }),
    { headers: { 'content-type': 'application/json' } },
  );
}
