'use client'

import React from 'react'
import { Floor, ReferenceData } from '@/types/calculator'
import SurfaceItem from './SurfaceItem'
import SurfacePaintOptions from '../SurfacePaintOptions'

interface FloorsSectionProps {
  floors: Floor[]
  roomId: number
  referenceData?: ReferenceData
  onAdd: (roomId: number) => void
  onUpdate: (roomId: number, floorId: number, field: keyof Floor, value: number) => void
  onRemove: (roomId: number, floorId: number) => void
}

export default function FloorsSection({
  floors,
  roomId,
  referenceData,
  onAdd,
  onUpdate,
  onRemove,
}: FloorsSectionProps) {
  return (
    <div className="surfaces-group">
      <div className="surfaces-header">
        <h4>Floors ({floors.length})</h4>
        <button className="btn btn-small" onClick={() => onAdd(roomId)}>
          + Add Floor
        </button>
      </div>

      {floors.map((floor, index) => (
        <SurfaceItem
          key={floor.id}
          title={`Floor ${index + 1}`}
          onDuplicate={() => onAdd(roomId)}
          onRemove={() => onRemove(roomId, floor.id)}
          canRemove={floors.length > 1}
        >
          <div className="input-group">
            <label>Length (mm)</label>
            <input
              type="number"
              placeholder="Length (mm)"
              value={floor.length}
              onChange={(e) => onUpdate(roomId, floor.id, 'length', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="input-group">
            <label>Width (mm)</label>
            <input
              type="number"
              placeholder="Width (mm)"
              value={floor.width}
              onChange={(e) => onUpdate(roomId, floor.id, 'width', parseFloat(e.target.value) || 0)}
            />
          </div>

          {referenceData && (
            <SurfacePaintOptions
              surfaceId={floor.id}
              surfaceName={`Floor ${index + 1}`}
              paintTypeId={floor.paintTypeId}
              surfaceTypeId={floor.surfaceTypeId}
              paintQualityId={floor.paintQualityId}
              surfaceConditionId={floor.surfaceConditionId}
              referenceData={referenceData}
              onUpdate={(field, value) => onUpdate(roomId, floor.id, field as keyof Floor, value)}
            />
          )}
        </SurfaceItem>
      ))}
    </div>
  )
}