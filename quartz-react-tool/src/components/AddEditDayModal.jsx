// src/components/AddEditDayModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { PREDEFINED_ROOMS, OUTER_ROOM_ID } from '../constants';
import RoomCell from './RoomCell';

// Define localStorage key constant
const SORT_METHOD_STORAGE_KEY = 'bluePrinceSortMethod';

function AddEditDayModal({
    isOpen,
    onClose,
    onSubmit,
    cellId,
    currentDay,
    initialCellData, // Renamed prop: Contains { days: [], letter: 'A' | null } or null
}) {
    // State for day-specific data
    const [currentOffers, setCurrentOffers] = useState([]);
    const [finalSelection, setFinalSelection] = useState(null);

    // State for cell-persistent data (letter only)
    const [letter, setLetter] = useState(''); // Player assigned letter for display

    // Other state
    const [editIndex, setEditIndex] = useState(-1); // Index of the day being edited, if any
    const [sortMethod, setSortMethod] = useState(() => {
        const storedSortMethod = localStorage.getItem(SORT_METHOD_STORAGE_KEY);
        return (storedSortMethod && (storedSortMethod === 'predefined' || storedSortMethod === 'alphabetical'))
            ? storedSortMethod
            : 'predefined';
    });

    const isOuterRoom = cellId === OUTER_ROOM_ID;
    const displayId = isOuterRoom ? "Outer Room" : cellId;

    // Effect to load/reset modal state
    useEffect(() => {
        if (isOpen && cellId) {
            // Use the initialCellData passed from App
            const cellData = initialCellData || { days: [], letter: null };
            const existingDayIndex = cellData.days.findIndex(d => d.day === currentDay);
            const existingDayData = existingDayIndex !== -1 ? cellData.days[existingDayIndex] : null;

            // Load cell-persistent data (letter only)
            setLetter(cellData.letter || ''); // Load existing letter

            // Load day-specific data
            setEditIndex(existingDayIndex);
            if (existingDayData) {
                setCurrentOffers(existingDayData.offered || []);
                setFinalSelection(existingDayData.selected);
            } else {
                setCurrentOffers([]);
                setFinalSelection(null);
            }
        } else {
            // Reset fields when closed or cellId is missing
            setCurrentOffers([]);
            setFinalSelection(null);
            setLetter('');
            setEditIndex(-1);
        }
    }, [isOpen, cellId, currentDay, initialCellData]); // Use initialCellData in dependency

    // Effect to save sortMethod to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(SORT_METHOD_STORAGE_KEY, sortMethod);
        } catch (e) {
            console.error("Error saving modal sort preference:", e);
        }
    }, [sortMethod]);


    const availableRoomsForOffers = useMemo(() => {
        let rooms = [...PREDEFINED_ROOMS];
        if (isOuterRoom) {
            rooms = rooms.filter(room => room.extra_data?.some(ed => ed.outer === true));
        }
        if (sortMethod === 'alphabetical') {
            rooms.sort((a, b) => a.name.localeCompare(b.name));
        }
        return rooms;
    }, [isOuterRoom, sortMethod]);

    // No longer need allRoomsForAssignment

    const handleRoomSelectionToggle = (roomName) => {
        setCurrentOffers(prevOffers => {
            const isSelected = prevOffers.includes(roomName);
            const newOffers = isSelected
                ? prevOffers.filter(name => name !== roomName)
                : [...prevOffers, roomName];
            if (isSelected && finalSelection === roomName) {
                setFinalSelection(null);
            }
            return newOffers;
        });
    };

    const handleFinalSelection = (roomName) => {
        setFinalSelection(roomName);
    };

    const handleLetterChange = (e) => {
        let value = e.target.value.toUpperCase();
        if (value.length <= 1 && /^[A-Z]?$/.test(value)) {
            setLetter(value);
        }
    };

    // Removed handleAssignedRoomChange

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalLetter = letter.trim() || null;
        // finalAssignedRoomName is removed

        // Validation
        if (finalSelection !== null && !currentOffers.includes(finalSelection)) {
            alert("The final selected room is not one of the chosen offers. Please re-select the final choice or add the room to the offers.");
            return;
        }

        // Pass only relevant data back
        onSubmit({
            cellId,
            day: currentDay,
            offered: currentOffers,
            selected: finalSelection,
            letter: finalLetter,
            // assignedRoomName removed
        });
    };

    if (!isOpen) return null;

    const offeredRoomDetails = currentOffers
        .map(name => PREDEFINED_ROOMS.find(r => r.name === name))
        .filter(Boolean);

    const modalCellSizeClass = "w-[60px] h-[60px] text-[9px] p-1";

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            {/* Modal Content Box */}
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-7xl max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-semibold">
                        {editIndex !== -1 ? 'Edit' : 'Log'} Day {currentDay} for Cell: {displayId}
                        {/* Display only current letter from state */}
                        {letter ? ` [${letter}]` : ''}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0">
                    {/* Top inputs section - Only Letter Input */}
                    <div className="flex-shrink-0 border-b pb-4 mb-4">
                        {/* Removed Cell Identity heading */}
                        {/* Removed grid layout */}
                        {/* Letter Input */}
                        <div>
                            <label htmlFor="day-letter-input" className="block text-sm font-medium text-gray-700 mb-1">
                                Display Letter (Optional, A-Z)
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
                        {/* Removed Assigned Room Name Dropdown */}
                    </div>

                    {/* Day Specific Data Section */}
                    <div className="flex flex-col flex-grow min-h-0">
                        <h3 className="text-lg font-medium mb-2 text-gray-800">Day {currentDay} Offers & Selection</h3>
                        {/* Sort Selector */}
                        <div className="mb-3 text-right flex-shrink-0">
                            <label htmlFor="modal-sort-selector" className="text-sm text-gray-600 mr-1">Sort Offers by:</label>
                            <select
                                id="modal-sort-selector"
                                value={sortMethod}
                                onChange={(e) => setSortMethod(e.target.value)}
                                className="p-1 border border-gray-300 rounded text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="predefined">Predefined</option>
                                <option value="alphabetical">Alphabetical</option>
                            </select>
                        </div>

                        {/* Room Selector Grid Section (Offers) */}
                        <div className="mb-4 flex flex-col flex-grow min-h-0">
                            <h4 className="text-md font-medium mb-2 flex-shrink-0">Available Room Offers (for Day {currentDay})</h4>
                            <div className="grid grid-cols-[repeat(auto-fit,minmax(60px,1fr))] gap-2 border p-2 rounded overflow-y-auto flex-grow">
                                {availableRoomsForOffers.map(room => {
                                    const isSelected = currentOffers.includes(room.name);
                                    return (
                                        <RoomCell
                                            key={room.name}
                                            roomName={room.name}
                                            roomColor={room.color} // Pass NAME
                                            isSelectedInModal={isSelected}
                                            onClick={() => handleRoomSelectionToggle(room.name)}
                                            className={modalCellSizeClass}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        {/* Chosen Offers & Final Selection */}
                        <div className="mb-6 flex-shrink-0">
                            <h4 className="text-md font-medium mb-2">Choose Final Selection (for Day {currentDay})</h4>
                            <div className="flex flex-wrap items-center gap-2 border p-2 rounded bg-gray-50 min-h-[70px]">
                                <RoomCell
                                    isNoneOption={true}
                                    isSelectedInModal={finalSelection === null}
                                    onClick={() => handleFinalSelection(null)}
                                    className={modalCellSizeClass}
                                />
                                {offeredRoomDetails.length === 0 && finalSelection !== null && (
                                    <em className="text-gray-500 text-sm">Select offers from grid above.</em>
                                )}
                                {offeredRoomDetails.map(offer => (
                                    <RoomCell
                                        key={offer.name}
                                        roomName={offer.name}
                                        roomColor={offer.color} // Pass NAME
                                        isFinalSelection={finalSelection === offer.name}
                                        onClick={() => handleFinalSelection(offer.name)}
                                        className={`${modalCellSizeClass} cursor-pointer`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end flex-shrink-0 border-t pt-4">
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
                            {editIndex !== -1 ? 'Update Day & Cell Letter' : 'Log Day & Cell Letter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddEditDayModal;
