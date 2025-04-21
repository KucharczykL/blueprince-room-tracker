import React from 'react';
import { PREDEFINED_ROOMS, COLOR_NAME_TO_VALUE, OUTER_ROOM_ID } from '../constants';

function GridCell({
    cellId,
    roomData,
    currentDay,
    isSelected,
    isFixed,
    fixedText = '',
    fixedLetter = '',
    onClick,
}) {
    const isOuterRoom = cellId === OUTER_ROOM_ID;
    const cellInfo = roomData[cellId]; // Object { days: [], letter: null } or undefined
    const days = cellInfo?.days || [];
    const persistentLetter = cellInfo?.letter || null;

    let selectionToShow = null;
    let roomColorName = null;
    let borderColor = isSelected ? 'border-blue-500' : 'border-gray-400'; // Default/Selected border
    let borderWidth = isSelected ? 'border-2' : 'border';
    let bgColor = 'bg-white hover:bg-gray-100';
    let textColor = 'text-gray-600';

    const entryForCurrentDay = days.find(dayEntry => dayEntry?.day === currentDay);

    if (entryForCurrentDay?.selected) {
        selectionToShow = entryForCurrentDay.selected;
        const predefinedRoom = PREDEFINED_ROOMS.find(r => r.name === selectionToShow);
        roomColorName = predefinedRoom?.color;
        if (roomColorName && COLOR_NAME_TO_VALUE[roomColorName]) {
            // Use inline style for dynamic border color from constants
            borderColor = COLOR_NAME_TO_VALUE[roomColorName];
            borderWidth = 'border-2'; // Make colored border thicker
        }
    }

    // Tooltip logic
    const absoluteLatestDay = days.length > 0 ? [...days].sort((a, b) => b.day - a.day)[0] : null;
    const tooltipSelection = absoluteLatestDay?.selected;
    let tooltipText = isOuterRoom ? "Outer Room" : cellId;
    if (persistentLetter) tooltipText += ` [${persistentLetter}]`;
    if (tooltipSelection) tooltipText += ` (Latest: ${tooltipSelection})`;
    else if (days.length > 0) tooltipText += ` (Latest: None)`;

    // Fixed cell styling
    if (isFixed) {
        bgColor = 'bg-gray-200';
        textColor = 'text-gray-800 font-semibold';
        tooltipText = fixedText; // Override tooltip for fixed
    }

    const borderStyle = {
        borderColor: typeof borderColor === 'string' && borderColor.startsWith('#') ? borderColor : undefined
    };
    const borderClasses = typeof borderColor === 'string' && !borderColor.startsWith('#') ? borderColor : '';


    return (
        <div
            id={cellId}
            className={`flex flex-col items-center justify-center min-h-[60px] p-1 text-center text-xs cursor-pointer transition-colors duration-150 ${borderWidth} ${borderClasses} ${bgColor} ${textColor} rounded shadow-sm`}
            style={borderStyle}
            title={tooltipText}
            onClick={!isFixed ? () => onClick(cellId) : undefined} // Only clickable if not fixed
        >
            {isFixed ? (
                <>
                    <span>{fixedText}</span>
                    {fixedLetter && <span className="font-bold ml-1">{fixedLetter}</span>}
                </>
            ) : selectionToShow || persistentLetter ? (
                <>
                    {selectionToShow && (
                        <span className="cell-room-name font-medium block truncate max-w-full" style={{ fontSize: '0.7rem' }}>
                            {selectionToShow}
                        </span>
                    )}
                    {persistentLetter && (
                        <span className={`cell-letter font-bold ${selectionToShow ? 'mt-1' : ''}`}>
                            {persistentLetter}
                        </span>
                    )}
                </>
            ) : (
                 // Show ID if nothing else to display
                <span className="cell-id-display text-gray-400">{isOuterRoom ? "Outer Room" : cellId}</span>
            )}
        </div>
    );
}

export default GridCell;
