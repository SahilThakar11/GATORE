import React, {
  createRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import Draggable, {
  type DraggableData,
  type DraggableEvent,
} from "react-draggable";

interface Table {
  id: number;
  name: string;
  size: number;
  status: "Available" | "Reserved" | "Occupied" | "Out of Service";
}

// Different colors based on capacity — used for both table square and chair dots
const SIZE_COLORS: Record<number, { bg: string; chair: string }> = {
  2: { bg: "bg-amber-400", chair: "bg-amber-300" },
  4: { bg: "bg-teal-400", chair: "bg-teal-300" },
  6: { bg: "bg-blue-400", chair: "bg-blue-300" },
  8: { bg: "bg-purple-400", chair: "bg-purple-300" },
};

const getSizeColor = (size: number) => {
  if (size <= 2) return SIZE_COLORS[2];
  if (size <= 4) return SIZE_COLORS[4];
  if (size <= 6) return SIZE_COLORS[6];
  return SIZE_COLORS[8];
};

const STORAGE_KEY = "gatore-floorplan-positions";

type Positions = Record<number, { x: number; y: number }>;

function loadPositions(): Positions {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePositions(positions: Positions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
}

// Generate default grid positions so tables don't stack
function getDefaultPositions(tables: Table[]): Positions {
  const cols = Math.min(tables.length, 4);
  const cellW = 160;
  const cellH = 180;
  const positions: Positions = {};
  tables.forEach((t, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions[t.id] = { x: col * cellW + 20, y: row * cellH + 20 };
  });
  return positions;
}

interface FloorPlanProps {
  isEditable?: boolean;
  tables?: Table[];
}

const FloorPlan: React.FC<FloorPlanProps> = ({
  isEditable = false,
  tables = [],
}) => {
  const tableRefs = useMemo(
    () => tables.map(() => createRef<HTMLDivElement>()),
    [tables.length],
  );

  const [positions, setPositions] = useState<Positions>(() => {
    const saved = loadPositions();
    const defaults = getDefaultPositions(tables);
    // Merge: use saved position if it exists, otherwise default
    const merged: Positions = {};
    tables.forEach((t) => {
      merged[t.id] = saved[t.id] ?? defaults[t.id];
    });
    return merged;
  });

  // Update positions when tables change (new tables added, etc.)
  useEffect(() => {
    const saved = loadPositions();
    const defaults = getDefaultPositions(tables);
    const merged: Positions = {};
    tables.forEach((t) => {
      merged[t.id] = saved[t.id] ?? defaults[t.id];
    });
    setPositions(merged);
  }, [tables.length]);

  const handleDragStop = useCallback(
    (tableId: number, _e: DraggableEvent, data: DraggableData) => {
      setPositions((prev) => {
        const updated = { ...prev, [tableId]: { x: data.x, y: data.y } };
        savePositions(updated);
        return updated;
      });
    },
    [],
  );

  if (tables.length === 0) {
    return (
      <div className="min-h-[420px] bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center">
        <p className="text-sm text-gray-400">No tables configured yet.</p>
      </div>
    );
  }

  // Calculate min height based on number of rows
  const cols = Math.min(tables.length, 4);
  const rows = Math.ceil(tables.length / cols);
  const minHeight = Math.max(420, rows * 180 + 40);

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
      <div className="relative" style={{ minHeight }}>
        {tables.map((table, index) => {
          const sizeColor = getSizeColor(table.size);
          const topChairs = Math.max(1, Math.ceil((table.size - 2) / 2));
          const bottomChairs = Math.max(1, Math.floor((table.size - 2) / 2));
          const pos = positions[table.id] ?? { x: 0, y: 0 };

          return (
            <Draggable
              key={table.id}
              nodeRef={tableRefs[index]}
              disabled={!isEditable}
              position={pos}
              onStop={(e, data) => handleDragStop(table.id, e, data)}
              bounds="parent"
            >
              <div
                ref={tableRefs[index]}
                className={`absolute flex flex-col items-center gap-1.5 ${isEditable ? "cursor-grab active:cursor-grabbing" : ""}`}
              >
                {/* Top chairs */}
                <div className="flex items-center justify-center gap-2">
                  {Array.from({ length: topChairs }).map((_, i) => (
                    <div
                      key={`top-${table.id}-${i}`}
                      className={`w-6 h-6 rounded-full ${sizeColor.chair} border-2 border-white shadow-sm`}
                    />
                  ))}
                </div>

                {/* Middle row: left chair + table square + right chair */}
                <div className="flex items-center justify-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full ${sizeColor.chair} border-2 border-white shadow-sm`}
                  />
                  <div
                    className={`w-16 h-16 rounded-xl ${sizeColor.bg} shadow-md border-2 border-white/40`}
                  />
                  <div
                    className={`w-6 h-6 rounded-full ${sizeColor.chair} border-2 border-white shadow-sm`}
                  />
                </div>

                {/* Bottom chairs */}
                <div className="flex items-center justify-center gap-2">
                  {Array.from({ length: bottomChairs }).map((_, i) => (
                    <div
                      key={`bottom-${table.id}-${i}`}
                      className={`w-6 h-6 rounded-full ${sizeColor.chair} border-2 border-white shadow-sm`}
                    />
                  ))}
                </div>

                {/* Table name + seat count */}
                <div className="flex flex-col items-center mt-1">
                  <span className="text-xs font-semibold text-gray-700">
                    {table.name}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {table.size} seats
                  </span>
                </div>
              </div>
            </Draggable>
          );
        })}
      </div>

      {/* Size legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-200">
        <span className="text-xs text-gray-400 font-medium">Table size:</span>
        {[
          { label: "1-2", color: "bg-amber-400" },
          { label: "3-4", color: "bg-teal-400" },
          { label: "5-6", color: "bg-blue-400" },
          { label: "7+", color: "bg-purple-400" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded ${item.color}`} />
            <span className="text-xs text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FloorPlan;
