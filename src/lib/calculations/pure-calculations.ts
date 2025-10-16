/**
 * Pure calculation functions for the RenoPilot Painting Cost Calculator
 * No database dependencies - all data passed as parameters
 * Can be used with any data source (database, API, static data, etc.)
 */

import type {
  SurfaceCondition,
  SurfaceType,
  PaintType,
  PaintQuality,
  PaintData,
  LaborRate,
  WallDimensions,
  SurfaceDimensions,
  AreaCalculationResult,
  MaterialCostResult,
  LaborCostResult,
  CostBreakdown,
  ValidationResult,
  ProjectSurface,
  ProjectCostSummary,
  SurfaceCategory,
  StandardDimensions,
} from '../../types/painting';

// ====== CONSTANTS ======

export const STANDARD_DIMENSIONS: StandardDimensions = {
  door: { height: 2.0, width: 0.9 },
  window: { height: 1.599, width: 1.0 },
} as const;

// ====== AREA CALCULATION FUNCTIONS ======

/**
 * Calculate wall area with deductions for doors and windows
 */
export function calculateWallArea(dimensions: WallDimensions): AreaCalculationResult {
  const { height, length, doorCount = 0, windowCount = 0, customDoorArea, customWindowArea } = dimensions;

  if (height <= 0 || length <= 0) {
    throw new Error('Height and length must be positive numbers');
  }

  if (doorCount < 0 || windowCount < 0) {
    throw new Error('Door and window counts must be non-negative');
  }

  const grossArea = height * length;

  const doorArea = customDoorArea ?? (doorCount * STANDARD_DIMENSIONS.door.height * STANDARD_DIMENSIONS.door.width);
  const windowArea = customWindowArea ?? (windowCount * STANDARD_DIMENSIONS.window.height * STANDARD_DIMENSIONS.window.width);

  const totalDeductions = doorArea + windowArea;
  const netArea = Math.max(0, grossArea - totalDeductions);

  return {
    grossArea,
    deductions: totalDeductions,
    netArea,
    breakdown: { doors: doorArea, windows: windowArea },
  };
}

/**
 * Calculate door area
 */
export function calculateDoorArea(dimensions: SurfaceDimensions): AreaCalculationResult {
  let area: number;

  if (dimensions.area !== undefined) {
    area = dimensions.area;
  } else if (dimensions.height !== undefined && dimensions.width !== undefined) {
    if (dimensions.height <= 0 || dimensions.width <= 0) {
      throw new Error('Door area must be positive');
    }
    area = dimensions.height * dimensions.width;
  } else {
    area = STANDARD_DIMENSIONS.door.height * STANDARD_DIMENSIONS.door.width;
  }

  if (area <= 0) {
    throw new Error('Door area must be positive');
  }

  return {
    grossArea: area,
    deductions: 0,
    netArea: area,
    breakdown: {},
  };
}

/**
 * Calculate ceiling area
 */
export function calculateCeilingArea(dimensions: SurfaceDimensions): AreaCalculationResult {
  let area: number;

  if (dimensions.area !== undefined) {
    area = dimensions.area;
  } else if (dimensions.width !== undefined && dimensions.length !== undefined) {
    if (dimensions.width <= 0 || dimensions.length <= 0) {
      throw new Error('Ceiling area must be positive');
    }
    area = dimensions.width * dimensions.length;
  } else {
    throw new Error('Ceiling requires either area or width and length');
  }

  if (area <= 0) {
    throw new Error('Ceiling area must be positive');
  }

  return {
    grossArea: area,
    deductions: 0,
    netArea: area,
    breakdown: {},
  };
}

/**
 * Calculate linear surface area (trim, skirting, cornice)
 */
export function calculateLinearSurfaceArea(length: number, height: number = 0.1): AreaCalculationResult {
  if (length <= 0 || height <= 0) {
    throw new Error('Length and height must be positive');
  }

  const area = length * height;

  return {
    grossArea: area,
    deductions: 0,
    netArea: area,
    breakdown: {},
  };
}

/**
 * Calculate room perimeter
 */
export function calculateRoomPerimeter(width: number, length: number): number {
  if (width <= 0 || length <= 0) {
    throw new Error('Width and length must be positive');
  }

  return 2 * (width + length);
}

// ====== COST CALCULATION FUNCTIONS ======

/**
 * Get paint data for specific combination
 */
export function findPaintData(
  paintData: PaintData[],
  paintTypeId: number,
  surfaceTypeId: number,
  paintQualityId: number
): PaintData {
  const data = paintData.find(
    p => p.paintTypeId === paintTypeId &&
      p.surfaceTypeId === surfaceTypeId &&
      p.paintQualityId === paintQualityId
  );

  if (!data) {
    throw new Error(
      `No paint data found for paint type ${paintTypeId}, surface type ${surfaceTypeId}, quality ${paintQualityId}`
    );
  }

  return data;
}

/**
 * Calculate material cost for painting a surface
 */
export function calculateMaterialCost(
  area: number,
  coats: number,
  paintData: PaintData
): MaterialCostResult {
  if (area <= 0 || coats <= 0) {
    throw new Error('Area and coats must be positive');
  }

  const totalAreaToPaint = area * coats;
  const paintVolume = totalAreaToPaint / paintData.coverage;
  const materialCost = totalAreaToPaint * paintData.costPerM2;

  return {
    materialCost,
    paintVolume,
    coverage: paintData.coverage,
    costPerM2: paintData.costPerM2,
  };
}

/**
 * Calculate labor cost for surface preparation and painting
 */
export function calculateLaborCost(
  area: number,
  surfaceCondition: SurfaceCondition,
  surfaceCategory: SurfaceCategory,
  laborRate: LaborRate
): LaborCostResult {
  if (area <= 0) {
    throw new Error('Area must be positive');
  }

  let prepTimePerUnit: number;
  switch (surfaceCategory) {
    case 'wall':
      prepTimePerUnit = surfaceCondition.prepTimeWall;
      break;
    case 'ceiling':
      prepTimePerUnit = surfaceCondition.prepTimeCeiling;
      break;
    case 'door':
      prepTimePerUnit = surfaceCondition.prepTimeDoor;
      break;
    case 'linear':
      prepTimePerUnit = surfaceCondition.prepTimeLinear;
      break;
    default:
      throw new Error(`Unsupported surface category: ${surfaceCategory}`);
  }

  const prepTime = area * prepTimePerUnit; // minutes
  const prepTimeHours = prepTime / 60;
  const totalRate = laborRate.totalRate || 0;
  const laborCost = prepTimeHours * totalRate;

  return {
    laborCost,
    prepTime,
    laborRate: totalRate,
  };
}

/**
 * Calculate complete cost breakdown for a surface
 */
export function calculateSurfaceCost(
  area: number,
  coats: number,
  paintData: PaintData,
  surfaceCondition: SurfaceCondition,
  surfaceCategory: SurfaceCategory,
  laborRate: LaborRate
): CostBreakdown {
  const materialCalc = calculateMaterialCost(area, coats, paintData);
  const laborCalc = calculateLaborCost(area, surfaceCondition, surfaceCategory, laborRate);

  const subtotal = materialCalc.materialCost + laborCalc.laborCost;
  const profitAmount = subtotal * laborRate.profitMargin;
  const totalCost = subtotal + profitAmount;

  return {
    materialCost: materialCalc.materialCost,
    laborCost: laborCalc.laborCost,
    subtotal,
    profitMargin: profitAmount,
    totalCost,
    details: {
      paintVolume: materialCalc.paintVolume,
      coverage: materialCalc.coverage,
      costPerM2: materialCalc.costPerM2,
      prepTime: laborCalc.prepTime,
      laborRate: laborCalc.laborRate,
    },
  };
}

/**
 * Calculate costs for multiple surfaces (project level)
 */
export function calculateProjectCosts(
  surfaces: Array<{
    id: string;
    name: string;
    area: number;
    coats: number;
    paintData: PaintData;
    surfaceCondition: SurfaceCondition;
    surfaceCategory: SurfaceCategory;
  }>,
  laborRate: LaborRate
): ProjectCostSummary {
  const surfaceResults = [];
  let totalArea = 0;
  let totalMaterialCost = 0;
  let totalLaborCost = 0;
  let totalSubtotal = 0;
  let totalProfitMargin = 0;
  let grandTotal = 0;

  for (const surface of surfaces) {
    const costBreakdown = calculateSurfaceCost(
      surface.area,
      surface.coats,
      surface.paintData,
      surface.surfaceCondition,
      surface.surfaceCategory,
      laborRate
    );

    surfaceResults.push({
      id: surface.id,
      name: surface.name,
      area: surface.area,
      costBreakdown,
    });

    totalArea += surface.area;
    totalMaterialCost += costBreakdown.materialCost;
    totalLaborCost += costBreakdown.laborCost;
    totalSubtotal += costBreakdown.subtotal;
    totalProfitMargin += costBreakdown.profitMargin;
    grandTotal += costBreakdown.totalCost;
  }

  return {
    surfaces: surfaceResults,
    totals: {
      totalArea,
      totalMaterialCost,
      totalLaborCost,
      totalSubtotal,
      totalProfitMargin,
      grandTotal,
    },
  };
}

// ====== HELPER FUNCTIONS ======

/**
 * Validate surface dimensions
 */
export function validateSurfaceDimensions(
  surfaceType: string,
  dimensions: Record<string, any>
): ValidationResult {
  const errors: string[] = [];

  switch (surfaceType) {
    case 'wall':
      if (!dimensions.height || dimensions.height <= 0) {
        errors.push('Wall height must be a positive number');
      }
      if (!dimensions.length || dimensions.length <= 0) {
        errors.push('Wall length must be a positive number');
      }
      break;

    case 'door':
      if (!dimensions.area && (!dimensions.height || !dimensions.width)) {
        errors.push('Door requires either area or height and width');
      }
      break;

    case 'ceiling':
      if (!dimensions.area && (!dimensions.width || !dimensions.length)) {
        errors.push('Ceiling requires either area or width and length');
      }
      break;

    case 'linear':
      if (!dimensions.length || dimensions.length <= 0) {
        errors.push('Linear surface length must be positive');
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'AUD'): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format area for display
 */
export function formatArea(area: number): string {
  return `${area.toFixed(2)} m²`;
}

/**
 * Format volume for display
 */
export function formatVolume(volume: number): string {
  return `${volume.toFixed(2)} L`;
}

/**
 * Format time for display
 */
export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

// ====== EXPORT ALL FUNCTIONS ======

export const paintingCalculations = {
  // Area calculations
  calculateWallArea,
  calculateDoorArea,
  calculateCeilingArea,
  calculateLinearSurfaceArea,
  calculateRoomPerimeter,

  // Cost calculations
  findPaintData,
  calculateMaterialCost,
  calculateLaborCost,
  calculateSurfaceCost,
  calculateProjectCosts,

  // Utilities
  validateSurfaceDimensions,
  formatCurrency,
  formatArea,
  formatVolume,
  formatTime,

  // Constants
  STANDARD_DIMENSIONS,
};