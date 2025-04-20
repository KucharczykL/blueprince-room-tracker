document.addEventListener('DOMContentLoaded', () => {
    // Constants (ROOM_COLORS, COLOR_NAME_TO_VALUE, PREDEFINED_ROOMS) remain the same
    const ROOM_COLORS = ["red", "blue", "purple", "yellow", "orange", "green", "gray"];
    const COLOR_NAME_TO_VALUE = {
        "red": "#dc3545",
        "blue": "#007bff",
        "purple": "#6f42c1",
        "yellow": "#ffc107",
        "orange": "#fd7e14",
        "green": "#28a745",
        "gray": "#808080",
    };
    const PREDEFINED_ROOMS = [
        { name: "Spare Room", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 3 }] },
        { name: "Parlor", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 5 }] },
        { name: "Billiard Room", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 6 }] },
        { name: "Closet", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 9 }] },
        { name: "Walk-in Closet", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 10 }] },
        { name: "Attic", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 11 }] },
        { name: "Storeroom", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 12 }] },
        { name: "Nook", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 13 }] },
        { name: "Garage", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 14 }] },
        { name: "Music Room", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 15 }] },
        { name: "Locker Room", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 16 }] },
        { name: "Den", color: "blue", exit_no: 3, rarity: "common", extra_data: [{ number: 17 }] },
        { name: "Wine Cellar", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 18 }] },
        { name: "Ball Room", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 20 }] },
        { name: "Pantry", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 21 }] },
        { name: "Rumpus Room", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 22 }] },
        { name: "Vault", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 23 }] },
        { name: "Office", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 24 }] },
        { name: "Drawing Room", color: "blue", exit_no: 3, rarity: "common", extra_data: [{ number: 25 }] },
        { name: "Study", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 26 }] },
        { name: "Library", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 27 }] },
        { name: "Chamber of Mirrors", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 28 }] },
        { name: "The Pool", color: "blue", exit_no: 3, rarity: "common", extra_data: [{ number: 29 }] },
        { name: "Utility Closet", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 31 }] },
        { name: "Boiler Room", color: "blue", exit_no: 3, rarity: "common", extra_data: [{ number: 32 }] },
        { name: "Pump Room", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 33 }] },
        { name: "Security", color: "blue", exit_no: 3, rarity: "common", extra_data: [{ number: 34 }] },
        { name: "Workshop", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 35 }] },
        { name: "Laboratory", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 36 }] },
        { name: "Sauna", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 37 }] },
        { name: "Coat Check", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 38 }] },
        { name: "Mail Room", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 39 }] },
        { name: "Dining Room", color: "blue", exit_no: 3, rarity: "common", extra_data: [{ number: 41 }] },
        { name: "Observatory", color: "blue", exit_no: 1, rarity: "common", extra_data: [{ number: 42 }] },
        { name: "Conference Room", color: "blue", exit_no: 3, rarity: "common", extra_data: [{ number: 43 }] },
        { name: "Aquarium", color: "blue", exit_no: 3, rarity: "common", extra_data: [{ number: 44 }] },
        { name: "Bedroom", color: "blue", exit_no: 1, rarity: "common", extra_data: [] },
        { name: "Boudoir", color: "blue", exit_no: 1, rarity: "common", extra_data: [] },
        { name: "Guest Bedroom", color: "blue", exit_no: 1, rarity: "common", extra_data: [] },
        { name: "Nursery", color: "blue", exit_no: 1, rarity: "common", extra_data: [] },
        { name: "Bunk Room", color: "blue", exit_no: 1, rarity: "common", extra_data: [] },
        { name: "Her Ladyship's Chamber", color: "blue", exit_no: 1, rarity: "common", extra_data: [] },
        { name: "Master Bedroom", color: "blue", exit_no: 1, rarity: "common", extra_data: [] },
        { name: "Hallway", color: "orange", exit_no: 3, rarity: "common", extra_data: [] },
        { name: "West Wing Hall", color: "orange", exit_no: 3, rarity: "common", extra_data: [] },
        { name: "East Wing Hall", color: "orange", exit_no: 3, rarity: "common", extra_data: [] },
        { name: "Corridor", color: "orange", exit_no: 1, rarity: "common", extra_data: [] },
        { name: "Passageway", color: "orange", exit_no: 4, rarity: "common", extra_data: [] },
        { name: "Secret Passage", color: "orange", exit_no: 1, rarity: "common", extra_data: [] },
        { name: "Great Hall", color: "orange", exit_no: 4, rarity: "common", extra_data: [] },
        { name: "Terrace", color: "green", exit_no: 1, rarity: "common", extra_data: [] },
        { name: "Patio", color: "green", exit_no: 1, rarity: "common", extra_data: [] },
        { name: "Courtyard", color: "green", exit_no: 3, rarity: "common", extra_data: [] },
        { name: "Cloister", color: "green", exit_no: 4, rarity: "common", extra_data: [] },
        { name: "Veranda", color: "green", exit_no: 1, rarity: "common", extra_data: [] },
        { name: "Conservatory", color: "green", exit_no: 2, rarity: "common", extra_data: [] },
        { name: "Greenhouse", color: "green", exit_no: 1, rarity: "common", extra_data: [] },
        { name: "Commissary", color: "yellow", exit_no: 1, rarity: "common", extra_data: [] },
        { name: "Kitchen", color: "yellow", exit_no: 1, rarity: "common", extra_data: [] },
        { name: "Locksmith", color: "yellow", exit_no: 1, rarity: "common", extra_data: [] },
        { name: "Showroom", color: "yellow", exit_no: 1, rarity: "common", extra_data: [] },
        { name: "Laundry Room", color: "yellow", exit_no: 1, rarity: "common", extra_data: [] },
        { name: "Bookshop", color: "yellow", exit_no: 2, rarity: "rare", extra_data: [{cost: "gem"}] },
        { name: "Lavatory", color: "red", exit_no: 1, rarity: "common", extra_data: [] },
        { name: "Chapel", color: "red", exit_no: 3, rarity: "common", extra_data: [] },
        { name: "Maid's Chamber", color: "red", exit_no: 1, rarity: "common", extra_data: [] },
        { name: "Archives", color: "red", exit_no: 4, rarity: "common", extra_data: [] },
        { name: "Gymnasium", color: "red", exit_no: 3, rarity: "common", extra_data: [] },
        { name: "Darkroom", color: "red", exit_no: 3, rarity: "common", extra_data: [] },
        { name: "Weight Room", color: "red", exit_no: 4, rarity: "common", extra_data: [] },
        { name: "Furnace", color: "red", exit_no: 1, rarity: "common", extra_data: [] },
        { name: "Conservatory", color: "red", exit_no: 1, rarity: "common", extra_data: [] },
        { name: "Closed Exhibit", color: "red", exit_no: 3, rarity: "common", extra_data: [] },
        { name: "Toolshed", color: "gray", exit_no: 1, rarity: "common", extra_data: [{ outer: true }] },
        { name: "Shelter", color: "gray", exit_no: 1, rarity: "common", extra_data: [{ outer: true }] },
        { name: "Schoolhouse", color: "gray", exit_no: 1, rarity: "common", extra_data: [{ outer: true }] },
        { name: "Shrine", color: "gray", exit_no: 1, rarity: "common", extra_data: [{ outer: true }] },
        { name: "Root Cellar", color: "gray", exit_no: 1, rarity: "common", extra_data: [{ outer: true }] },
        { name: "Hovel", color: "gray", exit_no: 1, rarity: "common", extra_data: [{ outer: true }] },
        { name: "Trading Post", color: "gray", exit_no: 1, rarity: "common", extra_data: [{ outer: true }] },
        { name: "Tomb", color: "gray", exit_no: 1, rarity: "common", extra_data: [{ outer: true }] },
        { name: "Foundation", color: "blue", exit_no: 3, rarity: "rare", extra_data: []},
        { name: "Freezer", color: "blue", exit_no: 1, rarity: "rare", extra_data: []},
        { name: "Classroom", color: "blue", exit_no: 2, rarity: "rare", extra_data: []},
    ];

    // --- DOM Element References ---
    const gridContainer = document.getElementById('mansion-grid');
    const cellInfoPanel = document.getElementById('cell-info');
    const selectedCellIdDisplay = document.getElementById('selected-cell-id');
    const dayCountDisplay = document.getElementById('day-count');
    const dayList = document.getElementById('day-list');
    const frequencyList = document.getElementById('frequency-list');
    const modal = document.getElementById('input-modal');
    const modalTitle = document.getElementById('modal-title');
    const closeModalButton = document.querySelector('.close-button');
    const submitDayButton = document.getElementById('submit-day');
    const editDayIndexInput = document.getElementById('edit-day-index');
    const roomSelectorGrid = document.getElementById('room-grid-selector');
    const chosenOffersDisplay = document.getElementById('chosen-offers-display');
    const dayLetterInput = document.getElementById('day-letter-input');
    const clearDataButton = document.getElementById('clear-all-data');
    const currentDayInput = document.getElementById('current-day-input');
    const prevDayButton = document.getElementById('prev-day');
    const nextDayButton = document.getElementById('next-day');
    const currentCalendarDateDisplay = document.getElementById('current-calendar-date');
    const addDayButton = document.getElementById('add-day-button');
    const sortMethodSelector = document.getElementById('sort-method-selector');


    // --- Constants and State ---
    const ROWS = 9;
    const COLS = 5;
    const START_DATE = new Date(1993, 10, 7); // November is month 10 (0-indexed)
    let selectedCellElement = null;
    // roomData structure: { cellId: { days: DayEntry[], letter: string | null }, ... }
    // DayEntry structure: { day: number, offered: string[], selected: string | null } (letter removed)
    let roomData = {};
    let currentDay = 1;
    let currentModalOffers = [];
    let currentModalFinalSelection = null;
    let currentSortMethod = 'predefined';


    // --- Date Calculation & Display ---
    /**
     * Calculates the calendar date for a given day number.
     * @param {number} dayNumber - The day number (1-based).
     * @returns {string} - Formatted date string (e.g., "November 7, 1993").
     */
    function getCalendarDateForDay(dayNumber) {
        if (dayNumber < 1 || isNaN(dayNumber)) {
            return "Invalid Day";
        }
        const date = new Date(START_DATE);
        date.setDate(date.getDate() + dayNumber - 1); // Add (dayNumber - 1) days
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function updateCalendarDateDisplay() {
        if (currentCalendarDateDisplay) {
            currentCalendarDateDisplay.textContent = getCalendarDateForDay(currentDay);
        } else {
            console.warn("Calendar date display element not found.");
        }
    }

    // --- Current Day Logic ---
    function updateCurrentDayDisplay() {
        currentDayInput.value = currentDay;
        updateCalendarDateDisplay();
        console.log("Current Day set to:", currentDay);
    }

    function changeCurrentDay(delta) {
        const newDay = currentDay + delta;
        if (newDay >= 1) {
            currentDay = newDay;
            updateCurrentDayDisplay();
            updateAllCellDisplays();
            if (selectedCellElement) {
                updateInfoPanel();
            }
            try {
                localStorage.setItem('bluePrinceCurrentDay', currentDay.toString());
                console.log("Current day saved.");
            } catch (e) {
                console.error("Error saving current day:", e);
            }
        }
    }

    function setCurrentDay(dayValue) {
        const newDay = parseInt(dayValue, 10);
        if (!isNaN(newDay) && newDay >= 1) {
            if (newDay !== currentDay) {
                currentDay = newDay;
                updateCurrentDayDisplay();
                updateAllCellDisplays();
                if (selectedCellElement) {
                    updateInfoPanel();
                }
                try {
                    localStorage.setItem('bluePrinceCurrentDay', currentDay.toString());
                    console.log("Current day saved.");
                } catch (e) {
                    console.error("Error saving current day:", e);
                }
            }
        } else {
            currentDayInput.value = currentDay;
            alert("Please enter a valid day number (1 or higher).");
        }
    }


    // --- Data Persistence ---
    function loadData() {
        // Load Room Data (with migration for structure and letter)
        const storedRoomData = localStorage.getItem('bluePrinceRoomData');
        let dataWasMigrated = false; // Flag for any migration type
        let letterMigrationLog = []; // Log messages for letter migration

        if (storedRoomData) {
            try {
                let parsedData = JSON.parse(storedRoomData);
                console.log("Raw room data loaded.");

                // --- Migration Step (Offer Format & Letter Structure) ---
                const migratedData = {}; // Build the new data structure here

                for (const cellId in parsedData) {
                    let cellData = parsedData[cellId];
                    let newCellStructure = { days: [], letter: null };
                    let firstLetterFound = null;

                    // Check if data is in the old format (cellId maps directly to array)
                    if (Array.isArray(cellData)) {
                        dataWasMigrated = true; // Mark structure migration
                        newCellStructure.days = cellData; // Assign the array to the 'days' property

                        // Now iterate through the days in the old structure to find the first letter
                        for (const dayEntry of newCellStructure.days) {
                            // Migrate offer format (object to string) if needed (from previous migration)
                            if (Array.isArray(dayEntry.offered) && dayEntry.offered.length > 0) {
                                if (typeof dayEntry.offered[0] === 'object' && dayEntry.offered[0] !== null && dayEntry.offered[0].hasOwnProperty('name')) {
                                    dayEntry.offered = dayEntry.offered.map(offerObj => offerObj?.name).filter(Boolean);
                                }
                            }

                            // Find and migrate the first letter
                            if (dayEntry.hasOwnProperty('letter') && dayEntry.letter && firstLetterFound === null) {
                                firstLetterFound = dayEntry.letter.trim().toUpperCase();
                                if (firstLetterFound.length > 1 || (firstLetterFound.length === 1 && !/^[A-Z]$/.test(firstLetterFound))) {
                                    letterMigrationLog.push(`Cell ${cellId}: Found invalid letter '${dayEntry.letter}' on day ${dayEntry.day}. Ignoring.`);
                                    firstLetterFound = null; // Ignore invalid letter
                                } else {
                                    newCellStructure.letter = firstLetterFound;
                                    letterMigrationLog.push(`Cell ${cellId}: Migrated letter '${firstLetterFound}' from day ${dayEntry.day}.`);
                                }
                            }
                            // Remove letter from individual day entry in the new structure
                            delete dayEntry.letter;
                        }
                    }
                    // Check if data is already in new object format but might need offer migration
                    else if (typeof cellData === 'object' && cellData !== null && cellData.hasOwnProperty('days')) {
                        newCellStructure = cellData; // Start with existing structure
                        // Migrate offer format if needed within the existing structure
                        if (Array.isArray(newCellStructure.days)) {
                            newCellStructure.days.forEach(dayEntry => {
                                if (Array.isArray(dayEntry.offered) && dayEntry.offered.length > 0) {
                                    if (typeof dayEntry.offered[0] === 'object' && dayEntry.offered[0] !== null && dayEntry.offered[0].hasOwnProperty('name')) {
                                        dayEntry.offered = dayEntry.offered.map(offerObj => offerObj?.name).filter(Boolean);
                                        dataWasMigrated = true; // Mark offer format migration
                                    }
                                }
                                // Ensure letter property doesn't exist on day entries (cleanup)
                                if (dayEntry.hasOwnProperty('letter')) {
                                     delete dayEntry.letter;
                                     dataWasMigrated = true; // Mark cleanup migration
                                }
                            });
                        }
                         // Ensure letter property exists at the cell level
                        if (!newCellStructure.hasOwnProperty('letter')) {
                            newCellStructure.letter = null;
                            dataWasMigrated = true; // Mark structure fix migration
                        }

                    } else {
                        // Skip invalid data for this cellId
                        console.warn(`Skipping invalid data format for cell ${cellId} during load.`);
                        continue;
                    }

                    migratedData[cellId] = newCellStructure; // Assign the processed structure
                }
                // --- End Migration Step ---

                if (dataWasMigrated) {
                    console.log("Data migration performed (structure/offer format/letter).");
                    if (letterMigrationLog.length > 0) {
                        console.log("Letter Migration Details:");
                        letterMigrationLog.forEach(log => console.log(`  - ${log}`));
                    }
                    // Optional: Save migrated data back immediately
                    // try { localStorage.setItem('bluePrinceRoomData', JSON.stringify(migratedData)); console.log("Migrated data saved back."); } catch (e) { console.error("Error saving migrated data:", e); }
                }

                roomData = migratedData; // Assign the fully migrated data

            } catch (e) {
                console.error("Error parsing or migrating room data:", e);
                roomData = {};
            }
        } else {
            roomData = {};
            console.log("No room data found.");
        }

        // Load Current Day
        const storedDay = localStorage.getItem('bluePrinceCurrentDay');
        if (storedDay) {
            const parsedDay = parseInt(storedDay, 10);
            if (!isNaN(parsedDay) && parsedDay >= 1) {
                currentDay = parsedDay;
                console.log("Current day loaded:", currentDay);
            }
        }


        // Load Sort Preference
        const storedSortMethod = localStorage.getItem('bluePrinceSortMethod');
        if (storedSortMethod && (storedSortMethod === 'predefined' || storedSortMethod === 'alphabetical')) {
            currentSortMethod = storedSortMethod;
            if (sortMethodSelector) {
                sortMethodSelector.value = currentSortMethod; // Update dropdown on load
            }
            console.log("Sort preference loaded:", currentSortMethod);
        }


        // Update displays AFTER loading data
        updateCurrentDayDisplay();
    }

    function saveData() {
        try {
            // Clean up empty cell data before saving
            for (const cellId in roomData) {
                const cell = roomData[cellId];
                // Delete cell entry if it has no days and no letter
                if ((!cell.days || cell.days.length === 0) && !cell.letter) {
                    delete roomData[cellId];
                }
            }
            localStorage.setItem('bluePrinceRoomData', JSON.stringify(roomData));
            console.log("Room data saved.");
        } catch (e) {
            console.error("Error saving room data:", e);
            alert("Could not save room data. LocalStorage might be full or unavailable.");
        }
    }

    // --- Helper to save sort preference ---
    function saveSortPreference() {
        try {
            localStorage.setItem('bluePrinceSortMethod', currentSortMethod);
            console.log("Sort preference saved:", currentSortMethod);
        } catch (e) {
            console.error("Error saving sort preference:", e);
        }
    }


    // --- Grid Generation & Display ---
    function createGrid() {
        gridContainer.innerHTML = '';
        const centerCol = Math.ceil(COLS / 2);

        for (let visualRow = 1; visualRow <= ROWS; visualRow++) {
            const rank = ROWS - visualRow + 1;
            for (let c = 1; c <= COLS; c++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.dataset.rank = rank;
                cell.dataset.col = c;
                const cellId = `R${rank}C${c}`;
                cell.id = cellId;

                if (rank === ROWS && c === centerCol) {
                    cell.textContent = 'Antechamber';
                    cell.classList.add('fixed-cell', 'antechamber');
                } else if (rank === 1 && c === centerCol) {
                    cell.classList.add('fixed-cell', 'entrance-hall');
                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = 'Entrance Hall';
                    cell.appendChild(nameSpan);
                    const letterSpan = document.createElement('span');
                    letterSpan.classList.add('cell-letter');
                    letterSpan.textContent = 'F';
                    letterSpan.style.fontWeight = 'bold';
                    letterSpan.style.marginLeft = '5px';
                    cell.appendChild(letterSpan);
                } else {
                    cell.addEventListener('click', handleCellClick);
                }
                gridContainer.appendChild(cell);
            }
        }
    }

    function updateCellDisplay(cellId) {
        const cellElement = document.getElementById(cellId);
        if (!cellElement || cellElement.classList.contains('fixed-cell')) {
            return;
        }

        cellElement.innerHTML = ''; // Clear previous content
        cellElement.classList.remove('has-selection');
        cellElement.style.borderColor = '';
        cellElement.style.borderWidth = '';
        cellElement.style.backgroundColor = '';
        cellElement.style.color = '';

        const cellData = roomData[cellId]; // Now an object { days: [], letter: null } or undefined
        const days = cellData?.days || [];
        const persistentLetter = cellData?.letter || null; // Get the persistent letter

        let selectionToShow = null;
        let roomColorName = null;

        // Find entry for the current day to display room name/color
        const entryForCurrentDay = days.find(dayEntry => dayEntry && typeof dayEntry.day === 'number' && dayEntry.day === currentDay);

        if (entryForCurrentDay && entryForCurrentDay.selected) {
            selectionToShow = entryForCurrentDay.selected;
            const predefinedRoom = PREDEFINED_ROOMS.find(r => r.name === selectionToShow);
            roomColorName = predefinedRoom?.color;
        }

        // Determine if the cell should show content (either a selection for today or a persistent letter)
        if (selectionToShow || persistentLetter) {
            cellElement.classList.add('has-selection');

            // Display room name for the current day if selected
            if (selectionToShow) {
                const roomNameSpan = document.createElement('span');
                roomNameSpan.classList.add('cell-room-name');
                roomNameSpan.textContent = selectionToShow;
                cellElement.appendChild(roomNameSpan);

                // Apply border color based on selected room
                if (roomColorName) {
                    cellElement.style.borderColor = COLOR_NAME_TO_VALUE[roomColorName] || '#aaa';
                    cellElement.style.borderWidth = '2px';
                }
            }

            // Always display the persistent letter if it exists
            if (persistentLetter) {
                const letterSpan = document.createElement('span');
                letterSpan.classList.add('cell-letter');
                letterSpan.textContent = persistentLetter;
                // Add margin if room name is also shown
                if (selectionToShow) {
                    letterSpan.style.marginLeft = '5px';
                }
                cellElement.appendChild(letterSpan);
            }
        } else {
            // No selection for today AND no persistent letter, show cell ID
            const idSpan = document.createElement('span');
            idSpan.classList.add('cell-id-display');
            idSpan.textContent = cellId;
            cellElement.appendChild(idSpan);
        }

        // Update Tooltip
        const absoluteLatestDay = days.length > 0 ? [...days].sort((a,b) => b.day - a.day)[0] : null;
        const tooltipSelection = absoluteLatestDay?.selected;
        let tooltipText = cellId;
        // Include persistent letter in tooltip
        if (persistentLetter) {
             tooltipText += ` [${persistentLetter}]`;
        }
        if (tooltipSelection) {
            tooltipText += ` (Latest Room: ${tooltipSelection})`;
        } else if (days.length > 0) {
             tooltipText += ` (Latest Room: None)`;
        }
        cellElement.title = tooltipText;
    }

    function updateAllCellDisplays() {
        console.log("Updating all displays for day:", currentDay);
        const cells = gridContainer.querySelectorAll('.grid-cell:not(.fixed-cell)');
        cells.forEach(cell => updateCellDisplay(cell.id));
    }


    // --- UI Updates (Info Panel) ---
    function updateInfoPanel() {
        if (!selectedCellIdDisplay || !dayCountDisplay || !dayList || !frequencyList) return;

        if (!selectedCellElement) {
            selectedCellIdDisplay.textContent = 'No cell selected';
            dayCountDisplay.textContent = '0';
            dayList.innerHTML = '';
            frequencyList.innerHTML = '';
            if (addDayButton) {
                addDayButton.disabled = true;
                addDayButton.textContent = 'Add/Edit Day';
                addDayButton.title = 'Select a cell first';
            }
            return;
        }

        const cellId = selectedCellElement.id;
        const cellData = roomData[cellId]; // Object { days: [], letter: null } or undefined
        const days = cellData?.days ? [...cellData.days].sort((a, b) => a.day - b.day) : [];
        const persistentLetter = cellData?.letter || null; // Get persistent letter

        // Display Cell ID and Persistent Letter
        selectedCellIdDisplay.textContent = `Selected: ${cellId}${persistentLetter ? ` [${persistentLetter}]` : ''}`;

        dayCountDisplay.textContent = days.length;

        // Update Add/Edit button text
        if (addDayButton) {
            addDayButton.disabled = false;
            const existingDayIndex = days.findIndex(d => d.day === currentDay);
            if (existingDayIndex !== -1) {
                addDayButton.textContent = `Edit Day ${currentDay}`;
                addDayButton.title = `Edit data for Day ${currentDay} in ${cellId}`;
            } else {
                addDayButton.textContent = `Add Day ${currentDay}`;
                addDayButton.title = `Add data for Day ${currentDay} to ${cellId}`;
            }
        }

        // Populate Day List
        dayList.innerHTML = '';
        days.forEach((dayEntry, index) => { // dayEntry no longer has .letter
            const li = document.createElement('li');
            li.classList.add('day-list-item');
            if (dayEntry.day === currentDay) {
                li.classList.add('current-day-item');
            }

            const header = document.createElement('h5');
            header.textContent = `Day ${dayEntry.day}`;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '❌';
            deleteButton.classList.add('delete-day-button');
            deleteButton.title = `Delete Day ${dayEntry.day}`;
            deleteButton.dataset.cellId = cellId;
            deleteButton.dataset.dayNumber = dayEntry.day;
            deleteButton.addEventListener('click', handleDeleteDay);
            header.appendChild(deleteButton);
            li.appendChild(header);

            const offersDiv = document.createElement('div');
            offersDiv.classList.add('day-offers');
            offersDiv.textContent = 'Offered: ';

            let hasOffers = false;
            if (Array.isArray(dayEntry.offered)) {
                dayEntry.offered.forEach(offerName => {
                    const roomName = typeof offerName === 'string' ? offerName : null;
                    if (roomName) {
                        const predefinedRoom = PREDEFINED_ROOMS.find(r => r.name === roomName);
                        const tag = createRoomTagElement(roomName, predefinedRoom?.color);
                        if (dayEntry.selected === roomName) { tag.classList.add('final-selection-info'); }
                        offersDiv.appendChild(tag);
                        hasOffers = true;
                    }
                });
            }
            if (!hasOffers) { offersDiv.appendChild(document.createTextNode('None')); }

            // Display selected room for the day
            offersDiv.appendChild(document.createTextNode(` (Selected: ${dayEntry.selected || 'None'})`));

            li.appendChild(offersDiv);
            dayList.appendChild(li);
        });

        updateFrequencyList(cellId);
    }

    function updateFrequencyList(cellId) {
        if (!frequencyList) return;

        frequencyList.innerHTML = '';
        frequencyList.classList.add('frequency-grid');

        const cellData = roomData[cellId]; // Object { days: [], letter: null } or undefined
        const days = cellData?.days || []; // Get days array

        if (days.length === 0) {
            frequencyList.innerHTML = '<li>No data logged.</li>';
            frequencyList.classList.remove('frequency-grid');
            return;
        }

        const roomCounts = {};
        let totalOffers = 0;

        // Calculate frequencies based on the 'days' array
        days.forEach(dayEntry => {
            if (Array.isArray(dayEntry.offered)) {
                dayEntry.offered.forEach(offerName => {
                    const roomName = typeof offerName === 'string' ? offerName : null;
                    if (roomName) {
                        const trimmedRoom = roomName.trim();
                        if (trimmedRoom !== '') {
                            roomCounts[trimmedRoom] = (roomCounts[trimmedRoom] || 0) + 1;
                            totalOffers++;
                        }
                    }
                });
            }
        });

        if (totalOffers === 0) {
            frequencyList.innerHTML = '<li>No valid room offers logged.</li>';
            frequencyList.classList.remove('frequency-grid');
            return;
        }

        const sortedRooms = Object.entries(roomCounts).sort(([, countA], [, countB]) => countB - countA);

        sortedRooms.forEach(([roomName, count]) => {
            const probability = ((count / totalOffers) * 100).toFixed(1);
            const predefinedRoom = PREDEFINED_ROOMS.find(r => r.name === roomName);
            const roomColorName = predefinedRoom?.color;

            const li = document.createElement('li');
            li.classList.add('frequency-item');

            const tag = createRoomTagElement(roomName, roomColorName);
            li.appendChild(tag);

            const freqText = document.createElement('span');
            freqText.classList.add('frequency-text');
            freqText.textContent = ` ${count} (${probability}%)`;
            li.appendChild(freqText);

            frequencyList.appendChild(li);
        });
    }

    // --- Event Handlers ---
    function handleCellClick(event) {
        const clickedElement = event.target.closest('.grid-cell');

        if (!clickedElement || clickedElement.classList.contains('fixed-cell')) {
            return;
        }
        if (event.target.closest('.delete-day-button')) {
             return;
        }
        if (clickedElement === selectedCellElement) {
            return;
        }
        if (selectedCellElement) {
            selectedCellElement.classList.remove('selected');
        }
        selectedCellElement = clickedElement;
        selectedCellElement.classList.add('selected');
        updateInfoPanel();
    }

    function handleDeleteDay(event) {
        const button = event.target.closest('.delete-day-button');
        const cellId = button.dataset.cellId;
        const dayNumber = parseInt(button.dataset.dayNumber, 10);
        if (!cellId || isNaN(dayNumber)) return;

        // Access the days array within the cellData object
        const cellData = roomData[cellId];
        if (!cellData || !Array.isArray(cellData.days)) return;

        const dayIndex = cellData.days.findIndex(d => d.day === dayNumber);
        if (dayIndex === -1) return;

        if (confirm(`Are you sure you want to delete Day ${dayNumber} for cell ${cellId}?`)) {
            cellData.days.splice(dayIndex, 1); // Remove from the days array
            console.log(`Deleted Day ${dayNumber} for cell ${cellId}`);
            saveData();
            updateCellDisplay(cellId); // Update grid display
            updateInfoPanel(); // Update info panel
        }
    }


    // --- Modal Logic ---
    function populateRoomSelectorGrid() {
        if (!roomSelectorGrid) return;
        roomSelectorGrid.innerHTML = '';

        // --- Sorting Logic ---
        let roomsToDisplay = [...PREDEFINED_ROOMS]; // Create a copy

        if (currentSortMethod === 'alphabetical') {
            roomsToDisplay.sort((a, b) => a.name.localeCompare(b.name));
            console.log("Sorting rooms alphabetically");
        } else {
            // 'predefined' or default
            console.log("Using predefined room order");
        }
        // --- End Sorting Logic ---

        roomsToDisplay.forEach(room => {
            const button = document.createElement('button');
            button.classList.add('room-selector-button', 'grid-cell');
            button.textContent = room.name;
            button.title = room.name;
            const colorValue = COLOR_NAME_TO_VALUE[room.color] || '#ccc';
            button.style.borderColor = colorValue;
            button.style.borderWidth = '2px';
            button.style.backgroundColor = '';
            button.style.color = '';
            button.dataset.roomName = room.name;

            if (currentModalOffers.some(offer => offer.name === room.name)) {
                button.classList.add('selected');
            }

            button.addEventListener('click', handleRoomSelection);
            roomSelectorGrid.appendChild(button);
        });
    }

    function handleRoomSelection(event) {
        const button = event.target;
        const roomName = button.dataset.roomName;
        const roomInfo = PREDEFINED_ROOMS.find(r => r.name === roomName);

        if (!roomInfo) return;

        const isSelected = currentModalOffers.some(offer => offer.name === roomName);

        if (isSelected) {
            currentModalOffers = currentModalOffers.filter(offer => offer.name !== roomName);
            button.classList.remove('selected');
        } else {
            currentModalOffers.push(roomInfo);
            button.classList.add('selected');
        }

        updateChosenOffersDisplay();
        if (currentModalFinalSelection && !currentModalOffers.some(o => o.name === currentModalFinalSelection)) {
           handleFinalSelectionClick(null, null);
        }
    }

    function updateChosenOffersDisplay() {
        if (!chosenOffersDisplay || !submitDayButton) return;

        chosenOffersDisplay.innerHTML = '';

        const noneButton = document.createElement('button');
        noneButton.classList.add('grid-cell', 'none-selection-button');
        noneButton.textContent = 'None';
        noneButton.title = 'Select None';
        noneButton.dataset.roomName = "";
        noneButton.addEventListener('click', handleFinalSelectionClick);
        if (currentModalFinalSelection === null) {
            noneButton.classList.add('final-selection');
        }
        chosenOffersDisplay.appendChild(noneButton);

        if (currentModalOffers.length === 0) {
            chosenOffersDisplay.insertAdjacentHTML('beforeend', '<em>Select offers from grid above.</em>');
        } else {
            currentModalOffers.forEach(offer => {
                const tag = createRoomTagElement(offer.name, offer.color);
                tag.dataset.roomName = offer.name;
                tag.classList.add('clickable-offer');
                tag.addEventListener('click', handleFinalSelectionClick);

                if (currentModalFinalSelection === offer.name) {
                    tag.classList.add('final-selection');
                }
                chosenOffersDisplay.appendChild(tag);
            });
        }

        submitDayButton.disabled = false;
        submitDayButton.title = 'Submit day data';
    }

    function handleFinalSelectionClick(event, simulatedRoomName = undefined) {
        let clickedElement;
        let roomName;

        if (simulatedRoomName !== undefined) {
            roomName = simulatedRoomName;
            clickedElement = chosenOffersDisplay.querySelector(`.grid-cell[data-room-name="${roomName === null ? '' : roomName}"]`);
        } else if (event) {
            clickedElement = event.target.closest('.grid-cell');
            if (!clickedElement) return;
            roomName = clickedElement.dataset.roomName;
        } else {
            return;
        }

        currentModalFinalSelection = roomName === "" ? null : roomName;
        console.log("Final selection set to:", currentModalFinalSelection);

        chosenOffersDisplay.querySelectorAll('.grid-cell').forEach(el => {
            el.classList.remove('final-selection');
        });
        if (clickedElement) {
            clickedElement.classList.add('final-selection');
        }
    }


    function openModal() {
        if (!selectedCellElement || !modal || !modalTitle || !editDayIndexInput || !submitDayButton || !dayLetterInput) return;

        const cellId = selectedCellElement.id;
        currentModalOffers = [];
        currentModalFinalSelection = null;

        const cellData = roomData[cellId]; // Object { days: [], letter: null } or undefined
        const days = cellData?.days || [];
        const persistentLetter = cellData?.letter || null; // Get persistent letter

        // Load persistent letter into input
        dayLetterInput.value = persistentLetter || '';

        const existingDayIndex = days.findIndex(d => d.day === currentDay);
        const existingDayData = existingDayIndex !== -1 ? days[existingDayIndex] : null; // Day entry (no letter)

        editDayIndexInput.value = existingDayIndex;

        populateRoomSelectorGrid(); // Populate based on sort preference

        if (existingDayData) {
            // EDIT MODE (for day-specific data: offers, selection)
            modalTitle.textContent = `Edit Day ${currentDay} for Cell: ${cellId}${persistentLetter ? ` [${persistentLetter}]` : ''}`;
            submitDayButton.textContent = 'Update Day';

            currentModalOffers = (existingDayData.offered || [])
                .map(offerName => PREDEFINED_ROOMS.find(r => r.name === offerName))
                .filter(Boolean);

            currentModalFinalSelection = existingDayData.selected;
            // Letter is already loaded from persistent storage above

            // Update highlights on room selector grid
            if (roomSelectorGrid) {
                roomSelectorGrid.querySelectorAll('.room-selector-button').forEach(button => {
                    if (currentModalOffers.some(offer => offer.name === button.dataset.roomName)) {
                        button.classList.add('selected');
                    } else {
                        button.classList.remove('selected');
                    }
                });
            }
            updateChosenOffersDisplay();

        } else {
            // ADD MODE (for day-specific data)
            modalTitle.textContent = `Log Day ${currentDay} for Cell: ${cellId}${persistentLetter ? ` [${persistentLetter}]` : ''}`;
            submitDayButton.textContent = 'Log This Day';
            currentModalFinalSelection = null;
            // Letter is already loaded from persistent storage above
            updateChosenOffersDisplay();
        }

        modal.style.display = 'block';
    }

    function closeModal() {
        if (!modal || !editDayIndexInput) return;
        modal.style.display = 'none';
        editDayIndexInput.value = "-1";
        currentModalOffers = [];
        currentModalFinalSelection = null;
    }

    function handleSubmitDay() {
        if (!selectedCellElement || !dayLetterInput) return;

        const cellId = selectedCellElement.id;
        const editIndex = parseInt(editDayIndexInput.value, 10);

        const offeredObjects = currentModalOffers;
        const selected = currentModalFinalSelection; // Room name or null

        // --- Handle Letter Input ---
        let inputLetter = dayLetterInput.value.trim().toUpperCase();
        if (inputLetter.length > 1 || (inputLetter.length === 1 && !/^[A-Z]$/.test(inputLetter))) {
            alert("Please enter only a single letter (A-Z) for the associated letter, or leave it blank.");
            dayLetterInput.focus();
            return;
        }
        const persistentLetterToSave = inputLetter.length === 1 ? inputLetter : null;
        // --- End Handle Letter Input ---

        // Validation for day-specific data (offers/selection)
        const hasOffers = offeredObjects.length > 0;
        const hasSelection = selected !== null; // True even if "None" was explicitly selected

        // Allow saving even if only the letter is changed
        // if (!hasOffers && !hasSelection && persistentLetterToSave === (roomData[cellId]?.letter || null)) {
        //     alert(`No changes detected. Please provide offers/selection or modify the letter.`);
        //     return;
        // }

        if (selected !== null && !offeredObjects.some(o => o.name === selected)) {
             alert("The final selected room is not one of the chosen offers. Please re-select the final choice or add the room to the offers.");
             return;
        }

        // --- Ensure cell data structure exists ---
        if (!roomData[cellId]) {
            roomData[cellId] = { days: [], letter: null };
        } else if (!roomData[cellId].days) { // Fix if somehow only letter exists
             roomData[cellId].days = [];
        }
        // --- End Ensure Structure ---


        // --- Save Persistent Letter ---
        roomData[cellId].letter = persistentLetterToSave;
        console.log(`Set persistent letter for ${cellId} to: ${persistentLetterToSave}`);
        // --- End Save Persistent Letter ---


        // --- Prepare and Save Day-Specific Data (if any) ---
        // Only save day entry if there were offers or a selection made
        if (hasOffers || hasSelection) {
            const dayEntryData = { // Letter is NOT included here anymore
                day: currentDay,
                offered: offeredObjects.map(o => o.name),
                selected: selected,
            };

            const daysArray = roomData[cellId].days;

            if (editIndex !== -1) {
                // UPDATE existing day entry
                if (daysArray[editIndex] && daysArray[editIndex].day === currentDay) {
                     daysArray[editIndex] = dayEntryData;
                     console.log(`Updated Day ${currentDay} data for ${cellId}`);
                } else {
                     console.error(`Error updating day data: Index ${editIndex} mismatch.`);
                     alert(`Error updating day data.`); closeModal(); return;
                }
            } else {
                // ADD NEW day entry (check for duplicates first)
                const existingDayEntry = daysArray.find(d => d.day === currentDay);
                if (existingDayEntry) {
                    // Overwrite if adding again for the same day? Or prevent?
                    // Let's overwrite for simplicity, like an implicit edit.
                    const idxToOverwrite = daysArray.findIndex(d => d.day === currentDay);
                    daysArray[idxToOverwrite] = dayEntryData;
                     console.log(`Overwrote Day ${currentDay} data for ${cellId}`);
                } else {
                    daysArray.push(dayEntryData);
                    daysArray.sort((a, b) => a.day - b.day); // Keep sorted
                    console.log(`Added Day ${currentDay} data for ${cellId}`);
                }
            }
        } else {
             console.log(`No day-specific data (offers/selection) to save for Day ${currentDay}. Only letter updated.`);
        }
        // --- End Save Day-Specific Data ---

        saveData(); // Save the updated roomData (with new structure and letter)
        updateCellDisplay(cellId); // Update grid
        updateInfoPanel(); // Update side panel
        closeModal();
    }


    // --- Helper Functions ---
    function createRoomTagElement(roomName, roomColorName) {
        const div = document.createElement('div');
        div.classList.add('grid-cell'); // Use common styling
        div.textContent = roomName;
        div.title = roomName;

        const colorValue = roomColorName ? COLOR_NAME_TO_VALUE[roomColorName] : null;
        if (colorValue) {
            div.style.borderColor = colorValue;
            div.style.borderWidth = '2px';
            div.style.borderStyle = 'solid';
        } else {
            div.style.borderColor = '';
            div.style.borderWidth = '';
            div.style.borderStyle = '';
        }
        div.style.backgroundColor = ''; // Ensure default background
        div.style.color = ''; // Ensure default text color

        return div;
    }
    // --- End Helper Functions ---


    // --- Initialization ---
    loadData(); // Loads data, including migration and sort preference
    createGrid();
    updateAllCellDisplays();
    updateInfoPanel();

    // --- Event Listeners ---
    if (prevDayButton) prevDayButton.addEventListener('click', () => changeCurrentDay(-1));
    if (nextDayButton) nextDayButton.addEventListener('click', () => changeCurrentDay(1));
    if (currentDayInput) currentDayInput.addEventListener('change', (e) => setCurrentDay(e.target.value));
    if (closeModalButton) closeModalButton.addEventListener('click', closeModal);
    if (submitDayButton) submitDayButton.addEventListener('click', handleSubmitDay);
    if (addDayButton) {
        addDayButton.addEventListener('click', () => {
            if (selectedCellElement) {
                openModal();
            } else {
                alert("Please select a cell from the grid first.");
            }
        });
    }
    if (sortMethodSelector) {
        sortMethodSelector.addEventListener('change', (event) => {
            currentSortMethod = event.target.value;
            console.log("Sort method changed to:", currentSortMethod);
            saveSortPreference(); // Save the new preference
            // Re-populate the grid if the modal is currently open
            if (modal && modal.style.display === 'block') {
                populateRoomSelectorGrid();
            }
        });
    }
    window.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });


    // Clear Data Button Logic (Adjusted slightly)
    if (clearDataButton) {
        clearDataButton.addEventListener('click', () => {
             if (modal && modal.style.display === 'block') closeModal();
            if (confirm('Are you sure you want to clear ALL logged data for ALL cells (including letters)? This cannot be undone.')) {
                roomData = {}; // Clear the main data object
                currentDay = 1;
                try { localStorage.removeItem('bluePrinceRoomData'); } catch (e) { console.error("Error clearing room data:", e); }
                try { localStorage.setItem('bluePrinceCurrentDay', currentDay.toString()); } catch (e) { console.error("Error resetting current day:", e); }
                // Keep sort preference

                if (selectedCellElement) {
                    selectedCellElement.classList.remove('selected');
                    selectedCellElement = null;
                }
                updateCurrentDayDisplay();
                updateAllCellDisplays();
                updateInfoPanel();
                alert('All data cleared.');
            }
        });
    }

}); // End of DOMContentLoaded
