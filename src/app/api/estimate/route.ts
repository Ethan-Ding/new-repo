// dont think any of this code is relevant






// // src/app/api/estimate/route.ts

// import { NextResponse } from 'next/server';

// /**
//  * Room payload sent from the frontend.
//  * All dimensions are in METERS. Counts are integers (>= 0).
//  */
// type Room = {
//   name: string;
//   length_m: number; // room length in meters
//   width_m: number;  // room width in meters
//   height_m: number; // wall height in meters
//   doors?: number;   // number of doors in the room
//   windows?: number; // number of windows in the room
//   coats?: number;   // number of paint coats (defaults to 2)
//   paintId?: string | null; // optional reference to a paint item (not used in calc yet)
// };

// /**
//  * POST /api/estimate
//  * Calculates a rough painting estimate for the given rooms.
//  * - Assumptions:
//  *   • Door area = 1.9 m², Window area = 1.5 m²
//  *   • Coverage = 16 m² per litre
//  *   • Paint price = $35 per litre
//  *   • Productivity = 12 m² per hour
//  *   • Labour rate = $60 per hour
//  * - Formula (per room):
//  *   wallArea = 2 * (length + width) * height
//  *   netArea  = max(0, wallArea - doorArea - windowArea) * coats
//  *   litres   = netArea / COVER
//  */
// export async function POST(req: Request) {
//   try {
//     // Parse request body; default to empty list if not provided
//     const { rooms = [] } = (await req.json()) as { rooms: Room[] };

//     // Constants / assumptions used in the estimate
//     const DOOR = 1.9;         // m² per door
//     const WINDOW = 1.5;       // m² per window
//     const COVER = 16;         // m² covered per litre of paint
//     const PPL = 35;           // price per litre ($)
//     const RATE = 60;          // labour rate ($/hour)
//     const PROD = 12;          // productivity (m² per hour)

//     let area = 0;             // total painted area across all rooms

//     const perRoom = rooms.map((r) => {
//       const coats = r.coats ?? 2;

//       // Total wall surface area (perimeter * height)
//       const wall = 2 * (r.length_m + r.width_m) * r.height_m;

//       // Subtract openings (doors + windows)
//       const minus = (r.doors ?? 0) * DOOR + (r.windows ?? 0) * WINDOW;

//       // Net area cannot be negative; multiply by number of coats
//       const a = Math.max(0, wall - minus) * coats;

//       // Litres required for this room
//       const l = a / COVER;

//       area += a;

//       return {
//         name: r.name,
//         area_m2: a,
//         litres_required: l,
//         // Optional: allocate costs per room later if needed
//         cost: 0,
//       };
//     });

//     // Totals across all rooms
//     const litres = area / COVER;
//     const material = litres * PPL;
//     const labourHours = area / PROD;
//     const labour = labourHours * RATE;
//     const total = material + labour;

//     // Standard JSON response
//     return NextResponse.json({
//       totals: {
//         area_m2: area,
//         litres_required: litres,
//         material_cost: material,
//         labour_hours: labourHours,
//         labour_cost: labour,
//         grand_total: total,
//       },
//       perRoom,
//     });
//   } catch (e: any) {
//     // Always return JSON on error, not an HTML error page
//     return NextResponse.json(
//       { error: e?.message ?? 'Bad Request' },
//       { status: 400 },
//     );
//   }
// }
