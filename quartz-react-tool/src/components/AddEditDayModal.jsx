import React, { useState, useEffect, useMemo } from 'react';
import { PREDEFINED_ROOMS, COLOR_NAME_TO_VALUE, OUTER_ROOM_ID } from '../constants';
import RoomCell from './RoomCell';

// Define localStorage key constant
const SORT_METHOD_STORAGE_KEY = 'bluePrinceSortMethod';

function AddEditDayModal({
    isOpen,
    onClose,
    onSubmit,
    cellId,
    currentDay,
    roomData,
}) {
    const [currentOffers, setCurrentOffers] = useState([]);
    const [finalSelection, setFinalSelection] = useState(null);
    const [letter, setLetter] = useState('');
    const [editIndex, setEditIndex] = useState(-1);
    // Initialize sortMethod from localStorage or default
    const [sortMethod, setSortMethod] = useState(() => {
        const storedSortMethod = localStorage.getItem(SORT_METHOD_STORAGE_KEY);
        return (storedSortMethod && (storedSortMethod === 'predefined' || storedSortMethod === 'alphabetical'))
            ? storedSortMethod
            : 'predefined'; // Default value
    });

    const isOuterRoom = cellId === OUTER_ROOM_ID;
    const displayId = isOuterRoom ? "Outer Room" : cellId;
    const cellInfo = (cellId && roomData[cellId]) || { days: [], letter: null };

    // Effect to load/reset modal state
    useEffect(() => {
        if (isOpen && cellId) {
            const currentCellInfo = roomData[cellId] || { days: [], letter: null };
            const existingDayIndex = currentCellInfo.days.findIndex(d => d.day === currentDay);
            const existingDayData = existingDayIndex !== -1 ? currentCellInfo.days[existingDayIndex] : null;

            setLetter(currentCellInfo.letter || '');
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
    }, [isOpen, cellId, currentDay, roomData]);

    // Effect to save sortMethod to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(SORT_METHOD_STORAGE_KEY, sortMethod);
            console.log("Modal sort preference saved:", sortMethod);
        } catch (e) {
            console.error("Error saving modal sort preference:", e);
        }
    }, [sortMethod]);


    const availableRooms = useMemo(() => {
        let rooms = [...PREDEFINED_ROOMS];
        if (isOuterRoom) {
            rooms = rooms.filter(room => room.extra_data?.some(ed => ed.outer === true));
        }
        if (sortMethod === 'alphabetical') {
            rooms.sort((a, b) => a.name.localeCompare(b.name));
        }
        return rooms;
    }, [isOuterRoom, sortMethod]);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalLetter = letter.trim() || null;
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
                        {cellInfo.letter && ` [${cellInfo.letter}]`}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0">
                    {/* Top inputs section */}
                    <div className="flex-shrink-0">
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
                        {/* Sort Selector */}
                        <div className="mb-3 text-right">
                            <label htmlFor="modal-sort-selector" className="text-sm text-gray-600 mr-1">Sort by:</label>
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
                    </div>

                    {/* Room Selector Grid Section */}
                    <div className="mb-4 flex flex-col flex-grow min-h-0">
                        <h3 className="text-lg font-medium mb-2 flex-shrink-0">Available Room Offers</h3>
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(60px,1fr))] gap-2 border p-2 rounded overflow-y-auto flex-grow">
                            {availableRooms.map(room => {
                                const isSelected = currentOffers.includes(room.name);
                                const colorValue = COLOR_NAME_TO_VALUE[room.color] || '#FFFFFF';
                                return (
                                    <RoomCell
                                        key={room.name}
                                        roomName={room.name}
                                        roomColor={colorValue}
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
                        <h3 className="text-lg font-medium mb-2">Choose Final Selection</h3>
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
                                    roomColor={COLOR_NAME_TO_VALUE[offer.color] || '#FFFFFF'}
                                    isFinalSelection={finalSelection === offer.name}
                                    onClick={() => handleFinalSelection(offer.name)}
                                    className={`${modalCellSizeClass} cursor-pointer`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end flex-shrink-0">
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
