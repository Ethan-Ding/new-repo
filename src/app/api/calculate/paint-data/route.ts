export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { PayloadPaintingService } from '../../../../lib/services/payload-service';

/**
 * Get available paint data combinations
 * GET /api/calculate/paint-data
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const paintTypeName = searchParams.get('paintTypeName');
    const surfaceTypeName = searchParams.get('surfaceTypeName');
    const qualityLevel = searchParams.get('qualityLevel');
    const maxCostPerM2 = searchParams.get('maxCostPerM2');

    const filters: any = {};
    if (paintTypeName) filters.paintTypeName = paintTypeName;
    if (surfaceTypeName) filters.surfaceTypeName = surfaceTypeName;
    if (qualityLevel) filters.qualityLevel = qualityLevel;
    if (maxCostPerM2) filters.maxCostPerM2 = parseFloat(maxCostPerM2);

    const paintData = await PayloadPaintingService.searchPaintData(filters);

    return NextResponse.json({
      success: true,
      data: paintData,
      count: paintData.length,
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