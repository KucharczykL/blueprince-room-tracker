// src/components/AddEditDayModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { PREDEFINED_ROOMS, OUTER_ROOM_ID } from '../constants';
import RoomCell from './RoomCell'; // Correct path

// Define localStorage key constant
const SORT_METHOD_STORAGE_KEY = 'bluePrinceSortMethod';

function AddEditDayModal({
    isOpen,
    onClose,
    onSubmit,
    cellId,
    currentDay,
    roomData, // Contains { cellId: { days: [], letter: 'A', assignedRoomName: 'Spare Room' }, ... }
}) {
    // State for day-specific data
    const [currentOffers, setCurrentOffers] = useState([]);
    const [finalSelection, setFinalSelection] = useState(null);

    // State for cell-persistent data
    const [assignedRoomName, setAssignedRoomName] = useState(''); // NEW: Holds the primary room name for the cell
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
            // Get the specific cell's data from the passed roomData prop
            const currentCellData = roomData[cellId] || { days: [], letter: null, assignedRoomName: null };
            const existingDayIndex = currentCellData.days.findIndex(d => d.day === currentDay);
            const existingDayData = existingDayIndex !== -1 ? currentCellData.days[existingDayIndex] : null;

            // Load cell-persistent data
            setAssignedRoomName(currentCellData.assignedRoomName || ''); // Load existing name or empty string for dropdown
            setLetter(currentCellData.letter || ''); // Load existing letter

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
            setAssignedRoomName(''); // Reset assigned name
            setEditIndex(-1);
        }
    }, [isOpen, cellId, currentDay, roomData]); // Dependencies

    // Effect to save sortMethod to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(SORT_METHOD_STORAGE_KEY, sortMethod);
        } catch (e) {
            console.error("Error saving modal sort preference:", e);
        }
    }, [sortMethod]);


    const availableRoomsForOffers = useMemo(() => {
        // Filter rooms available for daily offers (e.g., outer rooms only if applicable)
        let rooms = [...PREDEFINED_ROOMS];
        if (isOuterRoom) {
            rooms = rooms.filter(room => room.extra_data?.some(ed => ed.outer === true));
        }
        // Apply sorting for the offer grid
        if (sortMethod === 'alphabetical') {
            rooms.sort((a, b) => a.name.localeCompare(b.name));
        }
        return rooms;
    }, [isOuterRoom, sortMethod]);

    // List of rooms for the primary assignment dropdown (usually all rooms)
    const allRoomsForAssignment = useMemo(() => {
        // Typically includes all rooms, maybe sorted alphabetically
        return [...PREDEFINED_ROOMS].sort((a, b) => a.name.localeCompare(b.name));
    }, []); // Doesn't depend on outer room status usually

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

    const handleAssignedRoomChange = (e) => {
        setAssignedRoomName(e.target.value); // Update state from dropdown
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalLetter = letter.trim() || null;
        const finalAssignedRoomName = assignedRoomName || null; // Ensure null if empty

        // Validation
        if (finalSelection !== null && !currentOffers.includes(finalSelection)) {
            alert("The final selected room is not one of the chosen offers. Please re-select the final choice or add the room to the offers.");
            return;
        }
        // Optional: Validate if assignedRoomName is selected if letter is present?
        // if (finalLetter && !finalAssignedRoomName) {
        //     alert("If assigning a letter, please also select the primary room for this cell.");
        //     return;
        // }

        // Pass all relevant data back
        onSubmit({
            cellId,
            day: currentDay,
            offered: currentOffers,
            selected: finalSelection,
            letter: finalLetter,
            assignedRoomName: finalAssignedRoomName, // Include assigned name
        });
    };

    if (!isOpen) return null;

    const offeredRoomDetails = currentOffers
        .map(name => PREDEFINED_ROOMS.find(r => r.name === name))
        .filter(Boolean);

    // Modal cells can still be smaller if desired
    const modalCellSizeClass = "w-[60px] h-[60px] text-[9px] p-1";

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            {/* Modal Content Box */}
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-7xl max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-semibold">
                        {editIndex !== -1 ? 'Edit' : 'Log'} Day {currentDay} for Cell: {displayId}
                        {/* Display current assigned name/letter from state */}
                        {assignedRoomName ? ` (${assignedRoomName})` : ''}
                        {letter ? ` [${letter}]` : ''}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0">
                    {/* Top inputs section - Cell Persistent Data */}
                    <div className="flex-shrink-0 border-b pb-4 mb-4">
                        <h3 className="text-lg font-medium mb-2 text-gray-800">Cell Identity</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Assigned Room Name Dropdown */}
                            <div>
                                <label htmlFor="assigned-room-select" className="block text-sm font-medium text-gray-700 mb-1">
                                    Primary Room for this Cell (Optional)
                                </label>
                                <select
                                    id="assigned-room-select"
                                    value={assignedRoomName}
                                    onChange={handleAssignedRoomChange}
                                    className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                >
                                    <option value="">-- Select Room --</option>
                                    {allRoomsForAssignment.map(room => (
                                        <option key={room.name} value={room.name}>
                                            {room.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
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
                        </div>
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
                                            className={modalCellSizeClass} // Apply modal-specific size
                                            // displayLetter={null} // Not relevant for offers grid
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
                                    className={modalCellSizeClass} // Apply modal-specific size
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
                                        className={`${modalCellSizeClass} cursor-pointer`} // Apply modal-specific size
                                        // displayLetter={null} // Not relevant for final selection display
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
                            {editIndex !== -1 ? 'Update Day & Cell' : 'Log Day & Cell'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddEditDayModal;
