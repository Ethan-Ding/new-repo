//dynamic room list for adding/deleting rooms
'use client'

import React from 'react'
import { useCalculator } from '../../contexts/CalculatorContext'
import AddRoomButton from './AddRoomButton'

export default function RoomList() {
  const { rooms, selectedRoomId, setSelectedRoomId, addRoom, removeRoom } = useCalculator()

  const deleteRoom = (id: number) => {
    removeRoom(id)
  }

  const handleAddRoom = () => {
    addRoom()
  }

  return (
    <div className="w-1/4 min-w-[200px] max-w-sm h-fit rounded-xl bg-gray-300 p-4">
      <h2 className="font-semibold text-lg text-center border-b border-gray-500 pb-1 mb-4">Rooms</h2>


      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
        {rooms.map((room) => (
          <div
            key={room.id}
            onClick={() => setSelectedRoomId(room.id)}
            className={`flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer ${
              selectedRoomId === room.id ? 'bg-blue-300' : 'bg-blue-100 hover:bg-blue-200'
            }`}
          >
            <span>{room.name}</span>
            {rooms.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`Remove "${room.name}"?`)) {
                    deleteRoom(room.id)
                  }
                }}
                className="text-red-600 hover:text-red-800 text-xl font-bold"
                title="Remove room"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-end">
        <AddRoomButton label="Add Room" onClick={handleAddRoom} />
      </div>
    </div>
  )
}
