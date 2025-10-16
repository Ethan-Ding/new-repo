import React, { useState } from 'react';
import './App.css';
import { generatePaintingCostReport } from './PDFReportGenerator';

export default function MobileUI({ rooms,
                                   selectedRoom,
                                   setSelectedRoom,
                                   addRoom,
                                   renameRoom,
                                   duplicateRoom,
                                   removeRoom,
                                   totalCost,
                                   generatePDFReport
                                   ,}) {
  const [open, setOpen] = useState(false);
  {/* change class when room tab is open */}
  let overlayClass = 'mobile-room-tab-overlay';
  if (open) overlayClass += ' open';
  let panelClass = 'mobile-room-tab';
  if (open) panelClass += ' open';

  return (
    <> {/* Room tab buttons */}
      <div className={overlayClass} onClick={function () { setOpen(false); }} />
      <aside className={panelClass}>
        <div className="mobile-room-tab-header">
          <h3>Rooms</h3>
          <button className="btn btn-secondary" onClick={function () { setOpen(false); }}>Close</button>
        </div>
        <div className="mobile-room-tab-button">
          <button className="btn btn-primary" onClick={function () { addRoom(); }}>+ Add Room</button>
        </div>
        {/* room list display in order */}
        <div className="rooms-list">
          {rooms.map(room => (
            <div key={room.id} className="room-tab-container">
              <button
                className={`room-tab ${selectedRoom === room.id ? 'active' : ''}`}
                onClick={() => setSelectedRoom(room.id)}
              >
                {room.name}
              </button>
              <div className="room-controls">
                <button
                  className="room-control-btn rename-btn"
                  onClick={() => {
                    const newName = prompt('Enter new room name:', room.name);
                    if (newName !== null) {
                      renameRoom(room.id, newName);
                    }
                  }}
                  title="Rename room"
                >
                  ✏️
                </button>
                <button
                  className="room-control-btn duplicate-btn"
                  onClick={() => duplicateRoom(room.id)}
                  title="Duplicate room"
                >
                  📋
                </button>
                <button
                  className="room-control-btn remove-btn"
                  onClick={() => {
                    if (confirm(`Are you sure you want to remove "${room.name}"?`)) {
                      removeRoom(room.id);
                    }
                  }}
                  title="Remove room"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Display room, pdf button and total project cost */}
      <div className="mobile-bar">
        <div className="cost-secondary">{'Total Project Cost: $' + totalCost.toFixed(2)}</div>
        <div className="mobile-bar-button">
          <button className="btn btn-secondary" onClick={function () { setOpen(true); }}>Rooms</button>
          <button className="btn btn-primary" onClick={generatePDFReport}>Generate PDF</button>
        </div>
      </div>

    </>
  );
}