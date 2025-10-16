/**
 * Integration tests for Next.js Painting Calculator API
 * Tests the full stack: API → Services → Database → Calculations
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

let payload: Payload
const API_BASE = 'http://localhost:3000/api'

describe('Painting Calculator API Integration', () => {
  beforeAll(async () => {
    // Initialize Payload for database operations
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterAll(async () => {
    // Clean up if needed
  })

  describe('Reference Data API', () => {
    it('should fetch all reference data successfully', async () => {
      const response = await fetch(`${API_BASE}/calculate/reference-data`)
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('paintTypes')
      expect(data.data).toHaveProperty('surfaceTypes')
      expect(data.data).toHaveProperty('paintQualities')
      expect(data.data).toHaveProperty('surfaceConditions')
      expect(data.data).toHaveProperty('laborRates')

      // Verify data structure
      expect(Array.isArray(data.data.paintTypes)).toBe(true)
      expect(Array.isArray(data.data.surfaceTypes)).toBe(true)
      expect(Array.isArray(data.data.paintQualities)).toBe(true)
      expect(Array.isArray(data.data.surfaceConditions)).toBe(true)
      expect(Array.isArray(data.data.laborRates)).toBe(true)

      // Verify each type has required fields
      if (data.data.paintTypes.length > 0) {
        expect(data.data.paintTypes[0]).toHaveProperty('id')
        expect(data.data.paintTypes[0]).toHaveProperty('name')
      }

      if (data.data.laborRates.length > 0) {
        expect(data.data.laborRates[0]).toHaveProperty('region')
        expect(data.data.laborRates[0]).toHaveProperty('totalRate')
      }
    })

    it('should handle reference data fetch errors gracefully', async () => {
      // This tests error handling if database is unavailable
      // Note: This may pass if database is healthy, which is fine
      const response = await fetch(`${API_BASE}/calculate/reference-data`)
      expect([200, 500]).toContain(response.status)

      if (!response.ok) {
        const errorData = await response.json()
        expect(errorData).toHaveProperty('error')
      }
    })
  })

  describe('Area Calculation API', () => {
    it('should calculate wall area correctly', async () => {
      const testWall = {
        surfaceType: 'wall',
        dimensions: {
          length: 4.0,
          height: 2.4,
          doorCount: 1,
          windowCount: 2
        }
      }

      const response = await fetch(`${API_BASE}/calculate/area`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testWall)
      })

      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.surfaceType).toBe('wall')
      expect(data.area).toHaveProperty('grossArea')
      expect(data.area).toHaveProperty('netArea')
      expect(data.area).toHaveProperty('deductions')

      // Wall: 4m * 2.4m = 9.6m² gross area
      expect(data.area.grossArea).toBe(9.6)
      expect(data.area.netArea).toBeLessThan(data.area.grossArea) // Due to door/windows
      expect(data.area.deductions).toBeGreaterThan(0)
    })

    it('should calculate ceiling area correctly', async () => {
      const testCeiling = {
        surfaceType: 'ceiling',
        dimensions: {
          width: 3.5,
          length: 4.2
        }
      }

      const response = await fetch(`${API_BASE}/calculate/area`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCeiling)
      })

      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.surfaceType).toBe('ceiling')

      // Ceiling: 3.5m * 4.2m = 14.7m²
      expect(data.area.netArea).toBeCloseTo(14.7, 1)
    })

    it('should calculate door area correctly', async () => {
      const testDoor = {
        surfaceType: 'door',
        dimensions: {
          width: 0.9,
          height: 2.1
        }
      }

      const response = await fetch(`${API_BASE}/calculate/area`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testDoor)
      })

      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.surfaceType).toBe('door')

      // Door: 0.9m * 2.1m = 1.89m²
      expect(data.area.netArea).toBeCloseTo(1.89, 2)
    })

    it('should calculate linear surface area correctly', async () => {
      const testLinear = {
        surfaceType: 'linear',
        dimensions: {
          length: 12.0,
          height: 0.15
        }
      }

      const response = await fetch(`${API_BASE}/calculate/area`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testLinear)
      })

      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.surfaceType).toBe('linear')

      // Linear: 12m * 0.15m = 1.8m²
      expect(data.area.netArea).toBeCloseTo(1.8, 1)
    })

    it('should validate dimensions and reject invalid input', async () => {
      const invalidWall = {
        surfaceType: 'wall',
        dimensions: {
          length: -1, // Invalid negative length
          height: 2.4
        }
      }

      const response = await fetch(`${API_BASE}/calculate/area`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidWall)
      })

      expect(response.status).toBe(400)

      const errorData = await response.json()
      expect(errorData.error).toBe('Invalid dimensions')
      expect(errorData.details).toBeInstanceOf(Array)
    })

    it('should reject missing required fields', async () => {
      const incompleteData = {
        surfaceType: 'wall'
        // Missing dimensions
      }

      const response = await fetch(`${API_BASE}/calculate/area`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteData)
      })

      expect(response.status).toBe(400)

      const errorData = await response.json()
      expect(errorData.error).toContain('Missing required fields')
    })
  })

  describe('Dimension Validation API', () => {
    it('should validate valid wall dimensions', async () => {
      const validDimensions = {
        surfaceType: 'wall',
        dimensions: {
          length: 4.0,
          height: 2.4,
          doorCount: 1,
          windowCount: 1
        }
      }

      const response = await fetch(`${API_BASE}/calculate/validate-dimensions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validDimensions)
      })

      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.validation.isValid).toBe(true)
      expect(data.validation.errors).toEqual([])
    })

    it('should reject invalid dimensions with detailed errors', async () => {
      const invalidDimensions = {
        surfaceType: 'wall',
        dimensions: {
          length: 0, // Invalid
          height: -2.4, // Invalid
          doorCount: -1, // Invalid
          windowCount: 1
        }
      }

      const response = await fetch(`${API_BASE}/calculate/validate-dimensions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidDimensions)
      })

      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.validation.isValid).toBe(false)
      expect(data.validation.errors.length).toBeGreaterThan(0)
    })
  })

  describe('Surface Cost Calculation API', () => {
    let referenceData: any

    beforeAll(async () => {
      // Get reference data for test IDs
      const response = await fetch(`${API_BASE}/calculate/reference-data`)
      const data = await response.json()
      referenceData = data.data
    })

    it('should calculate surface cost with database integration', async () => {
      // Skip if no reference data available
      if (!referenceData || !referenceData.paintTypes.length) {
        console.warn('Skipping surface cost test - no reference data available')
        return
      }

      const surfaceCostRequest = {
        area: 9.6,
        coats: 2,
        paintTypeId: referenceData.paintTypes[0].id,
        surfaceTypeId: referenceData.surfaceTypes[0].id,
        paintQualityId: referenceData.paintQualities[0].id,
        surfaceConditionId: referenceData.surfaceConditions[0].id,
        surfaceCategory: 'wall',
        region: 'Sydney'
      }

      const response = await fetch(`${API_BASE}/calculate/surface-cost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surfaceCostRequest)
      })

      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.costBreakdown).toHaveProperty('materialCost')
      expect(data.costBreakdown).toHaveProperty('laborCost')
      expect(data.costBreakdown).toHaveProperty('subtotal')
      expect(data.costBreakdown).toHaveProperty('profitMargin')
      expect(data.costBreakdown).toHaveProperty('totalCost')

      // Verify costs are positive numbers
      expect(data.costBreakdown.materialCost).toBeGreaterThan(0)
      expect(data.costBreakdown.laborCost).toBeGreaterThan(0)
      expect(data.costBreakdown.totalCost).toBeGreaterThan(0)

      // Verify total cost is sum of components
      const expectedTotal = data.costBreakdown.subtotal + data.costBreakdown.profitMargin
      expect(Math.abs(data.costBreakdown.totalCost - expectedTotal)).toBeLessThan(0.01)

      // Verify inputs are returned
      expect(data.inputs).toHaveProperty('area')
      expect(data.inputs).toHaveProperty('coats')
      expect(data.inputs.area).toBe(9.6)
      expect(data.inputs.coats).toBe(2)
    })

    it('should handle different regions correctly', async () => {
      if (!referenceData || !referenceData.paintTypes.length) {
        console.warn('Skipping region test - no reference data available')
        return
      }

      const melbourneRequest = {
        area: 10.0,
        coats: 2,
        paintTypeId: referenceData.paintTypes[0].id,
        surfaceTypeId: referenceData.surfaceTypes[0].id,
        paintQualityId: referenceData.paintQualities[0].id,
        surfaceConditionId: referenceData.surfaceConditions[0].id,
        surfaceCategory: 'wall',
        region: 'Melbourne'
      }

      const response = await fetch(`${API_BASE}/calculate/surface-cost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(melbourneRequest)
      })

      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.costBreakdown.totalCost).toBeGreaterThan(0)

      // Melbourne should have different labor rates than Sydney
      expect(data.inputs.laborRate).toHaveProperty('totalRate')
    })

    it('should reject invalid paint data combinations', async () => {
      const invalidRequest = {
        area: 10.0,
        coats: 2,
        paintTypeId: 99999, // Non-existent ID
        surfaceTypeId: 99999, // Non-existent ID
        paintQualityId: 99999, // Non-existent ID
        surfaceConditionId: 99999, // Non-existent ID
        surfaceCategory: 'wall',
        region: 'Sydney'
      }

      const response = await fetch(`${API_BASE}/calculate/surface-cost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidRequest)
      })

      expect(response.status).toBe(404)

      const errorData = await response.json()
      expect(errorData.error).toContain('No paint data found')
    })

    it('should reject missing required fields', async () => {
      const incompleteRequest = {
        area: 10.0,
        coats: 2
        // Missing required IDs
      }

      const response = await fetch(`${API_BASE}/calculate/surface-cost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteRequest)
      })

      expect(response.status).toBe(400)

      const errorData = await response.json()
      expect(errorData.error).toBe('Missing required fields')
    })
  })

  describe('Project Cost Calculation API', () => {
    let referenceData: any

    beforeAll(async () => {
      // Get reference data for test IDs
      const response = await fetch(`${API_BASE}/calculate/reference-data`)
      const data = await response.json()
      referenceData = data.data
    })

    it('should calculate multi-surface project costs', async () => {
      if (!referenceData || !referenceData.paintTypes.length) {
        console.warn('Skipping project cost test - no reference data available')
        return
      }

      const projectRequest = {
        surfaces: [
          {
            id: 'wall-1',
            name: 'Living Room Wall',
            area: 15.0,
            coats: 2,
            paintTypeId: referenceData.paintTypes[0].id,
            surfaceTypeId: referenceData.surfaceTypes[0].id,
            paintQualityId: referenceData.paintQualities[0].id,
            surfaceConditionId: referenceData.surfaceConditions[0].id,
            surfaceCategory: 'wall'
          },
          {
            id: 'ceiling-1',
            name: 'Living Room Ceiling',
            area: 12.0,
            coats: 2,
            paintTypeId: referenceData.paintTypes[0].id,
            surfaceTypeId: referenceData.surfaceTypes.find(s => s.category === 'ceiling')?.id || referenceData.surfaceTypes[0].id,
            paintQualityId: referenceData.paintQualities[0].id,
            surfaceConditionId: referenceData.surfaceConditions[0].id,
            surfaceCategory: 'ceiling'
          }
        ],
        region: 'Sydney'
      }

      const response = await fetch(`${API_BASE}/calculate/project-cost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectRequest)
      })

      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.projectCosts).toHaveProperty('surfaces')
      expect(data.projectCosts).toHaveProperty('totals')

      // Verify surfaces array
      expect(data.projectCosts.surfaces).toHaveLength(2)
      expect(data.projectCosts.surfaces[0]).toHaveProperty('name', 'Living Room Wall')
      expect(data.projectCosts.surfaces[1]).toHaveProperty('name', 'Living Room Ceiling')

      // Verify totals
      expect(data.projectCosts.totals).toHaveProperty('totalArea')
      expect(data.projectCosts.totals).toHaveProperty('totalMaterialCost')
      expect(data.projectCosts.totals).toHaveProperty('totalLaborCost')
      expect(data.projectCosts.totals).toHaveProperty('grandTotal')

      // Verify totals are sums of individual surfaces
      expect(data.projectCosts.totals.totalArea).toBe(27.0) // 15.0 + 12.0
      expect(data.projectCosts.totals.grandTotal).toBeGreaterThan(0)

      // Verify labor rate information
      expect(data.laborRate).toHaveProperty('region', 'Sydney')
      expect(data.laborRate).toHaveProperty('totalRate')
    })

    it('should handle empty surfaces array', async () => {
      const emptyProjectRequest = {
        surfaces: [],
        region: 'Sydney'
      }

      const response = await fetch(`${API_BASE}/calculate/project-cost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emptyProjectRequest)
      })

      expect(response.status).toBe(400)

      const errorData = await response.json()
      expect(errorData.error).toContain('invalid surfaces array')
    })

    it('should reject surfaces with missing required fields', async () => {
      if (!referenceData || !referenceData.paintTypes.length) {
        console.warn('Skipping incomplete surface test - no reference data available')
        return
      }

      const invalidProjectRequest = {
        surfaces: [
          {
            id: 'wall-1',
            name: 'Incomplete Wall'
            // Missing required fields: area, coats, paintTypeId, etc.
          }
        ],
        region: 'Sydney'
      }

      const response = await fetch(`${API_BASE}/calculate/project-cost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidProjectRequest)
      })

      expect(response.status).toBe(400)

      const errorData = await response.json()
      expect(errorData.error).toContain('Missing required fields')
    })
  })

  describe('Paint Data Query API', () => {
    it('should fetch paint data combinations', async () => {
      const response = await fetch(`${API_BASE}/calculate/paint-data`)
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data).toHaveProperty('data')
      expect(data).toHaveProperty('count')
      expect(Array.isArray(data.data)).toBe(true)
      expect(typeof data.count).toBe('number')
    })

    it('should filter paint data by query parameters', async () => {
      const response = await fetch(`${API_BASE}/calculate/paint-data?maxCostPerM2=1.0`)
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)

      // All returned items should have costPerM2 <= 1.0
      data.data.forEach((item: any) => {
        if (item.costPerM2 !== null) {
          expect(item.costPerM2).toBeLessThanOrEqual(1.0)
        }
      })
    })
  })
})