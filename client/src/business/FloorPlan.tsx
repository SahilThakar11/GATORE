import React from 'react';
import Draggable from 'react-draggable';

const FloorPlan = () => {
    const nodeRef = React.useRef(null);

    return (
        <div className="h-96 bg-gray-100 rounded" style={{ position: 'relative' }}>
            <h1>Floor Plan</h1>
            <Draggable bounds="parent" nodeRef={nodeRef}>
                <div 
                    ref={nodeRef}
                    style={{
                        width: '200px',
                        padding: '20px',
                        background: 'lightblue',
                        textAlign: 'center',
                        cursor: 'move',
                        border: '1px solid black'
                    }}
                >
                    Drag Me! (e.g., a table or chair icon)
                </div>
            </Draggable>
        </div>
    );
};

export default FloorPlan;