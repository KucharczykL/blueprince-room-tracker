import React from 'react';
import { COLOR_NAME_TO_VALUE } from '../constants';

function RoomTag({ roomName, roomColorName, className = '', onClick, ...props }) {
    const colorValue = roomColorName ? COLOR_NAME_TO_VALUE[roomColorName] : null;
    const style = colorValue ? { borderColor: colorValue, borderWidth: '2px', borderStyle: 'solid' } : {};

    return (
        <div
            className={`px-2 py-1 text-xs rounded border border-gray-300 inline-block m-1 ${className}`}
            style={style}
            title={roomName}
            onClick={onClick}
            {...props}
        >
            {roomName}
        </div>
    );
}

export default RoomTag;
