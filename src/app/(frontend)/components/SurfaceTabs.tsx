'use client'

import React, { useState } from 'react'
import { Room, Wall, Door, Window, Trim, Floor, Ceiling, ReferenceData } from '@/types/calculator'
import WallsSection from './Surfaces/WallsSection'
import DoorsSection from './Surfaces/DoorsSection'
import WindowsSection from './Surfaces/WindowsSection'
import TrimsSection from './Surfaces/TrimsSection'
import FloorsSection from './Surfaces/FloorsSection'
import CeilingsSection from './Surfaces/CeilingsSection'

interface SurfaceTabsProps {
  room: Room
  referenceData?: ReferenceData
  onAddWall: (roomId: number) => void
  onUpdateWall: (roomId: number, wallId: number, field: keyof Wall, value: number) => void
  onDuplicateWall: (roomId: number, wallId: number) => void
  onRemoveWall: (roomId: number, wallId: number) => void

  onAddDoor: (roomId: number) => void
  onUpdateDoor: (roomId: number, doorId: number, field: keyof Door, value: number) => void
  onRemoveDoor: (roomId: number, doorId: number) => void

  onAddWindow: (roomId: number) => void
  onUpdateWindow: (roomId: number, windowId: number, field: keyof Window, value: number) => void
  onRemoveWindow: (roomId: number, windowId: number) => void

  onAddTrim: (roomId: number) => void
  onUpdateTrim: (roomId: number, trimId: number, field: keyof Trim, value: number) => void
  onRemoveTrim: (roomId: number, trimId: number) => void

  onAddFloor: (roomId: number) => void
  onUpdateFloor: (roomId: number, floorId: number, field: keyof Floor, value: number) => void
  onRemoveFloor: (roomId: number, floorId: number) => void

  onAddCeiling: (roomId: number) => void
  onUpdateCeiling: (roomId: number, ceilingId: number, field: keyof Ceiling, value: number) => void
  onRemoveCeiling: (roomId: number, ceilingId: number) => void
}

export default function SurfaceTabs({
  room,
  referenceData,
  onAddWall,
  onUpdateWall,
  onDuplicateWall,
  onRemoveWall,
  onAddDoor,
  onUpdateDoor,
  onRemoveDoor,
  onAddWindow,
  onUpdateWindow,
  onRemoveWindow,
  onAddTrim,
  onUpdateTrim,
  onRemoveTrim,
  onAddFloor,
  onUpdateFloor,
  onRemoveFloor,
  onAddCeiling,
  onUpdateCeiling,
  onRemoveCeiling,
}: SurfaceTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('all')

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'walls', label: 'Walls' },
    { id: 'trims', label: 'Trims' },
    { id: 'doors', label: 'Doors' },
    { id: 'windows', label: 'Windows' },
    { id: 'floors', label: 'Floors' },
    { id: 'ceilings', label: 'Ceilings' },
  ]

  return (
    <div>
      {/* Tab Buttons */}
      <div className="btn-group" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`btn tab-btn ${activeTab === tab.id ? 'btn-primary' : 'btn-outline-primary'} me-2 rounded-pill`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-3">
        {activeTab === 'all' && (
          <div>
            <WallsSection
              walls={room.walls}
              roomId={room.id}
              referenceData={referenceData}
              onAdd={onAddWall}
              onUpdate={onUpdateWall}
              onDuplicate={onDuplicateWall}
              onRemove={onRemoveWall}
            />
            <TrimsSection
              trims={room.trims}
              roomId={room.id}
              referenceData={referenceData}
              onAdd={onAddTrim}
              onUpdate={onUpdateTrim}
              onRemove={onRemoveTrim}
            />
            <DoorsSection
              doors={room.doors}
              roomId={room.id}
              onAdd={onAddDoor}
              onUpdate={onUpdateDoor}
              onRemove={onRemoveDoor}
            />
            <WindowsSection
              windows={room.windows}
              roomId={room.id}
              onAdd={onAddWindow}
              onUpdate={onUpdateWindow}
              onRemove={onRemoveWindow}
            />
            <FloorsSection
              floors={room.floors}
              roomId={room.id}
              referenceData={referenceData}
              onAdd={onAddFloor}
              onUpdate={onUpdateFloor}
              onRemove={onRemoveFloor}
            />
            <CeilingsSection
              ceilings={room.ceilings}
              roomId={room.id}
              referenceData={referenceData}
              onAdd={onAddCeiling}
              onUpdate={onUpdateCeiling}
              onRemove={onRemoveCeiling}
            />
          </div>
        )}
        {activeTab === 'walls' && (
          <WallsSection
            walls={room.walls}
            roomId={room.id}
            referenceData={referenceData}
            onAdd={onAddWall}
            onUpdate={onUpdateWall}
            onDuplicate={onDuplicateWall}
            onRemove={onRemoveWall}
          />
        )}
        {activeTab === 'trims' && (
          <TrimsSection
            trims={room.trims}
            roomId={room.id}
            referenceData={referenceData}
            onAdd={onAddTrim}
            onUpdate={onUpdateTrim}
            onRemove={onRemoveTrim}
          />
        )}
        {activeTab === 'doors' && (
          <DoorsSection
            doors={room.doors}
            roomId={room.id}
            onAdd={onAddDoor}
            onUpdate={onUpdateDoor}
            onRemove={onRemoveDoor}
          />
        )}
        {activeTab === 'windows' && (
          <WindowsSection
            windows={room.windows}
            roomId={room.id}
            onAdd={onAddWindow}
            onUpdate={onUpdateWindow}
            onRemove={onRemoveWindow}
          />
        )}
        {activeTab === 'floors' && (
          <FloorsSection
            floors={room.floors}
            roomId={room.id}
            referenceData={referenceData}
            onAdd={onAddFloor}
            onUpdate={onUpdateFloor}
            onRemove={onRemoveFloor}
          />
        )}
        {activeTab === 'ceilings' && (
          <CeilingsSection
            ceilings={room.ceilings}
            roomId={room.id}
            referenceData={referenceData}
            onAdd={onAddCeiling}
            onUpdate={onUpdateCeiling}
            onRemove={onRemoveCeiling}
          />
        )}
      </div>
    </div>
  )
}