document.addEventListener('DOMContentLoaded', () => {
    // List of allowed color names
    const ROOM_COLORS = ["red", "blue", "purple", "yellow", "orange", "green", "gray"];
    // Map color names to actual CSS values (hex or standard names)
    const COLOR_NAME_TO_VALUE = {
        "red": "#dc3545",
        "blue": "#007bff",
        "purple": "#6f42c1",
        "yellow": "#ffc107",
        "orange": "#fd7e14",
        "green": "#28a745",
        "gray": "#808080",
    };

    // --- Predefined Room Data ---
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
    const sortMethodSelector = document.getElementById('sort-method-selector'); // Added reference for sort selector


    // --- Constants and State ---
    const ROWS = 9;
    const COLS = 5;
    let selectedCellElement = null;
    let roomData = {};
    let currentDay = 1;
    let currentModalOffers = []; // Array of room *objects* currently selected in modal
    let currentModalFinalSelection = null; // Stores name string or null
    const START_DATE = new Date(1993, 10, 7); // November is month 10 (0-indexed)
    let currentSortMethod = 'predefined'; // Default sort method ('predefined' or 'alphabetical')


    // --- Date Calculation Helper ---
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

    // --- Update Calendar Date Display ---
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
        // Load Room Data (with migration)
        const storedRoomData = localStorage.getItem('bluePrinceRoomData');
        if (storedRoomData) {
            try {
                let parsedData = JSON.parse(storedRoomData);
                console.log("Raw room data loaded.");

                // --- Migration Step ---
                let dataWasMigrated = false;
                for (const cellId in parsedData) {
                    if (Array.isArray(parsedData[cellId])) {
                        parsedData[cellId].forEach(dayEntry => {
                            if (Array.isArray(dayEntry.offered) && dayEntry.offered.length > 0) {
                                if (typeof dayEntry.offered[0] === 'object' && dayEntry.offered[0] !== null && dayEntry.offered[0].hasOwnProperty('name')) {
                                    dayEntry.offered = dayEntry.offered.map(offerObj => offerObj?.name).filter(Boolean);
                                    dataWasMigrated = true;
                                }
                            }
                        });
                    }
                }
                if (dataWasMigrated) {
                    console.log("Old room data format detected and migrated to new format (string names).");
                    // Optional: Save migrated data back immediately
                    // try { localStorage.setItem('bluePrinceRoomData', JSON.stringify(parsedData)); console.log("Migrated data saved back."); } catch (e) { console.error("Error saving migrated data:", e); }
                }
                // --- End Migration Step ---
                roomData = parsedData;
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

        // --- Load Sort Preference ---
        const storedSortMethod = localStorage.getItem('bluePrinceSortMethod');
        if (storedSortMethod && (storedSortMethod === 'predefined' || storedSortMethod === 'alphabetical')) {
            currentSortMethod = storedSortMethod;
            if (sortMethodSelector) {
                sortMethodSelector.value = currentSortMethod; // Update dropdown on load
            }
            console.log("Sort preference loaded:", currentSortMethod);
        }
        // --- End Load Sort Preference ---

        // Update displays AFTER loading data
        updateCurrentDayDisplay();
    }

    function saveData() {
        try {
            // Clean up empty arrays before saving
            for (const cellId in roomData) {
                if (Array.isArray(roomData[cellId]) && roomData[cellId].length === 0) {
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

        cellElement.innerHTML = '';
        cellElement.classList.remove('has-selection');
        cellElement.style.borderColor = '';
        cellElement.style.borderWidth = '';
        cellElement.style.backgroundColor = '';
        cellElement.style.color = '';

        const days = roomData[cellId] || [];
        let selectionToShow = null;
        let roomColorName = null;
        let letterToShow = null;

        const entryForCurrentDay = days.find(dayEntry => dayEntry && typeof dayEntry.day === 'number' && dayEntry.day === currentDay);

        if (entryForCurrentDay) {
            selectionToShow = entryForCurrentDay.selected;
            letterToShow = entryForCurrentDay.letter || null;
            if (selectionToShow) {
                const predefinedRoom = PREDEFINED_ROOMS.find(r => r.name === selectionToShow);
                roomColorName = predefinedRoom?.color;
            }
        }

        if (selectionToShow || letterToShow) {
            cellElement.classList.add('has-selection');
            if (selectionToShow) {
                const roomNameSpan = document.createElement('span');
                roomNameSpan.classList.add('cell-room-name');
                roomNameSpan.textContent = selectionToShow;
                cellElement.appendChild(roomNameSpan);
                if (roomColorName) {
                    cellElement.style.borderColor = COLOR_NAME_TO_VALUE[roomColorName] || '#aaa';
                    cellElement.style.borderWidth = '2px';
                } else {
                    cellElement.style.borderColor = '';
                    cellElement.style.borderWidth = '';
                }
            }
            if (letterToShow) {
                const letterSpan = document.createElement('span');
                letterSpan.classList.add('cell-letter');
                letterSpan.textContent = letterToShow;
                cellElement.appendChild(letterSpan);
            }
        } else {
            const idSpan = document.createElement('span');
            idSpan.classList.add('cell-id-display');
            idSpan.textContent = cellId;
            cellElement.appendChild(idSpan);
        }

        const absoluteLatestDay = days.length > 0 ? [...days].sort((a,b) => b.day - a.day)[0] : null; // Use copy for sort
        const tooltipSelection = absoluteLatestDay?.selected;
        const tooltipLetter = absoluteLatestDay?.letter;
        let tooltipText = cellId;
        if (tooltipSelection || tooltipLetter) {
            tooltipText += ` (Latest: ${tooltipSelection || 'N/A'}${tooltipLetter ? ` [${tooltipLetter}]` : ''})`;
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
        if (!selectedCellIdDisplay || !dayCountDisplay || !dayList || !frequencyList) {
            console.error("Info panel elements not found!");
            return;
        }

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
        selectedCellIdDisplay.textContent = `Selected: ${cellId}`;

        const days = roomData[cellId] ? [...roomData[cellId]].sort((a, b) => a.day - b.day) : []; // Use copy for sort

        dayCountDisplay.textContent = days.length;

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

        dayList.innerHTML = '';
        days.forEach((dayEntry, index) => {
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
                    const predefinedRoom = PREDEFINED_ROOMS.find(r => r.name === roomName);
                    const roomColorName = predefinedRoom?.color;

                    if (roomName && roomName.trim() !== '') {
                        const tag = createRoomTagElement(roomName, roomColorName);
                        if (dayEntry.selected === roomName) {
                            tag.classList.add('final-selection-info');
                        }
                        offersDiv.appendChild(tag);
                        hasOffers = true;
                    }
                });
            }
            if (!hasOffers) {
                offersDiv.appendChild(document.createTextNode('None'));
            }
            offersDiv.appendChild(document.createTextNode(` (Selected: ${dayEntry.selected || 'None'})`));
            if (dayEntry.letter) {
                const letterInfoSpan = document.createElement('span');
                letterInfoSpan.textContent = ` [${dayEntry.letter}]`;
                letterInfoSpan.style.fontWeight = 'bold';
                offersDiv.appendChild(letterInfoSpan);
            }
            li.appendChild(offersDiv);

            dayList.appendChild(li);
        });

        updateFrequencyList(cellId);
    }

    function updateFrequencyList(cellId) {
        if (!frequencyList) return;

        frequencyList.innerHTML = '';
        frequencyList.classList.add('frequency-grid');

        const days = roomData[cellId] || [];
        if (days.length === 0) {
            frequencyList.innerHTML = '<li>No data logged.</li>';
            frequencyList.classList.remove('frequency-grid');
            return;
        }

        const roomCounts = {};
        let totalOffers = 0;

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
        if (!cellId || isNaN(dayNumber)) {
            console.error("Could not delete day: Invalid data attributes."); return;
        }
        const dayIndex = roomData[cellId]?.findIndex(d => d.day === dayNumber);
        if (dayIndex === undefined || dayIndex === -1) {
            console.error(`Could not delete day: Day ${dayNumber} not found for ${cellId}.`); return;
        }
        if (confirm(`Are you sure you want to delete Day ${dayNumber} for cell ${cellId}?`)) {
            roomData[cellId].splice(dayIndex, 1);
            console.log(`Deleted Day ${dayNumber} for cell ${cellId}`);
            saveData();
            updateCellDisplay(cellId);
            updateInfoPanel();
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
        dayLetterInput.value = '';

        const days = roomData[cellId] || [];
        const existingDayIndex = days.findIndex(d => d.day === currentDay);
        const existingDayData = existingDayIndex !== -1 ? days[existingDayIndex] : null;

        editDayIndexInput.value = existingDayIndex;

        // Populate grid *using current sort method*
        populateRoomSelectorGrid();

        if (existingDayData) {
            // EDIT MODE
            modalTitle.textContent = `Edit Day ${currentDay} for Cell: ${cellId}`;
            submitDayButton.textContent = 'Update Day';

            currentModalOffers = (existingDayData.offered || [])
                .map(offerName => PREDEFINED_ROOMS.find(r => r.name === offerName))
                .filter(Boolean);

            currentModalFinalSelection = existingDayData.selected;
            dayLetterInput.value = existingDayData.letter || '';

            // Update highlights on the potentially sorted grid
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
            // ADD MODE
            modalTitle.textContent = `Log Day ${currentDay} for Cell: ${cellId}`;
            submitDayButton.textContent = 'Log This Day';
            currentModalFinalSelection = null;
            dayLetterInput.value = '';
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
        const selected = currentModalFinalSelection;

        let letter = dayLetterInput.value.trim().toUpperCase();
        if (letter.length > 1 || (letter.length === 1 && !/^[A-Z]$/.test(letter))) {
            alert("Please enter only a single letter (A-Z) for the associated letter, or leave it blank.");
            dayLetterInput.focus();
            return;
        }
        if (letter.length === 0) {
            letter = null;
        }

        const hasOffers = offeredObjects.length > 0;
        const hasSelection = selected !== null;
        const hasLetter = letter !== null;

        if (!hasOffers && !hasSelection && !hasLetter) {
            alert(`Please provide at least one offer, a final selection (even "None"), or an associated letter to log this day.`);
            return;
        }

        if (selected !== null && !offeredObjects.some(o => o.name === selected)) {
             alert("The final selected room is not one of the chosen offers. Please re-select the final choice or add the room to the offers.");
             return;
        }

        if (!roomData[cellId]) {
            roomData[cellId] = [];
        }

        const dayEntryData = {
            day: currentDay,
            offered: offeredObjects.map(o => o.name),
            selected: selected,
            letter: letter
        };

        if (editIndex !== -1) {
            // UPDATE
            if (roomData[cellId][editIndex] && roomData[cellId][editIndex].day === currentDay) {
                 roomData[cellId][editIndex] = dayEntryData;
                 console.log(`Updated Day ${currentDay} for ${cellId}`);
            } else {
                 console.error(`Error updating: Index ${editIndex} mismatch.`);
                 alert(`Error updating day data.`);
                 closeModal(); return;
            }
        } else {
            // ADD NEW
            const existingDayEntry = roomData[cellId].find(d => d.day === currentDay);
            if (existingDayEntry) {
                alert(`Data for Day ${currentDay} already exists. Edit it instead.`);
                closeModal(); return;
            }
            roomData[cellId].push(dayEntryData);
            roomData[cellId].sort((a, b) => a.day - b.day); // Keep day entries sorted
            console.log(`Added Day ${currentDay} for ${cellId}:`, dayEntryData);
        }

        saveData();
        updateCellDisplay(cellId);
        updateInfoPanel();
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
    loadData(); // Loads room data, current day, and sort preference
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

    // --- Listener for Sort Selector ---
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
    // --- End Listener ---

    window.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    if (clearDataButton) {
        clearDataButton.addEventListener('click', () => {
             if (modal && modal.style.display === 'block') closeModal();
            if (confirm('Are you sure you want to clear ALL logged data for ALL cells? This cannot be undone.')) {
                roomData = {};
                currentDay = 1;
                try { localStorage.removeItem('bluePrinceRoomData'); } catch (e) { console.error("Error clearing room data:", e); }
                try { localStorage.setItem('bluePrinceCurrentDay', currentDay.toString()); } catch (e) { console.error("Error resetting current day:", e); }
                // No need to clear sort preference here, user might want to keep it
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
