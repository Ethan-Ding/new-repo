/**
 * API Client for Calculator
 * Handles all API communication with the backend calculation endpoints
 */

import {
  Room,
  APISurface,
  ProjectCostRequest,
  ProjectCostResponse,
  ReferenceDataResponse,
  ReferenceData,
  CalculatorDefaults,
} from '@/types/calculator'
import {
  calculateWallArea,
  calculateCeilingArea,
  calculateDoorArea,
  calculateLinearSurfaceArea,
  STANDARD_DIMENSIONS
} from '@/lib/calculations/pure-calculations'

/**
 * Convert frontend rooms to API surfaces format
 * Transforms room data with walls, doors, windows, etc. into flat surface objects for API
 */
export function toApiSurfaces(rooms: Room[], defaults: CalculatorDefaults): APISurface[] {
  if (!defaults) return []

  const mm2ToM2 = (mm2: number): number => (Number(mm2) || 0) / 1_000_000
  const safe = (v: number | undefined): number => Number(v) || 0

  const COATS_DEFAULT = 2

  return (rooms ?? []).flatMap((room) => {
    const walls = room.walls ?? []
    const trims = room.trims ?? []
    const ceilings = room.ceilings ?? []
    const doors = room.doors ?? []
    const windows = room.windows ?? []
    const floors = room.floors ?? []

    const surfaces: APISurface[] = []

    // Add each wall as a separate surface
    walls.forEach((wall) => {
      // Only include surfaces that have all paint options selected
      const hasAllPaintOptions = wall.paintTypeId && wall.surfaceTypeId && wall.paintQualityId && wall.surfaceConditionId
      if (safe(wall.length) > 0 && safe(wall.height) > 0 && hasAllPaintOptions) {
        // Convert mm to meters for pure-calculations
        const heightM = safe(wall.height) / 1000
        const lengthM = safe(wall.length) / 1000

        // Use calculateWallArea from pure-calculations to deduct doors/windows
        const wallAreaResult = calculateWallArea({
          height: heightM,
          length: lengthM,
          doorCount: wall.doorCount || 0,
          windowCount: wall.windowCount || 0,
        })

        // Only add if net area is positive
        if (wallAreaResult.netArea > 0) {
          surfaces.push({
            id: `room-${room.id}-wall-${wall.id}`,
            name: `${room.name} – Wall ${wall.id}`,
            area: wallAreaResult.netArea, // Already in m²
            coats: COATS_DEFAULT,
            paintTypeId: wall.paintTypeId!,
            surfaceTypeId: wall.surfaceTypeId!,
            paintQualityId: wall.paintQualityId!,
            surfaceConditionId: wall.surfaceConditionId!,
            surfaceCategory: 'wall',
          })
        }
      }
    })

    // Add each ceiling as a separate surface
    ceilings.forEach((ceiling) => {
      // Only include surfaces that have all paint options selected
      const hasAllPaintOptions = ceiling.paintTypeId && ceiling.surfaceTypeId && ceiling.paintQualityId && ceiling.surfaceConditionId
      if (safe(ceiling.length) > 0 && safe(ceiling.width) > 0 && hasAllPaintOptions) {
        // Convert mm to meters for pure-calculations
        const lengthM = safe(ceiling.length) / 1000
        const widthM = safe(ceiling.width) / 1000

        // Use calculateCeilingArea from pure-calculations
        const ceilingAreaResult = calculateCeilingArea({
          length: lengthM,
          width: widthM,
        })

        if (ceilingAreaResult.netArea > 0) {
          surfaces.push({
            id: `room-${room.id}-ceiling-${ceiling.id}`,
            name: `${room.name} – Ceiling ${ceiling.id}`,
            area: ceilingAreaResult.netArea, // Already in m²
            coats: COATS_DEFAULT,
            paintTypeId: ceiling.paintTypeId!,
            surfaceTypeId: ceiling.surfaceTypeId!,
            paintQualityId: ceiling.paintQualityId!,
            surfaceConditionId: ceiling.surfaceConditionId!,
            surfaceCategory: 'ceiling',
          })
        }
      }
    })

    // Add each trim as a separate surface
    trims.forEach((trim) => {
      // Only include surfaces that have all paint options selected
      const hasAllPaintOptions = trim.paintTypeId && trim.surfaceTypeId && trim.paintQualityId && trim.surfaceConditionId
      if (safe(trim.length) > 0 && safe(trim.height) > 0 && hasAllPaintOptions) {
        // Convert mm to meters for pure-calculations
        const lengthM = safe(trim.length) / 1000
        const heightM = safe(trim.height) / 1000

        // Use calculateLinearSurfaceArea from pure-calculations
        const trimAreaResult = calculateLinearSurfaceArea(lengthM, heightM)

        if (trimAreaResult.netArea > 0) {
          surfaces.push({
            id: `room-${room.id}-trim-${trim.id}`,
            name: `${room.name} – Trim ${trim.id}`,
            area: trimAreaResult.netArea, // Already in m²
            coats: COATS_DEFAULT,
            paintTypeId: trim.paintTypeId!,
            surfaceTypeId: trim.surfaceTypeId!,
            paintQualityId: trim.paintQualityId!,
            surfaceConditionId: trim.surfaceConditionId!,
            surfaceCategory: 'linear',
          })
        }
      }
    })

    // Add each door as a separate surface
    doors.forEach((door) => {
      // Only include surfaces that have all paint options selected
      const hasAllPaintOptions = door.paintTypeId && door.surfaceTypeId && door.paintQualityId && door.surfaceConditionId
      if (safe(door.width) > 0 && safe(door.height) > 0 && hasAllPaintOptions) {
        // Convert mm to meters for pure-calculations
        const widthM = safe(door.width) / 1000
        const heightM = safe(door.height) / 1000

        // Use calculateDoorArea from pure-calculations
        const doorAreaResult = calculateDoorArea({
          width: widthM,
          height: heightM,
        })

        if (doorAreaResult.netArea > 0) {
          surfaces.push({
            id: `room-${room.id}-door-${door.id}`,
            name: `${room.name} – Door ${door.id}`,
            area: doorAreaResult.netArea, // Already in m²
            coats: COATS_DEFAULT,
            paintTypeId: door.paintTypeId!,
            surfaceTypeId: door.surfaceTypeId!,
            paintQualityId: door.paintQualityId!,
            surfaceConditionId: door.surfaceConditionId!,
            surfaceCategory: 'door',
          })
        }
      }
    })

    // Add each window as a separate surface
    windows.forEach((window) => {
      // Only include surfaces that have all paint options selected
      const hasAllPaintOptions = window.paintTypeId && window.surfaceTypeId && window.paintQualityId && window.surfaceConditionId
      if (safe(window.width) > 0 && safe(window.height) > 0 && hasAllPaintOptions) {
        // Convert mm to meters for pure-calculations
        const widthM = safe(window.width) / 1000
        const heightM = safe(window.height) / 1000

        // Use calculateLinearSurfaceArea from pure-calculations
        // Windows are linear surfaces (perimeter-based like trim)
        const windowPerimeter = 2 * (widthM + heightM)
        const windowAreaResult = calculateLinearSurfaceArea(windowPerimeter, 0.1) // Default 100mm height for trim

        if (windowAreaResult.netArea > 0) {
          surfaces.push({
            id: `room-${room.id}-window-${window.id}`,
            name: `${room.name} – Window ${window.id}`,
            area: windowAreaResult.netArea, // Already in m²
            coats: COATS_DEFAULT,
            paintTypeId: window.paintTypeId!,
            surfaceTypeId: window.surfaceTypeId!,
            paintQualityId: window.paintQualityId!,
            surfaceConditionId: window.surfaceConditionId!,
            surfaceCategory: 'linear',
          })
        }
      }
    })

    // Add each floor as a separate surface
    floors.forEach((floor) => {
      // Only include surfaces that have all paint options selected
      const hasAllPaintOptions = floor.paintTypeId && floor.surfaceTypeId && floor.paintQualityId && floor.surfaceConditionId
      if (safe(floor.length) > 0 && safe(floor.width) > 0 && hasAllPaintOptions) {
        // Convert mm to meters for pure-calculations
        const lengthM = safe(floor.length) / 1000
        const widthM = safe(floor.width) / 1000

        // Use calculateCeilingArea from pure-calculations (floors are calculated like ceilings)
        const floorAreaResult = calculateCeilingArea({
          length: lengthM,
          width: widthM,
        })

        if (floorAreaResult.netArea > 0) {
          surfaces.push({
            id: `room-${room.id}-floor-${floor.id}`,
            name: `${room.name} – Floor ${floor.id}`,
            area: floorAreaResult.netArea, // Already in m²
            coats: COATS_DEFAULT,
            paintTypeId: floor.paintTypeId!,
            surfaceTypeId: floor.surfaceTypeId!,
            paintQualityId: floor.paintQualityId!,
            surfaceConditionId: floor.surfaceConditionId!,
            surfaceCategory: 'wall', // Floors use wall category for now
          })
        }
      }
    })

    return surfaces
  })
}

/**
 * Fetch reference data (paint types, qualities, conditions, etc.)
 * GET /api/calculate/reference-data
 */
export async function fetchReferenceData(): Promise<ReferenceData> {
  const res = await fetch('/api/calculate/reference-data', { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`Failed to fetch reference data: ${res.status} ${res.statusText}`)
  }
  const json: ReferenceDataResponse = await res.json()
  return json.data
}

/**
 * Calculate project cost for given surfaces
 * POST /api/calculate/project-cost
 */
export async function calculateProjectCost(
  surfaces: APISurface[],
  options: {
    laborRateId?: number
    region?: string
    signal?: AbortSignal
  } = {},
): Promise<ProjectCostResponse> {
  const { laborRateId, region, signal } = options

  const requestBody: ProjectCostRequest = {
    surfaces,
    laborRateId,
    region,
  }

  const res = await fetch('/api/calculate/project-cost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
    signal,
  })

  if (!res.ok) {
    // Try to get error message from response
    let errorMessage = `Failed to calculate project cost: ${res.status} ${res.statusText}`
    try {
      const errorData = await res.json()
      if (errorData.message) {
        errorMessage = errorData.message
      }
    } catch {
      // If can't parse error as JSON, try text
      try {
        const errorText = await res.text()
        if (errorText) {
          errorMessage = errorText
        }
      } catch {
        // Use default error message
      }
    }
    throw new Error(errorMessage)
  }

  return res.json()
}

/**
 * Helper to find default IDs from reference data
 * Searches by various fields (name, key, code, level) in a case-insensitive manner
 */
export function findDefaultIds(data: ReferenceData): CalculatorDefaults {
  const norm = (s: string | null | undefined): string => (typeof s === 'string' ? s.trim().toLowerCase() : '')

  const findId = (
    arr: Array<{ id: number; [key: string]: any }>,
    target: string,
  ): number | null => {
    const item = arr?.find((x) =>
      [x.level, x.name, x.key, x.code].some((v) => norm(v) === norm(target)),
    )
    return item?.id ?? null
  }

  // Find by category for surface types
  const findByCategory = (arr: Array<{ id: number; category?: string | null; [key: string]: any }>, category: string): number | null => {
    const item = arr?.find((x) => norm(x.category) === norm(category))
    return item?.id ?? null
  }

  return {
    wall: {
      paintTypeId: findId(data.paintTypes, 'interior latex') || data.paintTypes?.[0]?.id || null,
      surfaceTypeId: findByCategory(data.surfaceTypes, 'wall') || data.surfaceTypes?.[0]?.id || null,
      paintQualityId: findId(data.paintQualities, 'standard') || data.paintQualities?.[0]?.id || null,
      surfaceConditionId: findId(data.surfaceConditions, 'good') || data.surfaceConditions?.[0]?.id || null,
      surfaceCategory: 'wall',
    },
    ceiling: {
      paintTypeId: findId(data.paintTypes, 'interior latex') || data.paintTypes?.[0]?.id || null,
      surfaceTypeId: findByCategory(data.surfaceTypes, 'ceiling') || data.surfaceTypes?.[1]?.id || null,
      paintQualityId: findId(data.paintQualities, 'standard') || data.paintQualities?.[0]?.id || null,
      surfaceConditionId: findId(data.surfaceConditions, 'good') || data.surfaceConditions?.[0]?.id || null,
      surfaceCategory: 'ceiling',
    },
  }
}