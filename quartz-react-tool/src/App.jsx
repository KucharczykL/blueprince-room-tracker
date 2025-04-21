// src/App.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    ROWS, COLS, PREDEFINED_ROOMS, OUTER_ROOM_ID, ANTECHAMBER_ID, ENTRANCE_HALL_ID
} from './constants';
import { getCalendarDateForDay } from './utils/dateUtils';
import RoomCell from './components/RoomCell';
import AddEditDayModal from './components/AddEditDayModal';

function App() {
    // Structure: { cellId: { days: [], letter: 'A' | null, assignedRoomName: 'Spare Room' | null }, ... }
    const [roomData, setRoomData] = useState({});
    const [currentDay, setCurrentDay] = useState(1);
    const [selectedCellId, setSelectedCellId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- Data Persistence ---
    useEffect(() => {
        console.log("--- Starting Data Load ---"); // 1. Check if this runs

        const storedRoomData = localStorage.getItem('bluePrinceRoomData');
        console.log("1. Raw data from localStorage:", storedRoomData); // 2. See what's actually stored

        let loadedData = {};
        let dataWasMigrated = false;
        let migrationLog = [];

        if (storedRoomData) {
            try {
                let parsedData = JSON.parse(storedRoomData);
                console.log("2. Parsed data:", parsedData); // 3. See if parsing worked

                const migratedData = {};

                let processedCells = 0;
                for (const cellId in parsedData) {
                    processedCells++;
                    console.log(`3a. Processing cell: ${cellId}`); // 4. Check if loop runs
                    let cellData = parsedData[cellId];
                    // Initialize with default structure
                    let newCellStructure = { days: [], letter: null, assignedRoomName: null };

                    // --- *** START FIX: Correctly copy/migrate data *** ---
                    if (Array.isArray(cellData)) { // --- Handle Old format: cellId -> array of days ---
                        dataWasMigrated = true;
                        newCellStructure.days = cellData; // Copy the days array
                        let firstLetterFound = null;
                        migrationLog.push(`Cell ${cellId}: Migrating from old array format.`);
                        for (const dayEntry of newCellStructure.days) {
                            // Migrate offer format if needed
                            if (Array.isArray(dayEntry.offered) && dayEntry.offered.length > 0 && typeof dayEntry.offered[0] === 'object' && dayEntry.offered[0]?.hasOwnProperty('name')) {
                                dayEntry.offered = dayEntry.offered.map(offerObj => offerObj?.name).filter(Boolean);
                            }
                            // Find and migrate the first letter (but DO NOT infer name from it)
                            if (dayEntry.hasOwnProperty('letter') && dayEntry.letter && firstLetterFound === null) {
                                firstLetterFound = dayEntry.letter.trim().toUpperCase();
                                if (firstLetterFound.length > 1 || (firstLetterFound.length === 1 && !/^[A-Z]$/.test(firstLetterFound))) {
                                    migrationLog.push(`  - Found invalid letter '${dayEntry.letter}' on day ${dayEntry.day}. Ignoring.`);
                                    firstLetterFound = null;
                                } else {
                                    newCellStructure.letter = firstLetterFound; // Assign found letter
                                    migrationLog.push(`  - Migrated letter '${firstLetterFound}' from day ${dayEntry.day}.`);
                                }
                            }
                            delete dayEntry.letter; // Remove from individual day
                        }
                        // assignedRoomName remains null for old format, needs user update
                    } else if (typeof cellData === 'object' && cellData !== null) { // --- Handle New format: cellId -> object ---
                        // Copy existing data, ensuring all props exist and are initialized if missing
                        newCellStructure = {
                            days: Array.isArray(cellData.days) ? [...cellData.days] : [], // Copy days safely
                            letter: cellData.letter || null, // Copy letter or null
                            assignedRoomName: cellData.assignedRoomName || null // Copy name or null
                        };

                        // Check if migration needed within the object structure
                        let internalMigration = false;
                        // Migrate offer format within existing structure if needed
                        newCellStructure.days.forEach(dayEntry => {
                            if (Array.isArray(dayEntry.offered) && dayEntry.offered.length > 0 && typeof dayEntry.offered[0] === 'object' && dayEntry.offered[0]?.hasOwnProperty('name')) {
                                dayEntry.offered = dayEntry.offered.map(offerObj => offerObj?.name).filter(Boolean);
                                internalMigration = true;
                            }
                            // Ensure letter property doesn't exist on day entries (cleanup)
                            if (dayEntry.hasOwnProperty('letter')) {
                                delete dayEntry.letter;
                                internalMigration = true;
                            }
                        });
                        // Ensure letter and assignedRoomName properties exist even if null
                         if (!cellData.hasOwnProperty('letter')) {
                             newCellStructure.letter = null; // Ensure property exists
                             internalMigration = true;
                         }
                         if (!cellData.hasOwnProperty('assignedRoomName')) {
                             newCellStructure.assignedRoomName = null; // Ensure property exists
                             internalMigration = true;
                             migrationLog.push(`Cell ${cellId}: Added missing assignedRoomName property (as null).`);
                         }
                         if(internalMigration) {
                            dataWasMigrated = true; // Mark overall migration if internal changes happened
                         }

                    } else {
                        console.warn(`Skipping invalid data format for cell ${cellId} during load.`);
                        continue; // Skip this cell if format is totally wrong
                    }
                    // --- *** END FIX *** ---

                    migratedData[cellId] = newCellStructure; // Assign the correctly populated structure
                    console.log(`3b. Migrated structure for ${cellId}:`, newCellStructure); // 5. See the result for each cell
                }
                console.log(`3c. Total cells processed in migration loop: ${processedCells}`); // 6. Confirm loop completion

                if (dataWasMigrated) {
                    console.log("Data migration performed.");
                    if (migrationLog.length > 0) {
                        console.log("Migration Details:");
                        migrationLog.forEach(log => console.log(`  - ${log}`));
                    }
                    // Optional: Save migrated data back immediately if desired
                    // try { localStorage.setItem('bluePrinceRoomData', JSON.stringify(migratedData)); console.log("Migrated data saved back to localStorage."); } catch(e) { console.error("Error saving migrated data immediately:", e); }
                }

                loadedData = migratedData; // Assign the result

            } catch (e) {
                console.error("!!! Error during parsing or migration:", e); // 7. CRITICAL: Check for errors here
                loadedData = {}; // Reset on error
            }
        } else {
            console.log("No stored room data found."); // 8. Check if storage was empty
        }

        console.log("4. Final loadedData before setting state:", loadedData); // 9. See the final result
        setRoomData(loadedData);
        console.log("--- Data Load Complete ---"); // 10. Check if state update happens

        // Load currentDay
        const storedDay = localStorage.getItem('bluePrinceCurrentDay');
        if (storedDay) {
            const parsedDay = parseInt(storedDay, 10);
            if (!isNaN(parsedDay) && parsedDay >= 1) {
                setCurrentDay(parsedDay);
            }
        }

    }, []); // Empty dependency array ensures this runs only once on mount

    useEffect(() => {
        // Get the current state of roomData keys for checks
        const roomDataKeys = Object.keys(roomData);
        const isRoomDataEmpty = roomDataKeys.length === 0;

        // Get current storage value *before* deciding to save
        const currentStorageValue = localStorage.getItem('bluePrinceRoomData');
        const storageIsEmptyOrNull = !currentStorageValue || currentStorageValue === '{}';

        // --- Prevent saving initial empty state ---
        // If roomData is empty AND storage was also initially empty/null, don't save yet.
        if (isRoomDataEmpty && storageIsEmptyOrNull) {
             console.log("Save skipped: Initial load state, roomData is empty and localStorage was empty/null.");
             return;
        }
        // --- Prevent overwriting valid data with empty state ---
        // If roomData is empty NOW, but storage previously had data, log a warning and skip.
        // This might happen if something incorrectly clears the state.
        if (isRoomDataEmpty && !storageIsEmptyOrNull) {
            console.warn("Save skipped: roomData is empty, but localStorage contained data. Preventing overwrite.", currentStorageValue);
            // Consider if this scenario indicates an error elsewhere that needs fixing.
            return;
        }

        // --- Proceed with saving non-empty data ---
        try {
            // Cleanup logic (remains the same)
            const cleanedData = { ...roomData };
            let dataWasCleaned = false;
            for (const cellId in cleanedData) {
                const cell = cleanedData[cellId];
                if ((!cell.days || cell.days.length === 0) && !cell.letter && !cell.assignedRoomName) {
                    delete cleanedData[cellId];
                    dataWasCleaned = true;
                }
            }

            const dataToSave = JSON.stringify(cleanedData);
            console.log(`Saving data (cleaned: ${dataWasCleaned}):`, dataToSave); // Log exactly what's being saved

            // Final check: Ensure we aren't saving "{}" if cleanedData became empty after cleanup
            if (dataToSave === '{}' && !storageIsEmptyOrNull) {
                 console.warn("Save skipped: Data became empty after cleanup, but storage wasn't empty. Preventing overwrite.", currentStorageValue);
                 return;
            }

            localStorage.setItem('bluePrinceRoomData', dataToSave);

        } catch (e) {
            console.error("Error saving room data:", e);
            alert("Could not save room data. LocalStorage might be full or unavailable.");
        }
    }, [roomData]); // Run whenever roomData changes

    // --- Saving currentDay Effect ---
    useEffect(() => {
        try {
            localStorage.setItem('bluePrinceCurrentDay', currentDay.toString());
        } catch (e) {
            console.error("Error saving current day:", e);
        }
    }, [currentDay]);

    // --- Event Handlers (Remain the same) ---
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
            e.target.value = currentDay;
            alert("Please enter a valid day number (1 or higher).");
        }
    }, [currentDay]);

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

    // --- Submit Handler (Assumes modal sends assignedRoomName) ---
    const handleSubmitDayData = useCallback((data) => {
        const { cellId, day, offered, selected, letter, assignedRoomName } = data;

        if (assignedRoomName && !PREDEFINED_ROOMS.some(r => r.name === assignedRoomName)) {
             console.warn(`Submitted assignedRoomName '${assignedRoomName}' for cell ${cellId} does not exist in PREDEFINED_ROOMS.`);
        }

        setRoomData(prevData => {
            const newData = { ...prevData };
            if (!newData[cellId]) {
                newData[cellId] = { days: [], letter: null, assignedRoomName: null };
            } else {
                 if (!newData[cellId].days) newData[cellId].days = [];
                 if (!newData[cellId].hasOwnProperty('letter')) newData[cellId].letter = null;
                 if (!newData[cellId].hasOwnProperty('assignedRoomName')) newData[cellId].assignedRoomName = null;
            }

            newData[cellId].assignedRoomName = assignedRoomName || null;
            newData[cellId].letter = letter || null;

            const hasDayData = offered.length > 0 || selected !== null;
            let dayEntryData = null;
            if (hasDayData) {
                dayEntryData = { day, offered, selected };
            }

            const daysArray = newData[cellId].days;
            const existingDayIndex = daysArray.findIndex(d => d.day === day);

            if (dayEntryData) {
                if (existingDayIndex !== -1) {
                    daysArray[existingDayIndex] = dayEntryData;
                } else {
                    daysArray.push(dayEntryData);
                    daysArray.sort((a, b) => a.day - b.day);
                }
            } else {
                if (existingDayIndex !== -1) {
                    daysArray.splice(existingDayIndex, 1);
                }
            }

            return newData;
        });

        handleCloseModal();
    }, [handleCloseModal]);

    const handleDeleteDay = useCallback((cellIdToDelete, dayNumberToDelete) => {
        if (confirm(`Are you sure you want to delete Day ${dayNumberToDelete} for cell ${cellIdToDelete}?`)) {
            setRoomData(prevData => {
                const newData = { ...prevData };
                if (newData[cellIdToDelete]?.days) {
                    const dayIndex = newData[cellIdToDelete].days.findIndex(d => d.day === dayNumberToDelete);
                    if (dayIndex !== -1) {
                        newData[cellIdToDelete].days.splice(dayIndex, 1);
                        return { ...newData };
                    }
                }
                return prevData;
            });
        }
    }, []);

    const handleClearAllData = useCallback(() => {
        if (confirm('Are you sure you want to clear ALL logged data for ALL cells (including letters and Outer Room)? This cannot be undone.')) {
            setRoomData({});
            setCurrentDay(1);
            setSelectedCellId(null);
            setIsModalOpen(false);
            try { localStorage.removeItem('bluePrinceRoomData'); } catch (e) { console.error("Error clearing room data from storage:", e); }
            alert('All data cleared.');
        }
    }, []);

    // --- Info Panel Data (Remains the same) ---
    const selectedCellInfo = useMemo(() => {
        if (!selectedCellId) return null;
        return roomData[selectedCellId] || { days: [], letter: null, assignedRoomName: null };
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


    // --- Add/Edit Button Logic (Remains the same) ---
    const addEditButtonText = useMemo(() => {
        if (!selectedCellId) return 'Add/Edit Day';
        const isEditing = selectedCellInfo?.days.some(d => d.day === currentDay);
        return isEditing ? `Edit Day ${currentDay}` : `Add Day ${currentDay}`;
    }, [selectedCellId, selectedCellInfo, currentDay]);

    const addEditButtonTitle = useMemo(() => {
        if (!selectedCellId) return 'Select a cell first';
        const isEditing = selectedCellInfo?.days.some(d => d.day === currentDay);
        const displayId = selectedCellId === OUTER_ROOM_ID ? "Outer Room" : selectedCellId;
        return isEditing ? `Edit data for Day ${currentDay} in ${displayId}` : `Add data for Day ${currentDay} to ${displayId}`;
    }, [selectedCellId, selectedCellInfo, currentDay]);

    // --- Grid Generation (Remains the same - relies on assignedRoomName) ---
    const gridCells = useMemo(() => {
        const cells = [];
        for (let visualRow = 1; visualRow <= ROWS; visualRow++) {
            const rank = ROWS - visualRow + 1;
            for (let c = 1; c <= COLS; c++) {
                const cellId = `R${rank}C${c}`;
                const cellData = roomData[cellId] || { days: [], letter: null, assignedRoomName: null };
                const isFixed = cellId === ANTECHAMBER_ID || cellId === ENTRANCE_HALL_ID;

                let roomNameToDisplay = '';
                let roomColorName = null;
                let letterToDisplay = cellData.letter || null;

                if (cellId === ANTECHAMBER_ID) {
                    roomNameToDisplay = 'Antechamber';
                    letterToDisplay = null;
                } else if (cellId === ENTRANCE_HALL_ID) {
                    roomNameToDisplay = 'Entrance Hall';
                    letterToDisplay = null;
                } else if (cellData.assignedRoomName) {
                    roomNameToDisplay = cellData.assignedRoomName;
                    const assignedRoom = PREDEFINED_ROOMS.find(room => room.name === cellData.assignedRoomName);
                    if (assignedRoom) {
                        roomColorName = assignedRoom.color;
                    } else {
                        console.warn(`Cell ${cellId} has assignedRoomName '${cellData.assignedRoomName}' but no match found in PREDEFINED_ROOMS.`);
                        roomNameToDisplay = `? (${cellData.assignedRoomName})`;
                        letterToDisplay = null;
                    }
                } else if (cellData.letter) {
                    roomNameToDisplay = cellData.letter;
                    roomColorName = null;
                    letterToDisplay = null;
                }

                cells.push(
                    <RoomCell
                        key={cellId}
                        roomName={roomNameToDisplay}
                        roomColor={roomColorName}
                        displayLetter={letterToDisplay}
                        isFixed={isFixed}
                        isSelectedInGrid={selectedCellId === cellId}
                        onClick={() => handleCellClick(cellId)}
                    />
                );
            }
        }
        return cells;
    }, [roomData, selectedCellId, handleCellClick]);

    // --- Outer Room Cell (Remains the same - relies on assignedRoomName) ---
    const outerRoomCell = useMemo(() => {
        const cellData = roomData[OUTER_ROOM_ID] || { days: [], letter: null, assignedRoomName: null };
        let roomNameToDisplay = '';
        let roomColorName = null;
        let letterToDisplay = cellData.letter || null;

        if (cellData.assignedRoomName) {
            roomNameToDisplay = cellData.assignedRoomName;
            const assignedRoom = PREDEFINED_ROOMS.find(room => room.name === cellData.assignedRoomName);
            if (assignedRoom) {
                roomColorName = assignedRoom.color;
            } else {
                console.warn(`OuterRoom has assignedRoomName '${cellData.assignedRoomName}' but no match found in PREDEFINED_ROOMS.`);
                roomNameToDisplay = `? (${cellData.assignedRoomName})`;
                letterToDisplay = null;
            }
        } else if (cellData.letter) {
            roomNameToDisplay = cellData.letter;
            roomColorName = null;
            letterToDisplay = null;
        }

        return (
            <RoomCell
                roomName={roomNameToDisplay}
                roomColor={roomColorName}
                displayLetter={letterToDisplay}
                isFixed={false}
                isSelectedInGrid={selectedCellId === OUTER_ROOM_ID}
                onClick={() => handleCellClick(OUTER_ROOM_ID)}
                className="w-full"
            />
        );
    }, [roomData, selectedCellId, handleCellClick]);


    // --- JSX Rendering (Remains largely the same) ---
    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 font-sans">
            {/* Left Side */}
            <div className="flex-grow p-4 overflow-y-auto">
                {/* ... Header, Controls, Grid, Outer Room ... */}
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
                            onBlur={handleCurrentDayInputChange}
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
                    className="grid gap-1 mb-4 mx-auto w-max"
                    style={{ gridTemplateColumns: `repeat(${COLS}, 70px)` }}
                >
                    {gridCells}
                </div>

                {/* Outer Room */}
                <div className="mt-4 max-w-[370px] mx-auto">
                    <h3 className="text-lg font-semibold mb-1 text-center">Outer Area</h3>
                    {outerRoomCell}
                </div>
            </div>

            {/* Right Side */}
            <div className="w-full md:w-1/3 lg:w-1/4 min-w-[300px] bg-white p-4 shadow-lg overflow-y-auto border-l border-gray-200 flex-shrink-0">
                {/* ... Info Panel Content ... */}
                 <h2 className="text-xl font-semibold mb-3 border-b pb-2">Cell Information</h2>
                <div id="cell-info">
                    <div className="mb-3">
                        <strong className="block">Selected Cell:</strong>
                        <span id="selected-cell-id" className="text-blue-700 font-medium break-words">
                            {selectedCellId ? (selectedCellId === OUTER_ROOM_ID ? 'Outer Room' : selectedCellId) : 'None'}
                            {selectedCellInfo?.assignedRoomName
                                ? ` (${selectedCellInfo.assignedRoomName})`
                                : ''
                            }
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
                    <div className="mb-4 max-h-96 overflow-y-auto border rounded p-2 bg-gray-50">
                        <h4 className="font-semibold text-sm mb-1">Day Details:</h4>
                        <ul id="day-list" className="list-none pl-0 text-sm space-y-4">
                            {sortedDaysForInfoPanel.length > 0 ? (
                                sortedDaysForInfoPanel.map(dayEntry => (
                                    <li key={dayEntry.day} className={`border-b pb-2 ${dayEntry.day === currentDay ? 'bg-yellow-100 rounded px-1' : ''}`}>
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
                                        <div className="text-xs mb-2">
                                            <span className="font-medium block mb-1">Offered:</span>
                                            {dayEntry.offered && dayEntry.offered.length > 0 ? (
                                                <div className="flex flex-wrap gap-2 ml-1">
                                                    {dayEntry.offered.map(offerName => {
                                                        const room = PREDEFINED_ROOMS.find(r => r.name === offerName);
                                                        return (
                                                            <RoomCell
                                                                key={offerName}
                                                                roomName={offerName}
                                                                roomColor={room?.color}
                                                                isSelectable={false}
                                                                className={`${dayEntry.selected === offerName ? 'ring-2 ring-green-500 ring-offset-1' : ''}`}
                                                                title={offerName}
                                                            />
                                                        );
                                                    })}
                                                </div>
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
                    <div className="max-h-96 overflow-y-auto">
                        <h4 className="font-semibold text-sm mb-1">Offer Frequency:</h4>
                        <ul id="frequency-list" className="list-none pl-0 text-sm space-y-2">
                            {frequencyData && frequencyData.totalOffers > 0 ? (
                                frequencyData.sortedRooms.map(item => (
                                    <li key={item.name} className="flex items-center justify-between text-xs border-b pb-1">
                                        <div className="flex items-center gap-2">
                                            <RoomCell
                                                roomName={item.name}
                                                roomColor={item.details?.color}
                                                isSelectable={false}
                                                title={item.name}
                                            />
                                        </div>
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
            />
        </div>
    );
}

export default App;
