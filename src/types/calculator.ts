/**
 * TypeScript types for Calculator UI Components
 * These types are specific to the frontend calculator interface
 */

// ====== ROOM & SURFACE UI TYPES ======

export interface Wall {
  id: number;
  length: number; // mm
  height: number; // mm
  doorCount?: number; // Number of doors on this wall
  windowCount?: number; // Number of windows on this wall
  // Paint/surface selections for this specific wall
  paintTypeId?: number | null;
  surfaceTypeId?: number | null;
  paintQualityId?: number | null;
  surfaceConditionId?: number | null;
}

export interface Trim {
  id: number;
  length: number; // mm
  height: number; // mm
  // Paint/surface selections for this specific trim
  paintTypeId?: number | null;
  surfaceTypeId?: number | null;
  paintQualityId?: number | null;
  surfaceConditionId?: number | null;
}

export interface Door {
  id: number;
  width: number; // mm
  height: number; // mm
  // Paint/surface selections for this specific door
  paintTypeId?: number | null;
  surfaceTypeId?: number | null;
  paintQualityId?: number | null;
  surfaceConditionId?: number | null;
}

export interface Window {
  id: number;
  width: number; // mm
  height: number; // mm
  // Paint/surface selections for this specific window
  paintTypeId?: number | null;
  surfaceTypeId?: number | null;
  paintQualityId?: number | null;
  surfaceConditionId?: number | null;
}

export interface Floor {
  id: number;
  length: number; // mm
  width: number; // mm
  // Paint/surface selections for this specific floor
  paintTypeId?: number | null;
  surfaceTypeId?: number | null;
  paintQualityId?: number | null;
  surfaceConditionId?: number | null;
}

export interface Ceiling {
  id: number;
  length: number; // mm
  width: number; // mm
  // Paint/surface selections for this specific ceiling
  paintTypeId?: number | null;
  surfaceTypeId?: number | null;
  paintQualityId?: number | null;
  surfaceConditionId?: number | null;
}

export interface Room {
  id: number;
  name: string;
  paintQuality: string;
  paintQualityCost: string;
  paintFinish: string;
  paintFinishCost: string;
  paintFinishCostManual: string;
  paintColour: string;
  paintColourCost: string;
  paintColourCostManual: string;
  // PayloadCMS IDs for paint/surface selections
  paintTypeId?: number | null;
  surfaceTypeId?: number | null;
  paintQualityId?: number | null;
  surfaceConditionId?: number | null;
  doors: Door[];
  windows: Window[];
  walls: Wall[];
  trims: Trim[];
  floors: Floor[];
  ceilings: Ceiling[];
}

// ====== API REQUEST/RESPONSE TYPES ======

export interface APISurface {
  id: string;
  name: string;
  area: number; // m²
  coats: number;
  paintTypeId: number;
  surfaceTypeId: number;
  paintQualityId: number;
  surfaceConditionId: number;
  surfaceCategory: 'wall' | 'ceiling' | 'door' | 'linear';
}

export interface ProjectCostRequest {
  surfaces: APISurface[];
  laborRateId?: number;
  region?: string;
}

export interface SurfaceCostBreakdown {
  materialCost: number;
  laborCost: number;
  subtotal: number;
  profitMargin: number;
  totalCost: number;
  details: {
    paintVolume: number;
    coverage: number;
    costPerM2: number;
    prepTime: number;
    laborRate: number;
  };
}

export interface ProjectCostResponse {
  projectCosts: {
    surfaces: Array<{
      id: string;
      name: string;
      area: number;
      costBreakdown: SurfaceCostBreakdown;
    }>;
    totals: {
      totalArea: number;
      totalMaterialCost: number;
      totalLaborCost: number;
      totalSubtotal: number;
      totalProfitMargin: number;
      grandTotal: number;
    };
  };
}

// ====== REFERENCE DATA TYPES ======

export interface PaintType {
  id: number;
  name: string;
  category?: string | null;
  key?: string | null;
  description?: string | null;
}

export interface SurfaceType {
  id: number;
  name: string;
  description?: string | null;
  category?: string | null;
  key?: string | null;
}

export interface PaintQuality {
  id: number;
  name: string;
  level?: string | null;
  key?: string | null;
  description?: string | null;
}

export interface SurfaceCondition {
  id: number;
  name: string;
  code?: string;
  key?: string;
  description?: string | null;
  prepTimeWall: number;
  prepTimeCeiling: number;
  prepTimeDoor: number;
  prepTimeLinear: number;
}

export interface LaborRate {
  id: number;
  name: string;
  region: string | null | undefined;
  hourlyRate?: number;
  directRate?: number;
  overheadRate: number;
  totalRate: number | null | undefined;
  profitMargin: number;
  effectiveDate?: string;
}

export interface ReferenceData {
  paintTypes: PaintType[];
  surfaceTypes: SurfaceType[];
  paintQualities: PaintQuality[];
  surfaceConditions: SurfaceCondition[];
  laborRates: LaborRate[];
}

export interface ReferenceDataResponse {
  data: ReferenceData;
}

// ====== DEFAULT IDS FOR CALCULATOR ======

export interface SurfaceDefaults {
  paintTypeId: number | null;
  surfaceTypeId: number | null;
  paintQualityId: number | null;
  surfaceConditionId: number | null;
  surfaceCategory: 'wall' | 'ceiling' | 'door' | 'linear';
}

export interface CalculatorDefaults {
  wall: SurfaceDefaults;
  ceiling: SurfaceDefaults;
}

// ====== ESTIMATE STATE ======

export interface CalculatorEstimate {
  projectCosts?: {
    surfaces: Array<{
      id: string;
      name: string;
      area: number;
      costBreakdown: SurfaceCostBreakdown;
    }>;
    totals: {
      totalArea: number;
      totalMaterialCost: number;
      totalLaborCost: number;
      totalSubtotal: number;
      totalProfitMargin: number;
      grandTotal: number;
    };
  };
  projectTotal: number;
}

// ====== PAINT OPTIONS (UI SPECIFIC) ======

export interface PaintOption {
  value: string;
  label: string;
  price?: number;
  cost?: number;
}

export interface PaintOptions {
  quality: PaintOption[];
  finish: PaintOption[];
  colour: PaintOption[];
}