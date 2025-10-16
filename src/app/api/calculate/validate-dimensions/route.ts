export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { validateSurfaceDimensions } from '../../../../lib/calculations/pure-calculations';

/**
 * Validate surface dimensions
 * POST /api/calculate/validate-dimensions
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

    return NextResponse.json({
      success: true,
      validation,
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