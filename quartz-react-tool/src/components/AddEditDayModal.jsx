import React, { useState, useEffect, useMemo } from 'react';
import { PREDEFINED_ROOMS, COLOR_NAME_TO_VALUE, OUTER_ROOM_ID } from '../constants';
import RoomTag from './RoomTag';

function AddEditDayModal({
    isOpen,
    onClose,
    onSubmit,
    cellId,
    currentDay,
    roomData,
    sortMethod,
}) {
    const [currentOffers, setCurrentOffers] = useState([]); // Array of room *names*
    const [finalSelection, setFinalSelection] = useState(null); // Room name or null
    const [letter, setLetter] = useState('');
    const [editIndex, setEditIndex] = useState(-1); // Store index if editing

    const isOuterRoom = cellId === OUTER_ROOM_ID;
    const displayId = isOuterRoom ? "Outer Room" : cellId;
    const cellInfo = roomData[cellId] || { days: [], letter: null };

    // Effect to reset state when modal opens or cellId/currentDay changes
    useEffect(() => {
        if (isOpen && cellId) {
            const existingDayIndex = cellInfo.days.findIndex(d => d.day === currentDay);
            const existingDayData = existingDayIndex !== -1 ? cellInfo.days[existingDayIndex] : null;

            setLetter(cellInfo.letter || '');
            setEditIndex(existingDayIndex);

            if (existingDayData) {
                // Edit mode
                setCurrentOffers(existingDayData.offered || []);
                setFinalSelection(existingDayData.selected);
            } else {
                // Add mode
                setCurrentOffers([]);
                setFinalSelection(null);
            }
        } else {
            // Reset when closed
            setCurrentOffers([]);
            setFinalSelection(null);
            setLetter('');
            setEditIndex(-1);
        }
    }, [isOpen, cellId, currentDay, roomData]); // Rerun if these change while open

    // Filter and Sort Rooms for Selector Grid
    const availableRooms = useMemo(() => {
        let rooms = [...PREDEFINED_ROOMS];
        if (isOuterRoom) {
            rooms = rooms.filter(room => room.extra_data?.some(ed => ed.outer === true));
        }
        if (sortMethod === 'alphabetical') {
            rooms.sort((a, b) => a.name.localeCompare(b.name));
        }
        // else 'predefined' order is maintained (within filter)
        return rooms;
    }, [isOuterRoom, sortMethod]);

    const handleRoomSelectionToggle = (roomName) => {
        setCurrentOffers(prevOffers => {
            const isSelected = prevOffers.includes(roomName);
            const newOffers = isSelected
                ? prevOffers.filter(name => name !== roomName)
                : [...prevOffers, roomName];

            // If the final selection was just removed from offers, reset it
            if (isSelected && finalSelection === roomName) {
                setFinalSelection(null);
            }
            return newOffers;
        });
    };

    const handleFinalSelection = (roomName) => {
        setFinalSelection(roomName); // roomName can be null for 'None'
    };

    const handleLetterChange = (e) => {
        let value = e.target.value.toUpperCase();
        // Allow only single A-Z or empty
        if (value.length <= 1 && /^[A-Z]?$/.test(value)) {
            setLetter(value);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalLetter = letter.trim() || null;

        // Validation
        if (finalSelection !== null && !currentOffers.includes(finalSelection)) {
            alert("The final selected room is not one of the chosen offers. Please re-select the final choice or add the room to the offers.");
            return;
        }

        onSubmit({
            cellId,
            day: currentDay,
            offered: currentOffers,
            selected: finalSelection,
            letter: finalLetter,
            editIndex: editIndex, // Pass index back for potential update/overwrite logic
        });
        // onClose(); // Usually called by parent after successful submit
    };

    if (!isOpen) return null;

    const offeredRoomDetails = currentOffers
        .map(name => PREDEFINED_ROOMS.find(r => r.name === name))
        .filter(Boolean); // Get full details for display

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                        {editIndex !== -1 ? 'Edit' : 'Log'} Day {currentDay} for Cell: {displayId}
                        {cellInfo.letter && ` [${cellInfo.letter}]`}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Letter Input */}
                    <div className="mb-4">
                        <label htmlFor="day-letter-input" className="block text-sm font-medium text-gray-700 mb-1">
                            Associated Letter (Optional, Single A-Z)
                        </label>
                        <input
                            type="text"
                            id="day-letter-input"
                            value={letter}
                            onChange={handleLetterChange}
                            maxLength="1"
                            className="w-20 p-2 border border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g., A"
                        />
                    </div>

                    {/* Room Selector Grid */}
                    <div className="mb-4">
                        <h3 className="text-lg font-medium mb-2">Available Room Offers</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 max-h-60 overflow-y-auto border p-2 rounded">
                            {availableRooms.map(room => {
                                const isSelected = currentOffers.includes(room.name);
                                const colorValue = COLOR_NAME_TO_VALUE[room.color] || '#ccc';
                                return (
                                    <button
                                        key={room.name}
                                        type="button" // Prevent form submission
                                        onClick={() => handleRoomSelectionToggle(room.name)}
                                        className={`p-2 text-xs rounded border-2 transition-all ${isSelected ? 'ring-2 ring-offset-1 ring-blue-500 bg-blue-100' : 'hover:bg-gray-100'}`}
                                        style={{ borderColor: colorValue }}
                                        title={room.name}
                                    >
                                        {room.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Chosen Offers & Final Selection */}
                    <div className="mb-6">
                        <h3 className="text-lg font-medium mb-2">Choose Final Selection</h3>
                        <div className="flex flex-wrap items-center gap-2 border p-2 rounded bg-gray-50 min-h-[40px]">
                            <button
                                type="button"
                                onClick={() => handleFinalSelection(null)}
                                className={`px-3 py-1 text-sm rounded border border-gray-400 ${finalSelection === null ? 'bg-green-200 ring-2 ring-green-500' : 'bg-white hover:bg-gray-100'}`}
                            >
                                None
                            </button>
                            {offeredRoomDetails.length === 0 && finalSelection !== null && (
                                <em className="text-gray-500 text-sm">Select offers from grid above.</em>
                            )}
                            {offeredRoomDetails.map(offer => (
                                <RoomTag
                                    key={offer.name}
                                    roomName={offer.name}
                                    roomColorName={offer.color}
                                    onClick={() => handleFinalSelection(offer.name)}
                                    className={`cursor-pointer transition-all ${finalSelection === offer.name ? 'ring-2 ring-offset-1 ring-green-500 scale-105' : 'hover:opacity-80'}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="mr-2 px-4 py-2 border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {editIndex !== -1 ? 'Update Day' : 'Log This Day'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddEditDayModal;
