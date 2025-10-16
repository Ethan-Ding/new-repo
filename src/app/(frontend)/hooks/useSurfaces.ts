'use client'

/**
 * Custom hook for managing surfaces (walls, doors, windows, etc.)
 * Provides helper functions for adding, removing, updating surfaces within a room
 */

import { useCalculator } from '../contexts/CalculatorContext'
import { Wall, Door, Window, Trim, Floor, Ceiling } from '@/types/calculator'

export function useSurfaces(roomId: number) {
  const { updateRoom, rooms } = useCalculator()
  const room = rooms.find((r) => r.id === roomId)

  if (!room) {
    throw new Error(`Room with id ${roomId} not found`)
  }

  // ====== WALLS ======
  const addWall = () => {
    const newWall: Wall = { id: Date.now(), length: 4000, height: 2700 }
    updateRoom(roomId, 'walls', [...room.walls, newWall])
  }

  const updateWall = (wallId: number, field: keyof Wall, value: number) => {
    const updatedWalls = room.walls.map((wall) =>
      wall.id === wallId ? { ...wall, [field]: value } : wall,
    )
    updateRoom(roomId, 'walls', updatedWalls)
  }

  const removeWall = (wallId: number) => {
    if (room.walls.length <= 1) {
      alert('You must have at least one wall')
      return
    }
    const updatedWalls = room.walls.filter((wall) => wall.id !== wallId)
    updateRoom(roomId, 'walls', updatedWalls)
  }

  const duplicateWall = (wallId: number) => {
    const wallToDuplicate = room.walls.find((w) => w.id === wallId)
    if (wallToDuplicate) {
      const newWall: Wall = {
        id: Date.now(),
        length: wallToDuplicate.length,
        height: wallToDuplicate.height,
      }
      updateRoom(roomId, 'walls', [...room.walls, newWall])
    }
  }

  // ====== DOORS ======
  const addDoor = () => {
    const newDoor: Door = { id: Date.now(), width: 800, height: 2000 }
    updateRoom(roomId, 'doors', [...room.doors, newDoor])
  }

  const updateDoor = (doorId: number, field: keyof Door, value: number) => {
    const updatedDoors = room.doors.map((door) =>
      door.id === doorId ? { ...door, [field]: value } : door,
    )
    updateRoom(roomId, 'doors', updatedDoors)
  }

  const removeDoor = (doorId: number) => {
    const updatedDoors = room.doors.filter((door) => door.id !== doorId)
    updateRoom(roomId, 'doors', updatedDoors)
  }

  // ====== WINDOWS ======
  const addWindow = () => {
    const newWindow: Window = { id: Date.now(), width: 1200, height: 1000 }
    updateRoom(roomId, 'windows', [...room.windows, newWindow])
  }

  const updateWindow = (windowId: number, field: keyof Window, value: number) => {
    const updatedWindows = room.windows.map((window) =>
      window.id === windowId ? { ...window, [field]: value } : window,
    )
    updateRoom(roomId, 'windows', updatedWindows)
  }

  const removeWindow = (windowId: number) => {
    const updatedWindows = room.windows.filter((window) => window.id !== windowId)
    updateRoom(roomId, 'windows', updatedWindows)
  }

  // ====== TRIMS ======
  const addTrim = () => {
    const newTrim: Trim = { id: Date.now(), length: 4000, height: 100 }
    updateRoom(roomId, 'trims', [...room.trims, newTrim])
  }

  const updateTrim = (trimId: number, field: keyof Trim, value: number) => {
    const updatedTrims = room.trims.map((trim) =>
      trim.id === trimId ? { ...trim, [field]: value } : trim,
    )
    updateRoom(roomId, 'trims', updatedTrims)
  }

  const removeTrim = (trimId: number) => {
    const updatedTrims = room.trims.filter((trim) => trim.id !== trimId)
    updateRoom(roomId, 'trims', updatedTrims)
  }

  // ====== FLOORS ======
  const addFloor = () => {
    const newFloor: Floor = { id: Date.now(), length: 5000, width: 4000 }
    updateRoom(roomId, 'floors', [...room.floors, newFloor])
  }

  const updateFloor = (floorId: number, field: keyof Floor, value: number) => {
    const updatedFloors = room.floors.map((floor) =>
      floor.id === floorId ? { ...floor, [field]: value } : floor,
    )
    updateRoom(roomId, 'floors', updatedFloors)
  }

  const removeFloor = (floorId: number) => {
    if (room.floors.length <= 1) {
      alert('You must have at least one floor')
      return
    }
    const updatedFloors = room.floors.filter((floor) => floor.id !== floorId)
    updateRoom(roomId, 'floors', updatedFloors)
  }

  // ====== CEILINGS ======
  const addCeiling = () => {
    const newCeiling: Ceiling = { id: Date.now(), length: 5000, width: 4000 }
    updateRoom(roomId, 'ceilings', [...room.ceilings, newCeiling])
  }

  const updateCeiling = (ceilingId: number, field: keyof Ceiling, value: number) => {
    const updatedCeilings = room.ceilings.map((ceiling) =>
      ceiling.id === ceilingId ? { ...ceiling, [field]: value } : ceiling,
    )
    updateRoom(roomId, 'ceilings', updatedCeilings)
  }

  const removeCeiling = (ceilingId: number) => {
    if (room.ceilings.length <= 1) {
      alert('You must have at least one ceiling')
      return
    }
    const updatedCeilings = room.ceilings.filter((ceiling) => ceiling.id !== ceilingId)
    updateRoom(roomId, 'ceilings', updatedCeilings)
  }

  return {
    // Walls
    addWall,
    updateWall,
    removeWall,
    duplicateWall,

    // Doors
    addDoor,
    updateDoor,
    removeDoor,

    // Windows
    addWindow,
    updateWindow,
    removeWindow,

    // Trims
    addTrim,
    updateTrim,
    removeTrim,

    // Floors
    addFloor,
    updateFloor,
    removeFloor,

    // Ceilings
    addCeiling,
    updateCeiling,
    removeCeiling,
  }
}