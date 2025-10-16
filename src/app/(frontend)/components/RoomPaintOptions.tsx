'use client'

import React from 'react'
import { useCalculator } from '../contexts/CalculatorContext'

export default function RoomPaintOptions() {
  const { currentRoom, updateRoom, referenceData, defaultIds } = useCalculator()

  if (!currentRoom || !referenceData || !defaultIds) {
    return null
  }

  // Get current room's paint/surface selections (stored in room state)
  const currentPaintTypeId = currentRoom.paintTypeId ?? defaultIds.wall.paintTypeId
  const currentSurfaceTypeId = currentRoom.surfaceTypeId ?? defaultIds.wall.surfaceTypeId
  const currentPaintQualityId = currentRoom.paintQualityId ?? defaultIds.wall.paintQualityId
  const currentSurfaceConditionId =
    currentRoom.surfaceConditionId ?? defaultIds.wall.surfaceConditionId

  const paintFinishOptions = [
    { value: 'flat', label: 'Flat' },
    { value: 'eggshell', label: 'Eggshell' },
    { value: 'satin', label: 'Satin' },
    { value: 'semi-gloss', label: 'Semi-Gloss' },
    { value: 'gloss', label: 'Gloss' },
  ]

  const paintColourOptions = [
    { value: 'white', label: 'White' },
    { value: 'off-white', label: 'Off-White' },
    { value: 'beige', label: 'Beige' },
    { value: 'grey', label: 'Grey' },
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'red', label: 'Red' },
    { value: 'custom', label: 'Custom' },
  ]

  return (
    <div className="room-defaults">
      <h4>Paint & Surface Options for {currentRoom.name}</h4>

      <div className="form-row triple">
        <div className="form-group">
          <label>Paint Type:</label>
          <select
            value={currentPaintTypeId ?? ''}
            onChange={(e) => updateRoom(currentRoom.id, 'paintTypeId', Number(e.target.value))}
          >
            {referenceData.paintTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Surface Type:</label>
          <select
            value={currentSurfaceTypeId ?? ''}
            onChange={(e) => updateRoom(currentRoom.id, 'surfaceTypeId', Number(e.target.value))}
          >
            {referenceData.surfaceTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name} ({type.category})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Paint Quality:</label>
          <select
            value={currentPaintQualityId ?? ''}
            onChange={(e) => updateRoom(currentRoom.id, 'paintQualityId', Number(e.target.value))}
          >
            {referenceData.paintQualities.map((quality) => (
              <option key={quality.id} value={quality.id}>
                {quality.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row triple">
        <div className="form-group">
          <label>Surface Condition:</label>
          <select
            value={currentSurfaceConditionId ?? ''}
            onChange={(e) =>
              updateRoom(currentRoom.id, 'surfaceConditionId', Number(e.target.value))
            }
          >
            {referenceData.surfaceConditions.map((condition) => (
              <option key={condition.id} value={condition.id}>
                {condition.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Paint Finish:</label>
          <select
            value={currentRoom.paintFinish}
            onChange={(e) => updateRoom(currentRoom.id, 'paintFinish', e.target.value)}
          >
            {paintFinishOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Paint Colour:</label>
          <select
            value={currentRoom.paintColour}
            onChange={(e) => updateRoom(currentRoom.id, 'paintColour', e.target.value)}
          >
            {paintColourOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}