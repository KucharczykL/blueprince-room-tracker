// src/App.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debounce } from 'lodash-es'; // Using lodash for debounce

// --- Project Specific Imports ---
import {
    ROWS, COLS, PREDEFINED_ROOMS, OUTER_ROOM_ID, ANTECHAMBER_ID, ENTRANCE_HALL_ID,
    CELL_SIZE
} from './constants'; // Adjust path if needed
import { getCalendarDateForDay } from './utils/dateUtils'; // Adjust path if needed
import RoomCell from './components/RoomCell'; // Adjust path if needed
import AddEditDayModal from './components/AddEditDayModal'; // Adjust path if needed

// --- Constants ---
const EXPORT_DATA_VERSION = 1;
const LOCAL_STORAGE_KEY = 'bluePrinceRoomData';
const QUERY_KEY = ['appData']; // Unique key for React Query

// --- Data Loading Function (for useQuery) ---
const loadAppData = async () => {
    console.log("--- RQ: Starting Data Load ---");
    const storedRoomData = localStorage.getItem(LOCAL_STORAGE_KEY);
    console.log("1. RQ: Raw data from localStorage:", storedRoomData ? storedRoomData.substring(0, 100) + '...' : 'null');

    let loadedData = {};
    let currentDayLoaded = 1;
    let dataWasMigrated = false; // Keep track if migration happened
    let migrationLog = [];

    // Default structure to return
    const defaultData = { roomData: {}, currentDay: 1, dataWasMigrated: false };

    if (!storedRoomData) {
        console.log("RQ: No stored room data found. Returning default state.");
        return defaultData;
    }

    try {
        let parsedData = JSON.parse(storedRoomData);
        console.log("2. RQ: Initial parsed data type:", typeof parsedData);

        // Handle potential double-encoding
        if (typeof parsedData === 'string') {
            console.log("2a. RQ: Detected string after first parse, attempting second parse...");
            try {
                parsedData = JSON.parse(parsedData);
                console.log("2b. RQ: Data after second parse:", parsedData);
            } catch (e2) {
                 console.error("!!! RQ Error during second parse:", e2);
                 // Treat as corrupted data, return default
                 throw new Error(`Data seems double-encoded but failed second parse: ${e2.message}`);
            }
        }
        console.log("3. RQ: Data ready for format check:", parsedData);

        if (parsedData && typeof parsedData === 'object' && parsedData !== null) {
            // Check for new format (version, roomData, currentDay)
            if (parsedData.version === EXPORT_DATA_VERSION && typeof parsedData.roomData === 'object' && parsedData.roomData !== null && typeof parsedData.currentDay === 'number') {
                console.log(`RQ: Loading data from structured export format (v${parsedData.version})`);
                loadedData = parsedData.roomData;
                currentDayLoaded = parsedData.currentDay >= 1 ? parsedData.currentDay : 1;
                // No migration needed for current version
                dataWasMigrated = false;

            } else { // Assume older format (or unrecognized) and migrate
                 console.log("RQ: Attempting migration from older localStorage format (or unrecognized structure)...");
                 const migratedData = {};
                 let processedCells = 0;
                 for (const cellId in parsedData) {
                     if (!Object.prototype.hasOwnProperty.call(parsedData, cellId)) continue;
                     processedCells++;
                     const cellData = parsedData[cellId];
                     let newCellStructure = { days: [], letter: null };
                     let internalMigration = false; // Track if *this specific cell* needed internal changes

                     if (typeof cellData === 'object' && cellData !== null) {
                         newCellStructure.days = Array.isArray(cellData.days) ? [...cellData.days] : [];
                         newCellStructure.letter = cellData.letter || null;

                         // --- Internal migrations/cleanups (copied from original logic) ---
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
                          // --- End Internal migrations ---

                     } else {
                         console.warn(`RQ Skipping invalid data format for cell ${cellId} during migration (expected object, got ${typeof cellData}).`);
                         continue; // Skip this cell
                     }
                     migratedData[cellId] = newCellStructure;
                     if (internalMigration) dataWasMigrated = true; // Mark if any cell needed internal migration
                 }
                 console.log(`RQ Migration: Processed ${processedCells} cells.`);
                 if (dataWasMigrated) {
                      console.log("RQ Data migration performed due to internal cleanups/format changes.");
                      if (migrationLog.length > 0) {
                          console.log("RQ Migration Details:");
                          migrationLog.forEach(log => console.log(log));
                      }
                  } else {
                       console.log("RQ Data format was older/unrecognized but compatible, no specific migration actions needed.");
                  }
                 loadedData = migratedData;
                 dataWasMigrated = true; // Always consider loading from old format as a migration needing save

                 // Load currentDay from separate key ONLY if migrating from the REALLY old format
                 const storedDay = localStorage.getItem('bluePrinceCurrentDay');
                 if (storedDay) {
                     const parsedDay = parseInt(storedDay, 10);
                     if (!isNaN(parsedDay) && parsedDay >= 1) {
                         currentDayLoaded = parsedDay;
                         console.log("RQ Loaded currentDay from separate legacy storage key:", currentDayLoaded);
                         try {
                              localStorage.removeItem('bluePrinceCurrentDay');
                              console.log("RQ Removed old 'bluePrinceCurrentDay' key.");
                         } catch (removeError) {
                              console.warn("RQ Could not remove old 'bluePrinceCurrentDay' key:", removeError);
                         }
                     } else {
                          console.warn("RQ Found separate currentDay key, but value was invalid:", storedDay);
                     }
                 } else {
                      console.log("RQ No separate legacy currentDay key found, using default:", currentDayLoaded);
                 }
            }
        } else {
             console.warn("RQ: Stored data was null or not an object after parsing. Resetting.");
             // Treat as corrupted, return default but signal potential migration needed if user wants to save defaults
             loadedData = {};
             currentDayLoaded = 1;
             dataWasMigrated = true; // If data existed but was invalid, treat as needing a save of defaults
        }

        console.log("4. RQ: Final loaded data structure:", { roomData: loadedData, currentDay: currentDayLoaded, dataWasMigrated });
        return { roomData: loadedData, currentDay: currentDayLoaded, dataWasMigrated };

    } catch (e) {
        console.error("!!! RQ Critical Error during data load/parse/migration !!!");
        console.error("Error message:", e.message);
        console.error("Error stack:", e.stack);
        // Re-throw the error for useQuery to catch and set isError state
        throw e;
    }
};

// --- Data Saving Function (for useMutation) ---
const saveAppData = async ({ roomData, currentDay }) => {
    console.log("--- RQ: Saving Data ---");
    try {
        // Clean up empty cells before saving (same logic as before)
        const cleanedData = { ...roomData };
        let dataWasCleaned = false;
        for (const cellId in cleanedData) {
             // Make sure we don't check prototype properties
            if (!Object.prototype.hasOwnProperty.call(cleanedData, cellId)) continue;
            const cell = cleanedData[cellId];
            // Check if cell object exists and has 'days' and 'letter' properties before checking their emptiness
            if (cell && (!cell.days || cell.days.length === 0) && !cell.letter) {
                delete cleanedData[cellId];
                dataWasCleaned = true;
            }
        }

        const dataToSaveStructured = {
            version: EXPORT_DATA_VERSION,
            currentDay: currentDay,
            roomData: cleanedData
        };

        const dataToSave = JSON.stringify(dataToSaveStructured);
        console.log(`RQ: Saving data (cleaned: ${dataWasCleaned}):`, dataToSave.substring(0, 200) + '...'); // Log a bit more
        localStorage.setItem(LOCAL_STORAGE_KEY, dataToSave);
        console.log("RQ: Save complete.");

    } catch (e) {
        console.error("RQ Error saving room data:", e);
        // Re-throw for useMutation's onError handler
        throw e;
    }
};


// --- Main Application Component ---
function App() {
    // --- React Query Hooks ---
    const queryClient = useQueryClient();

    // Handles loading data from localStorage
    const {
        data: queryData, // Contains { roomData, currentDay, dataWasMigrated } on success
        isLoading: isQueryLoading, // True during initial fetch
        isError: isQueryError,     // True if loadAppData threw an error
        error: queryError,         // The error object if isQueryError is true
        isSuccess: isQuerySuccess, // True if fetch succeeded
        isFetching: isQueryFetching, // True if any fetch (initial or background) is in progress
    } = useQuery({
        queryKey: QUERY_KEY,
        queryFn: loadAppData,
        // Config options suitable for localStorage:
        staleTime: Infinity,       // Data is never stale unless we invalidate it
        cacheTime: Infinity,       // Keep data in cache indefinitely
        refetchOnWindowFocus: false, // No need to refetch on focus for localStorage
        refetchOnMount: false,       // No need to refetch on mount if already cached
        retry: false,              // Don't retry automatically on load error
    });

    // Handles saving data back to localStorage
    const { mutate: triggerSave, isPending: isSavePending, error: saveError } = useMutation({
        mutationFn: saveAppData,
        onError: (error) => {
            // Central error handling for saves
            console.error("RQ Mutation onError:", error);
            alert("Could not save room data. LocalStorage might be full or unavailable.");
        },
        // We don't need complex cache updates here as the source of truth
        // for the *next* save is the local state, which triggers the save.
    });

    // Debounce the save function
    // Note: Using useCallback ensures the debounced function is stable unless triggerSave changes
    const debouncedSave = useCallback(debounce(triggerSave, 500), [triggerSave]); // 500ms delay

    // --- Local Component State ---
    // Holds the data the UI directly interacts with. Initialized with defaults,
    // then updated ("hydrated") from the successful query result.
    const [roomData, setRoomData] = useState({});
    const [currentDay, setCurrentDay] = useState(1);
    const [selectedCellId, setSelectedCellId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Ref to track if the initial data load has been applied to local state
    const isInitialLoadApplied = useRef(false);

    // --- Effect to Hydrate Local State from Query Result ---
    useEffect(() => {
        // Run only when the query succeeds and provides data
        if (isQuerySuccess && queryData) {
            // Check if data is actually different to avoid unnecessary state updates/renders
            // Note: This is a shallow comparison, adjust if deep comparison is needed
            // and potentially use a library like 'fast-deep-equal' if performance matters.
            let changed = false;
            if (JSON.stringify(roomData) !== JSON.stringify(queryData.roomData)) {
                setRoomData(queryData.roomData);
                changed = true;
            }
            if (currentDay !== queryData.currentDay) {
                setCurrentDay(queryData.currentDay);
                changed = true;
            }

            if (changed) {
                console.log("RQ: Hydrating local state from successful query.");
            }

            // Mark that the initial load is done *after* attempting to set state.
            // We do this even if data was the same to allow autosave to proceed.
            isInitialLoadApplied.current = true;

             // If data was migrated on load, trigger an immediate save of the migrated format.
             // Cancel any pending debounced saves first.
             if (queryData.dataWasMigrated) {
                 console.log("RQ: Triggering immediate save after migration.");
                 debouncedSave.cancel(); // Cancel pending debounced saves
                 triggerSave({ roomData: queryData.roomData, currentDay: queryData.currentDay });
             }
        }
    }, [isQuerySuccess, queryData, triggerSave, debouncedSave]); // Add dependencies

    // --- Effect to Save Local State Changes (Autosave) ---
    useEffect(() => {
        // Autosave should only run *after* the initial data has been loaded and applied.
        if (!isInitialLoadApplied.current) {
             console.log(`RQ Save skipped: Initial load not yet applied.`);
            return;
        }

        // Avoid saving if a query fetch or another save is currently in progress
        if (isQueryFetching || isSavePending) {
            console.log(`RQ Save skipped: QueryFetching=${isQueryFetching}, SavePending=${isSavePending}`);
            return;
        }

        // This effect runs on initial load *after* hydration too, so debounce is important.
        console.log("RQ: Change detected in roomData or currentDay, queueing debounced save...");
        debouncedSave({ roomData, currentDay });

        // Cleanup function to cancel debounced save if component unmounts or dependencies change
        return () => {
            debouncedSave.cancel();
        };

    }, [roomData, currentDay, debouncedSave, isQueryFetching, isSavePending]);


    // --- Event Handlers ---
    const handleCellClick = useCallback((cellId) => {
        setSelectedCellId(cellId);
    }, []);

    const changeCurrentDay = useCallback((delta) => {
        setCurrentDay(prevDay => Math.max(1, prevDay + delta));
        // Local state change triggers the autosave useEffect
    }, []);

    const handleCurrentDayInputChange = useCallback((e) => {
        const value = e.target.value;
        const newDay = parseInt(value, 10);
        if (!isNaN(newDay) && newDay >= 1) {
            setCurrentDay(newDay);
            // Local state change triggers the autosave useEffect
        } else if (value === "") {
            // Allow temporary empty state while typing, maybe handle onBlur?
            // Or reset immediately:
             // e.target.value = currentDay; // Reset input visually
             // alert("Please enter a valid day number (1 or higher).");
             // For now, let autosave handle the invalid state potentially
        } else {
             e.target.value = currentDay; // Reset if invalid chars entered
             alert("Please enter a valid day number (1 or higher).");
        }
    }, [currentDay]);

     // Separate handler for blur to commit or reset the input
     const handleCurrentDayInputBlur = useCallback((e) => {
         const value = e.target.value;
         const newDay = parseInt(value, 10);
         if (value === "" || isNaN(newDay) || newDay < 1) {
             // If invalid or empty on blur, reset to the last valid currentDay
             e.target.value = currentDay;
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
            // Ensure cell structure exists and is correct (defensive coding)
            if (!newData[cellId]) {
                newData[cellId] = { days: [], letter: null };
            } else {
                // Ensure deep copy if modifying nested arrays/objects
                 newData[cellId] = {
                    days: Array.isArray(newData[cellId].days) ? [...newData[cellId].days] : [],
                    letter: newData[cellId].letter || null
                 };
            }

            newData[cellId].letter = letter || null; // Update letter

            const hasDayData = offered.length > 0 || selected !== null;
            let dayEntryData = null;
            if (hasDayData) {
                // Filter out empty strings from offered array defensively
                const validOffered = offered.filter(o => typeof o === 'string' && o.trim() !== '');
                dayEntryData = { day, offered: validOffered, selected };
            }

            const daysArray = newData[cellId].days;
            const existingDayIndex = daysArray.findIndex(d => d.day === day);

            if (dayEntryData) { // Add or update day
                if (existingDayIndex !== -1) {
                    daysArray[existingDayIndex] = dayEntryData; // Replace existing entry
                } else {
                    daysArray.push(dayEntryData); // Add new entry
                    daysArray.sort((a, b) => a.day - b.day); // Keep sorted
                }
            } else { // Remove day if submitted with no data
                if (existingDayIndex !== -1) {
                    daysArray.splice(existingDayIndex, 1); // Remove the entry
                }
            }

            // Optional: Cleanup cell if completely empty (might be better done in saveAppData)
            // if (newData[cellId].days.length === 0 && !newData[cellId].letter) {
            //     delete newData[cellId];
            // }

            return newData; // Return the modified newData object
        });
        // Local state change triggers the autosave useEffect
        handleCloseModal();
    }, [handleCloseModal]);

    const handleDeleteDay = useCallback((cellIdToDelete, dayNumberToDelete) => {
        if (confirm(`Are you sure you want to delete Day ${dayNumberToDelete} data for cell ${cellIdToDelete}?`)) {
            setRoomData(prevData => {
                // Ensure cell exists before trying to modify it
                if (!prevData[cellIdToDelete] || !prevData[cellIdToDelete].days) {
                    return prevData; // No change needed
                }

                const newData = { ...prevData };
                 // Deep copy the specific cell's data to avoid direct mutation
                 newData[cellIdToDelete] = { ...newData[cellIdToDelete], days: [...newData[cellIdToDelete].days] };

                const dayIndex = newData[cellIdToDelete].days.findIndex(d => d.day === dayNumberToDelete);

                if (dayIndex !== -1) {
                    newData[cellIdToDelete].days.splice(dayIndex, 1); // Remove the day entry
                    // Optional: Check if the cell itself should be removed if empty
                    // if (newData[cellIdToDelete].days.length === 0 && !newData[cellIdToDelete].letter) {
                    //     delete newData[cellIdToDelete];
                    // }
                    return newData; // Return the new state object
                } else {
                    return prevData; // Day not found, no change needed
                }
            });
            // Local state change triggers the autosave useEffect
        }
    }, []);

    const handleClearAllData = useCallback(() => {
        if (confirm('Are you sure you want to clear ALL logged data for ALL cells...? This cannot be undone.')) {
            // 1. Update local state immediately for UI responsiveness
            setRoomData({});
            setCurrentDay(1);
            setSelectedCellId(null);
            setIsModalOpen(false); // Close modal if open

            // 2. Trigger save mutation directly with the new empty state
            console.log("RQ: Triggering immediate save for clear all.");
            debouncedSave.cancel(); // Cancel any pending debounced save
            triggerSave({ roomData: {}, currentDay: 1 });

            alert('All data cleared.');
        }
    }, [triggerSave, debouncedSave]);

    const handleExportData = useCallback(() => {
        // Uses the current local state for export
        try {
            const dataToExport = {
                version: EXPORT_DATA_VERSION,
                currentDay: currentDay,
                roomData: roomData // Use local state directly
            };

            const jsonString = JSON.stringify(dataToExport, null, 2); // Pretty print
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
    }, [roomData, currentDay]); // Depends on local state

    // Handler for the import file input change event
    const handleImportFileSelected = useCallback((event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            let importedJsonString = null;
            try {
                importedJsonString = e.target.result;
                const importedData = JSON.parse(importedJsonString);

                // --- Validation (copied from original logic) ---
                if (typeof importedData !== 'object' || importedData === null) {
                    throw new Error("Imported file is not a valid JSON object.");
                }
                if (!importedData.hasOwnProperty('version') || !importedData.hasOwnProperty('roomData') || !importedData.hasOwnProperty('currentDay')) {
                     throw new Error("Imported JSON is missing required fields (version, roomData, currentDay).");
                }
                 if (importedData.version > EXPORT_DATA_VERSION) { // Allow older versions? Check policy.
                     alert(`Warning: Importing data from a newer version (v${importedData.version}). Expected v${EXPORT_DATA_VERSION}. Data might not load correctly.`);
                 }
                 // Add more validation as needed (e.g., roomData is object, currentDay is number >= 1)
                if (typeof importedData.roomData !== 'object' || importedData.roomData === null) {
                   throw new Error("Invalid 'roomData' structure in imported file.");
                 }
                  if (typeof importedData.currentDay !== 'number' || importedData.currentDay < 1) {
                   throw new Error("Invalid 'currentDay' value in imported file.");
                 }
                // --- End Validation ---

                if (!confirm('Importing this file will overwrite your current data. Are you sure?')) {
                    console.log("Import cancelled by user.");
                    return;
                }

                // Perform potential migration/validation on importedData.roomData if needed here

                // 1. Update local state immediately
                setRoomData(importedData.roomData);
                setCurrentDay(importedData.currentDay);
                setSelectedCellId(null); // Reset selection
                setIsModalOpen(false);  // Close modal

                // 2. Trigger save mutation directly with the imported state
                console.log("RQ: Triggering immediate save for import.");
                debouncedSave.cancel(); // Cancel pending debounced saves
                triggerSave({ roomData: importedData.roomData, currentDay: importedData.currentDay });

                alert("Data imported successfully!");

            } catch (error) {
                console.error("Error importing data:", error);
                alert(`Failed to import data: ${error.message}. Please ensure the file is valid JSON in the expected format.`);
            }
        };
        reader.onerror = (error) => {
            console.error("Error reading file:", error);
            alert("An error occurred while reading the file.");
        };
        reader.readAsText(file);
    }, [triggerSave, debouncedSave]); // Depends on triggerSave and debouncedSave

    // Wrapper function to trigger the file input dialog
    const triggerImportFileSelect = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.onchange = handleImportFileSelected; // Assign the actual handler
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input); // Clean up the temporary input element
    }, [handleImportFileSelected]);


    // --- Memos calculating derived state (using local state) ---
    const selectedCellInfo = useMemo(() => {
        if (!selectedCellId) return null;
        return roomData[selectedCellId] || { days: [], letter: null }; // Use local roomData
    }, [selectedCellId, roomData]);

    const sortedDaysForInfoPanel = useMemo(() => {
        // sort higher day to lower day
        return selectedCellInfo?.days ? [...selectedCellInfo.days].sort((a, b) => b.day - a.day) : [];
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
            .sort((a, b) => b.count - a.count);
         return { totalOffers, sortedRooms };
        // --- End frequency logic ---
    }, [selectedCellInfo, sortedDaysForInfoPanel]);

    const addEditButtonTitle = useMemo(() => {
        if (!selectedCellId) return 'Select a cell first';
        const isEditing = selectedCellInfo?.days?.some(d => d.day === currentDay);
        const displayId = selectedCellId === OUTER_ROOM_ID ? "Outer Room" : selectedCellId;
        // Use local currentDay
        return isEditing ? `Edit data for Day ${currentDay} in ${displayId}` : `Add data for Day ${currentDay} to ${displayId}`;
    }, [selectedCellId, selectedCellInfo, currentDay]);

    // --- Grid Generation (using local state) ---
    const gridCells = useMemo(() => {
        const cells = [];
        for (let visualRow = 1; visualRow <= ROWS; visualRow++) {
            const rank = ROWS - visualRow + 1;
            for (let c = 1; c <= COLS; c++) {
                const cellId = `R${rank}C${c}`;
                // Use local roomData and currentDay
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
                    letterToDisplay = 'F';
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
                        // Pass calculated props
                        onClick={() => handleCellClick(cellId)} // Use local handler
                        isSelectedInGrid={selectedCellId === cellId} // Use local selectedCellId
                        // ... other props ...
                        roomName={roomNameToDisplay}
                        roomColor={roomColorName}
                        displayLetter={letterToDisplay}
                        isFixed={isFixed}
                    />
                );
            }
        }
        return cells;
    }, [roomData, selectedCellId, handleCellClick, currentDay]); // Depends on local state

    // --- Outer Room Cell (using local state) ---
    const outerRoomCell = useMemo(() => {
        // Use local roomData and currentDay
        const cellData = roomData[OUTER_ROOM_ID] || { days: [], letter: null };
        let roomNameToDisplay = '';
        let roomColorName = null;
        let letterToDisplay = null;
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
                 // Pass calculated props
                 onClick={() => handleCellClick(OUTER_ROOM_ID)} // Use local handler
                 isSelectedInGrid={selectedCellId === OUTER_ROOM_ID} // Use local selectedCellId
                //  className="w-full"
                 roomName={roomNameToDisplay}
                 roomColor={roomColorName}
                 displayLetter={letterToDisplay}
                 isFixed={false}
            />
        );
    }, [roomData, selectedCellId, handleCellClick, currentDay]); // Depends on local state


    // --- JSX Rendering Logic ---

    // 1. Handle Loading State (from useQuery)
    if (isQueryLoading) {
        return <div className="flex justify-center items-center min-h-screen text-xl font-semibold">Loading application data...</div>;
    }

    // 2. Handle Error State (from useQuery)
    if (isQueryError) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen text-red-600 p-4 text-center">
                <h2 className="text-2xl font-bold mb-3">Error Loading Data</h2>
                <p className="mb-4">Could not load data from local storage. The stored data might be corrupted or unreadable.</p>
                <details className="mb-4 w-full max-w-lg text-left">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">Error Details</summary>
                    <pre className="mt-2 bg-red-50 p-3 rounded text-sm text-red-800 border border-red-200 overflow-auto">
                        {queryError instanceof Error ? queryError.message : String(queryError)}
                         {queryError instanceof Error && <hr className="my-2" />}
                         {queryError instanceof Error && queryError.stack}
                    </pre>
                </details>
                <div className="flex gap-4">
                    <button
                         onClick={() => queryClient.invalidateQueries({ queryKey: QUERY_KEY })}
                         className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 shadow"
                    >
                        Retry Load
                    </button>
                     <button
                         onClick={() => {
                             if (confirm("This will permanently clear the application's data from your browser's storage and reload the app. Are you sure?")) {
                                 localStorage.removeItem(LOCAL_STORAGE_KEY);
                                 // Invalidate and refetch to get the default state after clearing
                                 queryClient.invalidateQueries({ queryKey: QUERY_KEY });
                             }
                         }}
                         className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 shadow"
                     >
                        Clear Storage & Reload
                     </button>
                </div>
            </div>
        );
    }

    // 3. Render Main Application UI (using local state: roomData, currentDay)
    // Only reachable if isQueryLoading is false and isQueryError is false
    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 font-sans">
            {/* Left Side */}
            <div className="flex-grow p-4 overflow-y-auto">
                 <h1 className="text-2xl font-bold mb-4 text-center text-blue-800">Blue Prince Room Tracker</h1>
                {/* Controls Row */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-4 p-2 bg-white rounded shadow">
                    {/* Day Navigation */}
                    <div className="flex items-center gap-1">
                        <button onClick={() => changeCurrentDay(-1)} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-lg font-bold">&lt;</button>
                        <input
                            type="number"
                            value={currentDay} // Controlled by local state
                            onChange={handleCurrentDayInputChange}
                            onBlur={handleCurrentDayInputBlur} // Handle blur for validation reset
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
                            onClick={triggerImportFileSelect} // Use the wrapper to open file dialog
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm shadow"
                            title="Import data from JSON file"
                        >
                            Import
                        </button>
                         <button
                            id="export-data"
                            onClick={handleExportData} // Uses local state
                            className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm shadow"
                            title="Export current data to JSON file"
                        >
                            Export
                        </button>
                        <button
                            id="clear-all-data"
                            onClick={handleClearAllData} // Updates local state & triggers save
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm shadow"
                            title="Clear ALL logged data"
                        >
                            Clear All
                        </button>
                    </div>
                </div>
                {/* Mansion Grid */}
                <div className="flex flex-row place-items-end mx-auto w-max gap-5">
                    <div
                        id="mansion-grid"
                        className="grid gap-1"
                        style={{ gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)` }}
                    >
                        {gridCells}
                    </div>
                    <span className="flex flex-col text-xs items-center">
                        <h1>Outer Room</h1>
                        {outerRoomCell}
                    </span>
                </div>
            </div>

            {/* Right Side Info Panel */}
            <div className="w-full md:w-1/3 lg:w-1/4 min-w-[300px] bg-white p-4 shadow-lg overflow-y-auto border-l border-gray-200 flex-shrink-0">
                 <span className="flex flex-row justify-between">
                     <span className="text-xl font-semibold">Cell Information (<span id="selected-cell-id" className="text-blue-700 font-medium break-words">
                                 {selectedCellId ? (selectedCellId === OUTER_ROOM_ID ? 'Outer Room' : selectedCellId) : 'None'}
                            </span>)</span>
                            <button
                                id="add-day-button"
                                onClick={handleOpenModal}
                                disabled={!selectedCellId} // Disable based on local state
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow disabled:bg-gray-400 disabled:cursor-not-allowed text-xs"
                                title={addEditButtonTitle} // Derived from local state
                            >
                                Edit Current Day
                            </button>
                 </span>
                <div id="cell-info">
                    <div className="mb-3">
                        <strong>Logged Days:</strong> <span id="day-count">{selectedCellInfo?.days?.length ?? 0}</span>
                    </div>

                    {/* Day List */}
                    <div className="mb-4 max-h-96 overflow-y-auto border border-gray-200">
                        <ul id="day-list" className="list-none divide-y-1 divide-gray-100">
                            {sortedDaysForInfoPanel.length > 0 ? (
                                sortedDaysForInfoPanel.map(dayEntry => (
                                    <li key={dayEntry.day} className={`px-6 py-2 ${dayEntry.day === currentDay ? 'bg-yellow-100' : ''}`}>
                                        {/* <div className="flex justify-between items-center mb-1 text-xs">
                                            <button
                                                onClick={() => handleDeleteDay(selectedCellId, dayEntry.day)}
                                                className="text-red-500 hover:text-red-700"
                                                title={`Delete Day ${dayEntry.day}`}
                                            >
                                                ❌
                                            </button>
                                        </div> */}
                                        <div className="flex flex-row">
                                            <strong class="transform -rotate-90">{dayEntry.day}</strong>
                                                <div id="entries">
                                                    {dayEntry.offered && dayEntry.offered.length > 0 ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            {dayEntry.offered.map(offerName => {
                                                                const room = PREDEFINED_ROOMS.find(r => r.name === offerName);
                                                                return (
                                                                    <RoomCell
                                                                        key={offerName}
                                                                        roomName={offerName}
                                                                        roomColor={room?.color}
                                                                        isSelectable={false}
                                                                        className={`!w-15 !h-15 !text-xs !break-all ${dayEntry.selected === offerName ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}
                                                                        title={offerName}
                                                                    />
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-500 italic ml-1">None</span>
                                                    )}
                                                </div>
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
                        <h4 className="font-semibold text-sm mb-1">Frequencies:</h4>
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
                isOpen={isModalOpen} // Controlled by local state
                onClose={handleCloseModal}
                onSubmit={handleSubmitDayData} // Updates local state
                cellId={selectedCellId} // From local state
                currentDay={currentDay} // From local state
                initialCellData={selectedCellInfo} // Derived from local state
            />
        </div>
    );
}

export default App;