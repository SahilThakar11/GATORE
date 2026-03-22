import React from 'react';
import Draggable from 'react-draggable';

const tables = [
    { id: 1, name: '1', size: 6, status: 'Available'},
    { id: 2, name: '2', size: 6, status: 'Reserved'},
    { id: 3, name: '3', size: 4, status: 'Occupied'},
    { id: 4, name: '4', size: 2, status: 'Out of Service'},
    { id: 5, name: '5', size: 8, status: 'Available'},
]

const getStatusColor = (status: string) => {
        switch (status) {
            case "Available":
                return "bg-blue-500";
            case "Reserved":
                return "bg-teal-500";
            case "Occupied":
                return "bg-purple-500";
            case "Out of Service":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

const FloorPlan = ({ isEditable }: { isEditable: boolean }) => {
    const nodeRef = React.useRef(null);

    return (
        <div className="h-115 bg-gray-100 rounded" style={{ position: 'relative' }}>
            {tables.map((table) => (
                <Draggable bounds="parent" nodeRef={nodeRef} disabled={!isEditable}>
                    <div ref={nodeRef} className='w-38 h-38' style={{ position: 'absolute'}}>
                        <div className={`w-full gap-2 flex items-center justify-center rounded`}>
                            {Array.from({length: ((table.size -2) / 2)}).map(() => (
                                <div className={`w-7 h-7 rounded-full ${getStatusColor(table.status)}`}></div>
                            ))}
                        </div>
                        <div className={`w-full p-2 gap-2 flex items-center justify-center rounded`}>
                            <div className={`w-7 h-7 rounded-full ${getStatusColor(table.status)}`}></div>
                            <div className={`w-20 h-20 rounded-xl ${getStatusColor(table.status)} flex items-center justify-center`}>
                                <div className='w-10 h-10 rounded-full bg-white flex items-center justify-center text-sm font-bold'>
                                    {table.name}
                                </div>
                            </div>
                            <div className={`w-7 h-7 rounded-full ${getStatusColor(table.status)}`}></div>
                        </div>
                        <div className={`w-full gap-2 flex items-center justify-center rounded`}>
                            {Array.from({length: (table.size -2) / 2}).map(() => (
                                <div className={`w-7 h-7 rounded-full ${getStatusColor(table.status)}`}></div>
                            ))}
                        </div>
                    </div>
                </Draggable>
            ))}
        </div>
    );
};

export default FloorPlan;