'use client'

import React, { ReactNode } from 'react'
import { Copy, Trash } from 'lucide-react'

interface SurfaceItemProps {
  title: string
  onDuplicate?: () => void
  onRemove?: () => void
  canRemove?: boolean
  children: ReactNode
}

export default function SurfaceItem({
  title,
  onDuplicate,
  onRemove,
  canRemove = true,
  children,
}: SurfaceItemProps) {
  const handleRemove = () => {
    if (!canRemove) {
      alert('You must have at least one item')
      return
    }
    if (confirm(`Are you sure you want to remove this ${title.toLowerCase()}?`)) {
      onRemove?.()
    }
  }

  return (
    <div className="surface-item">
      <div className="surface-header">
        <span>{title}</span>
        <div className="surface-controls">
          {onDuplicate && (
            <button
              className="duplicate-btn"
              onClick={(e) => {
                e.stopPropagation()
                onDuplicate()
              }}
              title={`Duplicate ${title.toLowerCase()}`}
            >
              <Copy size={18} />
            </button>
          )}
          {onRemove && (
            <button
              className="remove-btn"
              onClick={(e) => {
                e.stopPropagation()
                handleRemove()
              }}
              title={`Remove ${title.toLowerCase()}`}
            >
              <Trash size={18} />
            </button>
          )}
        </div>
      </div>
      <div className="dimension-inputs">{children}</div>
    </div>
  )
}