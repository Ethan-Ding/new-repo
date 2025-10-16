export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { PayloadPaintingService } from '../../../../lib/services/payload-service';
import { calculateProjectCosts } from '../../../../lib/calculations/pure-calculations';

/**
 * Calculate costs for multiple surfaces (project level)
 * POST /api/calculate/project-cost
 */
export async function POST(req: Request) {
  try {
    const { surfaces, laborRateId, region } = await req.json();

    if (!surfaces || !Array.isArray(surfaces) || surfaces.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid surfaces array' },
        { status: 400 }
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

    const processedSurfaces = [];
    for (const surface of surfaces) {
      const {
        id,
        name,
        area,
        coats,
        paintTypeId,
        surfaceTypeId,
        paintQualityId,
        surfaceConditionId,
        surfaceCategory,
      } = surface;

      if (!id || !name || !area || !coats || !paintTypeId || !surfaceTypeId || !paintQualityId || !surfaceConditionId || !surfaceCategory) {
        return NextResponse.json(
          { error: `Missing required fields for surface: ${name || id}` },
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
          { error: `No paint data found for surface: ${name}` },
          { status: 404 }
        );
      }
      console.log('paintData for', { paintTypeId, surfaceTypeId, paintQualityId }, paintData);

      const surfaceCondition = await PayloadPaintingService.getSurfaceConditionById(surfaceConditionId);
      console.log('surfaceCondition', surfaceCondition);
      if (!surfaceCondition) {
        return NextResponse.json(
          { error: `Surface condition not found for surface: ${name}` },
          { status: 404 }
        );
      }

      processedSurfaces.push({
        id,
        name,
        area,
        coats,
        paintData,
        surfaceCondition,
        surfaceCategory,
      });
    }

    const projectCosts = calculateProjectCosts(processedSurfaces, laborRate);

    return NextResponse.json({
      success: true,
      projectCosts,
      laborRate: {
        name: laborRate.name,
        region: laborRate.region,
        totalRate: laborRate.totalRate,
        profitMargin: laborRate.profitMargin,
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