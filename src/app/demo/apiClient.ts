export function toApiRooms(rooms: any[]) {
  return rooms.map((room) => {
    const walls = room.walls ?? [];
    const perimeter_mm = walls.reduce((sum: number, w: any) => sum + (w.length || 0), 0);
    const height_mm = walls.length ? walls[0].height || 0 : 0;

    const perimeter_m = perimeter_mm / 1000;
    const height_m = height_mm / 1000;

    const half = perimeter_m / 2;
    const length_m = half / 2;
    const width_m  = half / 2;

    return {
      name: room.name,
      length_m,
      width_m,
      height_m,
      doors: Number(room.doors || 0),
      windows: Number(room.windows || 0),
      coats: 2,
      paintId: null,
    };
  });
}

export async function fetchPaints() {
  const res = await fetch('/api/calculate/reference-data', { cache: 'no-store' });
  if (!res.ok) throw new Error(`ref-data failed: ${res.status}`);
  const { data } = await res.json();
  return {
    paints: {
      types:         data.paintTypes,
      surfaceTypes:  data.surfaceTypes,
      qualities:     data.paintQualities,
      conditions:    data.surfaceConditions,
      laborRates:    data.laborRates,        // <-- keep this!
    }
  };
}



export function toSurfaces(rooms: any[], defaults: any) {
  if (!defaults) return [];

  const mm2ToM2 = (mm2: any) => (Number(mm2) || 0) / 1_000_000;
  const safe = (v: any) => Number(v) || 0;

  const DOOR = 2000 * 800;
  const WINDOW = 1200 * 1000;
  const COATS_DEFAULT = 2;

  return (rooms ?? []).flatMap((room) => {
    const walls = room.walls ?? [];
    const trims = room.trims ?? [];
    const ceilings = room.ceilings ?? [];

    const wallAreaMm2 =
      walls.reduce((t: number, w: any) => t + (safe(w.length) * safe(w.height)), 0);
    const trimAreaMm2 =
      trims.reduce((t: number, tr: any) => t + (safe(tr.length) * safe(tr.height)), 0);
    const openingsMm2 = safe(room.doors) * DOOR + safe(room.windows) * WINDOW;
    const netWallAreaMm2 = Math.max(0, wallAreaMm2 - openingsMm2 - trimAreaMm2);

    const out = [];

    //walls 
    out.push({
      id: `room-${room.id}-walls`,
      name: `${room.name} – Walls`,
      area: mm2ToM2(netWallAreaMm2),
      coats: COATS_DEFAULT,
      paintTypeId: defaults.wall.paintTypeId,
      surfaceTypeId: defaults.wall.surfaceTypeId,
      paintQualityId: defaults.wall.paintQualityId,     
      surfaceConditionId: defaults.wall.surfaceConditionId,
      surfaceCategory: defaults.wall.surfaceCategory,
    });

    //ceilings
    const ceilingAreaMm2 =
      ceilings.reduce((t: number, c: any) => t + (safe(c.length) * safe(c.width)), 0);
    if (ceilingAreaMm2 > 0) {
      out.push({
        id: `room-${room.id}-ceiling`,
        name: `${room.name} – Ceiling`,
        area: mm2ToM2(ceilingAreaMm2),
        coats: COATS_DEFAULT,
        paintTypeId: defaults.ceiling.paintTypeId,
        surfaceTypeId: defaults.ceiling.surfaceTypeId,
        paintQualityId: defaults.ceiling.paintQualityId,
        surfaceConditionId: defaults.ceiling.surfaceConditionId,
        surfaceCategory: defaults.ceiling.surfaceCategory,
      });
    }

    return out;
  });
}


export async function postProjectCost(
  surfaces: any[], { laborRateId, region, signal }: { laborRateId?: number; region?: string; signal?: AbortSignal } = {}
) {
  const res = await fetch('/api/calculate/project-cost', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ surfaces, laborRateId, region }),
    signal,
  });
  if (!res.ok) {
    // bubble up readable error
    const text = await res.text().catch(() => '');
    throw new Error(text || `project-cost failed: ${res.status}`);
  }
  return res.json();
}



