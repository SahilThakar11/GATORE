import React, { createRef } from 'react';
import Draggable from 'react-draggable';

interface Table {
  id: number;
  name: string;
  size: number;
  status: 'Available' | 'Confirmed' | 'Seated' | 'Out of Service';
}

const tables: Table[] = [
  { id: 1, name: '1', size: 6, status: 'Available' },
  { id: 2, name: '2', size: 6, status: 'Confirmed' },
  { id: 3, name: '3', size: 4, status: 'Seated' },
  { id: 4, name: '4', size: 2, status: 'Out of Service' },
  { id: 5, name: '5', size: 8, status: 'Available' },
  { id: 6, name: '6', size: 4, status: 'Available' },
  { id: 7, name: '7', size: 6, status: 'Confirmed' },
  { id: 8, name: '8', size: 4, status: 'Seated' },
];

const STATUS_COLORS: Record<string, string> = {
  Available:        'bg-teal-400',
  Confirmed:        'bg-blue-400',
  Seated:           'bg-teal-600',
  'Out of Service': 'bg-neutral-400',
};

const getStatusColor = (status: string): string => STATUS_COLORS[status] ?? 'bg-gray-400';

// Create individual refs for each table to prevent shared-ref dragging bug
const tableRefs = tables.map(() => createRef<HTMLDivElement>());

interface FloorPlanProps {
  isEditable?: boolean;
}

const FloorPlan: React.FC<FloorPlanProps> = ({ isEditable = false }) => {
  return (
    <div
      className="min-h-[420px] bg-gray-50 rounded-xl border border-gray-200"
      style={{ position: 'relative' }}
    >
      {tables.map((table, index) => (
        <Draggable
          key={table.id}
          bounds="parent"
          nodeRef={tableRefs[index]}
          disabled={!isEditable}
        >
          <div
            ref={tableRefs[index]}
            className="w-[140px] h-[140px] cursor-grab active:cursor-grabbing"
            style={{ position: 'absolute' }}
          >
            {/* Top chairs */}
            <div className="w-full gap-2 flex items-center justify-center">
              {Array.from({ length: Math.max(1, (table.size - 2) / 2) }).map(
                (_, i) => (
                  <div
                    key={`top-${table.id}-${i}`}
                    className={`w-7 h-7 rounded-full ${getStatusColor(table.status)} border-2 border-white shadow-sm`}
                  />
                ),
              )}
            </div>

            {/* Middle row: left chair + table + right chair */}
            <div className="w-full p-1 gap-2 flex items-center justify-center">
              <div
                className={`w-7 h-7 rounded-full ${getStatusColor(table.status)} border-2 border-white shadow-sm`}
              />
              <div
                className={`w-[72px] h-[72px] rounded-xl ${getStatusColor(table.status)} flex items-center justify-center shadow-md`}
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-sm font-bold text-gray-700 shadow-inner">
                  {table.name}
                </div>
              </div>
              <div
                className={`w-7 h-7 rounded-full ${getStatusColor(table.status)} border-2 border-white shadow-sm`}
              />
            </div>

            {/* Bottom chairs */}
            <div className="w-full gap-2 flex items-center justify-center">
              {Array.from({ length: Math.max(1, (table.size - 2) / 2) }).map(
                (_, i) => (
                  <div
                    key={`bottom-${table.id}-${i}`}
                    className={`w-7 h-7 rounded-full ${getStatusColor(table.status)} border-2 border-white shadow-sm`}
                  />
                ),
              )}
            </div>
          </div>
        </Draggable>
      ))}
    </div>
  );
};

export default FloorPlan;