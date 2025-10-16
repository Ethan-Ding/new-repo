'use client'

import React from 'react'
import { useCalculator } from '../contexts/CalculatorContext'
import SurfaceTabs from './SurfaceTabs'
import CostSummary from './CostSummary'
import { generatePaintingCostReport } from '../lib/pdfReportGenerator'

export default function Calculator() {
  const {
    rooms,
    currentRoom,
    estimate,
    loading,
    referenceData,
    addWall,
    updateWall,
    duplicateWall,
    removeWall,
    addDoor,
    updateDoor,
    removeDoor,
    addWindow,
    updateWindow,
    removeWindow,
    addTrim,
    updateTrim,
    removeTrim,
    addFloor,
    updateFloor,
    removeFloor,
    addCeiling,
    updateCeiling,
    removeCeiling,
  } = useCalculator()

  const handleGeneratePDF = () => {
    if (!estimate) {
      alert('No estimate available to generate PDF')
      return
    }

    const doc = generatePaintingCostReport({
      rooms,
      estimate,
      referenceData,
    })

    const fileName = `painting-cost-report-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  if (!currentRoom) {
    return (
      <div>
        <h2>No room selected</h2>
        <p>Please add a room to get started.</p>
      </div>
    )
  }

  return (
    <div className="calculator-container">
      <div className="room-details">
        <h3>{currentRoom.name}</h3>

        {/* Surface Tabs with all sections */}
        <SurfaceTabs
          room={currentRoom}
          referenceData={referenceData ?? undefined}
          onAddWall={addWall}
          onUpdateWall={updateWall}
          onDuplicateWall={duplicateWall}
          onRemoveWall={removeWall}
          onAddDoor={addDoor}
          onUpdateDoor={updateDoor}
          onRemoveDoor={removeDoor}
          onAddWindow={addWindow}
          onUpdateWindow={updateWindow}
          onRemoveWindow={removeWindow}
          onAddTrim={addTrim}
          onUpdateTrim={updateTrim}
          onRemoveTrim={removeTrim}
          onAddFloor={addFloor}
          onUpdateFloor={updateFloor}
          onRemoveFloor={removeFloor}
          onAddCeiling={addCeiling}
          onUpdateCeiling={updateCeiling}
          onRemoveCeiling={removeCeiling}
        />
      </div>

      {/* Cost Summary */}
      <CostSummary
        projectTotal={estimate?.projectTotal ?? null}
        loading={loading}
        onGeneratePDF={handleGeneratePDF}
      />
    </div>
  )
}