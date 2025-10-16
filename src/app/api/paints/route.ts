
// src/app/api/paints/route.ts

// // Ensure this runs on Node (not Edge) and is never statically cached.
// export const runtime = 'nodejs';
// export const dynamic = 'force-dynamic';

// import { NextResponse } from 'next/server';
// import { getPayload } from 'payload';

// /**
//  * GET /api/paints
//  * Reads paint items from the Payload collection `Paintcolor` (note: capital P),
//  * then normalizes them into a frontend-friendly shape.
//  */
// export async function GET() {
//   try {
//     // Load Payload config lazily to avoid ESM/alias issues in Next App Router
//     const { default: config } = await import('../../../payload.config');

//     // Initialize the local Payload instance
//     const payload = await getPayload({ config });

//     // IMPORTANT: Use the exact collection slug as defined in your config/Admin.
//     // If you later rename the collection to lowercase (e.g. 'paintcolors'),
//     // update this value accordingly.
//     const r = await payload.find({
//       collection: 'Paintcolor',
//       limit: 1000,
//       sort: 'paintColor', 
//     });

//     // Normalize records for the frontend
//     const paints = r.docs.map((d: any) => ({
//       id: d.id,
//       // Support both 'paintColor' (camel) and 'paintcolor' (flat) just in case
//       label: d.paintColor ?? d.paintcolor ?? '',
//       brand: null,
//       line: null,
//       finish: null,
//       coverage_m2_per_litre: null,
//       price_per_litre: null,
//     }));

//     // Always return JSON; NextResponse sets the correct content-type
//     return NextResponse.json({ paints, _collection: 'Paintcolor' });
//   } catch (e: any) {
//     // Log for server debugging and return a JSON error (avoid HTML error pages)
//     console.error('[/api/paints] error:', e);
//     return NextResponse.json(
//       { error: e?.message ?? 'Internal error' },
//       { status: 500 },
//     );
//   }
// }
