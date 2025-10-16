import { getPayload } from 'payload'
import config from '../../payload.config.js'
import type {
  PaintData as PaintDataType,
} from '../../types/painting'
import type {
  PaintType,
  SurfaceType,
  PaintQuality,
  SurfaceCondition,
  LaborRate,
} from '../../types/calculator'

export class PayloadPaintingService {
  /**
   * Get Payload instance
   */
  private static async getPayloadInstance() {
    return await getPayload({ config })
  }

  /**
   * Get all active paint types
   */
  static async getPaintTypes(): Promise<PaintType[]> {
    try {
      const payload = await this.getPayloadInstance()
      const result = await payload.find({
        collection: 'paint-types',
        where: {
          isActive: {
            equals: true,
          },
        },
        sort: 'name',
      })

      return result.docs.map(doc => ({
        id: doc.id,
        name: doc.name,
        description: doc.description,
      }))
    } catch (error) {
      throw new Error(`Failed to fetch paint types: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get all active surface types
   */
  static async getSurfaceTypes(): Promise<SurfaceType[]> {
    try {
      const payload = await this.getPayloadInstance()
      const result = await payload.find({
        collection: 'surface-types',
        where: {
          isActive: {
            equals: true,
          },
        },
        sort: 'name',
      })

      return result.docs.map(doc => ({
        id: doc.id,
        name: doc.name,
        category: doc.category,
        description: doc.description,
      }))
    } catch (error) {
      throw new Error(`Failed to fetch surface types: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get all active paint qualities
   */
  static async getPaintQualities(): Promise<PaintQuality[]> {
    try {
      const payload = await this.getPayloadInstance()
      const result = await payload.find({
        collection: 'paint-qualities',
        where: {
          isActive: {
            equals: true,
          },
        },
        sort: 'level',
      })

      return result.docs.map(doc => ({
        id: doc.id,
        name: doc.name,
        level: doc.level,
        description: doc.description,
      }))
    } catch (error) {
      throw new Error(`Failed to fetch paint qualities: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get all active surface conditions
   */
  static async getSurfaceConditions(): Promise<SurfaceCondition[]> {
    try {
      const payload = await this.getPayloadInstance()
      const result = await payload.find({
        collection: 'surface-conditions',
        where: {
          isActive: {
            equals: true,
          },
        },
        sort: 'name',
      })

      return result.docs.map(doc => ({
        id: doc.id,
        name: doc.name,
        description: doc.description,
        prepTimeWall: doc.prepTimeWall,
        prepTimeCeiling: doc.prepTimeCeiling,
        prepTimeDoor: doc.prepTimeDoor,
        prepTimeLinear: doc.prepTimeLinear,
      }))
    } catch (error) {
      throw new Error(`Failed to fetch surface conditions: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get all paint data combinations
   */
  static async getPaintData(): Promise<PaintDataType[]> {
    try {
      const payload = await this.getPayloadInstance()
      const result = await payload.find({
        collection: 'paint-data',
        where: {
          isActive: {
            equals: true,
          },
        },
        depth: 2, // Include related documents
      })

      return result.docs.map(doc => ({
        id: doc.id,
        paintTypeId: typeof doc.paintType === 'object' ? doc.paintType.id : doc.paintType,
        surfaceTypeId: typeof doc.surfaceType === 'object' ? doc.surfaceType.id : doc.surfaceType,
        paintQualityId: typeof doc.paintQuality === 'object' ? doc.paintQuality.id : doc.paintQuality,
        costPerM2: doc.costPerM2,
        coverage: doc.coverage,
        notes: doc.notes,
      }))
    } catch (error) {
      throw new Error(`Failed to fetch paint data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get specific paint data by combination
   */
  static async getPaintDataByCombination(
    paintTypeId: number,
    surfaceTypeId: number,
    paintQualityId: number
  ): Promise<PaintDataType | null> {
    try {
      const payload = await this.getPayloadInstance()
      const result = await payload.find({
        collection: 'paint-data',
        where: {
          and: [
            {
              paintType: {
                equals: paintTypeId,
              },
            },
            {
              surfaceType: {
                equals: surfaceTypeId,
              },
            },
            {
              paintQuality: {
                equals: paintQualityId,
              },
            },
            {
              isActive: {
                equals: true,
              },
            },
          ],
        },
        limit: 1,
      })

      if (result.docs.length === 0) {
        return null
      }

      const doc = result.docs[0]
      return {
        id: doc.id,
        paintTypeId: typeof doc.paintType === 'object' ? doc.paintType.id : doc.paintType,
        surfaceTypeId: typeof doc.surfaceType === 'object' ? doc.surfaceType.id : doc.surfaceType,
        paintQualityId: typeof doc.paintQuality === 'object' ? doc.paintQuality.id : doc.paintQuality,
        costPerM2: doc.costPerM2,
        coverage: doc.coverage,
        notes: doc.notes,
      }
    } catch (error) {
      throw new Error(`Failed to fetch paint data combination: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get active labor rates
   */
  static async getLaborRates(region?: string): Promise<LaborRate[]> {
    try {
      const whereClause: any = {
        isActive: {
          equals: true,
        },
      }

      if (region) {
        whereClause.region = {
          equals: region,
        }
      }

      const payload = await this.getPayloadInstance()
      const result = await payload.find({
        collection: 'labor-rates',
        where: whereClause,
        sort: '-effectiveDate', // Most recent first
      })

      return result.docs.map(doc => ({
        id: doc.id,
        name: doc.name,
        region: doc.region,
        hourlyRate: doc.hourlyRate,
        overheadRate: doc.overheadRate,
        totalRate: doc.totalRate,
        profitMargin: doc.profitMargin,
        effectiveDate: doc.effectiveDate,
      }))
    } catch (error) {
      throw new Error(`Failed to fetch labor rates: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get the most current labor rate for a region
   */
  static async getCurrentLaborRate(region?: string): Promise<LaborRate | null> {
    try {
      const rates = await this.getLaborRates(region)
      return rates.length > 0 ? rates[0] : null
    } catch (error) {
      throw new Error(`Failed to fetch current labor rate: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get surface condition by ID
   */
  static async getSurfaceConditionById(id: number): Promise<SurfaceCondition | null> {
    try {
      const payload = await this.getPayloadInstance()
      const result = await payload.findByID({
        collection: 'surface-conditions',
        id,
      })

      if (!result || !result.isActive) {
        return null
      }

      return {
        id: result.id,
        name: result.name,
        description: result.description,
        prepTimeWall: result.prepTimeWall,
        prepTimeCeiling: result.prepTimeCeiling,
        prepTimeDoor: result.prepTimeDoor,
        prepTimeLinear: result.prepTimeLinear,
      }
    } catch (error) {
      return null
    }
  }

  /**
   * Search paint data with filters
   */
  static async searchPaintData(filters: {
    paintTypeName?: string
    surfaceTypeName?: string
    qualityLevel?: string
    maxCostPerM2?: number
  }): Promise<PaintDataType[]> {
    try {
      const payload = await this.getPayloadInstance()
      const result = await payload.find({
        collection: 'paint-data',
        where: {
          and: [
            {
              isActive: {
                equals: true,
              },
            },
          ],
        },
        depth: 2,
      })

      let filteredData = result.docs

      // Apply client-side filtering for related fields
      if (filters.paintTypeName) {
        filteredData = filteredData.filter(doc =>
          typeof doc.paintType === 'object' &&
          doc.paintType.name.toLowerCase().includes(filters.paintTypeName!.toLowerCase())
        )
      }

      if (filters.surfaceTypeName) {
        filteredData = filteredData.filter(doc =>
          typeof doc.surfaceType === 'object' &&
          doc.surfaceType.name.toLowerCase().includes(filters.surfaceTypeName!.toLowerCase())
        )
      }

      if (filters.qualityLevel) {
        filteredData = filteredData.filter(doc =>
          typeof doc.paintQuality === 'object' &&
          doc.paintQuality.level === filters.qualityLevel
        )
      }

      if (filters.maxCostPerM2) {
        filteredData = filteredData.filter(doc => doc.costPerM2 <= filters.maxCostPerM2!)
      }

      return filteredData.map(doc => ({
        id: doc.id,
        paintTypeId: typeof doc.paintType === 'object' ? doc.paintType.id : doc.paintType,
        surfaceTypeId: typeof doc.surfaceType === 'object' ? doc.surfaceType.id : doc.surfaceType,
        paintQualityId: typeof doc.paintQuality === 'object' ? doc.paintQuality.id : doc.paintQuality,
        costPerM2: doc.costPerM2,
        coverage: doc.coverage,
        notes: doc.notes,
      }))
    } catch (error) {
      throw new Error(`Failed to search paint data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}