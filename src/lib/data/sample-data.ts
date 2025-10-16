/**
 * Sample data based on the Excel file structure
 * This data can be replaced with actual database calls or API responses
 */

import type {
  SurfaceCondition,
  SurfaceType,
  PaintType,
  PaintQuality,
  PaintData,
  LaborRate,
  LookupData,
  CalculationExample,
  PaintDataFilter,
  ValidationResult,
} from '../../types/painting';

// ====== LOOKUP DATA ======

export const SURFACE_CONDITIONS: SurfaceCondition[] = [
  {
    id: 1,
    name: 'Extremely poor',
    prepTimeWall: 5.0,      // min/m²
    prepTimeCeiling: 10.0,  // min/m²
    prepTimeDoor: 8.0,      // min/m²
    prepTimeLinear: 8.0,    // min/linear m
  },
  {
    id: 2,
    name: 'Poor',
    prepTimeWall: 4.0,
    prepTimeCeiling: 8.0,
    prepTimeDoor: 6.0,
    prepTimeLinear: 6.0,
  },
  {
    id: 3,
    name: 'Fair',
    prepTimeWall: 3.0,
    prepTimeCeiling: 6.0,
    prepTimeDoor: 4.0,
    prepTimeLinear: 4.0,
  },
  {
    id: 4,
    name: 'Good',
    prepTimeWall: 2.0,
    prepTimeCeiling: 4.0,
    prepTimeDoor: 2.0,
    prepTimeLinear: 2.0,
  },
  {
    id: 5,
    name: 'Very good',
    prepTimeWall: 1.0,
    prepTimeCeiling: 2.0,
    prepTimeDoor: 1.0,
    prepTimeLinear: 1.0,
  },
];

export const SURFACE_TYPES: SurfaceType[] = [
  { id: 1, name: 'Porous (masonry)', description: 'Brick, concrete block, rendered surfaces' },
  { id: 2, name: 'Semi-porous (gyprock)', description: 'Plasterboard, drywall surfaces' },
  { id: 3, name: 'Non-porous (plaster)', description: 'Smooth plaster, smooth concrete surfaces' },
  { id: 4, name: 'Weather/VJ boards (timber)', description: 'External timber cladding, weatherboards' },
  { id: 5, name: 'Other surface 1', description: 'Custom surface type 1' },
  { id: 6, name: 'Other surface 2', description: 'Custom surface type 2' },
];

export const PAINT_TYPES: PaintType[] = [
  { id: 1, name: 'Primer (never painted/stripped back surfaces)', category: 'primer' },
  { id: 2, name: 'Primer (substantially restored surfaces)', category: 'primer' },
  { id: 3, name: 'Undercoat (previously painted)', category: 'undercoat' },
  { id: 4, name: 'Top coat - ceiling', category: 'topcoat' },
  { id: 5, name: 'Top coat - matt', category: 'topcoat' },
  { id: 6, name: 'Top coat - satin', category: 'topcoat' },
  { id: 7, name: 'Top coat - semi gloss', category: 'topcoat' },
  { id: 8, name: 'Top coat - full gloss', category: 'topcoat' },
  { id: 9, name: 'Other top coat 1', category: 'topcoat' },
  { id: 10, name: 'Other top coat 2', category: 'topcoat' },
];

export const PAINT_QUALITIES: PaintQuality[] = [
  { id: 1, name: 'Budget' },
  { id: 2, name: 'Standard' },
  { id: 3, name: 'Premium' },
];

// ====== PAINT DATA (Coverage & Costs) ======

export const PAINT_DATA: PaintData[] = [
  // Budget Quality - Paint Type 1 (Primer - never painted)
  { paintTypeId: 1, surfaceTypeId: 1, paintQualityId: 1, coverage: 2.5, costPerM2: 7.0 },     // Porous
  { paintTypeId: 1, surfaceTypeId: 2, paintQualityId: 1, coverage: 3.846, costPerM2: 4.55 },  // Semi-porous
  { paintTypeId: 1, surfaceTypeId: 3, paintQualityId: 1, coverage: 4.167, costPerM2: 4.2 },   // Non-porous
  { paintTypeId: 1, surfaceTypeId: 4, paintQualityId: 1, coverage: 3.333, costPerM2: 5.25 },  // Timber

  // Budget Quality - Paint Type 2 (Primer - restored)
  { paintTypeId: 2, surfaceTypeId: 1, paintQualityId: 1, coverage: 8.0, costPerM2: 2.187 },
  { paintTypeId: 2, surfaceTypeId: 2, paintQualityId: 1, coverage: 8.348, costPerM2: 2.096 },
  { paintTypeId: 2, surfaceTypeId: 3, paintQualityId: 1, coverage: 8.727, costPerM2: 2.005 },
  { paintTypeId: 2, surfaceTypeId: 4, paintQualityId: 1, coverage: 7.68, costPerM2: 2.279 },

  // Budget Quality - Paint Type 3 (Undercoat)
  { paintTypeId: 3, surfaceTypeId: 1, paintQualityId: 1, coverage: 7.0, costPerM2: 2.679 },
  { paintTypeId: 3, surfaceTypeId: 2, paintQualityId: 1, coverage: 7.636, costPerM2: 2.455 },
  { paintTypeId: 3, surfaceTypeId: 3, paintQualityId: 1, coverage: 8.4, costPerM2: 2.232 },
  { paintTypeId: 3, surfaceTypeId: 4, paintQualityId: 1, coverage: 7.636, costPerM2: 2.455 },

  // Budget Quality - Paint Type 4 (Top coat - ceiling)
  { paintTypeId: 4, surfaceTypeId: 1, paintQualityId: 1, coverage: 11.2, costPerM2: 0.893 },
  { paintTypeId: 4, surfaceTypeId: 2, paintQualityId: 1, coverage: 11.2, costPerM2: 0.893 },
  { paintTypeId: 4, surfaceTypeId: 3, paintQualityId: 1, coverage: 11.2, costPerM2: 0.893 },
  { paintTypeId: 4, surfaceTypeId: 4, paintQualityId: 1, coverage: 11.2, costPerM2: 0.893 },

  // Budget Quality - Paint Type 5 (Top coat - matt)
  { paintTypeId: 5, surfaceTypeId: 1, paintQualityId: 1, coverage: 9.8, costPerM2: 2.551 },
  { paintTypeId: 5, surfaceTypeId: 2, paintQualityId: 1, coverage: 9.8, costPerM2: 2.551 },
  { paintTypeId: 5, surfaceTypeId: 3, paintQualityId: 1, coverage: 9.8, costPerM2: 2.551 },
  { paintTypeId: 5, surfaceTypeId: 4, paintQualityId: 1, coverage: 9.8, costPerM2: 2.551 },

  // Budget Quality - Paint Type 6 (Top coat - satin)
  { paintTypeId: 6, surfaceTypeId: 1, paintQualityId: 1, coverage: 9.1, costPerM2: 2.747 },
  { paintTypeId: 6, surfaceTypeId: 2, paintQualityId: 1, coverage: 9.1, costPerM2: 2.747 },
  { paintTypeId: 6, surfaceTypeId: 3, paintQualityId: 1, coverage: 9.1, costPerM2: 2.747 },
  { paintTypeId: 6, surfaceTypeId: 4, paintQualityId: 1, coverage: 9.1, costPerM2: 2.747 },

  // Budget Quality - Paint Type 7 (Top coat - semi gloss)
  { paintTypeId: 7, surfaceTypeId: 1, paintQualityId: 1, coverage: 8.4, costPerM2: 2.976 },
  { paintTypeId: 7, surfaceTypeId: 2, paintQualityId: 1, coverage: 8.4, costPerM2: 2.976 },
  { paintTypeId: 7, surfaceTypeId: 3, paintQualityId: 1, coverage: 8.4, costPerM2: 2.976 },
  { paintTypeId: 7, surfaceTypeId: 4, paintQualityId: 1, coverage: 8.4, costPerM2: 2.976 },

  // Budget Quality - Paint Type 8 (Top coat - full gloss)
  { paintTypeId: 8, surfaceTypeId: 1, paintQualityId: 1, coverage: 7.0, costPerM2: 3.571 },
  { paintTypeId: 8, surfaceTypeId: 2, paintQualityId: 1, coverage: 7.0, costPerM2: 3.571 },
  { paintTypeId: 8, surfaceTypeId: 3, paintQualityId: 1, coverage: 7.0, costPerM2: 3.571 },
  { paintTypeId: 8, surfaceTypeId: 4, paintQualityId: 1, coverage: 7.0, costPerM2: 3.571 },

  // Standard Quality - Higher coverage, higher cost (example multipliers)
  // Paint Type 5 (Matt) - Standard Quality
  { paintTypeId: 5, surfaceTypeId: 1, paintQualityId: 2, coverage: 10.8, costPerM2: 3.061 },
  { paintTypeId: 5, surfaceTypeId: 2, paintQualityId: 2, coverage: 10.8, costPerM2: 3.061 },
  { paintTypeId: 5, surfaceTypeId: 3, paintQualityId: 2, coverage: 10.8, costPerM2: 3.061 },
  { paintTypeId: 5, surfaceTypeId: 4, paintQualityId: 2, coverage: 10.8, costPerM2: 3.061 },

  // Premium Quality - Best coverage, highest cost
  // Paint Type 5 (Matt) - Premium Quality
  { paintTypeId: 5, surfaceTypeId: 1, paintQualityId: 3, coverage: 12.0, costPerM2: 3.826 },
  { paintTypeId: 5, surfaceTypeId: 2, paintQualityId: 3, coverage: 12.0, costPerM2: 3.826 },
  { paintTypeId: 5, surfaceTypeId: 3, paintQualityId: 3, coverage: 12.0, costPerM2: 3.826 },
  { paintTypeId: 5, surfaceTypeId: 4, paintQualityId: 3, coverage: 12.0, costPerM2: 3.826 },

  // Additional data for Standard and Premium qualities for other paint types
  // Paint Type 4 (Ceiling) - Standard Quality
  { paintTypeId: 4, surfaceTypeId: 1, paintQualityId: 2, coverage: 12.5, costPerM2: 1.12 },
  { paintTypeId: 4, surfaceTypeId: 2, paintQualityId: 2, coverage: 12.5, costPerM2: 1.12 },
  { paintTypeId: 4, surfaceTypeId: 3, paintQualityId: 2, coverage: 12.5, costPerM2: 1.12 },
  { paintTypeId: 4, surfaceTypeId: 4, paintQualityId: 2, coverage: 12.5, costPerM2: 1.12 },

  // Paint Type 4 (Ceiling) - Premium Quality
  { paintTypeId: 4, surfaceTypeId: 1, paintQualityId: 3, coverage: 14.0, costPerM2: 1.43 },
  { paintTypeId: 4, surfaceTypeId: 2, paintQualityId: 3, coverage: 14.0, costPerM2: 1.43 },
  { paintTypeId: 4, surfaceTypeId: 3, paintQualityId: 3, coverage: 14.0, costPerM2: 1.43 },
  { paintTypeId: 4, surfaceTypeId: 4, paintQualityId: 3, coverage: 14.0, costPerM2: 1.43 },

  // Paint Type 3 (Undercoat) - Standard Quality
  { paintTypeId: 3, surfaceTypeId: 1, paintQualityId: 2, coverage: 8.5, costPerM2: 3.22 },
  { paintTypeId: 3, surfaceTypeId: 2, paintQualityId: 2, coverage: 9.0, costPerM2: 2.95 },
  { paintTypeId: 3, surfaceTypeId: 3, paintQualityId: 2, coverage: 9.5, costPerM2: 2.68 },
  { paintTypeId: 3, surfaceTypeId: 4, paintQualityId: 2, coverage: 9.0, costPerM2: 2.95 },

  // Paint Type 3 (Undercoat) - Premium Quality
  { paintTypeId: 3, surfaceTypeId: 1, paintQualityId: 3, coverage: 10.0, costPerM2: 4.02 },
  { paintTypeId: 3, surfaceTypeId: 2, paintQualityId: 3, coverage: 10.5, costPerM2: 3.69 },
  { paintTypeId: 3, surfaceTypeId: 3, paintQualityId: 3, coverage: 11.0, costPerM2: 3.36 },
  { paintTypeId: 3, surfaceTypeId: 4, paintQualityId: 3, coverage: 10.5, costPerM2: 3.69 },
];

// ====== LABOR RATES ======

export const DEFAULT_LABOR_RATE: LaborRate = {
  directRate: 35.0,      // $/hour
  overheadRate: 35.0,    // $/hour
  totalRate: 70.0,       // $/hour
  profitMargin: 0.20,    // 20%
};

export const CONTRACTOR_LABOR_RATE: LaborRate = {
  directRate: 45.0,
  overheadRate: 25.0,
  totalRate: 70.0,
  profitMargin: 0.15,    // 15% (contractor might have lower margin)
};

// ====== HELPER FUNCTIONS ======

/**
 * Get surface condition by ID
 */
export function getSurfaceCondition(id: number): SurfaceCondition {
  const condition = SURFACE_CONDITIONS.find(c => c.id === id);
  if (!condition) {
    throw new Error(`Surface condition with ID ${id} not found`);
  }
  return condition;
}

/**
 * Get surface type by ID
 */
export function getSurfaceType(id: number): SurfaceType {
  const type = SURFACE_TYPES.find(t => t.id === id);
  if (!type) {
    throw new Error(`Surface type with ID ${id} not found`);
  }
  return type;
}

/**
 * Get paint type by ID
 */
export function getPaintType(id: number): PaintType {
  const type = PAINT_TYPES.find(t => t.id === id);
  if (!type) {
    throw new Error(`Paint type with ID ${id} not found`);
  }
  return type;
}

/**
 * Get paint quality by ID
 */
export function getPaintQuality(id: number): PaintQuality {
  const quality = PAINT_QUALITIES.find(q => q.id === id);
  if (!quality) {
    throw new Error(`Paint quality with ID ${id} not found`);
  }
  return quality;
}

/**
 * Get paint data for specific combination
 */
export function getPaintData(paintTypeId: number, surfaceTypeId: number, paintQualityId: number): PaintData {
  const data = PAINT_DATA.find(
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

// ====== EXAMPLE CALCULATIONS ======

export const CALCULATION_EXAMPLES: Record<string, CalculationExample> = {
  // Example 1: Living room wall calculation
  livingRoomWall: {
    description: 'Living room wall (East) - 3.2m high × 4.0m long with 1 door and 2 windows',
    input: {
      height: 3.2,
      length: 4.0,
      doorCount: 1,
      windowCount: 2,
    },
    expectedArea: {
      grossArea: 12.8,  // 3.2 × 4.0
      deductions: 5.398, // (2.0 × 0.9) + (2 × 1.599 × 1.0)
      netArea: 7.402,   // 12.8 - 5.398
    },
  },

  // Example 2: Complete room cost calculation
  completeRoom: {
    description: 'Complete lounge room painting - Budget quality, Fair condition',
    input: {}, // Added required input field
    surfaces: [
      {
        id: 'wall-1',
        name: 'Wall 1 (East)',
        area: 7.402,
        coats: 1,
        paintTypeId: 3, // Undercoat
        surfaceTypeId: 2, // Semi-porous (gyprock)
        paintQualityId: 1, // Budget
        surfaceConditionId: 3, // Fair
        surfaceCategory: 'wall' as const,
      },
      {
        id: 'wall-2',
        name: 'Wall 2 (South)',
        area: 6.402,
        coats: 1,
        paintTypeId: 3, // Undercoat
        surfaceTypeId: 2, // Semi-porous (gyprock)
        paintQualityId: 1, // Budget
        surfaceConditionId: 4, // Good
        surfaceCategory: 'wall' as const,
      },
      {
        id: 'ceiling',
        name: 'Ceiling',
        area: 12.0,
        coats: 1,
        paintTypeId: 4, // Top coat - ceiling
        surfaceTypeId: 2, // Semi-porous (gyprock)
        paintQualityId: 1, // Budget
        surfaceConditionId: 3, // Fair
        surfaceCategory: 'ceiling' as const,
      },
    ],
  },

  // Example 3: Door calculation
  standardDoor: {
    description: 'Standard door painting',
    input: {},
    expectedArea: {
      grossArea: 1.8,  // 2.0 × 0.9
      deductions: 0,
      netArea: 1.8,
    },
  },

  // Example 4: Ceiling calculation
  roomCeiling: {
    description: 'Room ceiling - 3.0m × 4.0m',
    input: {
      width: 3.0,
      length: 4.0,
    },
    expectedArea: {
      grossArea: 12.0,
      deductions: 0,
      netArea: 12.0,
    },
  },

  // Example 5: Linear surface (skirting)
  skirting: {
    description: 'Skirting boards - 14m perimeter × 0.1m height',
    input: {
      length: 14.0,
      height: 0.1,
    },
    expectedArea: {
      grossArea: 1.4,
      deductions: 0,
      netArea: 1.4,
    },
  },
};

// ====== DATA ACCESS FUNCTIONS ======

/**
 * Get all data needed for dropdowns/selects
 */
export function getAllLookupData(): LookupData {
  return {
    surfaceConditions: SURFACE_CONDITIONS,
    surfaceTypes: SURFACE_TYPES,
    paintTypes: PAINT_TYPES,
    paintQualities: PAINT_QUALITIES,
  };
}

/**
 * Get paint types filtered by category
 */
export function getPaintTypesByCategory(category: 'primer' | 'undercoat' | 'topcoat') {
  return PAINT_TYPES.filter(type => type.category === category);
}

/**
 * Get all paint data for a specific quality level
 */
export function getPaintDataByQuality(qualityId: number) {
  return PAINT_DATA.filter(data => data.paintQualityId === qualityId);
}

/**
 * Get available paint qualities for a paint type and surface type combination
 */
export function getAvailableQualities(paintTypeId: number, surfaceTypeId: number) {
  const availableQualityIds = PAINT_DATA
    .filter(data => data.paintTypeId === paintTypeId && data.surfaceTypeId === surfaceTypeId)
    .map(data => data.paintQualityId);

  return PAINT_QUALITIES.filter(quality => availableQualityIds.includes(quality.id));
}

// ====== MOCK API FUNCTIONS ======

/**
 * Mock function to simulate fetching data from API/database
 * The other team can replace these with actual API calls
 */
export const mockAPI = {
  async getSurfaceConditions(): Promise<SurfaceCondition[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return SURFACE_CONDITIONS;
  },

  async getSurfaceTypes(): Promise<SurfaceType[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return SURFACE_TYPES;
  },

  async getPaintTypes(): Promise<PaintType[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return PAINT_TYPES;
  },

  async getPaintQualities(): Promise<PaintQuality[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return PAINT_QUALITIES;
  },

  async getPaintData(filters?: PaintDataFilter): Promise<PaintData[]> {
    await new Promise(resolve => setTimeout(resolve, 100));

    let filtered = PAINT_DATA;

    if (filters?.paintTypeId) {
      filtered = filtered.filter(data => data.paintTypeId === filters.paintTypeId);
    }
    if (filters?.surfaceTypeId) {
      filtered = filtered.filter(data => data.surfaceTypeId === filters.surfaceTypeId);
    }
    if (filters?.paintQualityId) {
      filtered = filtered.filter(data => data.paintQualityId === filters.paintQualityId);
    }

    return filtered;
  },

  async getLaborRates(): Promise<LaborRate[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [DEFAULT_LABOR_RATE, CONTRACTOR_LABOR_RATE];
  },

  async getDefaultLaborRate(): Promise<LaborRate> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return DEFAULT_LABOR_RATE;
  },
};

// ====== VALIDATION HELPERS ======

/**
 * Validate that all required IDs exist in the lookup data
 */
export function validateSurfaceSpecification(spec: {
  surfaceConditionId: number;
  surfaceTypeId: number;
  paintTypeId: number;
  paintQualityId: number;
}): ValidationResult {
  const errors: string[] = [];

  try {
    getSurfaceCondition(spec.surfaceConditionId);
  } catch {
    errors.push(`Invalid surface condition ID: ${spec.surfaceConditionId}`);
  }

  try {
    getSurfaceType(spec.surfaceTypeId);
  } catch {
    errors.push(`Invalid surface type ID: ${spec.surfaceTypeId}`);
  }

  try {
    getPaintType(spec.paintTypeId);
  } catch {
    errors.push(`Invalid paint type ID: ${spec.paintTypeId}`);
  }

  try {
    getPaintQuality(spec.paintQualityId);
  } catch {
    errors.push(`Invalid paint quality ID: ${spec.paintQualityId}`);
  }

  // Check if paint data exists for this combination
  try {
    getPaintData(spec.paintTypeId, spec.surfaceTypeId, spec.paintQualityId);
  } catch {
    errors.push(`No paint data available for this combination`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ====== EXPORT ALL ======

export const sampleData = {
  // Raw data
  SURFACE_CONDITIONS,
  SURFACE_TYPES,
  PAINT_TYPES,
  PAINT_QUALITIES,
  PAINT_DATA,
  DEFAULT_LABOR_RATE,
  CONTRACTOR_LABOR_RATE,

  // Examples
  CALCULATION_EXAMPLES,

  // Helper functions
  getSurfaceCondition,
  getSurfaceType,
  getPaintType,
  getPaintQuality,
  getPaintData,
  getAllLookupData,
  getPaintTypesByCategory,
  getPaintDataByQuality,
  getAvailableQualities,
  validateSurfaceSpecification,

  // Mock API
  mockAPI,
};