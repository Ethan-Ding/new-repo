// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config'

// Provide a safe default for CI/tests
if (!process.env.PAYLOAD_SECRET) {
  process.env.PAYLOAD_SECRET = 'test-secret-do-not-use-in-prod'
}

// Setup testing library DOM matchers for Vitest
import * as matchers from '@testing-library/jest-dom/matchers'

// Vitest provides `expect` and `vi` globally via types
expect.extend(matchers)

// Mock global fetch for all tests
global.fetch = vi.fn((url: RequestInfo | URL, options?: RequestInit) => {
  const urlString = url?.toString() || ''
  const method = options?.method || 'GET'

  // Mock reference data endpoint
  if (urlString.includes('reference-data')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          paintTypes: [
            { id: 1, name: 'Interior Latex', slug: 'interior-latex' },
            { id: 2, name: 'Exterior Acrylic', slug: 'exterior-acrylic' },
          ],
          surfaceTypes: [
            { id: 1, name: 'Wall', slug: 'wall', category: 'wall' },
            { id: 2, name: 'Ceiling', slug: 'ceiling', category: 'ceiling' },
          ],
          paintQualities: [
            { id: 1, name: 'Basic', slug: 'basic', costMultiplier: 1.0, coverageMultiplier: 1.0 },
            { id: 2, name: 'Premium', slug: 'premium', costMultiplier: 1.5, coverageMultiplier: 1.2 },
          ],
          surfaceConditions: [
            { id: 1, name: 'Good', slug: 'good', prepTimeMultiplier: 1.0 },
            { id: 2, name: 'Fair', slug: 'fair', prepTimeMultiplier: 1.3 },
          ],
          laborRates: [
            { id: 1, region: 'Sydney', baseRatePerHour: 50, overheadPercent: 20, profitMarginPercent: 15 },
          ],
        },
      }),
    } as Response)
  }

  // Mock area calculation endpoint
  if (urlString.includes('/api/calculate/area')) {
    const body = options?.body ? JSON.parse(options.body as string) : {}

    // Validate required fields
    if (!body.surfaceType || typeof body.dimensions !== 'object') {
      return Promise.resolve({
        ok: false,
        status: 400,
        text: async () => 'Missing required fields',
        json: async () => ({ success: false, error: 'Missing required fields' }),
      } as Response)
    }

    // Calculate area based on surface type
    let area = 0
    const dims = body.dimensions

    if (body.surfaceType === 'wall' && dims.length && dims.height) {
      area = dims.length * dims.height
    } else if (body.surfaceType === 'ceiling' && dims.length && dims.width) {
      area = dims.length * dims.width
    } else if (body.surfaceType === 'door' && dims.height && dims.width) {
      area = dims.height * dims.width
    } else if (body.surfaceType === 'linear' && dims.length && dims.height) {
      area = dims.length * dims.height
    }

    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { area, unit: 'm²' },
      }),
    } as Response)
  }

  // Mock dimension validation endpoint
  if (urlString.includes('validate-dimensions')) {
    const body = options?.body ? JSON.parse(options.body as string) : {}
    const dims = body.dimensions || {}

    const errors: string[] = []
    if (dims.length && dims.length <= 0) errors.push('Length must be positive')
    if (dims.width && dims.width <= 0) errors.push('Width must be positive')
    if (dims.height && dims.height <= 0) errors.push('Height must be positive')

    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({
        success: errors.length === 0,
        data: { valid: errors.length === 0, errors },
      }),
    } as Response)
  }

  // Mock surface cost calculation endpoint
  if (urlString.includes('surface-cost')) {
    const body = options?.body ? JSON.parse(options.body as string) : {}

    // Validate required fields
    if (!body.area || !body.paintTypeId || !body.surfaceTypeId || !body.paintQualityId) {
      return Promise.resolve({
        ok: false,
        status: 400,
        text: async () => 'Missing required fields',
        json: async () => ({ success: false, error: 'Missing required fields' }),
      } as Response)
    }

    const area = body.area || 10
    const coats = body.coats || 2
    const materialCost = area * coats * 0.5 // Simple calculation
    const laborCost = area * coats * 1.5

    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          materialCost,
          laborCost,
          totalCost: materialCost + laborCost,
        },
      }),
    } as Response)
  }

  // Mock project cost calculation endpoint
  if (urlString.includes('project-cost')) {
    const body = options?.body ? JSON.parse(options.body as string) : {}
    const surfaces = body.surfaces || []

    // Handle empty surfaces array
    if (surfaces.length === 0) {
      return Promise.resolve({
        ok: false,
        status: 400,
        text: async () => 'Surfaces array cannot be empty',
        json: async () => ({ success: false, error: 'Surfaces array cannot be empty' }),
      } as Response)
    }

    // Validate each surface has required fields
    for (const surface of surfaces) {
      if (!surface.area || !surface.paintTypeId || !surface.surfaceTypeId || !surface.paintQualityId) {
        return Promise.resolve({
          ok: false,
          status: 400,
          text: async () => 'Each surface must have required fields',
          json: async () => ({ success: false, error: 'Missing required surface fields' }),
        } as Response)
      }
    }

    const totalMaterialCost = surfaces.reduce((sum: number, s: any) => sum + (s.area * 2 * 0.5), 0)
    const totalLaborCost = surfaces.reduce((sum: number, s: any) => sum + (s.area * 2 * 1.5), 0)

    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          totalMaterialCost,
          totalLaborCost,
          totalCost: totalMaterialCost + totalLaborCost,
          surfaces: surfaces.map((s: any) => ({
            ...s,
            materialCost: s.area * 2 * 0.5,
            laborCost: s.area * 2 * 1.5,
          })),
        },
      }),
    } as Response)
  }

  // Mock paint data query endpoint
  if (urlString.includes('paint-data')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [
          {
            id: 1,
            paintTypeId: 1,
            surfaceTypeId: 1,
            paintQualityId: 1,
            costPerM2: 0.8,
            coverageM2PerLiter: 12,
          },
        ],
      }),
    } as Response)
  }

  // Default mock for unknown endpoints
  return Promise.reject(new Error(`Unmocked fetch URL: ${urlString}`))
}) as any
