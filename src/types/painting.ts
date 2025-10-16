/**
 * TypeScript interfaces and types for the RenoPilot Painting Cost Calculator
 * All types used across the painting cost calculation system
 */

// ====== CORE SURFACE TYPES ======

export interface SurfaceCondition {
  id: number;
  name: string;
  prepTimeWall: number; // min/m²
  prepTimeCeiling: number; // min/m²
  prepTimeDoor: number; // min/m²
  prepTimeLinear: number; // min/linear m
}

export interface SurfaceType {
  id: number;
  name: string;
  description: string;
}

export interface PaintType {
  id: number;
  name: string;
  category: 'primer' | 'undercoat' | 'topcoat';
}

export interface PaintQuality {
  id: number;
  name: 'Budget' | 'Standard' | 'Premium';
}

export interface PaintData {
  id?: number;
  paintTypeId: number;
  surfaceTypeId: number;
  paintQualityId: number;
  coverage: number; // m²/litre
  costPerM2: number; // $/m²
  notes?: string | null;
}

export interface LaborRate {
  id?: number;
  name?: string;
  region?: string | null;
  directRate?: number; // $/hour
  hourlyRate?: number; // $/hour (alias for directRate)
  overheadRate: number; // $/hour
  totalRate: number | null | undefined; // $/hour
  profitMargin: number; // decimal (0.2 = 20%)
  effectiveDate?: string;
}

// ====== DIMENSION TYPES ======

export interface WallDimensions {
  height: number;
  length: number;
  doorCount?: number;
  windowCount?: number;
  customDoorArea?: number;
  customWindowArea?: number;
}

export interface SurfaceDimensions {
  height?: number;
  width?: number;
  length?: number;
  area?: number;
}

// ====== CALCULATION RESULT TYPES ======

export interface AreaCalculationResult {
  grossArea: number;
  deductions: number;
  netArea: number;
  breakdown: {
    doors?: number;
    windows?: number;
  };
}

export interface MaterialCostResult {
  materialCost: number;
  paintVolume: number; // litres
  coverage: number;
  costPerM2: number;
}

export interface LaborCostResult {
  laborCost: number;
  prepTime: number; // minutes
  laborRate: number;
}

export interface CostBreakdown {
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

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// ====== PROJECT TYPES ======

export interface ProjectSurface {
  id: string;
  name: string;
  area: number;
  coats: number;
  paintData: PaintData;
  surfaceCondition: SurfaceCondition;
  surfaceCategory: 'wall' | 'ceiling' | 'door' | 'linear';
}

export interface ProjectCostSummary {
  surfaces: Array<{
    id: string;
    name: string;
    area: number;
    costBreakdown: CostBreakdown;
  }>;
  totals: {
    totalArea: number;
    totalMaterialCost: number;
    totalLaborCost: number;
    totalSubtotal: number;
    totalProfitMargin: number;
    grandTotal: number;
  };
}

// ====== FORM/UI TYPES ======

export interface SurfaceFormData {
  name: string;
  surfaceType: 'wall' | 'ceiling' | 'door' | 'linear';
  dimensions: {
    height?: number;
    width?: number;
    length?: number;
    area?: number;
    doorCount?: number;
    windowCount?: number;
  };
  coats: number;
  surfaceConditionId: number;
  surfaceTypeId: number;
  paintTypeId: number;
  paintQualityId: number;
}

export interface CalculatorState {
  surfaces: ProjectSurface[];
  laborRate: LaborRate;
  projectSummary: ProjectCostSummary | null;
  loading: boolean;
  errors: string[];
}

// ====== LOOKUP DATA TYPES ======

export interface LookupData {
  surfaceConditions: SurfaceCondition[];
  surfaceTypes: SurfaceType[];
  paintTypes: PaintType[];
  paintQualities: PaintQuality[];
}

// ====== API TYPES ======

export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaintDataFilter {
  paintTypeId?: number;
  surfaceTypeId?: number;
  paintQualityId?: number;
}

// ====== CONSTANTS TYPES ======

export interface StandardDimensions {
  door: { height: number; width: number };
  window: { height: number; width: number };
}

// ====== CALCULATION EXAMPLE TYPES ======

export interface CalculationExample {
  description: string;
  input: Record<string, any>;
  expectedArea?: {
    grossArea: number;
    deductions: number;
    netArea: number;
  };
  surfaces?: Array<{
    id: string;
    name: string;
    area: number;
    coats: number;
    paintTypeId: number;
    surfaceTypeId: number;
    paintQualityId: number;
    surfaceConditionId: number;
    surfaceCategory: 'wall' | 'ceiling' | 'door' | 'linear';
  }>;
}

// ====== UTILITY TYPES ======

export type SurfaceCategory = 'wall' | 'ceiling' | 'door' | 'linear';
export type PaintCategory = 'primer' | 'undercoat' | 'topcoat';
export type QualityLevel = 'Budget' | 'Standard' | 'Premium';

// Note: All interfaces are already exported above, no need for duplicate export types