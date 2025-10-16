'use client'

/**
 * API Test Page
 * Simple page to test the API integration and context
 */

import { CalculatorProvider, useCalculator } from '../contexts/CalculatorContext'

function TestContent() {
  const {
    rooms,
    estimate,
    loading,
    error,
    referenceData,
    defaultIds,
    addRoom,
    removeRoom,
  } = useCalculator()

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>API Integration Test</h1>

      {/* Reference Data Status */}
      <section style={{ marginBottom: '30px', padding: '15px', background: '#f5f5f5' }}>
        <h2>Reference Data Status</h2>
        {referenceData ? (
          <div>
            <p>✅ Reference data loaded</p>
            <ul>
              <li>Paint Types: {referenceData.paintTypes?.length || 0}</li>
              <li>Surface Types: {referenceData.surfaceTypes?.length || 0}</li>
              <li>Paint Qualities: {referenceData.paintQualities?.length || 0}</li>
              <li>Surface Conditions: {referenceData.surfaceConditions?.length || 0}</li>
              <li>Labor Rates: {referenceData.laborRates?.length || 0}</li>
            </ul>
          </div>
        ) : (
          <p>⏳ Loading reference data...</p>
        )}
      </section>

      {/* Default IDs Status */}
      <section style={{ marginBottom: '30px', padding: '15px', background: '#f5f5f5' }}>
        <h2>Default IDs</h2>
        {defaultIds ? (
          <div>
            <p>✅ Default IDs calculated</p>
            <pre style={{ fontSize: '12px' }}>{JSON.stringify(defaultIds, null, 2)}</pre>
          </div>
        ) : (
          <p>⏳ Waiting for default IDs...</p>
        )}
      </section>

      {/* Rooms */}
      <section style={{ marginBottom: '30px', padding: '15px', background: '#f5f5f5' }}>
        <h2>Rooms ({rooms.length})</h2>
        <div style={{ marginBottom: '10px' }}>
          <button onClick={addRoom} style={{ marginRight: '10px', padding: '8px 16px' }}>
            + Add Room
          </button>
          {rooms.length > 1 && (
            <button
              onClick={() => removeRoom(rooms[rooms.length - 1].id)}
              style={{ padding: '8px 16px' }}
            >
              - Remove Last Room
            </button>
          )}
        </div>
        <ul>
          {rooms.map((room) => (
            <li key={room.id}>
              <strong>{room.name}</strong> - {room.walls.length} walls, {room.doors.length}{' '}
              doors, {room.windows.length} windows, {room.ceilings.length} ceilings
            </li>
          ))}
        </ul>
      </section>

      {/* Estimate Status */}
      <section style={{ marginBottom: '30px', padding: '15px', background: '#f5f5f5' }}>
        <h2>Cost Estimate</h2>
        {loading && <p>⏳ Calculating...</p>}
        {error && <p style={{ color: 'red' }}>❌ Error: {error}</p>}
        {estimate && (
          <div>
            <p>✅ Estimate calculated</p>
            <h3 style={{ fontSize: '24px', color: 'green' }}>
              Total: ${estimate.projectTotal.toFixed(2)}
            </h3>
            {estimate.projectCosts && (
              <div>
                <p>
                  <strong>Total Area:</strong>{' '}
                  {estimate.projectCosts.totals.totalArea.toFixed(2)} m²
                </p>
                <p>
                  <strong>Material Cost:</strong> $
                  {estimate.projectCosts.totals.totalMaterialCost.toFixed(2)}
                </p>
                <p>
                  <strong>Labor Cost:</strong> $
                  {estimate.projectCosts.totals.totalLaborCost.toFixed(2)}
                </p>
                <p>
                  <strong>Surfaces:</strong> {estimate.projectCosts.surfaces.length}
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Detailed Surfaces */}
      {estimate?.projectCosts && (
        <section style={{ marginBottom: '30px', padding: '15px', background: '#f5f5f5' }}>
          <h2>Surface Breakdown</h2>
          {estimate.projectCosts.surfaces.map((surface) => (
            <div
              key={surface.id}
              style={{
                marginBottom: '15px',
                padding: '10px',
                background: 'white',
                border: '1px solid #ddd',
              }}
            >
              <h4>{surface.name}</h4>
              <p>
                Area: {surface.area.toFixed(2)} m² | Total Cost: $
                {surface.costBreakdown.totalCost.toFixed(2)}
              </p>
              <small>
                Material: ${surface.costBreakdown.materialCost.toFixed(2)} | Labor: $
                {surface.costBreakdown.laborCost.toFixed(2)}
              </small>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}

export default function ApiTestPage() {
  return (
    <CalculatorProvider>
      <TestContent />
    </CalculatorProvider>
  )
}