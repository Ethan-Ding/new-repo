'use client'

import React from 'react'
import { Door } from '@/types/calculator'
import SurfaceItem from './SurfaceItem'

interface DoorsSectionProps {
  doors: Door[]
  roomId: number
  onAdd: (roomId: number) => void
  onUpdate: (roomId: number, doorId: number, field: keyof Door, value: number) => void
  onRemove: (roomId: number, doorId: number) => void
}

export default function DoorsSection({
  doors,
  roomId,
  onAdd,
  onUpdate,
  onRemove,
}: DoorsSectionProps) {
  return (
    <div className="surfaces-group">
      <div className="surfaces-header">
        <h4>Doors ({doors.length})</h4>
        <button className="btn btn-small" onClick={() => onAdd(roomId)}>
          + Add Door
        </button>
      </div>

      {doors.map((door, index) => (
        <SurfaceItem
          key={door.id}
          title={`Door ${index + 1}`}
          onDuplicate={() => onAdd(roomId)}
          onRemove={() => onRemove(roomId, door.id)}
        >
          <div className="input-group">
            <label>Width (mm)</label>
            <input
              type="number"
              placeholder="Width (mm)"
              value={door.width}
              onChange={(e) => onUpdate(roomId, door.id, 'width', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="input-group">
            <label>Height (mm)</label>
            <input
              type="number"
              placeholder="Height (mm)"
              value={door.height}
              onChange={(e) => onUpdate(roomId, door.id, 'height', parseFloat(e.target.value) || 0)}
            />
          </div>
        </SurfaceItem>
      ))}
    </div>
  )
}