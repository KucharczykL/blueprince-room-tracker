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
        // Add more if needed, ensure names match ROOM_COLORS
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
        { name: "Greenhouse", color: "green", exit_no: 1, rarity: "common", extra_data: [] },
        { name: "Commissary", color: "yellow", exit_no: 1, rarity: "common", extra_data: [] },
        { name: "Kitchen", color: "yellow", exit_no: 1, rarity: "common", extra_data: [] },
        { name: "Locksmit", color: "yellow", exit_no: 1, rarity: "common", extra_data: [] }, // Note: Name kept as provided
        { name: "Showroom", color: "yellow", exit_no: 1, rarity: "common", extra_data: [] },
        { name: "Laundry Room", color: "yellow", exit_no: 1, rarity: "common", extra_data: [] },
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
    ];

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
    const selectionOptionsContainer = document.getElementById('selection-options');
    const editDayIndexInput = document.getElementById('edit-day-index');
    const roomSelectorGrid = document.getElementById('room-grid-selector');
    const chosenOffersDisplay = document.getElementById('chosen-offers-display');
    const clearDataButton = document.getElementById('clear-all-data');
    const currentDayInput = document.getElementById('current-day-input');
    const prevDayButton = document.getElementById('prev-day');
    const nextDayButton = document.getElementById('next-day');


    // --- Constants and State ---
    // ... (state remains the same) ...
    const ROWS = 9;
    const COLS = 5;
    let selectedCellElement = null;
    let roomData = {};
    let currentDay = 1;
    let currentModalOffers = [];
    const MAX_OFFERS = 3;


    // --- Current Day Logic ---
    // ... (functions remain the same) ...
    function updateCurrentDayDisplay() {
        currentDayInput.value = currentDay;
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
    // ... (functions remain the same) ...
    function loadData() {
        const storedRoomData = localStorage.getItem('bluePrinceRoomData');
        if (storedRoomData) {
            try {
                roomData = JSON.parse(storedRoomData);
                console.log("Room data loaded.");
            } catch (e) {
                console.error("Error parsing room data:", e);
                roomData = {};
            }
        } else {
            roomData = {};
            console.log("No room data found.");
        }
        const storedDay = localStorage.getItem('bluePrinceCurrentDay');
        if (storedDay) {
            const parsedDay = parseInt(storedDay, 10);
            if (!isNaN(parsedDay) && parsedDay >= 1) {
                currentDay = parsedDay;
                console.log("Current day loaded:", currentDay);
            }
        }
        currentDayInput.value = currentDay;
    }

    function saveData() {
        try {
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


    // --- Grid Generation & Display ---
    // ... (createGrid remains the same) ...
    function createGrid() {
        gridContainer.innerHTML = '';
        // gridContainer.style.gridTemplateRows = `repeat(${ROWS}, 60px)`;
        // gridContainer.style.gridTemplateColumns = `repeat(${COLS}, 60px)`;
        const centerCol = Math.ceil(COLS / 2);

        for (let visualRow = 1; visualRow <= ROWS; visualRow++) {
            const rank = ROWS - visualRow + 1;
            for (let c = 1; c <= COLS; c++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.dataset.rank = rank;
                cell.dataset.col = c;
                const cellId = `R${rank}C${c}`;
                // const cellId = " ";
                cell.id = cellId;

                if (rank === ROWS && c === centerCol) {
                    cell.textContent = 'Antechamber';
                    cell.classList.add('fixed-cell', 'antechamber');
                } else if (rank === 1 && c === centerCol) {
                    cell.textContent = 'Entrance Hall';
                    cell.classList.add('fixed-cell', 'entrance-hall');
                } else {
                    cell.textContent = cellId; // Default text
                    cell.addEventListener('mouseover', handleCellMouseOver);
                    cell.addEventListener('click', handleCellClick);
                }
                gridContainer.appendChild(cell);
            }
        }
        gridContainer.addEventListener('mouseout', handleGridMouseOut);
    }


    // ** MODIFIED updateCellDisplay for border color **
    function updateCellDisplay(cellId) {
        const cellElement = document.getElementById(cellId);
        if (!cellElement || cellElement.classList.contains('fixed-cell')) {
            return;
        }

        const days = roomData[cellId] || [];
        let selectionToShow = null;
        let roomColorName = null; // Store the color NAME

        const entryForCurrentDay = days.find(dayEntry => dayEntry && typeof dayEntry.day === 'number' && dayEntry.day === currentDay);

        if (entryForCurrentDay) {
            selectionToShow = entryForCurrentDay.selected; // Room name string or null
            if (selectionToShow) {
                const predefinedRoom = PREDEFINED_ROOMS.find(r => r.name === selectionToShow);
                roomColorName = predefinedRoom?.color; // Get the color NAME ('red', 'blue', etc.)
            }
        }

        // Update display based on selection and color name
        if (selectionToShow && roomColorName) {
            // Room selected AND color name found
            cellElement.textContent = selectionToShow;
            cellElement.classList.add('has-selection');
            // Apply border color using the mapped value
            cellElement.style.borderColor = COLOR_NAME_TO_VALUE[roomColorName] || '#aaa'; // Fallback border color
            cellElement.style.borderWidth = '2px'; // Make border more prominent
            // Reset background and text color to default
            cellElement.style.backgroundColor = '';
            cellElement.style.color = '';
        } else if (selectionToShow) {
            // Room selected but color name NOT found (shouldn't happen)
            cellElement.textContent = selectionToShow;
            cellElement.classList.add('has-selection');
            // Reset border, background, color
            cellElement.style.borderColor = '';
            cellElement.style.borderWidth = '';
            cellElement.style.backgroundColor = '';
            cellElement.style.color = '';
        } else {
            // No room selected for this day
            cellElement.textContent = cellId;
            cellElement.classList.remove('has-selection');
            // Reset border, background, color
            cellElement.style.borderColor = '';
            cellElement.style.borderWidth = '';
            cellElement.style.backgroundColor = '';
            cellElement.style.color = '';
        }

        // Tooltip logic (unchanged)
        const absoluteLatestDay = days.length > 0 ? days[days.length - 1] : null;
        const tooltipSelection = absoluteLatestDay?.selected;
        cellElement.title = tooltipSelection ? `${cellId} - ${tooltipSelection} (Latest)` : cellId;
    }

    function updateAllCellDisplays() {
        console.log("Updating all displays for day:", currentDay);
        const cells = gridContainer.querySelectorAll('.grid-cell:not(.fixed-cell)');
        cells.forEach(cell => updateCellDisplay(cell.id));
    }


    // --- UI Updates (Info Panel) ---
    // ... (updateInfoPanel remains the same - uses createRoomTagElement) ...
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
            return;
        }

        const cellId = selectedCellElement.id;
        selectedCellIdDisplay.textContent = `Selected: ${cellId}`;

        const days = roomData[cellId] || [];
        days.sort((a, b) => a.day - b.day);

        dayCountDisplay.textContent = days.length;

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
                dayEntry.offered.forEach(offer => {
                    const roomName = offer?.name || (typeof offer === 'string' ? offer : null);
                    const predefinedRoom = PREDEFINED_ROOMS.find(r => r.name === roomName);
                    const roomColorName = predefinedRoom?.color; // Get color NAME

                    if (roomName && typeof roomName === 'string' && roomName.trim() !== '') {
                        // Pass color NAME to createRoomTagElement
                        const tag = createRoomTagElement(roomName, roomColorName);
                        offersDiv.appendChild(tag);
                        hasOffers = true;
                    }
                });
            }
            if (!hasOffers) {
                offersDiv.appendChild(document.createTextNode('None'));
            }
            li.appendChild(offersDiv);

            const selectionDiv = document.createElement('div');
            selectionDiv.classList.add('day-selection-controls');
            selectionDiv.dataset.cellId = cellId;
            selectionDiv.dataset.dayNumber = dayEntry.day;

            const offeredNames = Array.isArray(dayEntry.offered)
                ? dayEntry.offered
                    .map(offer => offer?.name || (typeof offer === 'string' ? offer : null))
                    .filter(name => name && typeof name === 'string' && name.trim() !== '')
                : [];

            const noneLabel = document.createElement('label');
            const noneRadio = document.createElement('input');
            noneRadio.type = 'radio';
            noneRadio.name = `day-${cellId}-${dayEntry.day}-selection`;
            noneRadio.value = '';
            noneRadio.checked = !dayEntry.selected;
            noneRadio.addEventListener('change', handleChangeSelection);
            noneLabel.appendChild(noneRadio);
            noneLabel.appendChild(document.createTextNode(' None'));
            selectionDiv.appendChild(noneLabel);

            offeredNames.forEach(roomName => {
                const label = document.createElement('label');
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = `day-${cellId}-${dayEntry.day}-selection`;
                radio.value = roomName;
                radio.checked = dayEntry.selected === roomName;
                radio.addEventListener('change', handleChangeSelection);
                label.appendChild(radio);
                label.appendChild(document.createTextNode(` ${roomName}`));
                selectionDiv.appendChild(label);
            });
            li.appendChild(selectionDiv);

            dayList.appendChild(li);
        });

        updateFrequencyList(cellId);
    }

    // ... (updateFrequencyList remains the same - uses createRoomTagElement) ...
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
                dayEntry.offered.forEach(offer => {
                    const roomName = offer?.name || (typeof offer === 'string' ? offer : null);
                    if (roomName && typeof roomName === 'string') {
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
            const roomColorName = predefinedRoom?.color; // Get color NAME

            const li = document.createElement('li');
            li.classList.add('frequency-item');

            // Pass color NAME to createRoomTagElement
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
    // ... (functions remain the same) ...
    function handleCellMouseOver(event) {
        if (modal.style.display === 'block') return;
        const hoveredElement = event.target.closest('.grid-cell');
        if (!hoveredElement || hoveredElement.classList.contains('fixed-cell') || hoveredElement === selectedCellElement) {
            return;
        }
        if (selectedCellElement) {
            selectedCellElement.classList.remove('selected');
        }
        selectedCellElement = hoveredElement;
        selectedCellElement.classList.add('selected');
        updateInfoPanel();
    }

    function handleGridMouseOut(event) {
        if (modal.style.display === 'block') return;
        if (!event.relatedTarget || !gridContainer.contains(event.relatedTarget)) {
            if (selectedCellElement) {
                selectedCellElement.classList.remove('selected');
                selectedCellElement = null;
                updateInfoPanel();
            }
        }
    }

    function handleCellClick(event) {
        const clickedElement = event.target.closest('.grid-cell');
        if (event.target.closest('.delete-day-button') || event.target.closest('.day-selection-controls')) {
            return;
        }
        if (clickedElement && !clickedElement.classList.contains('fixed-cell') && clickedElement === selectedCellElement) {
            openModal();
        }
    }

    function handleChangeSelection(event) {
        const radio = event.target;
        const controlsDiv = radio.closest('.day-selection-controls');
        const cellId = controlsDiv.dataset.cellId;
        const dayNumber = parseInt(controlsDiv.dataset.dayNumber, 10);
        const newSelection = radio.value || null;

        if (!cellId || isNaN(dayNumber)) {
            console.error("Failed to change selection: Invalid data attributes."); return;
        }
        const dayIndex = roomData[cellId]?.findIndex(d => d.day === dayNumber);
        if (dayIndex === undefined || dayIndex === -1) {
            console.error(`Failed to change selection: Day ${dayNumber} not found for ${cellId}.`); return;
        }
        roomData[cellId][dayIndex].selected = newSelection;
        console.log(`Changed selection for ${cellId}, Day ${dayNumber} to: ${newSelection}`);
        saveData();
        updateCellDisplay(cellId);
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
    // ** MODIFIED populateRoomSelectorGrid for border color **
    function populateRoomSelectorGrid() {
        if (!roomSelectorGrid) return;

        roomSelectorGrid.innerHTML = '';
        // roomSelectorGrid.style.gridTemplateColumns = `repeat(10, 1fr)`;

        PREDEFINED_ROOMS.forEach(room => {
            const button = document.createElement('button');
            button.classList.add('room-selector-button', 'grid-cell');
            button.textContent = room.name;
            button.title = room.name;
            // Apply border color based on mapped value
            const colorValue = COLOR_NAME_TO_VALUE[room.color] || '#ccc'; // Fallback color
            button.style.borderColor = colorValue;
            button.style.borderWidth = '2px'; // Make border visible
            // Reset background and text color
            button.style.backgroundColor = '';
            button.style.color = ''; // Use default text color
            button.dataset.roomName = room.name;

            if (currentModalOffers.some(offer => offer.name === room.name)) {
                button.classList.add('selected');
            }

            button.addEventListener('click', handleRoomSelection);
            roomSelectorGrid.appendChild(button);
        });
    }

    // ... (handleRoomSelection remains the same) ...
    function handleRoomSelection(event) {
        const button = event.target;
        const roomName = button.dataset.roomName;
        const roomInfo = PREDEFINED_ROOMS.find(r => r.name === roomName);

        if (!roomInfo) return;

        const isSelected = currentModalOffers.some(offer => offer.name === roomName);
        const canSelectMore = currentModalOffers.length < MAX_OFFERS;

        if (isSelected) {
            currentModalOffers = currentModalOffers.filter(offer => offer.name !== roomName);
            button.classList.remove('selected');
        } else if (canSelectMore) {
            currentModalOffers.push(roomInfo);
            button.classList.add('selected');
        } else {
            alert(`You can only select ${MAX_OFFERS} rooms.`);
            return;
        }

        updateChosenOffersDisplay();
        updateModalSelectionOptions();
    }

    // ... (updateChosenOffersDisplay remains the same - uses createRoomTagElement) ...
    function updateChosenOffersDisplay() {
        if (!chosenOffersDisplay) return;

        chosenOffersDisplay.innerHTML = '';
        if (currentModalOffers.length === 0) {
            chosenOffersDisplay.innerHTML = '<em>No offers selected yet.</em>';
            return;
        }
        currentModalOffers.forEach(offer => {
            // Pass color NAME to createRoomTagElement
            const tag = createRoomTagElement(offer.name, offer.color);
            chosenOffersDisplay.appendChild(tag);
        });
    }

    // ... (openModal remains the same) ...
    function openModal() {
        if (!selectedCellElement || !modal || !modalTitle || !editDayIndexInput || !submitDayButton) return;

        const cellId = selectedCellElement.id;
        currentModalOffers = [];

        const days = roomData[cellId] || [];
        const existingDayIndex = days.findIndex(d => d.day === currentDay);
        const existingDayData = existingDayIndex !== -1 ? days[existingDayIndex] : null;

        editDayIndexInput.value = existingDayIndex;

        populateRoomSelectorGrid();

        if (existingDayData) {
            modalTitle.textContent = `Edit Day ${currentDay} for Cell: ${cellId}`;
            submitDayButton.textContent = 'Update Day';

            currentModalOffers = (existingDayData.offered || [])
                .map(offerData => {
                    const offerName = offerData?.name || offerData;
                    return PREDEFINED_ROOMS.find(r => r.name === offerName);
                })
                .filter(Boolean);

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
            updateModalSelectionOptions(existingDayData.selected);

        } else {
            modalTitle.textContent = `Log Day ${currentDay} for Cell: ${cellId}`;
            submitDayButton.textContent = 'Log This Day';
            updateChosenOffersDisplay();
            updateModalSelectionOptions(null);
        }

        modal.style.display = 'block';
    }

    // ... (updateModalSelectionOptions remains the same) ...
    function updateModalSelectionOptions(preSelection = null) {
        if (!selectionOptionsContainer) return;

        selectionOptionsContainer.innerHTML = '';
        const enableSelection = currentModalOffers.length <= MAX_OFFERS;

        const noneLabel = document.createElement('label');
        const noneRadio = document.createElement('input');
        noneRadio.type = 'radio';
        noneRadio.name = 'modal-selection';
        noneRadio.value = '';
        noneRadio.checked = preSelection == null;
        noneRadio.disabled = !enableSelection;
        noneLabel.appendChild(noneRadio);
        noneLabel.appendChild(document.createTextNode(' None (No Selection)'));
        if (!enableSelection) noneLabel.style.opacity = '0.5';
        selectionOptionsContainer.appendChild(noneLabel);

        currentModalOffers.forEach(offer => {
            const label = document.createElement('label');
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'modal-selection';
            radio.value = offer.name;
            radio.checked = preSelection === offer.name;
            radio.disabled = !enableSelection;
            label.appendChild(radio);
            label.appendChild(document.createTextNode(` ${offer.name}`));
            if (!enableSelection) label.style.opacity = '0.5';
            selectionOptionsContainer.appendChild(label);
        });

        // if (!enableSelection && currentModalOffers.length < MAX_OFFERS) {
        //      selectionOptionsContainer.insertAdjacentHTML('beforeend', `<p><em>Select ${MAX_OFFERS - currentModalOffers.length} more room(s) to enable final selection.</em></p>`);
        // } else if (!enableSelection && currentModalOffers.length > MAX_OFFERS) {
        //      selectionOptionsContainer.insertAdjacentHTML('beforeend', `<p><em>Too many offers selected. Please deselect some.</em></p>`);
        // }
        if (!enableSelection && currentModalOffers.length > MAX_OFFERS) {
            selectionOptionsContainer.insertAdjacentHTML('beforeend', `<p><em>Too many offers selected. Please deselect some.</em></p>`);
        }
    }

    // ... (closeModal remains the same) ...
    function closeModal() {
        if (!modal || !editDayIndexInput) return;
        modal.style.display = 'none';
        editDayIndexInput.value = "-1";
        currentModalOffers = [];
    }

    // ... (handleSubmitDay remains the same) ...
    function handleSubmitDay() {
        if (!selectedCellElement || !selectionOptionsContainer) return;

        const cellId = selectedCellElement.id;
        const editIndex = parseInt(editDayIndexInput.value, 10);

        // if (currentModalOffers.length !== MAX_OFFERS) {
        //     alert(`Please select exactly ${MAX_OFFERS} rooms from the grid.`);
        //     return;
        // }
        const offered = currentModalOffers;

        const selectedRadio = selectionOptionsContainer.querySelector('input[name="modal-selection"]:checked');
        const selected = selectedRadio ? (selectedRadio.value || null) : null;

        if (!roomData[cellId]) {
            roomData[cellId] = [];
        }

        if (editIndex !== -1) {
            if (roomData[cellId][editIndex] && roomData[cellId][editIndex].day === currentDay) {
                roomData[cellId][editIndex].offered = offered;
                roomData[cellId][editIndex].selected = selected;
                console.log(`Updated Day ${currentDay} for ${cellId}`);
            } else {
                console.error(`Error updating: Index ${editIndex} mismatch.`);
                alert(`Error updating day data.`);
                closeModal(); return;
            }
        } else {
            if (roomData[cellId].some(d => d.day === currentDay)) {
                alert(`Data for Day ${currentDay} already exists.`);
                closeModal(); return;
            }
            const newDayEntry = { day: currentDay, offered: offered, selected: selected };
            roomData[cellId].push(newDayEntry);
            roomData[cellId].sort((a, b) => a.day - b.day);
            console.log(`Added Day ${currentDay} for ${cellId}:`, newDayEntry);
        }

        saveData();
        updateCellDisplay(cellId);
        updateInfoPanel();
        closeModal();
    }


    // --- Helper Functions ---
    // ** REMOVED getContrastYIQ **
    // function getContrastYIQ(colorValue){ ... }

    // ** MODIFIED createRoomTagElement for border color **
    /**
     * Creates a styled div element representing a room tag/cell.
     * Uses the .grid-cell base style. Applies border color.
     * @param {string} roomName - The name of the room.
     * @param {string} [roomColorName] - Optional color name ('red', 'blue', etc.).
     * @returns {HTMLDivElement} - The styled div element.
     */
    function createRoomTagElement(roomName, roomColorName) {
        const div = document.createElement('div');
        div.classList.add('grid-cell'); // Use the base class
        div.textContent = roomName;
        div.title = roomName; // Tooltip

        // Apply border color if color name is provided and mapped
        const colorValue = roomColorName ? COLOR_NAME_TO_VALUE[roomColorName] : null;
        if (colorValue) {
            div.style.borderColor = colorValue;
            div.style.borderWidth = '2px'; // Make border visible
            div.style.borderStyle = 'solid';
        } else {
            // Reset to default border from CSS if no color name/value
            div.style.borderColor = '';
            div.style.borderWidth = '';
            div.style.borderStyle = '';
        }
        // Ensure background and text color use defaults from CSS
        div.style.backgroundColor = '';
        div.style.color = '';

        return div;
    }
    // --- End Helper Functions ---


    // --- Initialization ---
    loadData();
    createGrid();
    updateAllCellDisplays();

    // --- Event Listeners ---
    // ... (listeners remain the same) ...
    if (prevDayButton) prevDayButton.addEventListener('click', () => changeCurrentDay(-1));
    if (nextDayButton) nextDayButton.addEventListener('click', () => changeCurrentDay(1));
    if (currentDayInput) currentDayInput.addEventListener('change', (e) => setCurrentDay(e.target.value));
    if (closeModalButton) closeModalButton.addEventListener('click', closeModal);
    if (submitDayButton) submitDayButton.addEventListener('click', handleSubmitDay);

    window.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    if (clearDataButton) {
        clearDataButton.addEventListener('click', () => {
            if (modal && modal.style.display === 'block') closeModal();
            if (confirm('Are you sure you want to clear ALL logged data for ALL cells? This cannot be undone.')) {
                roomData = {};
                currentDay = 1;
                try { localStorage.setItem('bluePrinceRoomData', JSON.stringify(roomData)); } catch (e) { console.error("Error clearing room data:", e); }
                try { localStorage.setItem('bluePrinceCurrentDay', currentDay.toString()); } catch (e) { console.error("Error resetting current day:", e); }
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
