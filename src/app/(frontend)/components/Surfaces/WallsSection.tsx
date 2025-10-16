'use client'

import React from 'react'
import { Wall, ReferenceData } from '@/types/calculator'
import SurfaceItem from './SurfaceItem'
import SurfacePaintOptions from '../SurfacePaintOptions'

interface WallsSectionProps {
  walls: Wall[]
  roomId: number
  referenceData?: ReferenceData
  onAdd: (roomId: number) => void
  onUpdate: (roomId: number, wallId: number, field: keyof Wall, value: number) => void
  onDuplicate: (roomId: number, wallId: number) => void
  onRemove: (roomId: number, wallId: number) => void
}

export default function WallsSection({
  walls,
  roomId,
  referenceData,
  onAdd,
  onUpdate,
  onDuplicate,
  onRemove,
}: WallsSectionProps) {
  return (
    <div className="surfaces-group">
      <div className="surfaces-header">
        <h4>Walls ({walls.length})</h4>
        <button className="btn btn-small" onClick={() => onAdd(roomId)}>
          + Add Wall
        </button>
      </div>

      {walls.map((wall, index) => (
        <SurfaceItem
          key={wall.id}
          title={`Wall ${index + 1}`}
          onDuplicate={() => onDuplicate(roomId, wall.id)}
          onRemove={() => onRemove(roomId, wall.id)}
          canRemove={walls.length > 1}
        >
          <div className="input-group">
            <label>Length (mm)</label>
            <input
              type="number"
              placeholder="Length (mm)"
              value={wall.length}
              onChange={(e) => onUpdate(roomId, wall.id, 'length', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="input-group">
            <label>Height (mm)</label>
            <input
              type="number"
              placeholder="Height (mm)"
              value={wall.height}
              onChange={(e) => onUpdate(roomId, wall.id, 'height', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="input-group">
            <label>Door Count</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={wall.doorCount ?? 0}
              onChange={(e) => onUpdate(roomId, wall.id, 'doorCount', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="input-group">
            <label>Window Count</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={wall.windowCount ?? 0}
              onChange={(e) => onUpdate(roomId, wall.id, 'windowCount', parseInt(e.target.value) || 0)}
            />
          </div>
          <span className="wall-area">{(wall.length * wall.height).toLocaleString()} mm²</span>

          {referenceData && (
            <SurfacePaintOptions
              surfaceId={wall.id}
              surfaceName={`Wall ${index + 1}`}
              paintTypeId={wall.paintTypeId}
              surfaceTypeId={wall.surfaceTypeId}
              paintQualityId={wall.paintQualityId}
              surfaceConditionId={wall.surfaceConditionId}
              referenceData={referenceData}
              onUpdate={(field, value) => onUpdate(roomId, wall.id, field as keyof Wall, value)}
            />
          )}
        </SurfaceItem>
      ))}
    </div>
  )
}