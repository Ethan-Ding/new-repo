'use client'

import React from 'react'
import { Trim, ReferenceData } from '@/types/calculator'
import SurfaceItem from './SurfaceItem'
import SurfacePaintOptions from '../SurfacePaintOptions'

interface TrimsSectionProps {
  trims: Trim[]
  roomId: number
  referenceData?: ReferenceData
  onAdd: (roomId: number) => void
  onUpdate: (roomId: number, trimId: number, field: keyof Trim, value: number) => void
  onRemove: (roomId: number, trimId: number) => void
}

export default function TrimsSection({
  trims,
  roomId,
  referenceData,
  onAdd,
  onUpdate,
  onRemove,
}: TrimsSectionProps) {
  return (
    <div className="surfaces-group">
      <div className="surfaces-header">
        <h4>Trims ({trims.length})</h4>
        <button className="btn btn-small" onClick={() => onAdd(roomId)}>
          + Add Trim
        </button>
      </div>

      {trims.map((trim, index) => (
        <SurfaceItem
          key={trim.id}
          title={`Trim ${index + 1}`}
          onDuplicate={() => onAdd(roomId)}
          onRemove={() => onRemove(roomId, trim.id)}
        >
          <div className="input-group">
            <label>Length (mm)</label>
            <input
              type="number"
              placeholder="Length (mm)"
              value={trim.length}
              onChange={(e) => onUpdate(roomId, trim.id, 'length', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="input-group">
            <label>Height (mm)</label>
            <input
              type="number"
              placeholder="Height (mm)"
              value={trim.height}
              onChange={(e) => onUpdate(roomId, trim.id, 'height', parseFloat(e.target.value) || 0)}
            />
          </div>

          {referenceData && (
            <SurfacePaintOptions
              surfaceId={trim.id}
              surfaceName={`Trim ${index + 1}`}
              paintTypeId={trim.paintTypeId}
              surfaceTypeId={trim.surfaceTypeId}
              paintQualityId={trim.paintQualityId}
              surfaceConditionId={trim.surfaceConditionId}
              referenceData={referenceData}
              onUpdate={(field, value) => onUpdate(roomId, trim.id, field as keyof Trim, value)}
            />
          )}
        </SurfaceItem>
      ))}
    </div>
  )
}