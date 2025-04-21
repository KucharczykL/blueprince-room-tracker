import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    ROWS, COLS, PREDEFINED_ROOMS, OUTER_ROOM_ID, ANTECHAMBER_ID, ENTRANCE_HALL_ID
} from './constants';
import { getCalendarDateForDay } from './utils/dateUtils';
import GridCell from './components/GridCell';
import AddEditDayModal from './components/AddEditDayModal';
import RoomTag from './components/RoomTag'; // For info panel

function App() {
    const [roomData, setRoomData] = useState({}); // { cellId: { days: [], letter: null }, ... }
    const [currentDay, setCurrentDay] = useState(1);
    const [selectedCellId, setSelectedCellId] = useState(null); // RxCx or OuterRoom
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sortMethod, setSortMethod] = useState('predefined'); // 'predefined' or 'alphabetical'

    // --- Data Persistence ---
    useEffect(() => {
        console.log("Attempting to load data...");
        // Load Room Data (with migration)
        const storedRoomData = localStorage.getItem('bluePrinceRoomData');
        let loadedData = {};
        let dataWasMigrated = false;
        let letterMigrationLog = [];

        if (storedRoomData) {
            try {
                let parsedData = JSON.parse(storedRoomData);
                console.log("Raw room data loaded.");
                const migratedData = {};

                for (const cellId in parsedData) {
                    let cellData = parsedData[cellId];
                    let newCellStructure = { days: [], letter: null };
                    let firstLetterFound = null;

                    if (Array.isArray(cellData)) { // Old format: cellId -> array of days
                        dataWasMigrated = true;
                        newCellStructure.days = cellData;
                        for (const dayEntry of newCellStructure.days) {
                            // Migrate offer format (object to string) if needed
                            if (Array.isArray(dayEntry.offered) && dayEntry.offered.length > 0 && typeof dayEntry.offered[0] === 'object' && dayEntry.offered[0]?.hasOwnProperty('name')) {
                                dayEntry.offered = dayEntry.offered.map(offerObj => offerObj?.name).filter(Boolean);
                            }
                            // Find and migrate the first letter
                            if (dayEntry.hasOwnProperty('letter') && dayEntry.letter && firstLetterFound === null) {
                                firstLetterFound = dayEntry.letter.trim().toUpperCase();
                                if (firstLetterFound.length > 1 || (firstLetterFound.length === 1 && !/^[A-Z]$/.test(firstLetterFound))) {
                                    letterMigrationLog.push(`Cell ${cellId}: Found invalid letter '${dayEntry.letter}' on day ${dayEntry.day}. Ignoring.`);
                                    firstLetterFound = null;
                                } else {
                                    newCellStructure.letter = firstLetterFound;
                                    letterMigrationLog.push(`Cell ${cellId}: Migrated letter '${firstLetterFound}' from day ${dayEntry.day}.`);
                                }
                            }
                            delete dayEntry.letter; // Remove from individual day
                        }
                    } else if (typeof cellData === 'object' && cellData !== null && cellData.hasOwnProperty('days')) { // New format: cellId -> { days: [], letter: null }
                        newCellStructure = { ...cellData, days: Array.isArray(cellData.days) ? [...cellData.days] : [] }; // Copy structure
                         // Migrate offer format within existing structure if needed
                        newCellStructure.days.forEach(dayEntry => {
                            if (Array.isArray(dayEntry.offered) && dayEntry.offered.length > 0 && typeof dayEntry.offered[0] === 'object' && dayEntry.offered[0]?.hasOwnProperty('name')) {
                                dayEntry.offered = dayEntry.offered.map(offerObj => offerObj?.name).filter(Boolean);
                                dataWasMigrated = true;
                            }
                             // Ensure letter property doesn't exist on day entries (cleanup)
                            if (dayEntry.hasOwnProperty('letter')) {
                                delete dayEntry.letter;
                                dataWasMigrated = true;
                            }
                        });
                         // Ensure top-level letter property exists
                        if (!newCellStructure.hasOwnProperty('letter')) {
                            newCellStructure.letter = null;
                            dataWasMigrated = true;
                        }
                    } else {
                        console.warn(`Skipping invalid data format for cell ${cellId} during load.`);
                        continue;
                    }
                    migratedData[cellId] = newCellStructure;
                }

                if (dataWasMigrated) {
                    console.log("Data migration performed (structure/offer format/letter).");
                    if (letterMigrationLog.length > 0) {
                        console.log("Letter Migration Details:");
                        letterMigrationLog.forEach(log => console.log(`  - ${log}`));
                    }
                    // Optionally save migrated data back immediately
                    // try { localStorage.setItem('bluePrinceRoomData', JSON.stringify(migratedData)); console.log("Migrated data saved back."); } catch (e) { console.error("Error saving migrated data:", e); }
                }
                loadedData = migratedData;

            } catch (e) {
                console.error("Error parsing or migrating room data:", e);
                loadedData = {};
            }
        } else {
            console.log("No room data found.");
        }
        setRoomData(loadedData);

        // Load Current Day
        const storedDay = localStorage.getItem('bluePrinceCurrentDay');
        if (storedDay) {
            const parsedDay = parseInt(storedDay, 10);
            if (!isNaN(parsedDay) && parsedDay >= 1) {
                setCurrentDay(parsedDay);
                console.log("Current day loaded:", parsedDay);
            }
        }

        // Load Sort Preference
        const storedSortMethod = localStorage.getItem('bluePrinceSortMethod');
        if (storedSortMethod && (storedSortMethod === 'predefined' || storedSortMethod === 'alphabetical')) {
            setSortMethod(storedSortMethod);
            console.log("Sort preference loaded:", storedSortMethod);
        }
        console.log("Initial load complete.");
    }, []); // Run only on mount

    // Save data whenever it changes
    useEffect(() => {
        // Debounce or throttle this if performance becomes an issue with large data
        try {
            // Clean up empty cell data before saving
            const cleanedData = { ...roomData };
            let dataChanged = false;
            for (const cellId in cleanedData) {
                const cell = cleanedData[cellId];
                if ((!cell.days || cell.days.length === 0) && !cell.letter) {
                    delete cleanedData[cellId];
                    dataChanged = true;
                }
            }
            localStorage.setItem('bluePrinceRoomData', JSON.stringify(cleanedData));
            if (dataChanged) console.log("Cleaned and saved room data."); else console.log("Room data saved.");
        } catch (e) {
            console.error("Error saving room data:", e);
            alert("Could not save room data. LocalStorage might be full or unavailable.");
        }
    }, [roomData]);

    useEffect(() => {
        try {
            localStorage.setItem('bluePrinceCurrentDay', currentDay.toString());
            console.log("Current day saved.");
        } catch (e) {
            console.error("Error saving current day:", e);
        }
    }, [currentDay]);

    useEffect(() => {
        try {
            localStorage.setItem('bluePrinceSortMethod', sortMethod);
            console.log("Sort preference saved.");
        } catch (e) {
            console.error("Error saving sort preference:", e);
        }
    }, [sortMethod]);

    // --- Grid Generation ---
    const gridCells = useMemo(() => {
        const cells = [];
        for (let visualRow = 1; visualRow <= ROWS; visualRow++) {
            const rank = ROWS - visualRow + 1;
            for (let c = 1; c <= COLS; c++) {
                const cellId = `R${rank}C${c}`;
                const isFixed = cellId === ANTECHAMBER_ID || cellId === ENTRANCE_HALL_ID;
                let fixedText = '';
                let fixedLetter = '';
                if (cellId === ANTECHAMBER_ID) fixedText = 'Antechamber';
                if (cellId === ENTRANCE_HALL_ID) {
                    fixedText = 'Entrance Hall';
                    fixedLetter = 'F'; // Hardcoded letter for Entrance Hall
                }

                cells.push(
                    <GridCell
                        key={cellId}
                        cellId={cellId}
                        roomData={roomData}
                        currentDay={currentDay}
                        isSelected={selectedCellId === cellId}
                        isFixed={isFixed}
                        fixedText={fixedText}
                        fixedLetter={fixedLetter}
                        onClick={setSelectedCellId}
                    />
                );
            }
        }
        return cells;
    }, [roomData, currentDay, selectedCellId]); // Recalculate only when needed

    // --- Event Handlers ---
    const handleCellClick = useCallback((cellId) => {
        setSelectedCellId(cellId);
    }, []);

    const changeCurrentDay = useCallback((delta) => {
        setCurrentDay(prevDay => Math.max(1, prevDay + delta));
    }, []);

    const handleCurrentDayInputChange = useCallback((e) => {
        const newDay = parseInt(e.target.value, 10);
        if (!isNaN(newDay) && newDay >= 1) {
            setCurrentDay(newDay);
        } else {
            // Optionally provide feedback or reset input
             e.target.value = currentDay; // Reset to current valid day
             alert("Please enter a valid day number (1 or higher).");
        }
    }, [currentDay]); // Include currentDay dependency if resetting input

    const handleOpenModal = useCallback(() => {
        if (selectedCellId) {
            setIsModalOpen(true);
        } else {
            alert("Please select a cell first.");
        }
    }, [selectedCellId]);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const handleSubmitDayData = useCallback((data) => {
        const { cellId, day, offered, selected, letter, editIndex } = data;

        setRoomData(prevData => {
            const newData = { ...prevData };
            // Ensure cell structure exists
            if (!newData[cellId]) {
                newData[cellId] = { days: [], letter: null };
            } else if (!newData[cellId].days) { // Fix if somehow only letter exists
                newData[cellId].days = [];
            }

            // Update persistent letter
            const currentLetter = newData[cellId].letter;
            newData[cellId].letter = letter; // letter is already null if empty

            // Prepare day entry (only if offers/selection exist)
            const hasDayData = offered.length > 0 || selected !== null;
            let dayEntryData = null;
            if (hasDayData) {
                 dayEntryData = { day, offered, selected };
            }

            const daysArray = newData[cellId].days;
            const existingDayIndex = daysArray.findIndex(d => d.day === day); // Find again for safety

            if (dayEntryData) { // We have day-specific data to save/update
                if (existingDayIndex !== -1) {
                    // Update existing entry
                    daysArray[existingDayIndex] = dayEntryData;
                    console.log(`Updated Day ${day} data for ${cellId}`);
                } else {
                    // Add new entry and sort
                    daysArray.push(dayEntryData);
                    daysArray.sort((a, b) => a.day - b.day);
                    console.log(`Added Day ${day} data for ${cellId}`);
                }
            } else { // No day-specific data, potentially remove existing entry if it existed
                 if (existingDayIndex !== -1) {
                     daysArray.splice(existingDayIndex, 1);
                     console.log(`Removed Day ${day} data for ${cellId} as it became empty.`);
                 } else if (currentLetter !== letter) {
                     console.log(`Only updated letter for ${cellId} to ${letter}. No day data for Day ${day}.`);
                 } else {
                     console.log(`No changes for ${cellId} on Day ${day}.`);
                 }
            }

            return newData;
        });

        handleCloseModal(); // Close modal after successful submission
    }, [handleCloseModal]); // Include dependencies

     const handleDeleteDay = useCallback((cellIdToDelete, dayNumberToDelete) => {
        if (confirm(`Are you sure you want to delete Day ${dayNumberToDelete} for cell ${cellIdToDelete}?`)) {
            setRoomData(prevData => {
                const newData = { ...prevData };
                if (newData[cellIdToDelete]?.days) {
                    const dayIndex = newData[cellIdToDelete].days.findIndex(d => d.day === dayNumberToDelete);
                    if (dayIndex !== -1) {
                        newData[cellIdToDelete].days.splice(dayIndex, 1);
                        console.log(`Deleted Day ${dayNumberToDelete} for cell ${cellIdToDelete}`);
                        // If this was the last day and there's no letter, we could clean up the cellId entry entirely,
                        // but the save effect already handles this.
                        return { ...newData }; // Return new object to trigger state update
                    }
                }
                return prevData; // No change needed
            });
            // Info panel will update automatically due to roomData change
        }
    }, []);

    const handleClearAllData = useCallback(() => {
        if (confirm('Are you sure you want to clear ALL logged data for ALL cells (including letters and Outer Room)? This cannot be undone.')) {
            setRoomData({});
            setCurrentDay(1);
            setSelectedCellId(null);
            setIsModalOpen(false); // Close modal if open
            // Keep sort preference
            try { localStorage.removeItem('bluePrinceRoomData'); } catch (e) { console.error("Error clearing room data from storage:", e); }
            // currentDay and sortMethod will be saved by their own useEffects
            alert('All data cleared.');
        }
    }, []);

    // --- Info Panel Data ---
    const selectedCellInfo = useMemo(() => {
        if (!selectedCellId) return null;
        return roomData[selectedCellId] || { days: [], letter: null };
    }, [selectedCellId, roomData]);

    const sortedDaysForInfoPanel = useMemo(() => {
        return selectedCellInfo ? [...selectedCellInfo.days].sort((a, b) => a.day - b.day) : [];
    }, [selectedCellInfo]);

    const frequencyData = useMemo(() => {
        if (!selectedCellInfo || sortedDaysForInfoPanel.length === 0) return null;

        const roomCounts = {};
        let totalOffers = 0;

        sortedDaysForInfoPanel.forEach(dayEntry => {
            if (Array.isArray(dayEntry.offered)) {
                dayEntry.offered.forEach(roomName => {
                    if (roomName && typeof roomName === 'string') {
                        const trimmedRoom = roomName.trim();
                        if (trimmedRoom) {
                            roomCounts[trimmedRoom] = (roomCounts[trimmedRoom] || 0) + 1;
                            totalOffers++;
                        }
                    }
                });
            }
        });

        if (totalOffers === 0) return { totalOffers: 0, sortedRooms: [] };

        const sortedRooms = Object.entries(roomCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .map(([name, count]) => ({
                name,
                count,
                probability: ((count / totalOffers) * 100).toFixed(1),
                details: PREDEFINED_ROOMS.find(r => r.name === name)
            }));

        return { totalOffers, sortedRooms };
    }, [selectedCellInfo, sortedDaysForInfoPanel]);


    // --- Add/Edit Button Logic ---
    const addEditButtonText = useMemo(() => {
        if (!selectedCellId) return 'Add/Edit Day';
        const isEditing = selectedCellInfo?.days.some(d => d.day === currentDay);
        const displayId = selectedCellId === OUTER_ROOM_ID ? "Outer Room" : selectedCellId;
        return isEditing ? `Edit Day ${currentDay}` : `Add Day ${currentDay}`;
    }, [selectedCellId, selectedCellInfo, currentDay]);

    const addEditButtonTitle = useMemo(() => {
         if (!selectedCellId) return 'Select a cell first';
         const isEditing = selectedCellInfo?.days.some(d => d.day === currentDay);
         const displayId = selectedCellId === OUTER_ROOM_ID ? "Outer Room" : selectedCellId;
         return isEditing ? `Edit data for Day ${currentDay} in ${displayId}` : `Add data for Day ${currentDay} to ${displayId}`;
    }, [selectedCellId, selectedCellInfo, currentDay]);


    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-100 font-sans">
            {/* Left Side: Grid and Controls */}
            <div className="flex-grow p-4 overflow-y-auto">
                <h1 className="text-2xl font-bold mb-4 text-center text-blue-800">Quartz Mansion Tracker</h1>

                 {/* Controls Row */}
                 <div className="flex flex-wrap items-center justify-center gap-4 mb-4 p-2 bg-white rounded shadow">
                     {/* Day Navigation */}
                     <div className="flex items-center gap-1">
                         <button onClick={() => changeCurrentDay(-1)} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-lg font-bold">&lt;</button>
                         <input
                             type="number"
                             value={currentDay}
                             onChange={handleCurrentDayInputChange}
                             onBlur={handleCurrentDayInputChange} // Ensure update on blur if value was invalid
                             min="1"
                             className="w-16 p-1 border border-gray-300 rounded text-center"
                             aria-label="Current Day"
                         />
                         <button onClick={() => changeCurrentDay(1)} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-lg font-bold">&gt;</button>
                     </div>
                     {/* Date Display */}
                     <div className="text-center">
                         <span className="text-sm text-gray-600 block">Calendar Date:</span>
                         <span id="current-calendar-date" className="font-semibold">{getCalendarDateForDay(currentDay)}</span>
                     </div>
                     {/* Sort Selector */}
                     <div>
                         <label htmlFor="sort-method-selector" className="text-sm text-gray-600 mr-1">Sort Modal:</label>
                         <select
                             id="sort-method-selector"
                             value={sortMethod}
                             onChange={(e) => setSortMethod(e.target.value)}
                             className="p-1 border border-gray-300 rounded text-sm"
                         >
                             <option value="predefined">Predefined</option>
                             <option value="alphabetical">Alphabetical</option>
                         </select>
                     </div>
                     {/* Clear Data */}
                     <button
                        id="clear-all-data"
                        onClick={handleClearAllData}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm shadow"
                        title="Clear ALL logged data"
                     >
                         Clear All Data
                     </button>
                 </div>


                {/* Mansion Grid */}
                <div
                    id="mansion-grid"
                    className="grid gap-1 mb-4"
                    style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
                >
                    {gridCells}
                </div>

                {/* Outer Room */}
                <div className="mt-4">
                     <h3 className="text-lg font-semibold mb-1 text-center">Outer Area</h3>
                     <GridCell
                        cellId={OUTER_ROOM_ID}
                        roomData={roomData}
                        currentDay={currentDay}
                        isSelected={selectedCellId === OUTER_ROOM_ID}
                        isFixed={false}
                        onClick={handleCellClick}
                     />
                </div>
            </div>

            {/* Right Side: Info Panel */}
            <div className="w-full md:w-1/3 lg:w-1/4 bg-white p-4 shadow-lg overflow-y-auto border-l border-gray-200">
                <h2 className="text-xl font-semibold mb-3 border-b pb-2">Cell Information</h2>
                <div id="cell-info">
                    <div className="mb-3">
                        <strong className="block">Selected Cell:</strong>
                        <span id="selected-cell-id" className="text-blue-700 font-medium">
                            {selectedCellId ? (selectedCellId === OUTER_ROOM_ID ? 'Outer Room' : selectedCellId) : 'None'}
                            {selectedCellInfo?.letter ? ` [${selectedCellInfo.letter}]` : ''}
                        </span>
                    </div>
                     <div className="mb-4">
                         <button
                             id="add-day-button"
                             onClick={handleOpenModal}
                             disabled={!selectedCellId}
                             className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow disabled:bg-gray-400 disabled:cursor-not-allowed"
                             title={addEditButtonTitle}
                         >
                             {addEditButtonText}
                         </button>
                     </div>
                    <div className="mb-3">
                        <strong>Logged Days:</strong> <span id="day-count">{selectedCellInfo?.days.length ?? 0}</span>
                    </div>

                    {/* Day List */}
                    <div className="mb-4 max-h-60 overflow-y-auto border rounded p-2 bg-gray-50">
                        <h4 className="font-semibold text-sm mb-1">Day Details:</h4>
                        <ul id="day-list" className="list-none pl-0 text-sm space-y-2">
                            {sortedDaysForInfoPanel.length > 0 ? (
                                sortedDaysForInfoPanel.map(dayEntry => (
                                    <li key={dayEntry.day} className={`border-b pb-1 ${dayEntry.day === currentDay ? 'bg-yellow-100 rounded px-1' : ''}`}>
                                        <div className="flex justify-between items-center mb-1">
                                            <strong className="text-xs">Day {dayEntry.day}</strong>
                                            <button
                                                onClick={() => handleDeleteDay(selectedCellId, dayEntry.day)}
                                                className="text-red-500 hover:text-red-700 text-xs px-1"
                                                title={`Delete Day ${dayEntry.day}`}
                                            >
                                                ❌
                                            </button>
                                        </div>
                                        <div className="text-xs">
                                            <span className="font-medium">Offered:</span>
                                            {dayEntry.offered && dayEntry.offered.length > 0 ? (
                                                dayEntry.offered.map(offerName => {
                                                     const room = PREDEFINED_ROOMS.find(r => r.name === offerName);
                                                     return (
                                                         <RoomTag
                                                             key={offerName}
                                                             roomName={offerName}
                                                             roomColorName={room?.color}
                                                             className={`text-[0.65rem] py-0.5 ${dayEntry.selected === offerName ? 'ring-1 ring-green-500' : ''}`}
                                                         />
                                                     );
                                                })
                                            ) : (
                                                <span className="text-gray-500 italic ml-1">None</span>
                                            )}
                                        </div>
                                         <div className="text-xs mt-1">
                                             <span className="font-medium">Selected:</span>
                                             <span className="ml-1 font-semibold">{dayEntry.selected || 'None'}</span>
                                         </div>
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-500 italic">No data logged for this cell.</li>
                            )}
                        </ul>
                    </div>

                    {/* Frequency List */}
                    <div>
                        <h4 className="font-semibold text-sm mb-1">Offer Frequency:</h4>
                        <ul id="frequency-list" className="list-none pl-0 text-sm space-y-1">
                            {frequencyData && frequencyData.totalOffers > 0 ? (
                                frequencyData.sortedRooms.map(item => (
                                    <li key={item.name} className="flex items-center justify-between text-xs border-b pb-0.5">
                                         <RoomTag
                                             roomName={item.name}
                                             roomColorName={item.details?.color}
                                             className="text-[0.65rem] py-0.5"
                                         />
                                        <span className="frequency-text ml-2 whitespace-nowrap">
                                            {item.count} ({item.probability}%)
                                        </span>
                                    </li>
                                ))
                            ) : selectedCellInfo && selectedCellInfo.days.length > 0 ? (
                                <li className="text-gray-500 italic">No valid room offers logged.</li>
                            ) : (
                                 <li className="text-gray-500 italic">No data logged.</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AddEditDayModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmitDayData}
                cellId={selectedCellId}
                currentDay={currentDay}
                roomData={roomData}
                sortMethod={sortMethod}
            />
        </div>
    );
}

export default App;

