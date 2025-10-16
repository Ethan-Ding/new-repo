export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { PayloadPaintingService } from '../../../../lib/services/payload-service';
import { calculateSurfaceCost } from '../../../../lib/calculations/pure-calculations';

/**
 * Calculate cost for a single surface
 * POST /api/calculate/surface-cost
 */
export async function POST(req: Request) {
  try {
    const {
      area,
      coats,
      paintTypeId,
      surfaceTypeId,
      paintQualityId,
      surfaceConditionId,
      surfaceCategory,
      laborRateId,
      region,
    } = await req.json();

    if (!area || !coats || !paintTypeId || !surfaceTypeId || !paintQualityId || !surfaceConditionId || !surfaceCategory) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const paintData = await PayloadPaintingService.getPaintDataByCombination(
      paintTypeId,
      surfaceTypeId,
      paintQualityId
    );

    if (!paintData) {
      return NextResponse.json(
        { error: 'No paint data found for the specified combination' },
        { status: 404 }
      );
    }

    const surfaceCondition = await PayloadPaintingService.getSurfaceConditionById(surfaceConditionId);
    if (!surfaceCondition) {
      return NextResponse.json(
        { error: 'Surface condition not found' },
        { status: 404 }
      );
    }

    let laborRate;
    if (laborRateId) {
      const laborRates = await PayloadPaintingService.getLaborRates();
      laborRate = laborRates.find(rate => rate.id === laborRateId);
    } else {
      laborRate = await PayloadPaintingService.getCurrentLaborRate(region);
    }

    if (!laborRate) {
      return NextResponse.json(
        { error: 'No labor rate found' },
        { status: 404 }
      );
    }

    const costBreakdown = calculateSurfaceCost(
      area,
      coats,
      paintData,
      surfaceCondition,
      surfaceCategory,
      laborRate
    );

    return NextResponse.json({
      success: true,
      costBreakdown,
      inputs: {
        area,
        coats,
        paintData: {
          costPerM2: paintData.costPerM2,
          coverage: paintData.coverage,
        },
        laborRate: {
          totalRate: laborRate.totalRate,
          profitMargin: laborRate.profitMargin,
        },
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