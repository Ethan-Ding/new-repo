import { PayloadPaintingService } from './payload-service'
import {
  calculateWallArea,
  calculateDoorArea,
  calculateCeilingArea,
  calculateLinearSurfaceArea,
  calculateSurfaceCost,
  calculateProjectCosts,
  validateSurfaceDimensions,
  formatCurrency,
  formatArea,
  formatVolume,
  formatTime,
} from '../calculations/pure-calculations'
import type {
  WallDimensions,
  SurfaceDimensions,
  AreaCalculationResult,
  CostBreakdown,
  ProjectCostSummary,
  SurfaceCategory,
} from '../../types/painting'

export interface SurfaceCalculationRequest {
  surfaceType: 'wall' | 'door' | 'ceiling' | 'linear'
  dimensions: WallDimensions | SurfaceDimensions | { length: number; height?: number }
  paintTypeId: number
  surfaceTypeId: number
  paintQualityId: number
  surfaceConditionId: number
  surfaceCategory: SurfaceCategory
  coats: number
  laborRateId?: number
  region?: string
}

export interface ProjectCalculationRequest {
  surfaces: Array<SurfaceCalculationRequest & { id: string; name: string }>
  laborRateId?: number
  region?: string
}

export interface CalculationResult {
  area: AreaCalculationResult
  cost: CostBreakdown
  formatted: {
    area: string
    totalCost: string
    materialCost: string
    laborCost: string
    paintVolume: string
    prepTime: string
  }
}

export class PaintingCalculationService {
  /**
   * Calculate area and cost for a single surface
   */
  static async calculateSurface(request: SurfaceCalculationRequest): Promise<CalculationResult> {
    try {
      // Validate dimensions
      const validation = validateSurfaceDimensions(request.surfaceType, request.dimensions)
      if (!validation.isValid) {
        throw new Error(`Invalid dimensions: ${validation.errors.join(', ')}`)
      }

      // Calculate area
      let areaResult: AreaCalculationResult
      switch (request.surfaceType) {
        case 'wall':
          areaResult = calculateWallArea(request.dimensions as WallDimensions)
          break
        case 'door':
          areaResult = calculateDoorArea(request.dimensions as SurfaceDimensions)
          break
        case 'ceiling':
          areaResult = calculateCeilingArea(request.dimensions as SurfaceDimensions)
          break
        case 'linear':
          const linearDims = request.dimensions as { length: number; height?: number }
          areaResult = calculateLinearSurfaceArea(linearDims.length, linearDims.height)
          break
        default:
          throw new Error(`Unsupported surface type: ${request.surfaceType}`)
      }

      // Fetch required data from database
      const [paintData, surfaceCondition, laborRate] = await Promise.all([
        PayloadPaintingService.getPaintDataByCombination(
          request.paintTypeId,
          request.surfaceTypeId,
          request.paintQualityId
        ),
        PayloadPaintingService.getSurfaceConditionById(request.surfaceConditionId),
        request.laborRateId
          ? PayloadPaintingService.getLaborRates().then(rates =>
              rates.find(rate => rate.id === request.laborRateId)
            )
          : PayloadPaintingService.getCurrentLaborRate(request.region),
      ])

      if (!paintData) {
        throw new Error('No paint data found for the specified combination')
      }
      if (!surfaceCondition) {
        throw new Error('Surface condition not found')
      }
      if (!laborRate) {
        throw new Error('No labor rate found')
      }

      // Calculate cost
      const costBreakdown = calculateSurfaceCost(
        areaResult.netArea,
        request.coats,
        paintData,
        surfaceCondition,
        request.surfaceCategory,
        laborRate
      )

      return {
        area: areaResult,
        cost: costBreakdown,
        formatted: {
          area: formatArea(areaResult.netArea),
          totalCost: formatCurrency(costBreakdown.totalCost),
          materialCost: formatCurrency(costBreakdown.materialCost),
          laborCost: formatCurrency(costBreakdown.laborCost),
          paintVolume: formatVolume(costBreakdown.details.paintVolume),
          prepTime: formatTime(costBreakdown.details.prepTime),
        },
      }
    } catch (error) {
      throw new Error(`Failed to calculate surface: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Calculate costs for multiple surfaces (project level)
   */
  static async calculateProject(request: ProjectCalculationRequest): Promise<{
    summary: ProjectCostSummary
    surfaces: Array<{
      id: string
      name: string
      result: CalculationResult
    }>
    formatted: {
      grandTotal: string
      totalArea: string
      totalMaterialCost: string
      totalLaborCost: string
    }
  }> {
    try {
      if (!request.surfaces || request.surfaces.length === 0) {
        throw new Error('No surfaces provided')
      }

      // Get labor rate
      const laborRate = request.laborRateId
        ? await PayloadPaintingService.getLaborRates().then(rates =>
            rates.find(rate => rate.id === request.laborRateId)
          )
        : await PayloadPaintingService.getCurrentLaborRate(request.region)

      if (!laborRate) {
        throw new Error('No labor rate found')
      }

      // Calculate each surface
      const surfaceResults = []
      const processedSurfaces = []

      for (const surface of request.surfaces) {
        const result = await this.calculateSurface(surface)
        surfaceResults.push({
          id: surface.id,
          name: surface.name,
          result,
        })

        // Prepare data for project calculation
        const [paintData, surfaceCondition] = await Promise.all([
          PayloadPaintingService.getPaintDataByCombination(
            surface.paintTypeId,
            surface.surfaceTypeId,
            surface.paintQualityId
          ),
          PayloadPaintingService.getSurfaceConditionById(surface.surfaceConditionId),
        ])

        if (!paintData || !surfaceCondition) {
          throw new Error('Missing paint data or surface condition')
        }

        processedSurfaces.push({
          id: surface.id,
          name: surface.name,
          area: result.area.netArea,
          coats: surface.coats,
          paintData,
          surfaceCondition,
          surfaceCategory: surface.surfaceCategory,
        })
      }

      // Calculate project totals
      const projectSummary = calculateProjectCosts(processedSurfaces, laborRate)

      return {
        summary: projectSummary,
        surfaces: surfaceResults,
        formatted: {
          grandTotal: formatCurrency(projectSummary.totals.grandTotal),
          totalArea: formatArea(projectSummary.totals.totalArea),
          totalMaterialCost: formatCurrency(projectSummary.totals.totalMaterialCost),
          totalLaborCost: formatCurrency(projectSummary.totals.totalLaborCost),
        },
      }
    } catch (error) {
      throw new Error(`Failed to calculate project: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Get estimation for quick quotes (simplified interface)
   */
  static async getQuickEstimate(
    surfaceType: 'wall' | 'door' | 'ceiling' | 'linear',
    area: number,
    qualityLevel: 'basic' | 'standard' | 'premium' | 'luxury',
    region?: string
  ): Promise<{
    estimatedCost: number
    costRange: { min: number; max: number }
    formatted: {
      estimatedCost: string
      costRange: string
    }
  }> {
    try {
      // Get paint qualities
      const paintQualities = await PayloadPaintingService.getPaintQualities()
      const quality = paintQualities.find(q => q.name?.toLowerCase() === qualityLevel.toLowerCase())

      if (!quality) {
        throw new Error(`Quality level '${qualityLevel}' not found`)
      }

      // Get surface types for the category
      const surfaceTypes = await PayloadPaintingService.getSurfaceTypes()
      const relevantSurfaceType = surfaceTypes[0] // Use first available surface type

      if (!relevantSurfaceType) {
        throw new Error(`Surface type '${surfaceType}' not found`)
      }

      // Get basic paint types
      const paintTypes = await PayloadPaintingService.getPaintTypes()
      const basicPaintType = paintTypes[0] // Use first available paint type

      if (!basicPaintType) {
        throw new Error('No paint types available')
      }

      // Get paint data
      const paintData = await PayloadPaintingService.getPaintDataByCombination(
        basicPaintType.id,
        relevantSurfaceType.id,
        quality.id
      )

      if (!paintData) {
        throw new Error('No paint data found for quick estimate')
      }

      // Get labor rate
      const laborRate = await PayloadPaintingService.getCurrentLaborRate(region)
      if (!laborRate) {
        throw new Error('No labor rate found')
      }

      // Simple estimation: material cost + average labor cost
      const materialCost = area * paintData.costPerM2 * 2 // Assume 2 coats
      const estimatedLaborTime = area * 5 // 5 minutes per m² (average)
      const laborCost = (estimatedLaborTime / 60) * (laborRate.totalRate || 0)

      const subtotal = materialCost + laborCost
      const totalWithProfit = subtotal * (1 + laborRate.profitMargin)

      // Create cost range (±20%)
      const variance = 0.2
      const costRange = {
        min: totalWithProfit * (1 - variance),
        max: totalWithProfit * (1 + variance),
      }

      return {
        estimatedCost: totalWithProfit,
        costRange,
        formatted: {
          estimatedCost: formatCurrency(totalWithProfit),
          costRange: `${formatCurrency(costRange.min)} - ${formatCurrency(costRange.max)}`,
        },
      }
    } catch (error) {
      throw new Error(`Failed to generate quick estimate: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Get available options for form selects
   */
  static async getFormOptions() {
    try {
      const [paintTypes, surfaceTypes, paintQualities, surfaceConditions, laborRates] = await Promise.all([
        PayloadPaintingService.getPaintTypes(),
        PayloadPaintingService.getSurfaceTypes(),
        PayloadPaintingService.getPaintQualities(),
        PayloadPaintingService.getSurfaceConditions(),
        PayloadPaintingService.getLaborRates(),
      ])

      return {
        paintTypes: paintTypes.map(pt => ({ value: pt.id, label: pt.name })),
        surfaceTypes: surfaceTypes.map(st => ({
          value: st.id,
          label: st.name
        })),
        paintQualities: paintQualities.map(pq => ({
          value: pq.id,
          label: pq.name
        })),
        surfaceConditions: surfaceConditions.map(sc => ({
          value: sc.id,
          label: sc.name
        })),
        laborRates: laborRates.map(lr => ({
          value: lr.id,
          label: `${lr.name} ${lr.region ? `(${lr.region})` : ''}`,
          region: lr.region
        })),
      }
    } catch (error) {
      throw new Error(`Failed to get form options: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}