export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { PayloadPaintingService } from '../../../../lib/services/payload-service';

/**
 * Get reference data (types, qualities, conditions, etc.)
 * GET /api/calculate/reference-data
 */
export async function GET() {
  try {
    const [paintTypes, surfaceTypes, paintQualities, surfaceConditions, laborRates] = await Promise.all([
      PayloadPaintingService.getPaintTypes(),
      PayloadPaintingService.getSurfaceTypes(),
      PayloadPaintingService.getPaintQualities(),
      PayloadPaintingService.getSurfaceConditions(),
      PayloadPaintingService.getLaborRates(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        paintTypes,
        surfaceTypes,
        paintQualities,
        surfaceConditions,
        laborRates,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}