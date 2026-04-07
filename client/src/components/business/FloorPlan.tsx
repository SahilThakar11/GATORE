import React, { createRef, useRef, useState, useEffect } from "react";
import Draggable, {
  type DraggableData,
  type DraggableEvent,
} from "react-draggable";

export interface FloorPlanTable {
  id: number;
  name: string;
  capacity: number;
  type: string;
  status: "Available" | "Confirmed" | "Seated" | "Out of Service";
}

const STATUS_COLORS: Record<string, string> = {
  Available: "bg-teal-400",
  Confirmed: "bg-blue-400",
  Seated: "bg-teal-600",
  "Out of Service": "bg-neutral-400",
};

const getStatusColor = (status: string): string =>
  STATUS_COLORS[status] ?? "bg-neutral-400";

/** Strip "Table " prefix so "Table 4" → "4" */
function tableLabel(name: string): string {
  return name.replace(/^table\s*/i, "");
}

/** True for round-cornered table shapes */
function isRound(type: string): boolean {
  return type === "Round" || type === "High-Top";
}

const STORAGE_KEY = "gatore_floorplan_positions";
type Position = { x: number; y: number };

function loadPositions(): Record<number, Position> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function savePosition(tableId: number, pos: Position) {
  try {
    const current = loadPositions();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...current, [tableId]: pos }),
    );
  } catch {}
}

interface FloorPlanProps {
  isEditable?: boolean;
  tables: FloorPlanTable[];
  onStatusChange?: (
    tableId: number,
    status: "Available" | "Out of Service",
  ) => void;
}

const FloorPlan: React.FC<FloorPlanProps> = ({
  isEditable = false,
  tables,
  onStatusChange,
}) => {
  const [savedPositions] = useState<Record<number, Position>>(loadPositions);
  const [activePopover, setActivePopover] = useState<number | null>(null);
  const isDragging = useRef(false);

  const nodeRefs = useRef<Map<number, React.RefObject<HTMLDivElement>>>(
    new Map(),
  );
  const popoverRefs = useRef<Map<number, React.RefObject<HTMLDivElement>>>(
    new Map(),
  );

  const getNodeRef = (id: number) => {
    if (!nodeRefs.current.has(id))
      nodeRefs.current.set(
        id,
        createRef<HTMLDivElement>() as React.RefObject<HTMLDivElement>,
      );
    return nodeRefs.current.get(id)!;
  };

  const getPopoverRef = (id: number) => {
    if (!popoverRefs.current.has(id))
      popoverRefs.current.set(
        id,
        createRef<HTMLDivElement>() as React.RefObject<HTMLDivElement>,
      );
    return popoverRefs.current.get(id)!;
  };

  // Close popover on outside click or Escape
  useEffect(() => {
    if (activePopover === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActivePopover(null);
    };
    const handleClick = (e: MouseEvent) => {
      const popoverEl = popoverRefs.current.get(activePopover);
      if (popoverEl?.current && !popoverEl.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [activePopover]);

  // Close popover when exiting edit mode
  useEffect(() => {
    if (!isEditable) setActivePopover(null);
  }, [isEditable]);

  const handleStop = (
    _: DraggableEvent,
    data: DraggableData,
    tableId: number,
  ) => {
    savePosition(tableId, { x: data.x, y: data.y });
  };

  return (
    <div
      className="min-h-[420px] bg-gray-50 rounded-xl border border-gray-200"
      style={{ position: "relative" }}
    >
      {tables.map((table) => {
        const nodeRef = getNodeRef(table.id);
        const popoverRef = getPopoverRef(table.id);
        const color = getStatusColor(table.status);
        const tableShape = isRound(table.type) ? "rounded-full" : "rounded-xl";

        const sides = Math.min(2, table.capacity);
        const remaining = Math.max(0, table.capacity - sides);
        const topCount = Math.floor(remaining / 2);
        const bottomCount = Math.ceil(remaining / 2);
        const label = tableLabel(table.name);
        const isOOS = table.status === "Out of Service";

        return (
          <Draggable
            key={table.id}
            bounds="parent"
            nodeRef={nodeRef}
            disabled={!isEditable}
            defaultPosition={savedPositions[table.id] ?? { x: 0, y: 0 }}
            onStart={() => {
              isDragging.current = false;
            }}
            onDrag={() => {
              isDragging.current = true;
            }}
            onStop={(e, data) => handleStop(e, data, table.id)}
          >
            <div
              ref={nodeRef}
              className={`w-[140px] h-[140px] select-none ${isEditable ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
              style={{ position: "absolute" }}
              aria-label={`${label}, ${table.capacity} seats, ${table.type}, ${table.status}`}
              onClick={() => {
                if (isEditable && !isDragging.current) {
                  setActivePopover((v) => (v === table.id ? null : table.id));
                }
              }}
            >
              {/* Status popover */}
              {isEditable && activePopover === table.id && (
                <div
                  ref={popoverRef}
                  style={{
                    position: "absolute",
                    bottom: "110%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 100,
                  }}
                  className="bg-white rounded-xl shadow-lg border border-warm-200 p-2 flex flex-col gap-1 whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-xs font-semibold text-neutral-500 px-2 pt-0.5 pb-0.5">
                    Table {label}
                  </p>
                  <button
                    className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer text-left ${
                      !isOOS
                        ? "bg-teal-50 text-teal-700 ring-1 ring-teal-300"
                        : "text-neutral-600 hover:bg-warm-100"
                    }`}
                    onClick={() => {
                      onStatusChange?.(table.id, "Available");
                      setActivePopover(null);
                    }}
                  >
                    Available
                  </button>
                  <button
                    className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer text-left ${
                      isOOS
                        ? "bg-neutral-100 text-neutral-700 ring-1 ring-neutral-300"
                        : "text-neutral-600 hover:bg-warm-100"
                    }`}
                    onClick={() => {
                      onStatusChange?.(table.id, "Out of Service");
                      setActivePopover(null);
                    }}
                  >
                    Out of Service
                  </button>
                </div>
              )}

              {/* Top chairs */}
              {topCount > 0 && (
                <div className="w-full gap-2 flex items-center justify-center">
                  {Array.from({ length: topCount }).map((_, i) => (
                    <div
                      key={`top-${table.id}-${i}`}
                      className={`w-7 h-7 rounded-full ${color} border-2 border-white shadow-sm`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              )}

              {/* Middle row: left chair + table body + right chair */}
              <div className="w-full flex items-center justify-center gap-1.5">
                <div
                  className={`w-7 h-7 rounded-full ${color} border-2 border-white shadow-sm shrink-0`}
                  aria-hidden="true"
                />
                <div
                  className={`w-[72px] h-[72px] ${tableShape} ${color} flex items-center justify-center shadow-md`}
                  aria-hidden="true"
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-sm font-bold text-neutral-700 shadow-inner">
                    {label}
                  </div>
                </div>
                <div
                  className={`w-7 h-7 rounded-full ${color} border-2 border-white shadow-sm shrink-0`}
                  aria-hidden="true"
                />
              </div>

              {/* Bottom chairs */}
              {bottomCount > 0 && (
                <div className="w-full gap-2 flex items-center justify-center">
                  {Array.from({ length: bottomCount }).map((_, i) => (
                    <div
                      key={`bottom-${table.id}-${i}`}
                      className={`w-7 h-7 rounded-full ${color} border-2 border-white shadow-sm`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              )}
            </div>
          </Draggable>
        );
      })}
    </div>
  );
};

export default FloorPlan;
