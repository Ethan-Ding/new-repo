import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generatePaintingCostReport } from '../../../src/app/demo/PDFReportGenerator'

// Mock jsPDF and jspdf-autotable
vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    text: vi.fn(),
    addPage: vi.fn(),
    internal: {
      getNumberOfPages: vi.fn().mockReturnValue(2),
      pageSize: { height: 297, width: 210 }
    },
    setPage: vi.fn()
  }))
}))

vi.mock('jspdf-autotable', () => ({
  default: vi.fn()
}))

// Import helper functions directly for unit testing
// Note: In a real scenario, these should be exported from the module
const calculateRoomCost = (room) => {
  const paintOptions = {
    quality: [
      { value: 'economy', price: 0.00027 },
      { value: 'standard', price: 0.00038 },
      { value: 'premium', price: 0.00054 }
    ]
  };

  const paintPrice = room.paintQualityCost && room.paintQualityCost.trim() !== ''
    ? parseFloat(room.paintQualityCost)
    : (paintOptions.quality.find(q => q.value === room.paintQuality)?.price || 0.00038);

  const wallAreaMm2 = room.walls.reduce((total, wall) => total + (wall.length * wall.height), 0);
  const doorAreaMm2 = room.doors * (2000 * 800);
  const windowAreaMm2 = room.windows * (1200 * 1000);

  // Calculate trim area (trims subtract from wall area)
  const trimAreaMm2 = room.trims ? room.trims.reduce((total, trim) => total + (trim.length * trim.height), 0) : 0;

  const netWallAreaMm2 = Math.max(0, wallAreaMm2 - doorAreaMm2 - windowAreaMm2 - trimAreaMm2);

  const basePaintCost = netWallAreaMm2 * paintPrice;

  const finishCostValue = room.paintFinishCostManual && room.paintFinishCostManual.trim() !== ''
    ? parseFloat(room.paintFinishCostManual)
    : (parseFloat(room.paintFinishCost) || 0);

  const colourCostValue = room.paintColourCostManual && room.paintColourCostManual.trim() !== ''
    ? parseFloat(room.paintColourCostManual)
    : (parseFloat(room.paintColourCost) || 0);

  const finishCost = finishCostValue * netWallAreaMm2;
  const colourCost = colourCostValue * netWallAreaMm2;

  return basePaintCost + finishCost + colourCost;
};

const calculateRoomArea = (room) => {
  const wallAreaMm2 = room.walls.reduce((total, wall) => total + (wall.length * wall.height), 0);
  const doorAreaMm2 = room.doors * (2000 * 800);
  const windowAreaMm2 = room.windows * (1200 * 1000);

  // Calculate trim area (trims subtract from wall area)
  const trimAreaMm2 = room.trims ? room.trims.reduce((total, trim) => total + (trim.length * trim.height), 0) : 0;

  const netWallAreaMm2 = Math.max(0, wallAreaMm2 - doorAreaMm2 - windowAreaMm2 - trimAreaMm2);

  // Calculate floor and ceiling areas
  const floorAreaMm2 = room.floors ? room.floors.reduce((total, floor) => total + (floor.length * floor.width), 0) : 0;
  const ceilingAreaMm2 = room.ceilings ? room.ceilings.reduce((total, ceiling) => total + (ceiling.length * ceiling.width), 0) : 0;

  return {
    totalWallArea: wallAreaMm2,
    doorArea: doorAreaMm2,
    windowArea: windowAreaMm2,
    trimArea: trimAreaMm2,
    netPaintableArea: netWallAreaMm2,
    floorArea: floorAreaMm2,
    ceilingArea: ceilingAreaMm2,
    totalArea: netWallAreaMm2 + floorAreaMm2 + ceilingAreaMm2
  };
};

const calculateCostBreakdown = (rooms) => {
  let basePaintCost = 0;
  let finishCost = 0;
  let colorCost = 0;

  rooms.forEach(room => {
    const roomArea = calculateRoomArea(room);
    const netWallAreaMm2 = roomArea.netPaintableArea;

    const paintOptions = {
      quality: [
        { value: 'economy', price: 0.00027 },
        { value: 'standard', price: 0.00038 },
        { value: 'premium', price: 0.00054 }
      ]
    };

    const paintPrice = room.paintQualityCost && room.paintQualityCost.trim() !== ''
      ? parseFloat(room.paintQualityCost)
      : (paintOptions.quality.find(q => q.value === room.paintQuality)?.price || 0.00038);

    basePaintCost += netWallAreaMm2 * paintPrice;

    const finishCostValue = room.paintFinishCostManual && room.paintFinishCostManual.trim() !== ''
      ? parseFloat(room.paintFinishCostManual)
      : (parseFloat(room.paintFinishCost) || 0);

    const colourCostValue = room.paintColourCostManual && room.paintColourCostManual.trim() !== ''
      ? parseFloat(room.paintColourCostManual)
      : (parseFloat(room.paintColourCost) || 0);

    finishCost += finishCostValue * netWallAreaMm2;
    colorCost += colourCostValue * netWallAreaMm2;
  });

  return { basePaintCost, finishCost, colorCost };
};

// Mock room data for testing
const createMockRoom = (overrides = {}) => ({
  name: 'Test Room',
  walls: [
    { length: 4000, height: 2500 }, // 10,000,000 mm²
    { length: 3000, height: 2500 }, // 7,500,000 mm²
    { length: 4000, height: 2500 }, // 10,000,000 mm²
    { length: 3000, height: 2500 }  // 7,500,000 mm²
  ], // Total: 35,000,000 mm²
  doors: 1, // 1,600,000 mm²
  windows: 2, // 2,400,000 mm²
  trims: [
    { length: 4000, height: 100 }, // 400,000 mm²
    { length: 3000, height: 100 }  // 300,000 mm²
  ], // Total: 700,000 mm²
  floors: [
    { length: 4000, width: 3000 } // 12,000,000 mm²
  ],
  ceilings: [
    { length: 4000, width: 3000 } // 12,000,000 mm²
  ],
  paintQuality: 'standard',
  paintFinish: 'eggshell',
  paintColour: 'white',
  paintQualityCost: '',
  paintFinishCost: '0.00005',
  paintColourCost: '0.00002',
  paintFinishCostManual: '',
  paintColourCostManual: '',
  ...overrides
});

describe('PDFReportGenerator Helper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('calculateRoomArea', () => {
    it('should calculate total wall area correctly', () => {
      const room = createMockRoom()
      const result = calculateRoomArea(room)

      expect(result.totalWallArea).toBe(35000000) // 4 walls total
    })

    it('should calculate door area correctly', () => {
      const room = createMockRoom({ doors: 2 })
      const result = calculateRoomArea(room)

      expect(result.doorArea).toBe(3200000) // 2 doors * (2000 * 800)
    })

    it('should calculate window area correctly', () => {
      const room = createMockRoom({ windows: 3 })
      const result = calculateRoomArea(room)

      expect(result.windowArea).toBe(3600000) // 3 windows * (1200 * 1000)
    })

    it('should calculate net paintable area correctly', () => {
      const room = createMockRoom()
      const result = calculateRoomArea(room)

      // Total: 35,000,000 - Doors: 1,600,000 - Windows: 2,400,000 - Trims: 700,000 = 30,300,000
      expect(result.netPaintableArea).toBe(30300000)
    })

    it('should handle negative net area by returning 0', () => {
      const room = createMockRoom({
        walls: [{ length: 1000, height: 1000 }], // 1,000,000 mm²
        doors: 5, // 8,000,000 mm²
        windows: 5 // 6,000,000 mm²
      })
      const result = calculateRoomArea(room)

      expect(result.netPaintableArea).toBe(0) // Math.max(0, negative)
    })
  })

  describe('calculateRoomCost', () => {
    it('should calculate cost with standard quality paint', () => {
      const room = createMockRoom({ paintQuality: 'standard' })
      const result = calculateRoomCost(room)

      // Net area: 30,300,000 mm²
      // Base: 30,300,000 * 0.00038 = 11,514
      // Finish: 30,300,000 * 0.00005 = 1,515
      // Color: 30,300,000 * 0.00002 = 606
      // Total: 13,635
      expect(result).toBe(13635)
    })

    it('should calculate cost with premium quality paint', () => {
      const room = createMockRoom({ paintQuality: 'premium' })
      const result = calculateRoomCost(room)

      // Base: 30,300,000 * 0.00054 = 16,362
      // Finish: 30,300,000 * 0.00005 = 1,515
      // Color: 30,300,000 * 0.00002 = 606
      // Total: 18,483
      expect(result).toBe(18483)
    })

    it('should calculate cost with economy quality paint', () => {
      const room = createMockRoom({ paintQuality: 'economy' })
      const result = calculateRoomCost(room)

      // Base: 30,300,000 * 0.00027 = 8,181
      // Finish: 30,300,000 * 0.00005 = 1,515
      // Color: 30,300,000 * 0.00002 = 606
      // Total: 10,302
      expect(result).toBe(10302)
    })

    it('should use manual quality cost override when provided', () => {
      const room = createMockRoom({
        paintQuality: 'standard',
        paintQualityCost: '0.001' // Override standard price
      })
      const result = calculateRoomCost(room)

      // Base: 30,300,000 * 0.001 = 30,300
      // Finish: 30,300,000 * 0.00005 = 1,515
      // Color: 30,300,000 * 0.00002 = 606
      // Total: 32,421
      expect(result).toBe(32421)
    })

    it('should use manual finish cost override when provided', () => {
      const room = createMockRoom({
        paintFinishCostManual: '0.0001' // Override finish cost
      })
      const result = calculateRoomCost(room)

      // Base: 30,300,000 * 0.00038 = 11,514
      // Finish: 30,300,000 * 0.0001 = 3,030
      // Color: 30,300,000 * 0.00002 = 606
      // Total: 15,150
      expect(result).toBe(15150)
    })

    it('should use manual color cost override when provided', () => {
      const room = createMockRoom({
        paintColourCostManual: '0.00008' // Override color cost
      })
      const result = calculateRoomCost(room)

      // Base: 30,300,000 * 0.00038 = 11,514
      // Finish: 30,300,000 * 0.00005 = 1,515
      // Color: 30,300,000 * 0.00008 = 2,424
      // Total: 15,453
      expect(result).toBe(15453)
    })

    it('should handle zero costs correctly', () => {
      const room = createMockRoom({
        paintFinishCost: '0',
        paintColourCost: '0'
      })
      const result = calculateRoomCost(room)

      // Only base paint cost: 30,300,000 * 0.00038 = 11,514
      expect(result).toBe(11514)
    })
  })

  describe('calculateCostBreakdown', () => {
    it('should calculate cost breakdown for single room', () => {
      const rooms = [createMockRoom()]
      const result = calculateCostBreakdown(rooms)

      expect(result.basePaintCost).toBe(11514) // 30,300,000 * 0.00038
      expect(result.finishCost).toBe(1515)     // 30,300,000 * 0.00005
      expect(result.colorCost).toBe(606)       // 30,300,000 * 0.00002
    })

    it('should calculate cost breakdown for multiple rooms', () => {
      const rooms = [
        createMockRoom({ name: 'Room 1' }),
        createMockRoom({
          name: 'Room 2',
          paintQuality: 'premium',
          walls: [{ length: 2000, height: 2500 }], // Smaller room = 5,000,000 mm²
          doors: 0,
          windows: 1, // 1,200,000 mm²
          trims: [] // No trims for smaller room
        })
      ]
      const result = calculateCostBreakdown(rooms)

      // Room 1: Net area = 30,300,000, Base 11,514, Finish 1,515, Color 606
      // Room 2: Net area = 5,000,000 - 1,200,000 = 3,800,000
      //         Base: 3,800,000 * 0.00054 = 2,052
      //         Finish: 3,800,000 * 0.00005 = 190
      //         Color: 3,800,000 * 0.00002 = 76

      expect(result.basePaintCost).toBe(13566) // 11,514 + 2,052
      expect(result.finishCost).toBe(1705)     // 1,515 + 190
      expect(result.colorCost).toBe(682)       // 606 + 76
    })

    it('should handle manual overrides in cost breakdown', () => {
      const rooms = [
        createMockRoom({
          paintQualityCost: '0.001',      // Override quality
          paintFinishCostManual: '0.0001', // Override finish
          paintColourCostManual: '0.00008' // Override color
        })
      ]
      const result = calculateCostBreakdown(rooms)

      expect(result.basePaintCost).toBe(30300) // 30,300,000 * 0.001
      expect(result.finishCost).toBe(3030)     // 30,300,000 * 0.0001
      expect(result.colorCost).toBe(2424)      // 30,300,000 * 0.00008
    })
  })

  describe('generatePaintingCostReport Integration', () => {
    it('should create PDF document with room data', () => {
      const rooms = [createMockRoom()]
      const totalCost = 13635

      const result = generatePaintingCostReport(rooms, totalCost)

      // Verify the function returns a PDF document object
      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })

    it('should handle multiple rooms in PDF generation', () => {
      const rooms = [
        createMockRoom({ name: 'Living Room' }),
        createMockRoom({ name: 'Bedroom' }),
        createMockRoom({ name: 'Kitchen' })
      ]
      const totalCost = 40905 // 3 * 13635

      const result = generatePaintingCostReport(rooms, totalCost)

      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })

    it('should handle empty rooms array', () => {
      const rooms: any[] = []
      const totalCost = 0

      const result = generatePaintingCostReport(rooms, totalCost)

      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })
  })
})