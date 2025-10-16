'use client'

/**
 * Calculator Context
 * Provides state management for the painting calculator
 * Handles rooms, API calls, reference data, and cost estimates
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  Room,
  ReferenceData,
  CalculatorDefaults,
  CalculatorEstimate,
  Wall,
  Door,
  Window,
  Trim,
  Floor,
  Ceiling,
} from '@/types/calculator'
import {
  fetchReferenceData,
  calculateProjectCost,
  toApiSurfaces,
  findDefaultIds,
} from '../lib/apiClient'

interface CalculatorContextType {
  // State
  rooms: Room[]
  selectedRoomId: number
  referenceData: ReferenceData | null
  defaultIds: CalculatorDefaults | null
  estimate: CalculatorEstimate | null
  loading: boolean
  error: string

  // Room Actions
  setRooms: (rooms: Room[]) => void
  setSelectedRoomId: (id: number) => void
  addRoom: () => void
  updateRoom: (roomId: number, field: keyof Room, value: any) => void
  removeRoom: (roomId: number) => void
  duplicateRoom: (roomId: number) => void
  renameRoom: (roomId: number, newName: string) => void

  // Surface Actions
  addWall: (roomId: number) => void
  updateWall: (roomId: number, wallId: number, field: keyof Wall, value: number) => void
  duplicateWall: (roomId: number, wallId: number) => void
  removeWall: (roomId: number, wallId: number) => void

  addDoor: (roomId: number) => void
  updateDoor: (roomId: number, doorId: number, field: keyof Door, value: number) => void
  removeDoor: (roomId: number, doorId: number) => void

  addWindow: (roomId: number) => void
  updateWindow: (roomId: number, windowId: number, field: keyof Window, value: number) => void
  removeWindow: (roomId: number, windowId: number) => void

  addTrim: (roomId: number) => void
  updateTrim: (roomId: number, trimId: number, field: keyof Trim, value: number) => void
  removeTrim: (roomId: number, trimId: number) => void

  addFloor: (roomId: number) => void
  updateFloor: (roomId: number, floorId: number, field: keyof Floor, value: number) => void
  removeFloor: (roomId: number, floorId: number) => void

  addCeiling: (roomId: number) => void
  updateCeiling: (roomId: number, ceilingId: number, field: keyof Ceiling, value: number) => void
  removeCeiling: (roomId: number, ceilingId: number) => void

  // Selected Room Helper
  currentRoom: Room | undefined
}

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined)

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: 1,
      name: 'Room 1',
      paintQuality: 'standard',
      paintQualityCost: '',
      paintFinish: 'flat',
      paintFinishCost: '0',
      paintFinishCostManual: '',
      paintColour: 'white',
      paintColourCost: '0',
      paintColourCostManual: '',
      doors: [],
      windows: [],
      walls: [{ id: 1, length: 4000, height: 2700, doorCount: 0, windowCount: 0 }],
      trims: [],
      floors: [{ id: 1, length: 5000, width: 4000 }],
      ceilings: [{ id: 1, length: 5000, width: 4000 }],
    },
  ])

  const [selectedRoomId, setSelectedRoomId] = useState<number>(1)
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null)
  const [defaultIds, setDefaultIds] = useState<CalculatorDefaults | null>(null)
  const [estimate, setEstimate] = useState<CalculatorEstimate | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  // Fetch reference data on mount
  useEffect(() => {
    ;(async () => {
      try {
        const data = await fetchReferenceData()
        setReferenceData(data)

        // Calculate default IDs
        const defaults = findDefaultIds(data)
        setDefaultIds(defaults)

        console.log('Reference data loaded:', data)
        console.log('Default IDs:', JSON.stringify(defaults, null, 2))
      } catch (err) {
        console.error('Failed to fetch reference data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load reference data')
      }
    })()
  }, [])

  // Calculate project cost when rooms or defaults change
  useEffect(() => {
    const debounceMs = 400
    setLoading(true)
    setError('')

    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      try {
        if (!defaultIds || !referenceData) {
          setLoading(false)
          return
        }

        // Convert rooms to API surfaces
        const surfaces = toApiSurfaces(rooms, defaultIds)
        console.log('Surfaces to calculate:', JSON.stringify(surfaces, null, 2))

        // If no surfaces have complete paint options, set estimate to zero
        if (surfaces.length === 0) {
          setEstimate({
            projectCosts: undefined,
            projectTotal: 0,
          })
          setLoading(false)
          return
        }

        // Get first labor rate ID
        const laborRateId = referenceData.laborRates?.[0]?.id

        // Call project cost API
        const response = await calculateProjectCost(surfaces, {
          laborRateId,
          signal: controller.signal,
        })

        console.log('Project cost response:', response)

        // Extract grand total
        const projectTotal = response.projectCosts?.totals?.grandTotal ?? 0

        setEstimate({
          projectCosts: response.projectCosts,
          projectTotal,
        })
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Failed to calculate cost:', err)
          setError(err.message || 'Failed to calculate estimate')
        }
      } finally {
        setLoading(false)
      }
    }, debounceMs)

    // Cleanup
    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [rooms, defaultIds, referenceData])

  // Room Actions
  const addRoom = () => {
    const newRoom: Room = {
      id: Date.now(),
      name: `Room ${rooms.length + 1}`,
      paintQuality: 'standard',
      paintQualityCost: '',
      paintFinish: 'flat',
      paintFinishCost: '0',
      paintFinishCostManual: '',
      paintColour: 'white',
      paintColourCost: '0',
      paintColourCostManual: '',
      doors: [],
      windows: [],
      walls: [{ id: Date.now() + 1, length: 4000, height: 2700, doorCount: 0, windowCount: 0 }],
      trims: [],
      floors: [{ id: Date.now() + 5, length: 5000, width: 4000 }],
      ceilings: [{ id: Date.now() + 6, length: 5000, width: 4000 }],
    }
    setRooms([...rooms, newRoom])
    setSelectedRoomId(newRoom.id)
  }

  const updateRoom = (roomId: number, field: keyof Room, value: any) => {
    setRooms(
      rooms.map((room) => {
        if (room.id === roomId) {
          return { ...room, [field]: value }
        }
        return room
      }),
    )
  }

  const removeRoom = (roomId: number) => {
    if (rooms.length <= 1) {
      alert('You must have at least one room')
      return
    }

    const updatedRooms = rooms.filter((room) => room.id !== roomId)
    setRooms(updatedRooms)

    // If the removed room was selected, select the first remaining room
    if (selectedRoomId === roomId) {
      setSelectedRoomId(updatedRooms[0].id)
    }
  }

  const duplicateRoom = (roomId: number) => {
    const roomToDuplicate = rooms.find((r) => r.id === roomId)
    if (!roomToDuplicate) return

    const newRoom: Room = {
      ...roomToDuplicate,
      id: Date.now(),
      name: `${roomToDuplicate.name} (Copy)`,
      doors: roomToDuplicate.doors.map((door) => ({
        ...door,
        id: Date.now() + Math.random(),
      })),
      windows: roomToDuplicate.windows.map((window) => ({
        ...window,
        id: Date.now() + Math.random(),
      })),
      walls: roomToDuplicate.walls.map((wall) => ({
        ...wall,
        id: Date.now() + Math.random(),
      })),
      trims: roomToDuplicate.trims.map((trim) => ({
        ...trim,
        id: Date.now() + Math.random(),
      })),
      floors: roomToDuplicate.floors.map((floor) => ({
        ...floor,
        id: Date.now() + Math.random(),
      })),
      ceilings: roomToDuplicate.ceilings.map((ceiling) => ({
        ...ceiling,
        id: Date.now() + Math.random(),
      })),
    }

    setRooms([...rooms, newRoom])
  }

  const renameRoom = (roomId: number, newName: string) => {
    if (!newName.trim()) {
      alert('Room name cannot be empty')
      return
    }
    updateRoom(roomId, 'name', newName.trim())
  }

  // Surface Actions - Walls
  const addWall = (roomId: number) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return
    const newWall: Wall = { id: Date.now(), length: 4000, height: 2700, doorCount: 0, windowCount: 0 }
    updateRoom(roomId, 'walls', [...room.walls, newWall])
  }

  const updateWall = (roomId: number, wallId: number, field: keyof Wall, value: number) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return
    const updatedWalls = room.walls.map((wall) =>
      wall.id === wallId ? { ...wall, [field]: value } : wall,
    )
    updateRoom(roomId, 'walls', updatedWalls)
  }

  const duplicateWall = (roomId: number, wallId: number) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return
    const wallToDuplicate = room.walls.find((w) => w.id === wallId)
    if (!wallToDuplicate) return
    const newWall: Wall = {
      id: Date.now(),
      length: wallToDuplicate.length,
      height: wallToDuplicate.height,
      doorCount: wallToDuplicate.doorCount || 0,
      windowCount: wallToDuplicate.windowCount || 0,
    }
    updateRoom(roomId, 'walls', [...room.walls, newWall])
  }

  const removeWall = (roomId: number, wallId: number) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return
    const updatedWalls = room.walls.filter((wall) => wall.id !== wallId)
    updateRoom(roomId, 'walls', updatedWalls)
  }

  // Surface Actions - Doors
  const addDoor = (roomId: number) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return
    const newDoor: Door = { id: Date.now(), width: 800, height: 2000 }
    updateRoom(roomId, 'doors', [...room.doors, newDoor])
  }

  const updateDoor = (roomId: number, doorId: number, field: keyof Door, value: number) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return
    const updatedDoors = room.doors.map((door) =>
      door.id === doorId ? { ...door, [field]: value } : door,
    )
    updateRoom(roomId, 'doors', updatedDoors)
  }

  const removeDoor = (roomId: number, doorId: number) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return
    updateRoom(
      roomId,
      'doors',
      room.doors.filter((door) => door.id !== doorId),
    )
  }

  // Surface Actions - Windows
  const addWindow = (roomId: number) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return
    const newWindow: Window = { id: Date.now(), width: 1200, height: 1000 }
    updateRoom(roomId, 'windows', [...room.windows, newWindow])
  }

  const updateWindow = (roomId: number, windowId: number, field: keyof Window, value: number) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return
    const updatedWindows = room.windows.map((window) =>
      window.id === windowId ? { ...window, [field]: value } : window,
    )
    updateRoom(roomId, 'windows', updatedWindows)
  }

  const removeWindow = (roomId: number, windowId: number) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return
    updateRoom(
      roomId,
      'windows',
      room.windows.filter((window) => window.id !== windowId),
    )
  }

  // Surface Actions - Trims
  const addTrim = (roomId: number) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return
    const newTrim: Trim = { id: Date.now(), length: 4000, height: 100 }
    updateRoom(roomId, 'trims', [...room.trims, newTrim])
  }

  const updateTrim = (roomId: number, trimId: number, field: keyof Trim, value: number) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return
    const updatedTrims = room.trims.map((trim) =>
      trim.id === trimId ? { ...trim, [field]: value } : trim,
    )
    updateRoom(roomId, 'trims', updatedTrims)
  }

  const removeTrim = (roomId: number, trimId: number) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return
    updateRoom(
      roomId,
      'trims',
      room.trims.filter((trim) => trim.id !== trimId),
    )
  }

  // Surface Actions - Floors
  const addFloor = (roomId: number) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return
    const newFloor: Floor = { id: Date.now(), length: 5000, width: 4000 }
    updateRoom(roomId, 'floors', [...room.floors, newFloor])
  }

  const updateFloor = (roomId: number, floorId: number, field: keyof Floor, value: number) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return
    const updatedFloors = room.floors.map((floor) =>
      floor.id === floorId ? { ...floor, [field]: value } : floor,
    )
    updateRoom(roomId, 'floors', updatedFloors)
  }

  const removeFloor = (roomId: number, floorId: number) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return
    updateRoom(
      roomId,
      'floors',
      room.floors.filter((floor) => floor.id !== floorId),
    )
  }

  // Surface Actions - Ceilings
  const addCeiling = (roomId: number) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return
    const newCeiling: Ceiling = { id: Date.now(), length: 5000, width: 4000 }
    updateRoom(roomId, 'ceilings', [...room.ceilings, newCeiling])
  }

  const updateCeiling = (
    roomId: number,
    ceilingId: number,
    field: keyof Ceiling,
    value: number,
  ) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return
    const updatedCeilings = room.ceilings.map((ceiling) =>
      ceiling.id === ceilingId ? { ...ceiling, [field]: value } : ceiling,
    )
    updateRoom(roomId, 'ceilings', updatedCeilings)
  }

  const removeCeiling = (roomId: number, ceilingId: number) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return
    updateRoom(
      roomId,
      'ceilings',
      room.ceilings.filter((ceiling) => ceiling.id !== ceilingId),
    )
  }

  // Helper to get current room
  const currentRoom = rooms.find((r) => r.id === selectedRoomId)

  const value: CalculatorContextType = {
    rooms,
    selectedRoomId,
    referenceData,
    defaultIds,
    estimate,
    loading,
    error,
    setRooms,
    setSelectedRoomId,
    addRoom,
    updateRoom,
    removeRoom,
    duplicateRoom,
    renameRoom,
    addWall,
    updateWall,
    duplicateWall,
    removeWall,
    addDoor,
    updateDoor,
    removeDoor,
    addWindow,
    updateWindow,
    removeWindow,
    addTrim,
    updateTrim,
    removeTrim,
    addFloor,
    updateFloor,
    removeFloor,
    addCeiling,
    updateCeiling,
    removeCeiling,
    currentRoom,
  }

  return <CalculatorContext.Provider value={value}>{children}</CalculatorContext.Provider>
}

/**
 * Hook to use the Calculator Context
 * Must be used within a CalculatorProvider
 */
export function useCalculator() {
  const context = useContext(CalculatorContext)
  if (context === undefined) {
    throw new Error('useCalculator must be used within a CalculatorProvider')
  }
  return context
}