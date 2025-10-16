/**
 * Unit tests for PDF Report Generator
 */

import { describe, it, expect } from 'vitest'
import { generatePaintingCostReport } from '@/app/(frontend)/lib/pdfReportGenerator'
import { Room, CalculatorEstimate, ReferenceData } from '@/types/calculator'

describe('PDF Report Generator', () => {
  const mockReferenceData: ReferenceData = {
    paintTypes: [
      { id: 1, name: 'Interior Acrylic', category: 'interior', key: 'interior-acrylic' },
    ],
    surfaceTypes: [
      { id: 1, name: 'Wall Plaster', category: 'wall', key: 'wall-plaster' },
    ],
    paintQualities: [
      { id: 1, name: 'Standard', level: 'standard', key: 'standard' },
    ],
    surfaceConditions: [
      {
        id: 1,
        name: 'Fair',
        code: 'fair',
        key: 'fair',
        prepTimeWall: 0.5,
        prepTimeCeiling: 0.5,
        prepTimeDoor: 0.3,
        prepTimeLinear: 0.2,
      },
    ],
    laborRates: [
      {
        id: 1,
        name: 'Sydney Standard',
        region: 'Sydney',
        hourlyRate: 50,
        overheadRate: 10,
        totalRate: 60,
        profitMargin: 0.15,
      },
    ],
  }

  const mockRoom: Room = {
    id: 1,
    name: 'Living Room',
    paintQuality: 'standard',
    paintQualityCost: '',
    paintFinish: 'eggshell',
    paintFinishCost: '0',
    paintFinishCostManual: '',
    paintColour: 'white',
    paintColourCost: '0',
    paintColourCostManual: '',
    walls: [{ id: 1, length: 4000, height: 2700, doorCount: 0, windowCount: 0 }],
    doors: [{ id: 1, width: 800, height: 2000 }],
    windows: [{ id: 1, width: 1200, height: 1000 }],
    trims: [],
    floors: [{ id: 1, length: 5000, width: 4000 }],
    ceilings: [{ id: 1, length: 5000, width: 4000 }],
  }

  const mockEstimate: CalculatorEstimate = {
    projectCosts: {
      surfaces: [
        {
          id: 'room-1-wall-1',
          name: 'Living Room - Wall 1',
          area: 10.8,
          costBreakdown: {
            materialCost: 50,
            laborCost: 100,
            subtotal: 150,
            profitMargin: 22.5,
            totalCost: 172.5,
            details: {
              paintVolume: 2.5,
              coverage: 12,
              costPerM2: 5.5,
              prepTime: 1.5,
              laborRate: 60,
            },
          },
        },
      ],
      totals: {
        totalArea: 10.8,
        totalMaterialCost: 50,
        totalLaborCost: 100,
        totalSubtotal: 150,
        totalProfitMargin: 22.5,
        grandTotal: 172.5,
      },
    },
    projectTotal: 172.5,
  }

  it('should generate PDF without errors', () => {
    const doc = generatePaintingCostReport({
      rooms: [mockRoom],
      estimate: mockEstimate,
      referenceData: mockReferenceData,
    })

    expect(doc).toBeDefined()
    expect(doc.internal).toBeDefined()
    expect(doc.internal.pages.length).toBeGreaterThan(0)
  })

  it('should handle multiple rooms', () => {
    const room2: Room = { ...mockRoom, id: 2, name: 'Bedroom' }
    const doc = generatePaintingCostReport({
      rooms: [mockRoom, room2],
      estimate: mockEstimate,
      referenceData: mockReferenceData,
    })

    expect(doc).toBeDefined()
    expect(doc.internal.pages.length).toBeGreaterThan(0)
  })

  it('should handle null reference data', () => {
    const doc = generatePaintingCostReport({
      rooms: [mockRoom],
      estimate: mockEstimate,
      referenceData: null,
    })

    expect(doc).toBeDefined()
    expect(doc.internal.pages.length).toBeGreaterThan(0)
  })

  it('should include room details', () => {
    const doc = generatePaintingCostReport({
      rooms: [mockRoom],
      estimate: mockEstimate,
      referenceData: mockReferenceData,
    })

    // Check that pages were generated (title page + details + cost breakdown)
    expect(doc.internal.pages.length).toBeGreaterThanOrEqual(3)
  })
})