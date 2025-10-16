'use client'

import React from 'react'
import { Window } from '@/types/calculator'
import SurfaceItem from './SurfaceItem'

interface WindowsSectionProps {
  windows: Window[]
  roomId: number
  onAdd: (roomId: number) => void
  onUpdate: (roomId: number, windowId: number, field: keyof Window, value: number) => void
  onRemove: (roomId: number, windowId: number) => void
}

export default function WindowsSection({
  windows,
  roomId,
  onAdd,
  onUpdate,
  onRemove,
}: WindowsSectionProps) {
  return (
    <div className="surfaces-group">
      <div className="surfaces-header">
        <h4>Windows ({windows.length})</h4>
        <button className="btn btn-small" onClick={() => onAdd(roomId)}>
          + Add Window
        </button>
      </div>

      {windows.map((window, index) => (
        <SurfaceItem
          key={window.id}
          title={`Window ${index + 1}`}
          onDuplicate={() => onAdd(roomId)}
          onRemove={() => onRemove(roomId, window.id)}
        >
          <div className="input-group">
            <label>Width (mm)</label>
            <input
              type="number"
              placeholder="Width (mm)"
              value={window.width}
              onChange={(e) => onUpdate(roomId, window.id, 'width', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="input-group">
            <label>Height (mm)</label>
            <input
              type="number"
              placeholder="Height (mm)"
              value={window.height}
              onChange={(e) => onUpdate(roomId, window.id, 'height', parseFloat(e.target.value) || 0)}
            />
          </div>
        </SurfaceItem>
      ))}
    </div>
  )
}