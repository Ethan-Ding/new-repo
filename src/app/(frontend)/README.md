# Frontend Calculator - Integration Guide

## Overview

This directory contains the refactored painting calculator with proper TypeScript types and API integration.

## Structure

```
(frontend)/
├── api-test/                 # Test page for API integration
│   └── page.tsx
├── contexts/                 # React Context for state management
│   └── CalculatorContext.tsx
├── hooks/                    # Custom React hooks
│   └── useSurfaces.ts
├── lib/                      # API client and utilities
│   └── apiClient.ts
└── components/               # UI components (to be migrated)
    ├── Calculator.tsx        # Main calculator component (Person 2)
    ├── MobileUI.tsx         # Mobile UI (Person 3)
    └── PDFReportGenerator.tsx # PDF generation (Person 3)
```

## What's Been Completed (Person 1)

### ✅ Type Definitions (`/src/types/calculator.ts`)
- `Room` - Frontend room structure with walls, doors, windows, etc.
- `APISurface` - API surface format for backend
- `ProjectCostRequest` / `ProjectCostResponse` - API request/response types
- `ReferenceData` - Paint types, qualities, conditions, labor rates
- `CalculatorDefaults` - Default IDs for wall/ceiling surfaces

### ✅ API Client (`lib/apiClient.ts`)
- `fetchReferenceData()` - GET /api/calculate/reference-data
- `calculateProjectCost()` - POST /api/calculate/project-cost
- `toApiSurfaces()` - Converts Room[] to APISurface[]
- `findDefaultIds()` - Extracts default IDs from reference data

### ✅ State Management (`contexts/CalculatorContext.tsx`)
Provides global state for the calculator:
- `rooms` - Array of rooms
- `selectedRoomId` - Currently selected room
- `referenceData` - Paint types, qualities, etc. from API
- `defaultIds` - Default paint/surface IDs for walls & ceilings
- `estimate` - Cost estimate from API
- `loading` / `error` - API state

Actions:
- `addRoom()` / `removeRoom()` / `duplicateRoom()` / `renameRoom()`
- `updateRoom(roomId, field, value)` - Update any room field

### ✅ Surface Management Hook (`hooks/useSurfaces.ts`)
Helper functions for managing surfaces within a room:
- Walls: `addWall`, `updateWall`, `removeWall`, `duplicateWall`
- Doors: `addDoor`, `updateDoor`, `removeDoor`
- Windows: `addWindow`, `updateWindow`, `removeWindow`
- Trims: `addTrim`, `updateTrim`, `removeTrim`
- Floors: `addFloor`, `updateFloor`, `removeFloor`
- Ceilings: `addCeiling`, `updateCeiling`, `removeCeiling`

## Testing

### Run the API Test Page
```bash
npm run dev
```
Then visit: `http://localhost:3000/api-test`

This page will show:
- ✅ Reference data loading status
- ✅ Default IDs
- ✅ Current rooms
- ✅ Real-time cost estimates from API
- ✅ Surface breakdown

## For Person 2: Calculator UI

### Your Tasks
Migrate the calculator UI from `/demo/App.jsx` to `components/Calculator.tsx`

### How to Use the Context

```tsx
'use client'

import { useCalculator } from '../contexts/CalculatorContext'
import { useSurfaces } from '../hooks/useSurfaces'

export default function Calculator() {
  const {
    rooms,
    selectedRoomId,
    currentRoom,
    estimate,
    loading,
    error,
    addRoom,
    removeRoom,
    setSelectedRoomId,
  } = useCalculator()

  // Get surface management functions for current room
  const {
    addWall,
    updateWall,
    removeWall,
    addDoor,
    updateDoor,
    removeDoor,
    // ... etc
  } = useSurfaces(selectedRoomId)

  return (
    <div>
      {/* Room tabs */}
      {rooms.map(room => (
        <button key={room.id} onClick={() => setSelectedRoomId(room.id)}>
          {room.name}
        </button>
      ))}

      {/* Current room details */}
      {currentRoom && (
        <div>
          <h2>{currentRoom.name}</h2>

          {/* Walls */}
          {currentRoom.walls.map(wall => (
            <div key={wall.id}>
              <input
                type="number"
                value={wall.length}
                onChange={(e) => updateWall(wall.id, 'length', parseFloat(e.target.value))}
              />
              <input
                type="number"
                value={wall.height}
                onChange={(e) => updateWall(wall.id, 'height', parseFloat(e.target.value))}
              />
              <button onClick={() => removeWall(wall.id)}>Remove</button>
            </div>
          ))}
          <button onClick={addWall}>Add Wall</button>
        </div>
      )}

      {/* Cost estimate */}
      {loading && <p>Calculating...</p>}
      {estimate && (
        <h2>Total: ${estimate.projectTotal.toFixed(2)}</h2>
      )}
    </div>
  )
}
```

### Wrap Your Component in Provider

In your main page:
```tsx
import { CalculatorProvider } from './contexts/CalculatorContext'
import Calculator from './components/Calculator'

export default function Page() {
  return (
    <CalculatorProvider>
      <Calculator />
    </CalculatorProvider>
  )
}
```

### Available Data from Context

```typescript
// State
rooms: Room[]                      // All rooms
selectedRoomId: number            // Current room ID
currentRoom: Room | undefined     // Current room object
referenceData: ReferenceData      // Paint types, qualities, etc.
defaultIds: CalculatorDefaults    // Default IDs for API
estimate: CalculatorEstimate      // Cost estimate from API
loading: boolean                  // API loading state
error: string                     // Error message

// Actions
addRoom()
removeRoom(roomId)
duplicateRoom(roomId)
renameRoom(roomId, newName)
updateRoom(roomId, field, value)
setSelectedRoomId(id)
```

## For Person 3: Mobile UI & PDF

### Your Tasks
1. Migrate `mobileUI.jsx` → `components/MobileUI.tsx`
2. Migrate `PDFReportGenerator.jsx` → `components/PDFReportGenerator.tsx`

### How to Use the Context

```tsx
'use client'

import { useCalculator } from '../contexts/CalculatorContext'

export default function MobileUI() {
  const { rooms, estimate, loading } = useCalculator()

  return (
    <div className="mobile-ui">
      {/* Your mobile UI here */}
      <h3>Total: ${estimate?.projectTotal.toFixed(2)}</h3>
    </div>
  )
}
```

### PDF Generation

```tsx
import { useCalculator } from '../contexts/CalculatorContext'

export function PDFReportGenerator() {
  const { rooms, estimate } = useCalculator()

  const generatePDF = () => {
    // Use your existing jsPDF logic
    // Data is available from context
    const total = estimate?.projectTotal ?? 0
    // ... generate PDF
  }

  return <button onClick={generatePDF}>Generate PDF</button>
}
```

## Important Notes

### API Integration
- All API calls are automatic via the context
- When rooms change, cost recalculates automatically (400ms debounce)
- No need to manually call APIs in your components

### Type Safety
- All types are defined in `/src/types/calculator.ts`
- Import types as needed: `import { Room, Wall } from '@/types/calculator'`

### Error Handling
- Check `loading` state before showing estimates
- Display `error` state if API fails
- Context handles all error states

### Dimensions
- All dimensions in the Room interface are in **millimeters (mm)**
- API client converts mm² to m² automatically in `toApiSurfaces()`

### Testing
- Use `/api-test` page to verify API integration
- Use `/calculator` page for testing existing functions (as requested)
- Use `/demo` as reference (will be deleted after migration)

## Questions?

Contact Person 1 (who built the APIs and this integration layer) for:
- API issues
- Type definition questions
- State management questions
- Context usage help