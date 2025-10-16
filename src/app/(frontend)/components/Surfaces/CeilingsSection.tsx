'use client'

import React from 'react'
import { Ceiling, ReferenceData } from '@/types/calculator'
import SurfaceItem from './SurfaceItem'
import SurfacePaintOptions from '../SurfacePaintOptions'

interface CeilingsSectionProps {
  ceilings: Ceiling[]
  roomId: number
  referenceData?: ReferenceData
  onAdd: (roomId: number) => void
  onUpdate: (roomId: number, ceilingId: number, field: keyof Ceiling, value: number) => void
  onRemove: (roomId: number, ceilingId: number) => void
}

export default function CeilingsSection({
  ceilings,
  roomId,
  referenceData,
  onAdd,
  onUpdate,
  onRemove,
}: CeilingsSectionProps) {
  return (
    <div className="surfaces-group">
      <div className="surfaces-header">
        <h4>Ceilings ({ceilings.length})</h4>
        <button className="btn btn-small" onClick={() => onAdd(roomId)}>
          + Add Ceiling
        </button>
      </div>

      {ceilings.map((ceiling, index) => (
        <SurfaceItem
          key={ceiling.id}
          title={`Ceiling ${index + 1}`}
          onDuplicate={() => onAdd(roomId)}
          onRemove={() => onRemove(roomId, ceiling.id)}
          canRemove={ceilings.length > 1}
        >
          <div className="input-group">
            <label>Length (mm)</label>
            <input
              type="number"
              placeholder="Length (mm)"
              value={ceiling.length}
              onChange={(e) =>
                onUpdate(roomId, ceiling.id, 'length', parseFloat(e.target.value) || 0)
              }
            />
          </div>
          <div className="input-group">
            <label>Width (mm)</label>
            <input
              type="number"
              placeholder="Width (mm)"
              value={ceiling.width}
              onChange={(e) =>
                onUpdate(roomId, ceiling.id, 'width', parseFloat(e.target.value) || 0)
              }
            />
          </div>

          {referenceData && (
            <SurfacePaintOptions
              surfaceId={ceiling.id}
              surfaceName={`Ceiling ${index + 1}`}
              paintTypeId={ceiling.paintTypeId}
              surfaceTypeId={ceiling.surfaceTypeId}
              paintQualityId={ceiling.paintQualityId}
              surfaceConditionId={ceiling.surfaceConditionId}
              referenceData={referenceData}
              onUpdate={(field, value) => onUpdate(roomId, ceiling.id, field as keyof Ceiling, value)}
            />
          )}
        </SurfaceItem>
      ))}
    </div>
  )
}