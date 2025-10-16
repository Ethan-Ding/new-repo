import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ProjectCostSummary, LaborRate } from '../types/painting';
import { formatCurrency, formatArea, formatVolume, formatTime } from '../lib/calculations/pure-calculations';

interface PDFReportGeneratorProps {
  projectSummary: ProjectCostSummary;
  laborRate: LaborRate;
  onGenerate: () => void;
}

export const generateAdvancedPaintingCostReport = (
  projectSummary: ProjectCostSummary,
  laborRate: LaborRate
): jsPDF => {
  const doc = new jsPDF();
  
  // Set up fonts and colors
  const primaryColor: [number, number, number] = [41, 128, 185]; // Blue
  const secondaryColor: [number, number, number] = [52, 73, 94]; // Dark gray
  const accentColor: [number, number, number] = [46, 204, 113]; // Green

  // Title
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.text('Professional Painting Cost Report', 20, 30);

  // Date and project info
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
  doc.text(`Project ID: ${Date.now().toString().slice(-6)}`, 20, 52);
  
  // Executive Summary
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text('Executive Summary', 20, 70);
  
  doc.setFontSize(12);
  doc.setTextColor(...secondaryColor);
  
  const summaryData = [
    ['Total Surfaces', projectSummary.surfaces.length.toString()],
    ['Total Area', formatArea(projectSummary.totals.totalArea)],
    ['Material Cost', formatCurrency(projectSummary.totals.totalMaterialCost)],
    ['Labor Cost', formatCurrency(projectSummary.totals.totalLaborCost)],
    ['Profit Margin', formatCurrency(projectSummary.totals.totalProfitMargin)],
    ['Grand Total', formatCurrency(projectSummary.totals.grandTotal)]
  ];
  
  autoTable(doc, {
    startY: 80,
    body: summaryData,
    theme: 'grid',
    styles: {
      fontSize: 11,
      cellPadding: 6
    },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 100, halign: 'right' }
    },
    bodyStyles: {
      fillColor: [255, 255, 255]
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });
  
  // Labor Rate Information
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text('Labor Rate Information', 20, 120);
  
  doc.setFontSize(12);
  doc.setTextColor(...secondaryColor);
  
  const laborData = [
    ['Hourly Rate', formatCurrency(laborRate.hourlyRate || 0) + '/hour'],
    ['Overhead Rate', formatCurrency(laborRate.overheadRate) + '/hour'],
    ['Total Rate', formatCurrency(laborRate.totalRate || 0) + '/hour'],
    ['Profit Margin', (laborRate.profitMargin * 100).toFixed(1) + '%']
  ];
  
  autoTable(doc, {
    startY: 140,
    body: laborData,
    theme: 'grid',
    styles: {
      fontSize: 11,
      cellPadding: 6
    },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 100, halign: 'right' }
    }
  });
  
  // Detailed Surface Breakdown
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text('Detailed Surface Breakdown', 20, 180);
  
  // Prepare surface table data
  const surfaceTableData = projectSummary.surfaces.map(surface => [
    surface.name,
    formatArea(surface.area),
    '2', // Default coats
    formatCurrency(surface.costBreakdown.materialCost),
    formatCurrency(surface.costBreakdown.laborCost),
    formatCurrency(surface.costBreakdown.totalCost)
  ]);
  
  // Add totals row
  surfaceTableData.push([
    'TOTAL',
    formatArea(projectSummary.totals.totalArea),
    '',
    formatCurrency(projectSummary.totals.totalMaterialCost),
    formatCurrency(projectSummary.totals.totalLaborCost),
    formatCurrency(projectSummary.totals.grandTotal)
  ]);
  
  autoTable(doc, {
    startY: 200,
    head: [['Surface', 'Area', 'Coats', 'Materials', 'Labor', 'Total']],
    body: surfaceTableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 10,
      cellPadding: 5
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 30, halign: 'right' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 30, halign: 'right' }
    }
  });
  
  // Detailed Surface Information
  let currentY = 250; // Approximate position after the table
  
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text('Detailed Surface Information', 20, currentY);
  currentY += 15;
  
  projectSummary.surfaces.forEach((surface, index) => {
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    // Surface header
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text(`${surface.name}`, 20, currentY);
    currentY += 10;
    
    // Surface details
    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    
    const details = [
      `Area: ${formatArea(surface.area)}`,
      `Coats: 2`,
      `Paint Volume: ${formatVolume(surface.costBreakdown.details.paintVolume)}`,
      `Coverage: ${surface.costBreakdown.details.coverage.toFixed(2)} m²/L`,
      `Cost per m²: ${formatCurrency(surface.costBreakdown.details.costPerM2)}`,
      `Prep Time: ${formatTime(surface.costBreakdown.details.prepTime)}`,
      `Labor Rate: ${formatCurrency(surface.costBreakdown.details.laborRate)}/hour`,
      `Material Cost: ${formatCurrency(surface.costBreakdown.materialCost)}`,
      `Labor Cost: ${formatCurrency(surface.costBreakdown.laborCost)}`,
      `Subtotal: ${formatCurrency(surface.costBreakdown.subtotal)}`,
      `Profit Margin: ${formatCurrency(surface.costBreakdown.profitMargin)}`,
      `Total Cost: ${formatCurrency(surface.costBreakdown.totalCost)}`
    ];
    
    details.forEach(detail => {
      doc.text(detail, 25, currentY);
      currentY += 6;
    });
    
    currentY += 10;
  });
  
  // Cost Analysis
  doc.addPage();
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text('Cost Analysis', 20, 30);
  
  // Cost breakdown pie chart data (as text)
  doc.setFontSize(12);
  doc.setTextColor(...secondaryColor);
  
  const materialPercentage = (projectSummary.totals.totalMaterialCost / projectSummary.totals.grandTotal * 100).toFixed(1);
  const laborPercentage = (projectSummary.totals.totalLaborCost / projectSummary.totals.grandTotal * 100).toFixed(1);
  const profitPercentage = (projectSummary.totals.totalProfitMargin / projectSummary.totals.grandTotal * 100).toFixed(1);
  
  doc.text('Cost Distribution:', 20, 50);
  doc.text(`• Materials: ${materialPercentage}% (${formatCurrency(projectSummary.totals.totalMaterialCost)})`, 30, 65);
  doc.text(`• Labor: ${laborPercentage}% (${formatCurrency(projectSummary.totals.totalLaborCost)})`, 30, 75);
  doc.text(`• Profit Margin: ${profitPercentage}% (${formatCurrency(projectSummary.totals.totalProfitMargin)})`, 30, 85);
  
  // Recommendations
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text('Recommendations', 20, 110);
  
  doc.setFontSize(11);
  doc.setTextColor(...secondaryColor);
  
  const recommendations = [
    '• Ensure all surfaces are properly prepared before painting',
    '• Consider the number of coats required for optimal coverage',
    '• Factor in additional time for surface preparation',
    '• Review material costs and consider bulk purchasing',
    '• Validate labor rates against current market standards'
  ];
  
  recommendations.forEach((rec, index) => {
    doc.text(rec, 20, 125 + (index * 8));
  });
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...secondaryColor);
    doc.text(`Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.height - 10);
    doc.text('Generated by Professional Painting Cost Calculator', doc.internal.pageSize.width - 100, doc.internal.pageSize.height - 10);
  }
  
  return doc;
};

export default function PDFReportGenerator({ projectSummary, laborRate, onGenerate }: PDFReportGeneratorProps) {
  const handleGenerateReport = () => {
    const doc = generateAdvancedPaintingCostReport(projectSummary, laborRate);
    doc.save(`professional-painting-report-${new Date().toISOString().split('T')[0]}.pdf`);
    onGenerate();
  };

  return (
    <button
      onClick={handleGenerateReport}
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
    >
      📄 Generate PDF Report
    </button>
  );
}