'use client'

import React from 'react'
import { ReferenceData } from '@/types/calculator'

interface SurfacePaintOptionsProps {
  surfaceId: number
  surfaceName: string
  paintTypeId?: number | null
  surfaceTypeId?: number | null
  paintQualityId?: number | null
  surfaceConditionId?: number | null
  referenceData: ReferenceData
  onUpdate: (field: string, value: number) => void
}

export default function SurfacePaintOptions({
  surfaceId,
  surfaceName,
  paintTypeId,
  surfaceTypeId,
  paintQualityId,
  surfaceConditionId,
  referenceData,
  onUpdate,
}: SurfacePaintOptionsProps) {
  return (
    <div className="surface-paint-options" style={{ marginTop: '10px', paddingLeft: '20px', borderLeft: '2px solid #e0e0e0' }}>
      <h5 style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
        Paint Options for {surfaceName}
      </h5>

      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        <div className="form-group">
          <label style={{ fontSize: '12px' }}>Paint Type:</label>
          <select
            value={paintTypeId ?? ''}
            onChange={(e) => onUpdate('paintTypeId', Number(e.target.value))}
            style={{ fontSize: '12px' }}
          >
            <option value="">-- Select Paint Type --</option>
            {referenceData.paintTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label style={{ fontSize: '12px' }}>Surface Type:</label>
          <select
            value={surfaceTypeId ?? ''}
            onChange={(e) => onUpdate('surfaceTypeId', Number(e.target.value))}
            style={{ fontSize: '12px' }}
          >
            <option value="">-- Select Surface Type --</option>
            {referenceData.surfaceTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name} ({type.category})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label style={{ fontSize: '12px' }}>Paint Quality:</label>
          <select
            value={paintQualityId ?? ''}
            onChange={(e) => onUpdate('paintQualityId', Number(e.target.value))}
            style={{ fontSize: '12px' }}
          >
            <option value="">-- Select Paint Quality --</option>
            {referenceData.paintQualities.map((quality) => (
              <option key={quality.id} value={quality.id}>
                {quality.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label style={{ fontSize: '12px' }}>Surface Condition:</label>
          <select
            value={surfaceConditionId ?? ''}
            onChange={(e) => onUpdate('surfaceConditionId', Number(e.target.value))}
            style={{ fontSize: '12px' }}
          >
            <option value="">-- Select Surface Condition --</option>
            {referenceData.surfaceConditions.map((condition) => (
              <option key={condition.id} value={condition.id}>
                {condition.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}