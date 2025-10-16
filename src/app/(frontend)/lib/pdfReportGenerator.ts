/**
 * PDF Report Generator for Frontend Calculator
 * Generates comprehensive painting cost reports using jsPDF
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Room, CalculatorEstimate, ReferenceData } from '@/types/calculator'

interface PDFReportData {
  rooms: Room[]
  estimate: CalculatorEstimate
  referenceData: ReferenceData | null
}

/**
 * Calculate total area for a room (all surfaces combined)
 */
function calculateRoomArea(room: Room): {
  totalWallArea: number // mm²
  doorArea: number // mm²
  windowArea: number // mm²
  trimArea: number // mm²
  floorArea: number // mm²
  ceilingArea: number // mm²
  netPaintableArea: number // mm²
  totalArea: number // mm²
} {
  const wallAreaMm2 = room.walls.reduce((total, wall) => total + wall.length * wall.height, 0)
  const doorAreaMm2 = room.doors.reduce((total, door) => total + door.width * door.height, 0)
  const windowAreaMm2 = room.windows.reduce(
    (total, window) => total + window.width * window.height,
    0,
  )
  const trimAreaMm2 = room.trims.reduce((total, trim) => total + trim.length * trim.height, 0)
  const floorAreaMm2 = room.floors.reduce((total, floor) => total + floor.length * floor.width, 0)
  const ceilingAreaMm2 = room.ceilings.reduce(
    (total, ceiling) => total + ceiling.length * ceiling.width,
    0,
  )

  const netWallAreaMm2 = Math.max(0, wallAreaMm2 - doorAreaMm2 - windowAreaMm2)
  const netPaintableArea = netWallAreaMm2 // Walls only for now
  const totalArea = netWallAreaMm2 + floorAreaMm2 + ceilingAreaMm2

  return {
    totalWallArea: wallAreaMm2,
    doorArea: doorAreaMm2,
    windowArea: windowAreaMm2,
    trimArea: trimAreaMm2,
    floorArea: floorAreaMm2,
    ceilingArea: ceilingAreaMm2,
    netPaintableArea,
    totalArea,
  }
}

/**
 * Find cost for a specific room from the estimate
 */
function getRoomCost(room: Room, estimate: CalculatorEstimate): number {
  if (!estimate.projectCosts?.surfaces) return 0

  // Find all surfaces belonging to this room
  const roomSurfaces = estimate.projectCosts.surfaces.filter((surface) =>
    surface.id.startsWith(`room-${room.id}-`),
  )

  // Sum up the costs
  return roomSurfaces.reduce((total, surface) => total + surface.costBreakdown.totalCost, 0)
}

/**
 * Get paint/surface names by ID from reference data
 */
function getPaintTypeName(id: number | null | undefined, referenceData: ReferenceData | null): string {
  if (!id || !referenceData) return 'N/A'
  return referenceData.paintTypes.find((pt) => pt.id === id)?.name ?? 'N/A'
}

function getSurfaceTypeName(id: number | null | undefined, referenceData: ReferenceData | null): string {
  if (!id || !referenceData) return 'N/A'
  return referenceData.surfaceTypes.find((st) => st.id === id)?.name ?? 'N/A'
}

function getPaintQualityName(id: number | null | undefined, referenceData: ReferenceData | null): string {
  if (!id || !referenceData) return 'N/A'
  return referenceData.paintQualities.find((pq) => pq.id === id)?.name ?? 'N/A'
}

function getSurfaceConditionName(id: number | null | undefined, referenceData: ReferenceData | null): string {
  if (!id || !referenceData) return 'N/A'
  return referenceData.surfaceConditions.find((sc) => sc.id === id)?.name ?? 'N/A'
}

/**
 * Generate PDF Report
 */
export function generatePaintingCostReport(data: PDFReportData): jsPDF {
  const { rooms, estimate, referenceData } = data
  const doc = new jsPDF()

  // Color palette
  const primaryColor: [number, number, number] = [41, 128, 185] // Blue
  const secondaryColor: [number, number, number] = [52, 73, 94] // Dark gray
  const accentColor: [number, number, number] = [46, 204, 113] // Green

  const totalCost = estimate.projectTotal

  // ====== PAGE 1: TITLE & SUMMARY ======
  doc.setFontSize(24)
  doc.setTextColor(...primaryColor)
  doc.text('Painting Cost Report', 20, 30)

  // Date
  doc.setFontSize(10)
  doc.setTextColor(...secondaryColor)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45)

  // Project Summary
  doc.setFontSize(16)
  doc.setTextColor(...primaryColor)
  doc.text('Project Summary', 20, 65)

  doc.setFontSize(12)
  doc.setTextColor(...secondaryColor)
  doc.text(`Total Rooms: ${rooms.length}`, 20, 80)
  doc.text(
    `Total Project Cost: $${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    20,
    90,
  )

  // Room Details Table
  doc.setFontSize(16)
  doc.setTextColor(...primaryColor)
  doc.text('Room-by-Room Breakdown', 20, 110)

  // Prepare table data
  const tableData = rooms.map((room) => {
    const roomArea = calculateRoomArea(room)
    const roomCost = getRoomCost(room, estimate)

    return [
      room.name,
      `${(roomArea.totalArea / 1_000_000).toFixed(2)} m²`,
      `${room.walls.length} walls`,
      `${room.doors.length} doors, ${room.windows.length} windows`,
      `$${roomCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    ]
  })

  // Add totals row
  const totalAreaM2 = rooms.reduce(
    (total, room) => total + calculateRoomArea(room).totalArea / 1_000_000,
    0,
  )
  tableData.push([
    'TOTAL',
    `${totalAreaM2.toFixed(2)} m²`,
    '',
    '',
    `$${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  ])

  // Create table
  autoTable(doc, {
    startY: 120,
    head: [['Room Name', 'Total Area', 'Walls', 'Openings', 'Cost']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 30, halign: 'right' },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 50, halign: 'center' },
      4: { cellWidth: 30, halign: 'right' },
    },
  })

  // ====== PAGE 2+: DETAILED ROOM INFORMATION ======
  let currentY = (doc as any).lastAutoTable.finalY + 20

  doc.setFontSize(16)
  doc.setTextColor(...primaryColor)
  doc.text('Detailed Room Information', 20, currentY)
  currentY += 15

  rooms.forEach((room, index) => {
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage()
      currentY = 20
    }

    const roomArea = calculateRoomArea(room)
    const roomCost = getRoomCost(room, estimate)

    // Room header
    doc.setFontSize(14)
    doc.setTextColor(...primaryColor)
    doc.text(`${room.name}`, 20, currentY)
    currentY += 10

    // Room details
    doc.setFontSize(10)
    doc.setTextColor(...secondaryColor)

    const details = [
      `Walls: ${room.walls.length} | Doors: ${room.doors.length} | Windows: ${room.windows.length} | Trims: ${room.trims.length}`,
      `Floors: ${room.floors.length} | Ceilings: ${room.ceilings.length}`,
      `Total Wall Area: ${(roomArea.totalWallArea / 1_000_000).toFixed(2)} m²`,
      `Net Paintable Area: ${(roomArea.netPaintableArea / 1_000_000).toFixed(2)} m²`,
      `Floor Area: ${(roomArea.floorArea / 1_000_000).toFixed(2)} m²`,
      `Ceiling Area: ${(roomArea.ceilingArea / 1_000_000).toFixed(2)} m²`,
      `Room Cost: $${roomCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    ]

    details.forEach((detail) => {
      doc.text(detail, 25, currentY)
      currentY += 6
    })

    currentY += 10
  })

  // ====== COST BREAKDOWN SUMMARY PAGE ======
  doc.addPage()
  doc.setFontSize(16)
  doc.setTextColor(...primaryColor)
  doc.text('Cost Breakdown Summary', 20, 30)

  if (estimate.projectCosts?.totals) {
    const totals = estimate.projectCosts.totals

    const breakdownData = [
      ['Material Cost', `$${totals.totalMaterialCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ['Labor Cost', `$${totals.totalLaborCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ['Subtotal', `$${totals.totalSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ['Profit Margin', `$${totals.totalProfitMargin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ['', ''],
      ['TOTAL PROJECT COST', `$${totals.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ]

    autoTable(doc, {
      startY: 50,
      body: breakdownData,
      theme: 'grid',
      styles: {
        fontSize: 12,
        cellPadding: 8,
      },
      columnStyles: {
        0: { cellWidth: 100, fontStyle: 'bold' },
        1: { cellWidth: 80, halign: 'right', fontStyle: 'bold' },
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    })
  }

  // ====== FOOTER ON ALL PAGES ======
  const pageCount = doc.internal.pages.length - 1 // Exclude the first empty page
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(...secondaryColor)
    doc.text(`Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.height - 10)
    doc.text(
      'Generated by Painting Cost Calculator',
      doc.internal.pageSize.width - 80,
      doc.internal.pageSize.height - 10,
    )
  }

  return doc
}