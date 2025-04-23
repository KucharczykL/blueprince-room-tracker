// src/App.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    ROWS, COLS, PREDEFINED_ROOMS, OUTER_ROOM_ID, ANTECHAMBER_ID, ENTRANCE_HALL_ID
} from './constants';
import { getCalendarDateForDay } from './utils/dateUtils';
import RoomCell from './components/RoomCell';
import AddEditDayModal from './components/AddEditDayModal';

const EXPORT_DATA_VERSION = 1;

function App() {
    const [roomData, setRoomData] = useState({});
    const [currentDay, setCurrentDay] = useState(1);
    const [selectedCellId, setSelectedCellId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Loading state

    // --- Data Persistence (Loading) ---
    useEffect(() => {
        console.log("--- Starting Data Load ---");
        // No need to set isLoading true here, default is true

        const storedRoomData = localStorage.getItem('bluePrinceRoomData');
        console.log("1. Raw data from localStorage:", storedRoomData ? storedRoomData.substring(0, 100) + '...' : 'null');

        let loadedData = {};
        let currentDayLoaded = 1;
        let dataWasMigrated = false;
        let migrationLog = [];

        // Use a finally block to ensure isLoading is set to false even if errors occur
        try {
            if (storedRoomData) {
                let parsedData = JSON.parse(storedRoomData);
                console.log("2. Initial parsed data type:", typeof parsedData);

                // --- FIX: Check for double-encoding and parse again ---
                if (typeof parsedData === 'string') {
                    console.log("2a. Detected string after first parse, attempting second parse...");
                    try {
                        parsedData = JSON.parse(parsedData);
                        console.log("2b. Data after second parse:", parsedData);
                    } catch (e2) {
                         console.error("!!! Error during second parse:", e2);
                         throw new Error(`Data seems double-encoded but failed second parse: ${e2.message}`);
                    }
                }
                // --- End FIX ---

                console.log("3. Data ready for format check:", parsedData);

                if (parsedData && typeof parsedData === 'object' && parsedData !== null) {
                    // Check for new format
                    if (parsedData.version === EXPORT_DATA_VERSION && typeof parsedData.roomData === 'object' && parsedData.roomData !== null && typeof parsedData.currentDay === 'number') {
                        console.log(`Loading data from structured export format (v${parsedData.version})`);
                        loadedData = parsedData.roomData;
                        currentDayLoaded = parsedData.currentDay >= 1 ? parsedData.currentDay : 1;
                        console.log("Loaded currentDay from structured data:", currentDayLoaded);
                    } else { // Assume older format and migrate
                        console.log("Attempting migration from older localStorage format (or unrecognized structure)...");
                        const migratedData = {};
                        let processedCells = 0;
                        for (const cellId in parsedData) {
                            if (!Object.prototype.hasOwnProperty.call(parsedData, cellId)) continue;
                            processedCells++;
                            const cellData = parsedData[cellId];
                            let newCellStructure = { days: [], letter: null };

                            if (typeof cellData === 'object' && cellData !== null) {
                                newCellStructure.days = Array.isArray(cellData.days) ? [...cellData.days] : [];
                                newCellStructure.letter = cellData.letter || null;

                                // Internal migrations/cleanups
                                let internalMigration = false;
                                newCellStructure.days.forEach(dayEntry => {
                                     if (Array.isArray(dayEntry.offered) && dayEntry.offered.length > 0 && typeof dayEntry.offered[0] === 'object' && dayEntry.offered[0]?.hasOwnProperty('name')) {
                                         dayEntry.offered = dayEntry.offered.map(offerObj => offerObj?.name).filter(Boolean);
                                         internalMigration = true;
                                         migrationLog.push(`  - Cell ${cellId}, Day ${dayEntry.day}: Migrated 'offered' format.`);
                                     }
                                     if (dayEntry.hasOwnProperty('letter')) {
                                         delete dayEntry.letter;
                                         internalMigration = true;
                                          migrationLog.push(`  - Cell ${cellId}, Day ${dayEntry.day}: Removed legacy 'letter' property.`);
                                     }
                                 });
                                 if (cellData.hasOwnProperty('assignedRoomName')) {
                                     internalMigration = true;
                                     migrationLog.push(`  - Cell ${cellId}: Removed unsupported 'assignedRoomName' property.`);
                                 }
                                if (internalMigration) dataWasMigrated = true;

                            } else {
                                console.warn(`Skipping invalid data format for cell ${cellId} during migration (expected object, got ${typeof cellData}).`);
                                continue;
                            }
                            migratedData[cellId] = newCellStructure;
                        }
                        console.log(`Migration: Processed ${processedCells} cells.`);
                        if (dataWasMigrated) {
                             console.log("Data migration performed due to internal cleanups/format changes.");
                             if (migrationLog.length > 0) {
                                 console.log("Migration Details:");
                                 migrationLog.forEach(log => console.log(log));
                             }
                         } else {
                              console.log("Data format was compatible, no specific migration actions needed.");
                         }
                        loadedData = migratedData;

                        // Load currentDay from separate key ONLY if migrating
                        const storedDay = localStorage.getItem('bluePrinceCurrentDay');
                        if (storedDay) {
                            const parsedDay = parseInt(storedDay, 10);
                            if (!isNaN(parsedDay) && parsedDay >= 1) {
                                currentDayLoaded = parsedDay;
                                console.log("Loaded currentDay from separate storage key:", currentDayLoaded);
                                try {
                                     localStorage.removeItem('bluePrinceCurrentDay');
                                     console.log("Removed old 'bluePrinceCurrentDay' key.");
                                } catch (removeError) {
                                     console.warn("Could not remove old 'bluePrinceCurrentDay' key:", removeError);
                                }
                            } else {
                                 console.warn("Found separate currentDay key, but value was invalid:", storedDay);
                            }
                        } else {
                             console.log("No separate currentDay key found, using default:", currentDayLoaded);
                        }
                    }
                } else {
                     console.warn("Stored data was null or not an object after parsing. Resetting data.");
                     loadedData = {};
                     currentDayLoaded = 1;
                }
            } else {
                console.log("No stored room data found. Initializing empty state.");
                loadedData = {};
                currentDayLoaded = 1;
            }

            // Set state after successful load/parse/migration
            console.log("4. Final loadedData before setting state:", loadedData);
            setRoomData(loadedData);
            setCurrentDay(currentDayLoaded);

        } catch (e) {
            console.error("!!! Critical Error during data load/parse/migration !!!");
            console.error("Error message:", e.message);
            console.error("Error stack:", e.stack);
            console.error("Stored data (start):", storedRoomData ? storedRoomData.substring(0, 500) + '...' : 'null');
            alert("CRITICAL ERROR loading data from storage. Data might be corrupted or unreadable. Resetting to empty state. Check the console (F12) for details.");
            setRoomData({}); // Reset on error
            setCurrentDay(1); // Reset day on error too
        } finally {
            // --- THIS IS KEY: Set loading false AFTER attempting to load/set state ---
            console.log("--- Data Load Complete ---");
            setIsLoading(false);
        }

    }, []); // Empty dependency array is correct for load-once effect

    // --- Saving roomData Effect ---
    useEffect(() => {
        // --- Prevent saving during initial load ---
        if (isLoading) {
            console.log("Save skipped: Initial data load in progress.");
            return;
        }
        // --- End check ---

        const roomDataKeys = Object.keys(roomData);
        const isRoomDataEmpty = roomDataKeys.length === 0;
        const currentStorageValue = localStorage.getItem('bluePrinceRoomData');
        const storageIsEmptyOrNull = !currentStorageValue || currentStorageValue === '{}';

        // Avoid saving empty data over nothing if it was already empty
        if (isRoomDataEmpty && storageIsEmptyOrNull && !currentStorageValue) {
             console.log("Save skipped: roomData is empty and localStorage was empty/null.");
             return;
        }
         // Log if saving empty data over existing data
        if (isRoomDataEmpty && !storageIsEmptyOrNull) {
            console.warn("Save check: roomData is empty, localStorage has data. Saving empty structure.", currentStorageValue);
            // Consider uncommenting the return below if you NEVER want to save an empty object over existing data
            // return;
        }

        try {
            // Clean up empty cells before saving
            const cleanedData = { ...roomData };
            let dataWasCleaned = false;
            for (const cellId in cleanedData) {
                const cell = cleanedData[cellId];
                if ((!cell.days || cell.days.length === 0) && !cell.letter) {
                    delete cleanedData[cellId];
                    dataWasCleaned = true;
                }
            }

            // Prepare data in the structured format
            const dataToSaveStructured = {
                version: EXPORT_DATA_VERSION,
                currentDay: currentDay,
                roomData: cleanedData
            };

            const dataToSave = JSON.stringify(dataToSaveStructured);
            console.log(`Saving data (cleaned: ${dataWasCleaned}):`, dataToSave.substring(0, 100) + '...');

            // Optional check: Prevent saving an empty structure if data only became empty after cleanup
            if (dataToSave === `{"version":${EXPORT_DATA_VERSION},"currentDay":${currentDay},"roomData":{}}` && !storageIsEmptyOrNull) {
                 console.warn("Save check: Data became empty after cleanup, but storage wasn't empty. Saving empty structure.", currentStorageValue);
                 // Consider uncommenting the return below
                 // return;
            }

            localStorage.setItem('bluePrinceRoomData', dataToSave);

        } catch (e) {
            console.error("Error saving room data:", e);
            alert("Could not save room data. LocalStorage might be full or unavailable.");
        }
    }, [roomData, currentDay, isLoading]); // Depend on isLoading

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
            e.target.value = currentDay; // Reset input visually if invalid
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

    const handleSubmitDayData = useCallback((data) => {
        const { cellId, day, offered, selected, letter } = data;

        setRoomData(prevData => {
            const newData = { ...prevData };
            // Ensure cell structure exists and is correct
            if (!newData[cellId]) {
                newData[cellId] = { days: [], letter: null };
            } else {
                 newData[cellId] = {
                    days: Array.isArray(newData[cellId].days) ? [...newData[cellId].days] : [],
                    letter: newData[cellId].letter || null
                 };
            }

            newData[cellId].letter = letter || null; // Update letter

            const hasDayData = offered.length > 0 || selected !== null;
            let dayEntryData = null;
            if (hasDayData) {
                dayEntryData = { day, offered, selected };
            }

            const daysArray = newData[cellId].days;
            const existingDayIndex = daysArray.findIndex(d => d.day === day);

            if (dayEntryData) { // Add or update day
                if (existingDayIndex !== -1) {
                    daysArray[existingDayIndex] = dayEntryData;
                } else {
                    daysArray.push(dayEntryData);
                    daysArray.sort((a, b) => a.day - b.day); // Keep sorted
                }
            } else { // Remove day if no data
                if (existingDayIndex !== -1) {
                    daysArray.splice(existingDayIndex, 1);
                }
            }

            // Optional: Remove cell if completely empty
            // if (newData[cellId].days.length === 0 && !newData[cellId].letter) {
            //     delete newData[cellId];
            // }

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
                        // Check if the cell is now empty and remove it if so (optional)
                        // if (newData[cellIdToDelete].days.length === 0 && !newData[cellIdToDelete].letter) {
                        //     delete newData[cellIdToDelete];
                        // }
                        return { ...newData }; // Return a new object to trigger re-render
                    }
                }
                return prevData; // Return previous data if no change
            });
        }
    }, []);

    const handleClearAllData = useCallback(() => {
        if (confirm('Are you sure you want to clear ALL logged data for ALL cells (including letters and Outer Room)? This cannot be undone.')) {
            setRoomData({});
            setCurrentDay(1);
            setSelectedCellId(null);
            setIsModalOpen(false);
            // Save the empty state immediately to reflect the clear
            try {
                 const emptyData = { version: EXPORT_DATA_VERSION, currentDay: 1, roomData: {} };
                 localStorage.setItem('bluePrinceRoomData', JSON.stringify(emptyData));
            } catch (e) {
                 console.error("Error clearing room data from storage:", e);
            }
            alert('All data cleared.');
        }
    }, []);

    const handleExportData = useCallback(() => {
        try {
            const dataToExport = {
                version: EXPORT_DATA_VERSION,
                currentDay: currentDay,
                roomData: roomData
            };

            const jsonString = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            const date = new Date();
            const dateString = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
            a.download = `quartz-mansion-data-${dateString}.json`;
            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log("Data exported successfully.");
            alert("Data exported successfully!");

        } catch (error) {
            console.error("Error exporting data:", error);
            alert("An error occurred while exporting data. Check the console for details.");
        }
    }, [roomData, currentDay]);

    const handleImportData = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';

        input.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                let importedJsonString = null; // Store the raw string for saving
                try {
                    importedJsonString = e.target.result;
                    const importedData = JSON.parse(importedJsonString);

                    // Validation
                    if (typeof importedData !== 'object' || importedData === null) {
                        throw new Error("Imported file is not a valid JSON object.");
                    }
                    if (!importedData.hasOwnProperty('version') || !importedData.hasOwnProperty('roomData') || !importedData.hasOwnProperty('currentDay')) {
                         throw new Error("Imported JSON is missing required fields (version, roomData, currentDay).");
                    }
                    if (importedData.version !== EXPORT_DATA_VERSION) {
                         alert(`Warning: Importing data from a different version (v${importedData.version}). Expected v${EXPORT_DATA_VERSION}. Data might not load correctly.`);
                    }
                    if (typeof importedData.roomData !== 'object' || importedData.roomData === null) {
                        throw new Error("Invalid 'roomData' structure in imported file.");
                    }
                     if (typeof importedData.currentDay !== 'number' || importedData.currentDay < 1) {
                        throw new Error("Invalid 'currentDay' value in imported file.");
                    }

                    if (!confirm('Importing this file will overwrite your current data. Are you sure?')) {
                        console.log("Import cancelled by user.");
                        return;
                    }

                    // Set loading state during import processing
                    setIsLoading(true);

                    // Update state
                    // Perform validation/migration on importedData.roomData if needed
                    setRoomData(importedData.roomData);
                    setCurrentDay(importedData.currentDay);
                    setSelectedCellId(null);
                    setIsModalOpen(false);

                    // Save imported data immediately to localStorage
                    try {
                        // Save the original imported string to ensure exact data persistence
                        localStorage.setItem('bluePrinceRoomData', importedJsonString);
                    } catch (saveError) {
                         console.error("Error saving imported data to localStorage:", saveError);
                         alert("Data imported, but failed to save immediately to local storage.");
                    }

                    console.log("Data imported successfully:", importedData);
                    alert("Data imported successfully!");

                } catch (error) {
                    console.error("Error importing data:", error);
                    alert(`Failed to import data: ${error.message}. Please ensure the file is valid JSON in the expected format.`);
                } finally {
                     // Ensure loading state is reset even if import fails
                     setIsLoading(false);
                     // Clean up the file input element
                     if (input.parentNode) {
                        input.parentNode.removeChild(input);
                     }
                }
            };

            reader.onerror = (e) => {
                console.error("Error reading file:", e);
                alert("An error occurred while reading the file.");
                 if (input.parentNode) {
                    input.parentNode.removeChild(input);
                 }
            };

            reader.readAsText(file);
        };

        document.body.appendChild(input);
        input.click();

    }, [setRoomData, setCurrentDay, setIsLoading]); // Add setIsLoading dependency


    // --- Info Panel Data ---
    const selectedCellInfo = useMemo(() => {
        if (!selectedCellId) return null;
        // Ensure a default structure even if cell data is missing
        return roomData[selectedCellId] || { days: [], letter: null };
    }, [selectedCellId, roomData]);

    const sortedDaysForInfoPanel = useMemo(() => {
        // Ensure selectedCellInfo and selectedCellInfo.days exist
        return selectedCellInfo?.days ? [...selectedCellInfo.days].sort((a, b) => a.day - b.day) : [];
    }, [selectedCellInfo]);

    const frequencyData = useMemo(() => {
        if (!selectedCellInfo || !sortedDaysForInfoPanel || sortedDaysForInfoPanel.length === 0) return null;

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
            .map(([name, count]) => ({
                name,
                count,
                probability: ((count / totalOffers) * 100).toFixed(1),
                details: PREDEFINED_ROOMS.find(r => r.name === name)
            }))
            .sort((a, b) => b.count - a.count); // Sort by count descending

        return { totalOffers, sortedRooms };
    }, [selectedCellInfo, sortedDaysForInfoPanel]);


    // --- Add/Edit Button Logic ---
    const addEditButtonText = useMemo(() => {
        if (!selectedCellId) return 'Add/Edit Day';
        const isEditing = selectedCellInfo?.days?.some(d => d.day === currentDay);
        return isEditing ? `Edit Day ${currentDay}` : `Add Day ${currentDay}`;
    }, [selectedCellId, selectedCellInfo, currentDay]);

    const addEditButtonTitle = useMemo(() => {
        if (!selectedCellId) return 'Select a cell first';
        const isEditing = selectedCellInfo?.days?.some(d => d.day === currentDay);
        const displayId = selectedCellId === OUTER_ROOM_ID ? "Outer Room" : selectedCellId;
        return isEditing ? `Edit data for Day ${currentDay} in ${displayId}` : `Add data for Day ${currentDay} to ${displayId}`;
    }, [selectedCellId, selectedCellInfo, currentDay]);

    // --- Grid Generation ---
    const gridCells = useMemo(() => {
        const cells = [];
        for (let visualRow = 1; visualRow <= ROWS; visualRow++) {
            const rank = ROWS - visualRow + 1;
            for (let c = 1; c <= COLS; c++) {
                const cellId = `R${rank}C${c}`;
                const cellData = roomData[cellId] || { days: [], letter: null };
                const isFixed = cellId === ANTECHAMBER_ID || cellId === ENTRANCE_HALL_ID;

                let roomNameToDisplay = '';
                let roomColorName = null;
                let letterToDisplay = cellData.letter || null;

                const entryForCurrentDay = cellData.days?.find(d => d.day === currentDay);

                if (cellId === ANTECHAMBER_ID) {
                    roomNameToDisplay = 'Antechamber';
                    letterToDisplay = null;
                } else if (cellId === ENTRANCE_HALL_ID) {
                    roomNameToDisplay = 'Entrance Hall';
                    letterToDisplay = null;
                } else if (entryForCurrentDay?.selected) {
                    roomNameToDisplay = entryForCurrentDay.selected;
                    const selectedRoom = PREDEFINED_ROOMS.find(room => room.name === roomNameToDisplay);
                    roomColorName = selectedRoom?.color; // Use optional chaining
                    if (!selectedRoom) {
                         console.warn(`Cell ${cellId} has selected room '${roomNameToDisplay}' for day ${currentDay} but no match found in PREDEFINED_ROOMS.`);
                         roomNameToDisplay = `? (${roomNameToDisplay})`;
                    }
                }
                // No else needed, defaults are set above

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
    }, [roomData, selectedCellId, handleCellClick, currentDay]);

    // --- Outer Room Cell ---
    const outerRoomCell = useMemo(() => {
        const cellData = roomData[OUTER_ROOM_ID] || { days: [], letter: null };
        let roomNameToDisplay = '';
        let roomColorName = null;
        let letterToDisplay = cellData.letter || null;

        const entryForCurrentDay = cellData.days?.find(d => d.day === currentDay);

        if (entryForCurrentDay?.selected) {
            roomNameToDisplay = entryForCurrentDay.selected;
            const selectedRoom = PREDEFINED_ROOMS.find(room => room.name === roomNameToDisplay);
            roomColorName = selectedRoom?.color;
            if (!selectedRoom) {
                console.warn(`OuterRoom has selected room '${roomNameToDisplay}' for day ${currentDay} but no match found in PREDEFINED_ROOMS.`);
                roomNameToDisplay = `? (${roomNameToDisplay})`;
            }
        }

        return (
            <RoomCell
                roomName={roomNameToDisplay}
                roomColor={roomColorName}
                displayLetter={letterToDisplay}
                isFixed={false}
                isSelectedInGrid={selectedCellId === OUTER_ROOM_ID}
                onClick={() => handleCellClick(OUTER_ROOM_ID)}
                className="w-full" // Ensure it takes full width in its container
            />
        );
    }, [roomData, selectedCellId, handleCellClick, currentDay]);


    // --- JSX Rendering ---
    // Show loading indicator
    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen text-xl font-semibold">Loading data...</div>;
    }

    // Main application UI
    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 font-sans">
            {/* Left Side */}
            <div className="flex-grow p-4 overflow-y-auto">
                 <h1 className="text-2xl font-bold mb-4 text-center text-blue-800">Quartz Mansion Tracker</h1>
                {/* Controls Row */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-4 p-2 bg-white rounded shadow">
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
                    {/* Action Buttons */}
                    <div className="flex flex-wrap justify-center gap-2 mt-2 sm:mt-0">
                         <button
                            id="import-data"
                            onClick={handleImportData}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm shadow"
                            title="Import data from JSON file"
                        >
                            Import
                        </button>
                         <button
                            id="export-data"
                            onClick={handleExportData}
                            className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm shadow"
                            title="Export current data to JSON file"
                        >
                            Export
                        </button>
                        <button
                            id="clear-all-data"
                            onClick={handleClearAllData}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm shadow"
                            title="Clear ALL logged data"
                        >
                            Clear All
                        </button>
                    </div>
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
                <div className="mt-4 max-w-[370px] mx-auto"> {/* Adjust max-width as needed */}
                    <h3 className="text-lg font-semibold mb-1 text-center">Outer Area</h3>
                    {outerRoomCell}
                </div>
            </div>

            {/* Right Side */}
            <div className="w-full md:w-1/3 lg:w-1/4 min-w-[300px] bg-white p-4 shadow-lg overflow-y-auto border-l border-gray-200 flex-shrink-0">
                 <h2 className="text-xl font-semibold mb-3 border-b pb-2">Cell Information</h2>
                <div id="cell-info">
                    <div className="mb-3">
                        <strong className="block">Selected Cell:</strong>
                        <span id="selected-cell-id" className="text-blue-700 font-medium break-words">
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
                        <strong>Logged Days:</strong> <span id="day-count">{selectedCellInfo?.days?.length ?? 0}</span>
                    </div>

                    {/* Day List */}
                    <div className="mb-4 max-h-96 overflow-y-auto border rounded p-2 bg-gray-50">
                        <h4 className="font-semibold text-sm mb-1">Day Details:</h4>
                        <ul id="day-list" className="list-none pl-0 text-sm space-y-4">
                            {sortedDaysForInfoPanel.length > 0 ? (
                                sortedDaysForInfoPanel.map(dayEntry => (
                                    <li key={dayEntry.day} className={`border-b pb-2 last:border-b-0 ${dayEntry.day === currentDay ? 'bg-yellow-100 rounded px-1 -mx-1' : ''}`}>
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
                                                <div className="flex flex-wrap gap-1 ml-1"> {/* Reduced gap */}
                                                    {dayEntry.offered.map(offerName => {
                                                        const room = PREDEFINED_ROOMS.find(r => r.name === offerName);
                                                        return (
                                                            <RoomCell
                                                                key={offerName}
                                                                roomName={offerName}
                                                                roomColor={room?.color}
                                                                isSelectable={false}
                                                                className={`transform scale-75 origin-top-left ${dayEntry.selected === offerName ? 'ring-2 ring-green-500 ring-offset-1' : ''}`} // Scaled down
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
                                    <li key={item.name} className="flex items-center justify-between text-xs border-b pb-1 last:border-b-0">
                                        <div className="flex items-center gap-1"> {/* Reduced gap */}
                                            <RoomCell
                                                roomName={item.name}
                                                roomColor={item.details?.color}
                                                isSelectable={false}
                                                className="transform scale-75 origin-center-left" // Scaled down
                                                title={item.name}
                                            />
                                        </div>
                                        <span className="frequency-text ml-2 whitespace-nowrap">
                                            {item.count} ({item.probability}%)
                                        </span>
                                    </li>
                                ))
                            ) : selectedCellInfo && selectedCellInfo.days?.length > 0 ? ( // Check days exist
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
                initialCellData={selectedCellInfo} // Pass the potentially null/default structure
            />
        </div>
    );
}

export default App;
