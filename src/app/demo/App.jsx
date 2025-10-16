import React, { useState, useEffect } from 'react';
import './App.css';
import { generatePaintingCostReport } from './PDFReportGenerator';

import { Copy, Trash, Edit, Download } from "lucide-react";

import MobileUI from './mobileUI';

import { toSurfaces, fetchPaints, postProjectCost } from './apiClient';

function App() {
  // Boolean check when the screen height is bigger than width to change to phone ui
  const [isMobile, setIsMobile] = useState(false);
  useEffect(function () {
    if (typeof window === "undefined") return;

    function onResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsMobile(h > w * 1.1);
    }
    onResize();
    window.addEventListener("resize", onResize);
    return function () {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const [rooms, setRooms] = useState([
    {
      id: 1,
      name: 'Living Room',
      paintQuality: 'standard',
      paintQualityCost: '', // Manual override for quality cost
      paintFinish: 'eggshell',
      paintFinishCost: '0.00005', // $0.00005/mm²
      paintFinishCostManual: '', // Manual override for finish cost
      paintColour: 'white',
      paintColourCost: '0.00002', // $0.00002/mm²
      paintColourCostManual: '', // Manual override for colour cost
      doors: [{ id: 1, width: 800, height: 2000 }],
      windows: [{ id: 1, width: 1200, height: 1000 }, { id: 2, width: 1200, height: 1000 }],
      walls: [
        { id: 1, length: 4000, height: 2700 }, // 4m x 2.7m wall
        { id: 2, length: 5000, height: 2700 }, // 5m x 2.7m wall
        { id: 3, length: 4000, height: 2700 }, // 4m x 2.7m wall
        { id: 4, length: 5000, height: 2700 }  // 5m x 2.7m wall
      ],
      trims: [
        { id: 1, length: 4000, height: 100 }, // 4m length, 100mm height trim
        { id: 2, length: 5000, height: 100 }  // 5m length, 100mm height trim
      ],
      floors: [
        { id: 1, length: 5000, width: 4000 } // 5m x 4m floor
      ],
      ceilings: [
        { id: 1, length: 5000, width: 4000 } // 5m x 4m ceiling
      ]
    }
  ]);

  const [selectedRoom, setSelectedRoom] = useState(1);
  const [showDimensions, setShowDimensions] = useState(false);
  const [paints, setPaints] = useState([]);
  const [estimate, setEstimate] = useState(null);
  const [defaultIds, setDefaultIds] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  //useEffect handlers runs once when the component loads
  useEffect(() => {
  (async () => {
    try {
      const p = await fetchPaints(); //calls /api/paints
      const data = p?.paints ?? {};
      setPaints(data);
      console.log("Using Payload API:", process.env.NEXT_PUBLIC_PAYLOAD_API);
      console.log('PAINTS PAYLOAD →', data);

      const norm = s => (typeof s === 'string' ? s.trim().toLowerCase() : '');
      const findId = (arr, target) =>
        arr?.find(x =>
          [x.level, x.name, x.key, x.code]
            .some(v => norm(v) === norm(target))
        )?.id ?? null;

      const defaults = {
        wall: {
          paintTypeId:        findId(data.types,        'interior acrylic'),
          surfaceTypeId:      findId(data.surfaceTypes, 'wall plaster'),
          paintQualityId:     findId(data.qualities,    'standard'),
          surfaceConditionId: findId(data.conditions,   'fair'),
          surfaceCategory:    'wall',
        },
        ceiling: {
          paintTypeId:        findId(data.types,        'interior ceiling'),
          surfaceTypeId:      findId(data.surfaceTypes, 'ceiling plaster'),
          paintQualityId:     findId(data.qualities,    'standard'),
          surfaceConditionId: findId(data.conditions,   'fair'),
          surfaceCategory:    'ceiling',
        },
      };
      
      setDefaultIds(defaults);      
      console.log('DEFAULT IDS →', defaults);          
    } catch (err) {
      console.error('Failed to fetch paints:', err);
    }
  })();
}, []);

  //dynamic room cost calculation
  useEffect(() => {
    const debounceMs = 400;
    setLoading(true);
    setErr('');

    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        if (!defaultIds) { setLoading(false); return; } //wait for IDs
        const surfaces = toSurfaces(rooms, defaultIds); //break rooms into surfaces, pass defaults
        console.log('SURFACES →', JSON.stringify(surfaces, null, 2));
        const laborRateId = Number(paints?.laborRates?.[0]?.id) || undefined;
        console.log('laborRateId →', laborRateId, paints?.laborRates?.[0]);
        const data = await postProjectCost(surfaces, { laborRateId, signal: controller.signal });
        console.log('project-cost response →', data); //confirms shape

        //creating a function named getProjectTotal
        const getProjectTotal = (pc) =>
          pc?.totals?.grandTotal ??
          0; //if no grandTotal, return 0

        setEstimate({
          ...data,
          projectTotal: getProjectTotal(data?.projectCosts),
        });

      } catch (e) {
        if (e.name !== 'AbortError') setErr(e.message || 'Failed to get estimate');
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    // cleanup if rooms change again before timeout/fetch finishes
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [rooms, defaultIds, paints]);


  const paintOptions = {
    quality: [
      { value: 'basic', label: 'Basic ($0.00027/mm²)', price: 0.00027 },
      { value: 'standard', label: 'Standard ($0.00038/mm²)', price: 0.00038 },
      { value: 'premium', label: 'Premium ($0.00054/mm²)', price: 0.00054 }
    ],
    finish: [
      { value: 'flat', label: 'Flat (No additional cost)', cost: 0 },
      { value: 'eggshell', label: 'Eggshell (+$0.00005/mm²)', cost: 0.00005 },
      { value: 'satin', label: 'Satin (+$0.00008/mm²)', cost: 0.00008 },
      { value: 'semi-gloss', label: 'Semi-Gloss (+$0.00010/mm²)', cost: 0.00010 },
      { value: 'gloss', label: 'Gloss (+$0.00012/mm²)', cost: 0.00012 }
    ],
    colour: [
      { value: 'white', label: 'White (No additional cost)', cost: 0 },
      { value: 'off-white', label: 'Off-White (+$0.00002/mm²)', cost: 0.00002 },
      { value: 'beige', label: 'Beige (+$0.00003/mm²)', cost: 0.00003 },
      { value: 'grey', label: 'Grey (+$0.00004/mm²)', cost: 0.00004 },
      { value: 'blue', label: 'Blue (+$0.00005/mm²)', cost: 0.00005 },
      { value: 'green', label: 'Green (+$0.00005/mm²)', cost: 0.00005 },
      { value: 'custom', label: 'Custom Colour (+$0.00010/mm²)', cost: 0.00010 }
    ]
  };

  const addRoom = () => {
    const newRoom = {
      id: Date.now(),
      name: `Room ${rooms.length + 1}`,
      paintQuality: 'standard',
      paintQualityCost: '', // Manual override for quality cost
      paintFinish: 'eggshell',
      paintFinishCost: '0.00005', // $0.00005/mm²
      paintFinishCostManual: '', // Manual override for finish cost
      paintColour: 'white',
      paintColourCost: '0.00002', // $0.00002/mm²
      paintColourCostManual: '', // Manual override for colour cost
      doors: [],
      windows: [],
      walls: [
        { id: Date.now() + 1, length: 4000, height: 2700 }, // 4m x 2.7m wall
        { id: Date.now() + 2, length: 5000, height: 2700 }, // 5m x 2.7m wall
        { id: Date.now() + 3, length: 4000, height: 2700 }, // 4m x 2.7m wall
        { id: Date.now() + 4, length: 5000, height: 2700 }  // 5m x 2.7m wall
      ],
      trims: [
        { id: Date.now() + 7, length: 4000, height: 100 }, // 4m length, 100mm height trim
        { id: Date.now() + 8, length: 5000, height: 100 }  // 5m length, 100mm height trim
      ],
      floors: [
        { id: Date.now() + 5, length: 5000, width: 4000 } // 5m x 4m floor
      ],
      ceilings: [
        { id: Date.now() + 6, length: 5000, width: 4000 } // 5m x 4m ceiling
      ]
    };
    setRooms([...rooms, newRoom]);
  };

  const updateRoom = (roomId, field, value) => {
    setRooms(rooms.map(room => {
      if (room.id === roomId) {
        const updatedRoom = { ...room, [field]: value };
        
        // Auto-update costs when paint options change
        if (field === 'paintFinish') {
          const finishOption = paintOptions.finish.find(f => f.value === value);
          updatedRoom.paintFinishCost = finishOption ? finishOption.cost.toString() : '0';
        }
        
        if (field === 'paintColour') {
          const colourOption = paintOptions.colour.find(c => c.value === value);
          updatedRoom.paintColourCost = colourOption ? colourOption.cost.toString() : '0';
        }
        
        return updatedRoom;
      }
      return room;
    }));
  };

  const addWall = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    const newWall = { id: Date.now(), length: 4000, height: 2700 }; // Default 4m x 2.7m wall
    updateRoom(roomId, 'walls', [...room.walls, newWall]);
  };

  const updateWall = (roomId, wallId, field, value) => {
    const room = rooms.find(r => r.id === roomId);
    const updatedWalls = room.walls.map(wall =>
      wall.id === wallId ? { ...wall, [field]: parseFloat(value) || 0 } : wall
    );
    updateRoom(roomId, 'walls', updatedWalls);
  };

  const removeRoom = (roomId) => {
    if (rooms.length <= 1) {
      alert('You must have at least one room');
      return;
    }
    
    const updatedRooms = rooms.filter(room => room.id !== roomId);
    setRooms(updatedRooms);
    
    // If the removed room was selected, select the first remaining room
    if (selectedRoom === roomId) {
      setSelectedRoom(updatedRooms[0].id);
    }
  };

  const renameRoom = (roomId, newName) => {
    if (!newName.trim()) {
      alert('Room name cannot be empty');
      return;
    }
    updateRoom(roomId, 'name', newName.trim());
  };

  const duplicateRoom = (roomId) => {
    const roomToDuplicate = rooms.find(r => r.id === roomId);
    if (roomToDuplicate) {
      const newRoom = {
        id: Date.now(),
        name: `${roomToDuplicate.name} (Copy)`,
        paintQuality: roomToDuplicate.paintQuality,
        paintQualityCost: roomToDuplicate.paintQualityCost,
        paintFinish: roomToDuplicate.paintFinish,
        paintFinishCost: roomToDuplicate.paintFinishCost,
        paintFinishCostManual: roomToDuplicate.paintFinishCostManual,
        paintColour: roomToDuplicate.paintColour,
        paintColourCost: roomToDuplicate.paintColourCost,
        paintColourCostManual: roomToDuplicate.paintColourCostManual,
        doors: roomToDuplicate.doors.map(door => ({
          id: Date.now() + Math.random(),
          width: door.width,
          height: door.height
        })),
        windows: roomToDuplicate.windows.map(window => ({
          id: Date.now() + Math.random(),
          width: window.width,
          height: window.height
        })),
        walls: roomToDuplicate.walls.map(wall => ({
          id: Date.now() + Math.random(),
          length: wall.length,
          height: wall.height
        })),
        trims: roomToDuplicate.trims.map(trim => ({
          id: Date.now() + Math.random(),
          length: trim.length,
          height: trim.height
        })),
        floors: roomToDuplicate.floors.map(floor => ({
          id: Date.now() + Math.random(),
          length: floor.length,
          width: floor.width
        })),
        ceilings: roomToDuplicate.ceilings.map(ceiling => ({
          id: Date.now() + Math.random(),
          length: ceiling.length,
          width: ceiling.width
        }))
      };
      setRooms([...rooms, newRoom]);
    }
  };

  const addFloor = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    
    if (room) {
      const newFloor = {
        id: Date.now(),
        length: 5000, // Default dimensions
        width: 4000
      };
      const updatedFloors = [...room.floors, newFloor];
      updateRoom(roomId, 'floors', updatedFloors);
    }
  };

  const addCeiling = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    
    if (room) {
      const newCeiling = {
        id: Date.now(),
        length: 5000, // Default dimensions
        width: 4000
      };
      const updatedCeilings = [...room.ceilings, newCeiling];
      updateRoom(roomId, 'ceilings', updatedCeilings);
    }
  };

  const removeFloor = (roomId, floorId) => {
    const room = rooms.find(r => r.id === roomId);
    
    if (room && room.floors.length > 1) {
      const updatedFloors = room.floors.filter(floor => floor.id !== floorId);
      updateRoom(roomId, 'floors', updatedFloors);
    } else if (room && room.floors.length === 1) {
      alert('You must have at least one floor');
    }
  };

  const removeCeiling = (roomId, ceilingId) => {
    const room = rooms.find(r => r.id === roomId);
    
    if (room && room.ceilings.length > 1) {
      const updatedCeilings = room.ceilings.filter(ceiling => ceiling.id !== ceilingId);
      updateRoom(roomId, 'ceilings', updatedCeilings);
    } else if (room && room.ceilings.length === 1) {
      alert('You must have at least one ceiling');
    }
  };

  const updateFloor = (roomId, floorId, field, value) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      const updatedFloors = room.floors.map(floor =>
        floor.id === floorId ? { ...floor, [field]: parseFloat(value) || 0 } : floor
      );
      updateRoom(roomId, 'floors', updatedFloors);
    }
  };

  const updateCeiling = (roomId, ceilingId, field, value) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      const updatedCeilings = room.ceilings.map(ceiling =>
        ceiling.id === ceilingId ? { ...ceiling, [field]: parseFloat(value) || 0 } : ceiling
      );
      updateRoom(roomId, 'ceilings', updatedCeilings);
    }
  };

  const addDoor = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      const newDoor = { id: Date.now(), width: 800, height: 2000 };
      updateRoom(roomId, 'doors', [...room.doors, newDoor]);
    }
  };

  const removeDoor = (roomId, doorId) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      updateRoom(roomId, 'doors', room.doors.filter(door => door.id !== doorId));
    }
  };

  const updateDoor = (roomId, doorId, field, value) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      const updatedDoors = room.doors.map(door =>
        door.id === doorId ? { ...door, [field]: parseFloat(value) || 0 } : door
      );
      updateRoom(roomId, 'doors', updatedDoors);
    }
  };

  const addWindow = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      const newWindow = { id: Date.now(), width: 1200, height: 1000 };
      updateRoom(roomId, 'windows', [...room.windows, newWindow]);
    }
  };

  const removeWindow = (roomId, windowId) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      updateRoom(roomId, 'windows', room.windows.filter(window => window.id !== windowId));
    }
  };

  const updateWindow = (roomId, windowId, field, value) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      const updatedWindows = room.windows.map(window =>
        window.id === windowId ? { ...window, [field]: parseFloat(value) || 0 } : window
      );
      updateRoom(roomId, 'windows', updatedWindows);
    }
  };

  const addTrim = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    
    if (room) {
      const newTrim = {
        id: Date.now(),
        length: 4000, // Default length
        height: 100   // Default height
      };
      const updatedTrims = [...room.trims, newTrim];
      updateRoom(roomId, 'trims', updatedTrims);
    }
  };

  const removeTrim = (roomId, trimId) => {
    const room = rooms.find(r => r.id === roomId);
    
    if (room) {
      const updatedTrims = room.trims.filter(trim => trim.id !== trimId);
      updateRoom(roomId, 'trims', updatedTrims);
    }
  };

  const updateTrim = (roomId, trimId, field, value) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      const updatedTrims = room.trims.map(trim =>
        trim.id === trimId ? { ...trim, [field]: parseFloat(value) || 0 } : trim
      );
      updateRoom(roomId, 'trims', updatedTrims);
    }
  };

  const duplicateWall = (roomId, wallId) => {
    const room = rooms.find(r => r.id === roomId);
    const wallToDuplicate = room.walls.find(w => w.id === wallId);
    if (wallToDuplicate) {
      const newWall = {
        id: Date.now(),
        length: wallToDuplicate.length,
        height: wallToDuplicate.height
      };
      updateRoom(roomId, 'walls', [...room.walls, newWall]);
    }
  };

  const removeWall = (roomId, wallId) => {
    const room = rooms.find(r => r.id === roomId);
    if (room.walls.length <= 1) {
      alert('You must have at least one wall');
      return;
    }
    const updatedWalls = room.walls.filter(wall => wall.id !== wallId);
    updateRoom(roomId, 'walls', updatedWalls);
  };

  const calculateRoomCost = (room) => {
    // Use manual quality cost if provided, otherwise use preset price
    const paintPrice = room.paintQualityCost && room.paintQualityCost.trim() !== '' 
      ? parseFloat(room.paintQualityCost) 
      : (paintOptions.quality.find(q => q.value === room.paintQuality)?.price || 0.00038);
    
    // Calculate total wall area in mm²
    const wallAreaMm2 = room.walls.reduce((total, wall) => total + (wall.length * wall.height), 0);
    
    // Subtract door and window areas
    const doorAreaMm2 = room.doors.reduce((total, door) => total + (door.width * door.height), 0);
    const windowAreaMm2 = room.windows.reduce((total, window) => total + (window.width * window.height), 0);
    
    const netWallAreaMm2 = Math.max(0, wallAreaMm2 - doorAreaMm2 - windowAreaMm2);
    
    // Calculate base paint cost
    const basePaintCost = netWallAreaMm2 * paintPrice;
    
    // Use manual finish cost if provided, otherwise use preset cost
    const finishCostValue = room.paintFinishCostManual && room.paintFinishCostManual.trim() !== ''
      ? parseFloat(room.paintFinishCostManual)
      : (parseFloat(room.paintFinishCost) || 0);
    
    // Use manual colour cost if provided, otherwise use preset cost
    const colourCostValue = room.paintColourCostManual && room.paintColourCostManual.trim() !== ''
      ? parseFloat(room.paintColourCostManual)
      : (parseFloat(room.paintColourCost) || 0);
    
    // Add finish and colour costs
    const finishCost = finishCostValue * netWallAreaMm2;
    const colourCost = colourCostValue * netWallAreaMm2;
    
    const totalCost = basePaintCost + finishCost + colourCost;
    
    return totalCost;
  };

  const totalCost = rooms.reduce((total, room) => total + calculateRoomCost(room), 0);

  const calculateRoomArea = (room) => {
    const wallAreaMm2 = room.walls.reduce((total, wall) => total + (wall.length * wall.height), 0);
    const doorAreaMm2 = room.doors.reduce((total, door) => total + (door.width * door.height), 0);
    const windowAreaMm2 = room.windows.reduce((total, window) => total + (window.width * window.height), 0);
    
    // Calculate trim area (trims subtract from wall area)
    const trimAreaMm2 = room.trims.reduce((total, trim) => total + (trim.length * trim.height), 0);
    
    const netWallAreaMm2 = Math.max(0, wallAreaMm2 - doorAreaMm2 - windowAreaMm2 - trimAreaMm2);
    
    // Calculate floor and ceiling areas
    const floorAreaMm2 = room.floors.reduce((total, floor) => total + (floor.length * floor.width), 0);
    const ceilingAreaMm2 = room.ceilings.reduce((total, ceiling) => total + (ceiling.length * ceiling.width), 0);
    
    return {
      totalWallArea: wallAreaMm2,
      doorArea: doorAreaMm2,
      windowArea: windowAreaMm2,
      trimArea: trimAreaMm2,
      netPaintableArea: netWallAreaMm2,
      floorArea: floorAreaMm2,
      ceilingArea: ceilingAreaMm2,
      totalArea: netWallAreaMm2 + floorAreaMm2 + ceilingAreaMm2
    };
  };

  const currentRoom = rooms.find(r => r.id === selectedRoom);

 const generatePDFReport = () => {
   const doc = generatePaintingCostReport(
     rooms,
     Number(estimate?.projectTotal ?? 0).toFixed(2)
   );
   doc.save(`painting-cost-report-${new Date().toISOString().split('T')[0]}.pdf`);
 }

  const [activeTab, setActiveTab] = useState('all');

  // Tab Components
  const WallsTab = () => (
    <div className="surfaces-group">
      <div className="surfaces-header">
        <h4>Walls ({currentRoom.walls.length})</h4>
        <button
          className="btn btn-small"
          onClick={() => addWall(currentRoom.id)}
        >
          + Add Wall
        </button>
      </div>

      {currentRoom.walls.map((wall, index) => (
        <div key={wall.id} className="surface-item">
          <div className="surface-header">
            <span>Wall {index + 1}</span>
            <div className="surface-controls">
              <button
                className="duplicate-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateWall(currentRoom.id, wall.id);
                }}
                title="Duplicate wall"
              >
                <Copy size={18} />
              </button>
              <button
                className="remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentRoom.walls.length > 1) {
                    if (confirm('Are you sure you want to remove this wall?')) {
                      removeWall(currentRoom.id, wall.id);
                    }
                  } else {
                    alert('You must have at least one wall');
                  }
                }}
                title="Remove wall"
              >
                <Trash size={18} />
              </button>
            </div>
          </div>
          <div className="dimension-inputs">
            <div className="input-group">
              <label>Length (mm)</label>
              <input
                type="number"
                placeholder="Length (mm)"
                value={wall.length}
                onChange={(e) => updateWall(currentRoom.id, wall.id, 'length', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Height (mm)</label>
              <input
                type="number"
                placeholder="Height (mm)"
                value={wall.height}
                onChange={(e) => updateWall(currentRoom.id, wall.id, 'height', e.target.value)}
              />
            </div>
            <span className="wall-area">
              {(wall.length * wall.height).toLocaleString()} mm²
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  const TrimsTab = () => (
    <div className="surfaces-group">
      <div className="surfaces-header">
        <h4>Trims ({currentRoom.trims.length})</h4>
        <button
          className="btn btn-small"
          onClick={() => addTrim(currentRoom.id)}
        >
          + Add Trim
        </button>
      </div>

      {currentRoom.trims.map((trim, index) => (
        <div key={trim.id} className="surface-item">
          <div className="surface-header">
            <span>Trim {index + 1}</span>
            <div className="surface-controls">
              <button
                className="duplicate-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  addTrim(currentRoom.id);
                }}
                title="Add another trim"
              >
                <Copy size={18} />
              </button>
              <button
                className="remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTrim(currentRoom.id, trim.id);
                }}
                title="Remove trim"
              >
                <Trash size={18} />
              </button>
            </div>
          </div>
          <div className="dimension-inputs">
            <div className="input-group">
              <label>Length (mm)</label>
              <input
                type="number"
                placeholder="Length (mm)"
                value={trim.length}
                onChange={(e) => updateTrim(currentRoom.id, trim.id, 'length', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Height (mm)</label>
              <input
                type="number"
                placeholder="Height (mm)"
                value={trim.height}
                onChange={(e) => updateTrim(currentRoom.id, trim.id, 'height', e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const DoorsTab = () => (
    <div className="surfaces-group">
      <div className="surfaces-header">
        <h4>Doors ({currentRoom.doors.length})</h4>
        <button
          className="btn btn-small"
          onClick={() => addDoor(currentRoom.id)}
        >
          + Add Door
        </button>
      </div>

      {currentRoom.doors.map((door, index) => (
        <div key={door.id} className="surface-item">
          <div className="surface-header">
            <span>Door {index + 1}</span>
            <div className="surface-controls">
              <button
                className="duplicate-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  addDoor(currentRoom.id);
                }}
                title="Add another door"
              >
                <Copy size={18} />
              </button>
              <button
                className="remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeDoor(currentRoom.id, door.id);
                }}
                title="Remove door"
              >
                <Trash size={18} />
              </button>
            </div>
          </div>
          <div className="dimension-inputs">
            <div className="input-group">
              <label>Width (mm)</label>
              <input
                type="number"
                placeholder="Width (mm)"
                value={door.width}
                onChange={(e) => updateDoor(currentRoom.id, door.id, 'width', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Height (mm)</label>
              <input
                type="number"
                placeholder="Height (mm)"
                value={door.height}
                onChange={(e) => updateDoor(currentRoom.id, door.id, 'height', e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const WindowsTab = () => (
    <div className="surfaces-group">
      <div className="surfaces-header">
        <h4>Windows ({currentRoom.windows.length})</h4>
        <button
          className="btn btn-small"
          onClick={() => addWindow(currentRoom.id)}
        >
          + Add Window
        </button>
      </div>

      {currentRoom.windows.map((window, index) => (
        <div key={window.id} className="surface-item">
          <div className="surface-header">
            <span>Window {index + 1}</span>
            <div className="surface-controls">
              <button
                className="duplicate-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  addWindow(currentRoom.id);
                }}
                title="Add another window"
              >
                <Copy size={18} />
              </button>
              <button
                className="remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeWindow(currentRoom.id, window.id);
                }}
                title="Remove window"
              >
                <Trash size={18} />
              </button>
            </div>
          </div>
          <div className="dimension-inputs">
            <div className="input-group">
              <label>Width (mm)</label>
              <input
                type="number"
                placeholder="Width (mm)"
                value={window.width}
                onChange={(e) => updateWindow(currentRoom.id, window.id, 'width', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Height (mm)</label>
              <input
                type="number"
                placeholder="Height (mm)"
                value={window.height}
                onChange={(e) => updateWindow(currentRoom.id, window.id, 'height', e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const FloorsTab = () => (
    <div className="surfaces-group">
      <div className="surfaces-header">
        <h4>Floors ({currentRoom.floors.length})</h4>
        <button
          className="btn btn-small"
          onClick={() => addFloor(currentRoom.id)}
        >
          + Add Floor
        </button>
      </div>

      {currentRoom.floors.map((floor, index) => (
        <div key={floor.id} className="surface-item">
          <div className="surface-header">
            <span>Floor {index + 1}</span>
            <div className="surface-controls">
              <button
                className="duplicate-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  addFloor(currentRoom.id);
                }}
                title="Add another floor"
              >
                <Copy size={18} />
              </button>
              <button
                className="remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFloor(currentRoom.id, floor.id);
                }}
                title="Remove floor"
              >
                <Trash size={18} />
              </button>
            </div>
          </div>
          <div className="dimension-inputs">
            <div className="input-group">
              <label>Length (mm)</label>
              <input
                type="number"
                placeholder="Length (mm)"
                value={floor.length}
                onChange={(e) => updateFloor(currentRoom.id, floor.id, 'length', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Width (mm)</label>
              <input
                type="number"
                placeholder="Width (mm)"
                value={floor.width}
                onChange={(e) => updateFloor(currentRoom.id, floor.id, 'width', e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const CeilingsTab = () => (
    <div className="surfaces-group">
      <div className="surfaces-header">
        <h4>Ceilings ({currentRoom.ceilings.length})</h4>
        <button
          className="btn btn-small"
          onClick={() => addCeiling(currentRoom.id)}
        >
          + Add Ceiling
        </button>
      </div>

      {currentRoom.ceilings.map((ceiling, index) => (
        <div key={ceiling.id} className="surface-item">
          <div className="surface-header">
            <span>Ceiling {index + 1}</span>
            <div className="surface-controls">
              <button
                className="duplicate-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  addCeiling(currentRoom.id);
                }}
                title="Add another ceiling"
              >
                <Copy size={18} />
              </button>
              <button
                className="remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeCeiling(currentRoom.id, ceiling.id);
                }}
                title="Remove ceiling"
              >
                <Trash size={18} />
              </button>
            </div>
          </div>
          <div className="dimension-inputs">
            <div className="input-group">
              <label>Length (mm)</label>
              <input
                type="number"
                placeholder="Length (mm)"
                value={ceiling.length}
                onChange={(e) => updateCeiling(currentRoom.id, ceiling.id, 'length', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Width (mm)</label>
              <input
                type="number"
                placeholder="Width (mm)"
                value={ceiling.width}
                onChange={(e) => updateCeiling(currentRoom.id, ceiling.id, 'width', e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const SectionTabs = () => {
    const tabs = [
      { id: 'all', label: 'All' },
      { id: 'walls', label: 'Walls' },
      { id: 'trims', label: 'Trims' },
      { id: 'doors', label: 'Doors' },
      { id: 'windows', label: 'Windows' },
      { id: 'floors', label: 'Floors' },
      { id: 'ceilings', label: 'Ceilings' }
    ];

    return (
      <div>
        {/* Tab Buttons */}
        <div className="btn-group" role="tablist">
          {tabs.map(tab => (
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

        <div className="mt-3">
          {activeTab === 'all' && (
            <div>
              <WallsTab />
              <TrimsTab />
              <DoorsTab />
              <WindowsTab />
              <FloorsTab />
              <CeilingsTab />
            </div>
          )}
          {activeTab === 'walls' && <WallsTab />}
          {activeTab === 'trims' && <TrimsTab />}
          {activeTab === 'doors' && <DoorsTab />}
          {activeTab === 'windows' && <WindowsTab />}
          {activeTab === 'floors' && <FloorsTab />}
          {activeTab === 'ceilings' && <CeilingsTab />}
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="rooms-section">
          <div className="rooms-header">
            <h2>Rooms</h2>
            <button className="btn btn-primary" onClick={addRoom}>
              + Add Room
            </button>
          </div>
          
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
                    <Edit size={18} /> 
                  </button>
                  <button
                    className="room-control-btn duplicate-btn"
                    onClick={() => duplicateRoom(room.id)}
                    title="Duplicate room"
                  >
                    <Copy size={18} /> 
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
                    <Trash size={18} /> 
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="main-content">
          <div>
            <h1>Painting Cost Calculator</h1>
            <p>Calculate the cost to paint your house by room</p>
          </div>


        {currentRoom && (
          <div className="room-details">
            <h3>{currentRoom.name}</h3>
            
            <div className="room-defaults">
              <h4>Room Defaults</h4>
              
              <div className="form-row triple">
                <div className="form-group">
                  <label>Paint Quality:</label>
                  <select
                    value={currentRoom.paintQuality}
                    onChange={(e) => updateRoom(currentRoom.id, 'paintQuality', e.target.value)}
                  >
                    {paintOptions.quality.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Quality Cost ($/mm²) <span className="auto-label">🔄 Auto</span>:</label>
                  <input
                    type="text"
                    value={(() => {
                      const qualityOption = paintOptions.quality.find(q => q.value === currentRoom.paintQuality);
                      return qualityOption ? qualityOption.price.toString() : '0.00038';
                    })()}
                    readOnly
                    className="auto-calculated"
                    title="This value is automatically calculated based on your quality selection"
                  />
                </div>
                <div className="form-group">
                  <label>Manual Override <span className="manual-label">✏️ Manual</span>:</label>
                  <input
                    type="text"
                    value={currentRoom.paintQualityCost}
                    onChange={(e) => updateRoom(currentRoom.id, 'paintQualityCost', e.target.value)}
                    placeholder="Override quality cost"
                    className="manual-input"
                    title="Enter custom quality cost to override preset pricing"
                  />
                </div>
              </div>

              <div className="form-row triple">
                <div className="form-group">
                  <label>Paint Finish:</label>
                  <select
                    value={currentRoom.paintFinish}
                    onChange={(e) => updateRoom(currentRoom.id, 'paintFinish', e.target.value)}
                  >
                    {paintOptions.finish.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Finish Cost ($/mm²) <span className="auto-label">🔄 Auto</span>:</label>
                  <input
                    type="text"
                    value={currentRoom.paintFinishCost}
                    onChange={(e) => updateRoom(currentRoom.id, 'paintFinishCost', e.target.value)}
                    placeholder="0.00000"
                    readOnly
                    className="auto-calculated"
                    title="This value is automatically calculated based on your finish selection"
                  />
                </div>
                <div className="form-group">
                  <label>Manual Override <span className="manual-label">✏️ Manual</span>:</label>
                  <input
                    type="text"
                    value={currentRoom.paintFinishCostManual}
                    onChange={(e) => updateRoom(currentRoom.id, 'paintFinishCostManual', e.target.value)}
                    placeholder="Override finish cost"
                    className="manual-input"
                    title="Enter custom finish cost to override automatic calculation"
                  />
                </div>
              </div>

              <div className="form-row triple">
                <div className="form-group">
                  <label>Paint Colour:</label>
                  <select
                    value={currentRoom.paintColour}
                    onChange={(e) => updateRoom(currentRoom.id, 'paintColour', e.target.value)}
                  >
                    {paintOptions.colour.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Colour Cost ($/mm²) <span className="auto-label">🔄 Auto</span>:</label>
                  <input
                    type="text"
                    value={currentRoom.paintColourCost}
                    onChange={(e) => updateRoom(currentRoom.id, 'paintColourCost', e.target.value)}
                    placeholder="0.00000"
                    readOnly
                    className="auto-calculated"
                    title="This value is automatically calculated based on your colour selection"
                  />
                </div>
                <div className="form-group">
                  <label>Manual Override <span className="manual-label">✏️ Manual</span>:</label>
                  <input
                    type="text"
                    value={currentRoom.paintColourCostManual}
                    onChange={(e) => updateRoom(currentRoom.id, 'paintColourCostManual', e.target.value)}
                    placeholder="Override colour cost"
                    className="manual-input"
                    title="Enter custom colour cost to override automatic calculation"
                  />
                </div>
              </div>
            </div>

            <SectionTabs />

            <div className="room-cost">
              <h4>Room Cost: ${calculateRoomCost(currentRoom).toFixed(2)}</h4>
            </div>
          </div>
        )}

          <div className="total-cost">

            {estimate ? (
              <>
                <h2>Total Project Cost: ${Number(estimate?.projectTotal ?? 0).toFixed(2)}</h2>
                <button 
                  className="btn btn-primary pdf-report-btn" 
                  onClick={generatePDFReport}
                  style={{ marginTop: '10px', padding: '10px 20px', fontSize: '14px' }}
                >
                  <Download size={18} /> Generate PDF Report 
                </button>
              </>
            ) : (
              <h2>Total Project Cost: …</h2>
            )}
          </div>
        </div>
        {isMobile && <MobileUI rooms={rooms}
                               selectedRoom={selectedRoom}
                               setSelectedRoom={setSelectedRoom}
                               addRoom={addRoom}
                               renameRoom={renameRoom}
                               duplicateRoom={duplicateRoom}
                               removeRoom={removeRoom}
                               totalCost={totalCost}
                               generatePDFReport={generatePDFReport}/>}

      </header>
    </div>
  );
}

export default App;