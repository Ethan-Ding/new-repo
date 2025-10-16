/**
 * Unit tests for pure calculation functions
 * Tests all calculation functions and edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateWallArea,
  calculateDoorArea,
  calculateCeilingArea,
  calculateLinearSurfaceArea,
  calculateRoomPerimeter,
  findPaintData,
  calculateMaterialCost,
  calculateLaborCost,
  calculateSurfaceCost,
  calculateProjectCosts,
  validateSurfaceDimensions,
  formatCurrency,
  formatArea,
  formatVolume,
  formatTime,
  STANDARD_DIMENSIONS,
} from '../../src/lib/calculations/pure-calculations';

import {
  SURFACE_CONDITIONS,
  PAINT_DATA,
  DEFAULT_LABOR_RATE,
  getSurfaceCondition,
  getPaintData,
} from '../../src/lib/data/sample-data';

import type {
  WallDimensions,
  SurfaceDimensions,
  PaintData,
  SurfaceCondition,
  LaborRate,
} from '../../src/types/painting';

describe('Area Calculation Functions', () => {
  describe('calculateWallArea', () => {
    it('should calculate basic wall area without deductions', () => {
      const dimensions: WallDimensions = {
        height: 3.0,
        length: 4.0,
      };

      const result = calculateWallArea(dimensions);

      expect(result.grossArea).toBe(12.0);
      expect(result.deductions).toBe(0);
      expect(result.netArea).toBe(12.0);
      expect(result.breakdown.doors).toBe(0);
      expect(result.breakdown.windows).toBe(0);
    });

    it('should calculate wall area with standard door and window deductions', () => {
      const dimensions: WallDimensions = {
        height: 3.2,
        length: 4.0,
        doorCount: 1,
        windowCount: 2,
      };

      const result = calculateWallArea(dimensions);
      const expectedGrossArea = 3.2 * 4.0; // 12.8
      const expectedDoorArea = 1 * STANDARD_DIMENSIONS.door.height * STANDARD_DIMENSIONS.door.width; // 1.8
      const expectedWindowArea = 2 * STANDARD_DIMENSIONS.window.height * STANDARD_DIMENSIONS.window.width; // 3.198

      expect(result.grossArea).toBe(expectedGrossArea);
      expect(result.breakdown.doors).toBe(expectedDoorArea);
      expect(result.breakdown.windows).toBe(expectedWindowArea);
      expect(result.deductions).toBe(expectedDoorArea + expectedWindowArea);
      expect(result.netArea).toBe(expectedGrossArea - result.deductions);
    });

    it('should use custom door and window areas when provided', () => {
      const dimensions: WallDimensions = {
        height: 3.0,
        length: 4.0,
        doorCount: 2,
        windowCount: 1,
        customDoorArea: 4.0, // Override standard door calculation
        customWindowArea: 2.0, // Override standard window calculation
      };

      const result = calculateWallArea(dimensions);

      expect(result.breakdown.doors).toBe(4.0);
      expect(result.breakdown.windows).toBe(2.0);
      expect(result.deductions).toBe(6.0);
      expect(result.netArea).toBe(12.0 - 6.0);
    });

    it('should ensure net area is never negative', () => {
      const dimensions: WallDimensions = {
        height: 1.0,
        length: 1.0, // Small wall
        doorCount: 2, // Large deductions
        windowCount: 5,
      };

      const result = calculateWallArea(dimensions);

      expect(result.netArea).toBe(0); // Should be clamped to 0
      expect(result.grossArea).toBe(1.0);
      expect(result.deductions).toBeGreaterThan(1.0);
    });

    it('should throw error for invalid dimensions', () => {
      expect(() => calculateWallArea({ height: 0, length: 4.0 })).toThrow('Height and length must be positive numbers');
      expect(() => calculateWallArea({ height: -1, length: 4.0 })).toThrow('Height and length must be positive numbers');
      expect(() => calculateWallArea({ height: 3.0, length: 0 })).toThrow('Height and length must be positive numbers');
    });

    it('should throw error for negative door/window counts', () => {
      expect(() => calculateWallArea({ height: 3.0, length: 4.0, doorCount: -1 })).toThrow('Door and window counts must be non-negative');
      expect(() => calculateWallArea({ height: 3.0, length: 4.0, windowCount: -1 })).toThrow('Door and window counts must be non-negative');
    });
  });

  describe('calculateDoorArea', () => {
    it('should use standard dimensions when no dimensions provided', () => {
      const result = calculateDoorArea({});
      const expectedArea = STANDARD_DIMENSIONS.door.height * STANDARD_DIMENSIONS.door.width;

      expect(result.grossArea).toBe(expectedArea);
      expect(result.netArea).toBe(expectedArea);
      expect(result.deductions).toBe(0);
    });

    it('should use provided dimensions', () => {
      const dimensions: SurfaceDimensions = {
        height: 2.1,
        width: 0.8,
      };

      const result = calculateDoorArea(dimensions);

      expect(result.grossArea).toBeCloseTo(1.68, 2);
      expect(result.netArea).toBeCloseTo(1.68, 2);
      expect(result.deductions).toBe(0);
    });

    it('should use provided area directly', () => {
      const dimensions: SurfaceDimensions = {
        area: 2.5,
      };

      const result = calculateDoorArea(dimensions);

      expect(result.grossArea).toBe(2.5);
      expect(result.netArea).toBe(2.5);
      expect(result.deductions).toBe(0);
    });

    it('should throw error for zero or negative area', () => {
      expect(() => calculateDoorArea({ area: 0 })).toThrow('Door area must be positive');
      expect(() => calculateDoorArea({ area: -1 })).toThrow('Door area must be positive');
      expect(() => calculateDoorArea({ height: 0, width: 1 })).toThrow('Door area must be positive');
    });
  });

  describe('calculateCeilingArea', () => {
    it('should calculate area from width and length', () => {
      const dimensions: SurfaceDimensions = {
        width: 3.0,
        length: 4.0,
      };

      const result = calculateCeilingArea(dimensions);

      expect(result.grossArea).toBe(12.0);
      expect(result.netArea).toBe(12.0);
      expect(result.deductions).toBe(0);
    });

    it('should use provided area directly', () => {
      const dimensions: SurfaceDimensions = {
        area: 15.5,
      };

      const result = calculateCeilingArea(dimensions);

      expect(result.grossArea).toBe(15.5);
      expect(result.netArea).toBe(15.5);
    });

    it('should throw error when missing required dimensions', () => {
      expect(() => calculateCeilingArea({})).toThrow('Ceiling requires either area or width and length');
      expect(() => calculateCeilingArea({ width: 3.0 })).toThrow('Ceiling requires either area or width and length');
      expect(() => calculateCeilingArea({ length: 4.0 })).toThrow('Ceiling requires either area or width and length');
    });

    it('should throw error for zero or negative area', () => {
      expect(() => calculateCeilingArea({ area: 0 })).toThrow('Ceiling area must be positive');
      expect(() => calculateCeilingArea({ width: 0, length: 4.0 })).toThrow('Ceiling area must be positive');
    });
  });

  describe('calculateLinearSurfaceArea', () => {
    it('should calculate area with default height', () => {
      const result = calculateLinearSurfaceArea(10.0);

      expect(result.grossArea).toBe(1.0); // 10.0 * 0.1
      expect(result.netArea).toBe(1.0);
      expect(result.deductions).toBe(0);
    });

    it('should calculate area with custom height', () => {
      const result = calculateLinearSurfaceArea(8.0, 0.15);

      expect(result.grossArea).toBe(1.2); // 8.0 * 0.15
      expect(result.netArea).toBe(1.2);
    });

    it('should throw error for invalid dimensions', () => {
      expect(() => calculateLinearSurfaceArea(0, 0.1)).toThrow('Length and height must be positive');
      expect(() => calculateLinearSurfaceArea(10, 0)).toThrow('Length and height must be positive');
      expect(() => calculateLinearSurfaceArea(-1, 0.1)).toThrow('Length and height must be positive');
    });
  });

  describe('calculateRoomPerimeter', () => {
    it('should calculate perimeter correctly', () => {
      const result = calculateRoomPerimeter(3.0, 4.0);
      expect(result).toBe(14.0); // 2 * (3 + 4)
    });

    it('should throw error for invalid dimensions', () => {
      expect(() => calculateRoomPerimeter(0, 4.0)).toThrow('Width and length must be positive');
      expect(() => calculateRoomPerimeter(3.0, -1)).toThrow('Width and length must be positive');
    });
  });
});

describe('Cost Calculation Functions', () => {
  let samplePaintData: PaintData[];
  let sampleSurfaceCondition: SurfaceCondition;
  let sampleLaborRate: LaborRate;

  beforeEach(() => {
    samplePaintData = PAINT_DATA;
    sampleSurfaceCondition = getSurfaceCondition(3); // Fair condition
    sampleLaborRate = DEFAULT_LABOR_RATE;
  });

  describe('findPaintData', () => {
    it('should find existing paint data', () => {
      const result = findPaintData(samplePaintData, 5, 2, 1); // Matt, Gyprock, Budget

      expect(result.paintTypeId).toBe(5);
      expect(result.surfaceTypeId).toBe(2);
      expect(result.paintQualityId).toBe(1);
      expect(result.coverage).toBe(9.8);
      expect(result.costPerM2).toBe(2.551);
    });

    it('should throw error for non-existent combination', () => {
      expect(() => findPaintData(samplePaintData, 999, 2, 1)).toThrow('No paint data found');
    });
  });

  describe('calculateMaterialCost', () => {
    it('should calculate material cost correctly', () => {
      const paintData = getPaintData(5, 2, 1); // Matt, Gyprock, Budget
      const result = calculateMaterialCost(10.0, 1, paintData);

      expect(result.materialCost).toBe(10.0 * 2.551); // area * costPerM2
      expect(result.paintVolume).toBe(10.0 / 9.8); // area / coverage
      expect(result.coverage).toBe(9.8);
      expect(result.costPerM2).toBe(2.551);
    });

    it('should handle multiple coats', () => {
      const paintData = getPaintData(5, 2, 1);
      const result = calculateMaterialCost(10.0, 2, paintData);

      expect(result.materialCost).toBe(20.0 * 2.551); // (area * coats) * costPerM2
      expect(result.paintVolume).toBe(20.0 / 9.8); // (area * coats) / coverage
    });

    it('should throw error for invalid inputs', () => {
      const paintData = getPaintData(5, 2, 1);
      expect(() => calculateMaterialCost(0, 1, paintData)).toThrow('Area and coats must be positive');
      expect(() => calculateMaterialCost(10, 0, paintData)).toThrow('Area and coats must be positive');
      expect(() => calculateMaterialCost(-1, 1, paintData)).toThrow('Area and coats must be positive');
    });
  });

  describe('calculateLaborCost', () => {
    it('should calculate labor cost for wall surface', () => {
      const result = calculateLaborCost(10.0, sampleSurfaceCondition, 'wall', sampleLaborRate);

      const expectedPrepTime = 10.0 * sampleSurfaceCondition.prepTimeWall; // 10 * 3 = 30 minutes
      const expectedLaborCost = (expectedPrepTime / 60) * sampleLaborRate.totalRate; // 0.5 * 70 = 35

      expect(result.prepTime).toBe(expectedPrepTime);
      expect(result.laborCost).toBe(expectedLaborCost);
      expect(result.laborRate).toBe(sampleLaborRate.totalRate);
    });

    it('should calculate labor cost for ceiling surface', () => {
      const result = calculateLaborCost(10.0, sampleSurfaceCondition, 'ceiling', sampleLaborRate);

      const expectedPrepTime = 10.0 * sampleSurfaceCondition.prepTimeCeiling; // 10 * 6 = 60 minutes
      const expectedLaborCost = (expectedPrepTime / 60) * sampleLaborRate.totalRate; // 1.0 * 70 = 70

      expect(result.prepTime).toBe(expectedPrepTime);
      expect(result.laborCost).toBe(expectedLaborCost);
    });

    it('should calculate labor cost for door surface', () => {
      const result = calculateLaborCost(2.0, sampleSurfaceCondition, 'door', sampleLaborRate);

      const expectedPrepTime = 2.0 * sampleSurfaceCondition.prepTimeDoor; // 2 * 4 = 8 minutes
      const expectedLaborCost = (expectedPrepTime / 60) * sampleLaborRate.totalRate;

      expect(result.prepTime).toBe(expectedPrepTime);
      expect(result.laborCost).toBe(expectedLaborCost);
    });

    it('should calculate labor cost for linear surface', () => {
      const result = calculateLaborCost(5.0, sampleSurfaceCondition, 'linear', sampleLaborRate);

      const expectedPrepTime = 5.0 * sampleSurfaceCondition.prepTimeLinear; // 5 * 4 = 20 minutes
      const expectedLaborCost = (expectedPrepTime / 60) * sampleLaborRate.totalRate;

      expect(result.prepTime).toBe(expectedPrepTime);
      expect(result.laborCost).toBe(expectedLaborCost);
    });

    it('should throw error for invalid inputs', () => {
      expect(() => calculateLaborCost(0, sampleSurfaceCondition, 'wall', sampleLaborRate)).toThrow('Area must be positive');
      expect(() => calculateLaborCost(-1, sampleSurfaceCondition, 'wall', sampleLaborRate)).toThrow('Area must be positive');
    });

    it('should throw error for invalid surface category', () => {
      expect(() => calculateLaborCost(10, sampleSurfaceCondition, 'invalid' as any, sampleLaborRate)).toThrow('Unsupported surface category');
    });
  });

  describe('calculateSurfaceCost', () => {
    it('should calculate complete surface cost breakdown', () => {
      const paintData = getPaintData(5, 2, 1); // Matt, Gyprock, Budget
      const area = 10.0;
      const coats = 1;

      const result = calculateSurfaceCost(
        area,
        coats,
        paintData,
        sampleSurfaceCondition,
        'wall',
        sampleLaborRate
      );

      // Verify material cost calculation
      const expectedMaterialCost = area * coats * paintData.costPerM2;
      expect(result.materialCost).toBe(expectedMaterialCost);

      // Verify labor cost calculation
      const expectedPrepTime = area * sampleSurfaceCondition.prepTimeWall;
      const expectedLaborCost = (expectedPrepTime / 60) * sampleLaborRate.totalRate;
      expect(result.laborCost).toBe(expectedLaborCost);

      // Verify totals
      const expectedSubtotal = expectedMaterialCost + expectedLaborCost;
      const expectedProfitMargin = expectedSubtotal * sampleLaborRate.profitMargin;
      const expectedTotal = expectedSubtotal + expectedProfitMargin;

      expect(result.subtotal).toBe(expectedSubtotal);
      expect(result.profitMargin).toBe(expectedProfitMargin);
      expect(result.totalCost).toBe(expectedTotal);

      // Verify details
      expect(result.details.paintVolume).toBe((area * coats) / paintData.coverage);
      expect(result.details.coverage).toBe(paintData.coverage);
      expect(result.details.costPerM2).toBe(paintData.costPerM2);
      expect(result.details.prepTime).toBe(expectedPrepTime);
      expect(result.details.laborRate).toBe(sampleLaborRate.totalRate);
    });
  });

  describe('calculateProjectCosts', () => {
    it('should calculate costs for multiple surfaces', () => {
      const surfaces = [
        {
          id: 'wall-1',
          name: 'Wall 1',
          area: 8.0,
          coats: 1,
          paintData: getPaintData(5, 2, 1), // Matt, Gyprock, Budget
          surfaceCondition: getSurfaceCondition(3), // Fair
          surfaceCategory: 'wall' as const,
        },
        {
          id: 'ceiling-1',
          name: 'Ceiling 1',
          area: 12.0,
          coats: 1,
          paintData: getPaintData(4, 2, 1), // Ceiling, Gyprock, Budget
          surfaceCondition: getSurfaceCondition(4), // Good
          surfaceCategory: 'ceiling' as const,
        },
      ];

      const result = calculateProjectCosts(surfaces, sampleLaborRate);

      expect(result.surfaces).toHaveLength(2);
      expect(result.surfaces[0].id).toBe('wall-1');
      expect(result.surfaces[1].id).toBe('ceiling-1');

      // Verify totals are sum of individual surfaces
      expect(result.totals.totalArea).toBe(20.0);
      
      const wall1Cost = result.surfaces[0].costBreakdown;
      const ceiling1Cost = result.surfaces[1].costBreakdown;

      expect(result.totals.totalMaterialCost).toBe(wall1Cost.materialCost + ceiling1Cost.materialCost);
      expect(result.totals.totalLaborCost).toBe(wall1Cost.laborCost + ceiling1Cost.laborCost);
      expect(result.totals.totalSubtotal).toBe(wall1Cost.subtotal + ceiling1Cost.subtotal);
      expect(result.totals.totalProfitMargin).toBe(wall1Cost.profitMargin + ceiling1Cost.profitMargin);
      expect(result.totals.grandTotal).toBe(wall1Cost.totalCost + ceiling1Cost.totalCost);
    });

    it('should handle empty surfaces array', () => {
      const result = calculateProjectCosts([], sampleLaborRate);

      expect(result.surfaces).toHaveLength(0);
      expect(result.totals.totalArea).toBe(0);
      expect(result.totals.grandTotal).toBe(0);
    });
  });
});

describe('Validation Functions', () => {
  describe('validateSurfaceDimensions', () => {
    it('should validate wall dimensions correctly', () => {
      const validWall = validateSurfaceDimensions('wall', { height: 3.0, length: 4.0 });
      expect(validWall.isValid).toBe(true);
      expect(validWall.errors).toHaveLength(0);

      const invalidWall = validateSurfaceDimensions('wall', { height: 0, length: 4.0 });
      expect(invalidWall.isValid).toBe(false);
      expect(invalidWall.errors).toContain('Wall height must be a positive number');

      const invalidWall2 = validateSurfaceDimensions('wall', { height: 3.0 });
      expect(invalidWall2.isValid).toBe(false);
      expect(invalidWall2.errors).toContain('Wall length must be a positive number');
    });

    it('should validate door dimensions correctly', () => {
      const validDoor1 = validateSurfaceDimensions('door', { height: 2.0, width: 0.9 });
      expect(validDoor1.isValid).toBe(true);

      const validDoor2 = validateSurfaceDimensions('door', { area: 1.8 });
      expect(validDoor2.isValid).toBe(true);

      const invalidDoor = validateSurfaceDimensions('door', {});
      expect(invalidDoor.isValid).toBe(false);
      expect(invalidDoor.errors).toContain('Door requires either area or height and width');
    });

    it('should validate ceiling dimensions correctly', () => {
      const validCeiling1 = validateSurfaceDimensions('ceiling', { width: 3.0, length: 4.0 });
      expect(validCeiling1.isValid).toBe(true);

      const validCeiling2 = validateSurfaceDimensions('ceiling', { area: 12.0 });
      expect(validCeiling2.isValid).toBe(true);

      const invalidCeiling = validateSurfaceDimensions('ceiling', { width: 3.0 });
      expect(invalidCeiling.isValid).toBe(false);
      expect(invalidCeiling.errors).toContain('Ceiling requires either area or width and length');
    });

    it('should validate linear surface dimensions correctly', () => {
      const validLinear = validateSurfaceDimensions('linear', { length: 10.0 });
      expect(validLinear.isValid).toBe(true);

      const invalidLinear = validateSurfaceDimensions('linear', {});
      expect(invalidLinear.isValid).toBe(false);
      expect(invalidLinear.errors).toContain('Linear surface length must be positive');
    });
  });
});

describe('Formatting Functions', () => {
  describe('formatCurrency', () => {
    it('should format AUD currency correctly', () => {
      expect(formatCurrency(123.45)).toBe('$123.45');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle custom currency', () => {
      expect(formatCurrency(123.45, 'USD')).toMatch(/123\.45/);
    });
  });

  describe('formatArea', () => {
    it('should format area correctly', () => {
      expect(formatArea(12.345)).toBe('12.35 m²');
      expect(formatArea(0)).toBe('0.00 m²');
      expect(formatArea(100)).toBe('100.00 m²');
    });
  });

  describe('formatVolume', () => {
    it('should format volume correctly', () => {
      expect(formatVolume(1.234)).toBe('1.23 L');
      expect(formatVolume(0)).toBe('0.00 L');
      expect(formatVolume(25)).toBe('25.00 L');
    });
  });

  describe('formatTime', () => {
    it('should format time correctly', () => {
      expect(formatTime(30)).toBe('30m');
      expect(formatTime(60)).toBe('1h 0m');
      expect(formatTime(90)).toBe('1h 30m');
      expect(formatTime(150)).toBe('2h 30m');
      expect(formatTime(125)).toBe('2h 5m');
    });
  });
});

describe('Constants', () => {
  describe('STANDARD_DIMENSIONS', () => {
    it('should have correct standard dimensions', () => {
      expect(STANDARD_DIMENSIONS.door.height).toBe(2.0);
      expect(STANDARD_DIMENSIONS.door.width).toBe(0.9);
      expect(STANDARD_DIMENSIONS.window.height).toBe(1.599);
      expect(STANDARD_DIMENSIONS.window.width).toBe(1.0);
    });
  });
});

describe('Integration Tests', () => {
  it('should calculate complete living room example', () => {
    // Based on CALCULATION_EXAMPLES.livingRoomWall
    const wallDimensions: WallDimensions = {
      height: 3.2,
      length: 4.0,
      doorCount: 1,
      windowCount: 2,
    };

    const areaResult = calculateWallArea(wallDimensions);
    
    expect(areaResult.grossArea).toBe(12.8);
    // Door: 2.0 × 0.9 = 1.8, Windows: 2 × (1.599 × 1.0) = 3.198, Total: 4.998
    expect(areaResult.deductions).toBeCloseTo(4.998, 3);
    expect(areaResult.netArea).toBeCloseTo(7.802, 3);

    // Now calculate the cost for this wall
    const paintData = getPaintData(5, 2, 1); // Matt, Gyprock, Budget
    const surfaceCondition = getSurfaceCondition(3); // Fair
    const laborRate = DEFAULT_LABOR_RATE;

    const costResult = calculateSurfaceCost(
      areaResult.netArea,
      1,
      paintData,
      surfaceCondition,
      'wall',
      laborRate
    );

    expect(costResult.materialCost).toBeCloseTo(7.802 * 2.551, 2);
    expect(costResult.laborCost).toBeCloseTo((7.802 * 3 / 60) * 70, 2);
    expect(costResult.totalCost).toBeGreaterThan(costResult.subtotal);
  });
});