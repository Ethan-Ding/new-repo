import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePaintingCostReport = (rooms, totalCost) => {
  const doc = new jsPDF();
  
  // Set up fonts and colors
  const primaryColor = [41, 128, 185]; // Blue
  const secondaryColor = [52, 73, 94]; // Dark gray
  const accentColor = [46, 204, 113]; // Green
  
  // Title
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.text('Painting Cost Report', 20, 30);
  
  // Date
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
  
  // Project Summary
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text('Project Summary', 20, 65);
  
  doc.setFontSize(12);
  doc.setTextColor(...secondaryColor);
  doc.text(`Total Rooms: ${rooms.length}`, 20, 80);
  doc.text(`Total Project Cost: $${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20, 90);
  
  // Room Details Table
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text('Room-by-Room Breakdown', 20, 110);
  
  // Prepare table data
  const tableData = rooms.map(room => {
    const roomArea = calculateRoomArea(room);
    const roomCost = calculateRoomCost(room);
    
    return [
      room.name,
      `${(roomArea.netPaintableArea / 1000000).toFixed(2)} m²`,
      room.paintQuality,
      room.paintFinish,
      room.paintColour,
      `$${roomCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ];
  });
  
  // Add totals row
  tableData.push([
    'TOTAL',
    `${(rooms.reduce((total, room) => total + calculateRoomArea(room).netPaintableArea, 0) / 1000000).toFixed(2)} m²`,
    '',
    '',
    '',
    `$${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  ]);
  
  // Create table
  autoTable(doc, {
    startY: 120,
    head: [['Room Name', 'Paintable Area', 'Quality', 'Finish', 'Color', 'Cost']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    styles: {
      fontSize: 10,
      cellPadding: 5
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 25, halign: 'right' },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 30, halign: 'right' }
    }
  });
  
  // Detailed Room Information
  let currentY = 200; // Approximate position after the table
  
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text('Detailed Room Information', 20, currentY);
  currentY += 15;
  
  rooms.forEach((room, index) => {
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    const roomArea = calculateRoomArea(room);
    const roomCost = calculateRoomCost(room);
    
    // Room header
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text(`${room.name}`, 20, currentY);
    currentY += 10;
    
    // Room details
    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    
    const details = [
      `Paint Quality: ${room.paintQuality}`,
      `Paint Finish: ${room.paintFinish}`,
      `Paint Color: ${room.paintColour}`,
      `Doors: ${room.doors}`,
      `Windows: ${room.windows}`,
      `Total Wall Area: ${(roomArea.totalWallArea / 1000000).toFixed(2)} m²`,
      `Net Paintable Area: ${(roomArea.netPaintableArea / 1000000).toFixed(2)} m²`,
      `Room Cost: $${roomCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ];
    
    details.forEach(detail => {
      doc.text(detail, 25, currentY);
      currentY += 6;
    });
    
    currentY += 10;
  });
  
  // Cost Breakdown Summary
  doc.addPage();
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text('Cost Breakdown Summary', 20, 30);
  
  // Calculate cost breakdown
  const costBreakdown = calculateCostBreakdown(rooms);
  
  doc.setFontSize(12);
  doc.setTextColor(...secondaryColor);
  
  const breakdownData = [
    ['Base Paint Cost', `$${costBreakdown.basePaintCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ['Finish Cost', `$${costBreakdown.finishCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ['Color Cost', `$${costBreakdown.colorCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ['', ''],
    ['TOTAL PROJECT COST', `$${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]
  ];
  
  autoTable(doc, {
    startY: 50,
    body: breakdownData,
    theme: 'grid',
    styles: {
      fontSize: 12,
      cellPadding: 8
    },
    columnStyles: {
      0: { cellWidth: 100, fontStyle: 'bold' },
      1: { cellWidth: 80, halign: 'right', fontStyle: 'bold' }
    },
    bodyStyles: {
      fillColor: [255, 255, 255]
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...secondaryColor);
    doc.text(`Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.height - 10);
    doc.text('Generated by Painting Cost Calculator', doc.internal.pageSize.width - 80, doc.internal.pageSize.height - 10);
  }
  
  return doc;
};

// Helper functions (these should match the ones in App.jsx)
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
  const netWallAreaMm2 = Math.max(0, wallAreaMm2 - doorAreaMm2 - windowAreaMm2);
  
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
  const trimAreaMm2 = room.trims.reduce((total, trim) => total + (trim.length * trim.height), 0);
  
  const netWallAreaMm2 = Math.max(0, wallAreaMm2 - doorAreaMm2 - windowAreaMm2 - trimAreaMm2);
  
  // Calculate floor and ceiling areas
  const floorAreaMm2 = room.floors.reduce((total, floor) => total + (floor.length * floor.width), 0);
  const ceilingAreaMm2 = room.ceilings.reduce((total, ceiling) => total + (ceiling.length * ceiling.width), 0);
  
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