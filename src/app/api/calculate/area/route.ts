export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import {
  calculateWallArea,
  calculateDoorArea,
  calculateCeilingArea,
  calculateLinearSurfaceArea,
  validateSurfaceDimensions,
} from '../../../../lib/calculations/pure-calculations';

/**
 * Calculate area for a single surface
 * POST /api/calculate/area
 */
export async function POST(req: Request) {
  try {
    const { surfaceType, dimensions } = await req.json();

    if (!surfaceType || !dimensions) {
      return NextResponse.json(
        { error: 'Missing required fields: surfaceType, dimensions' },
        { status: 400 }
      );
    }

    const validation = validateSurfaceDimensions(surfaceType, dimensions);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Invalid dimensions',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    let result;
    switch (surfaceType) {
      case 'wall':
        result = calculateWallArea(dimensions);
        break;
      case 'door':
        result = calculateDoorArea(dimensions);
        break;
      case 'ceiling':
        result = calculateCeilingArea(dimensions);
        break;
      case 'linear':
        result = calculateLinearSurfaceArea(dimensions.length, dimensions.height);
        break;
      default:
        return NextResponse.json(
          { error: `Unsupported surface type: ${surfaceType}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      surfaceType,
      area: result,
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