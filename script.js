document.addEventListener('DOMContentLoaded', () => {
    // --- Predefined Room Data ---
    // Replace with actual room names and colors from Blue Prince
    const PREDEFINED_ROOMS = [
        { name: "Kitchen", color: "#FFC300" }, { name: "Library", color: "#FF5733" },
        { name: "Garden", color: "#C70039" }, { name: "Study", color: "#900C3F" },
        { name: "Hall", color: "#581845" }, { name: "Attic", color: "#DAF7A6" },
        { name: "Cellar", color: "#FFC300" }, { name: "Balcony", color: "#FF5733" },
        { name: "Bedroom", color: "#C70039" }, { name: "Bathroom", color: "#900C3F" },
        // Add more rooms until you have 100 (or fewer if needed)
        // Placeholder rooms to reach 100 for the 10x10 grid example
        ...Array.from({ length: 90 }, (_, i) => ({ name: `Room ${i + 11}`, color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}` }))
    ].slice(0, 100); // Ensure exactly 100 rooms for the grid

    // --- DOM Element References ---
    const gridContainer = document.getElementById('mansion-grid');
    // ** ADDED Missing Info Panel References **
    const cellInfoPanel = document.getElementById('cell-info'); // Reference for the panel itself (already existed, but good to confirm)
    const selectedCellIdDisplay = document.getElementById('selected-cell-id');
    const dayCountDisplay = document.getElementById('day-count');
    const dayList = document.getElementById('day-list');
    const frequencyList = document.getElementById('frequency-list');
    // Modal References
    const modal = document.getElementById('input-modal');
    const modalTitle = document.getElementById('modal-title');
    const closeModalButton = document.querySelector('.close-button');
    const submitDayButton = document.getElementById('submit-day');
    const selectionOptionsContainer = document.getElementById('selection-options');
    const editDayIndexInput = document.getElementById('edit-day-index');
    const roomSelectorGrid = document.getElementById('room-grid-selector');
    const chosenOffersDisplay = document.getElementById('chosen-offers-display');
    // Control References
    const clearDataButton = document.getElementById('clear-all-data');
    const currentDayInput = document.getElementById('current-day-input');
    const prevDayButton = document.getElementById('prev-day');
    const nextDayButton = document.getElementById('next-day');


    // --- Constants and State ---
    const ROWS = 9;
    const COLS = 5;
    let selectedCellElement = null;
    let roomData = {};
    let currentDay = 1;
    let currentModalOffers = []; // Stores the {name, color} objects of the 3 selected rooms
    const MAX_OFFERS = 3;

    // --- Current Day Logic ---
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
    function createGrid() {
        gridContainer.innerHTML = '';
        gridContainer.style.gridTemplateRows = `repeat(${ROWS}, 60px)`;
        gridContainer.style.gridTemplateColumns = `repeat(${COLS}, 60px)`;
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

    function updateCellDisplay(cellId) {
        const cellElement = document.getElementById(cellId);
        if (!cellElement || cellElement.classList.contains('fixed-cell')) {
            return;
        }
        const days = roomData[cellId] || [];
        let selectionToShow = null;
        const entryForCurrentDay = days.find(dayEntry => dayEntry && typeof dayEntry.day === 'number' && dayEntry.day === currentDay);
        if (entryForCurrentDay) {
            selectionToShow = entryForCurrentDay.selected;
        }
        if (selectionToShow) {
            cellElement.textContent = selectionToShow;
            cellElement.classList.add('has-selection');
        } else {
            cellElement.textContent = cellId;
            cellElement.classList.remove('has-selection');
        }
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
    function updateInfoPanel() {
        // ** Check if elements exist before using them **
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

            // --- Header (Day Number + Delete Button) ---
            const header = document.createElement('h5');
            // ... (header creation remains the same) ...
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


            // --- Offered Rooms (Using Tags) ---
            const offersDiv = document.createElement('div');
            offersDiv.classList.add('day-offers');
            offersDiv.textContent = 'Offered: '; // Add prefix text

            let hasOffers = false;
            if (Array.isArray(dayEntry.offered)) {
                dayEntry.offered.forEach(offer => {
                    // Get name and color, handling potential old data
                    const roomName = offer?.name || (typeof offer === 'string' ? offer : null);
                    // Find the corresponding predefined room to get the color
                    const predefinedRoom = PREDEFINED_ROOMS.find(r => r.name === roomName);
                    const roomColor = predefinedRoom?.color; // Get color if found

                    if (roomName && typeof roomName === 'string' && roomName.trim() !== '') {
                        const tag = createRoomTagElement(roomName, roomColor); // Use the reusable function
                        offersDiv.appendChild(tag);
                        hasOffers = true;
                    }
                });
            }
            if (!hasOffers) {
                offersDiv.appendChild(document.createTextNode('None')); // Append "None" text if no valid offers
            }
            li.appendChild(offersDiv);
            // --- End Offered Rooms ---


            // --- Selection Controls (Radio Buttons) ---
            const selectionDiv = document.createElement('div');
            // ... (radio button creation remains the same, using offeredNames derived earlier if needed, or re-derive) ...
             selectionDiv.classList.add('day-selection-controls');
            selectionDiv.dataset.cellId = cellId;
            selectionDiv.dataset.dayNumber = dayEntry.day;

            // Re-derive offeredNames for radio buttons (ensure consistency)
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
            // --- End Selection Controls ---

            dayList.appendChild(li);
        });

        updateFrequencyList(cellId);
    }

    function updateFrequencyList(cellId) {
        // ** Check if element exists **
        if (!frequencyList) return;

        frequencyList.innerHTML = '';
        // ** Add grid class for styling **
        frequencyList.classList.add('frequency-grid');

        const days = roomData[cellId] || [];
        if (days.length === 0) {
            frequencyList.innerHTML = '<li>No data logged.</li>';
            // ** Remove grid class if no data **
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
            // ** Remove grid class if no valid offers **
            frequencyList.classList.remove('frequency-grid');
            return;
       }

        const sortedRooms = Object.entries(roomCounts).sort(([, countA], [, countB]) => countB - countA);

        sortedRooms.forEach(([roomName, count]) => {
            const probability = ((count / totalOffers) * 100).toFixed(1);

            // Find the room color
            const predefinedRoom = PREDEFINED_ROOMS.find(r => r.name === roomName);
            const roomColor = predefinedRoom?.color;

            // Create list item
            const li = document.createElement('li');
            li.classList.add('frequency-item'); // Add class for grid item styling

            // Create room tag
            const tag = createRoomTagElement(roomName, roomColor);
            li.appendChild(tag);

            // Create frequency text span
            const freqText = document.createElement('span');
            freqText.classList.add('frequency-text');
            freqText.textContent = ` ${count} (${probability}%)`; // Add space before text
            li.appendChild(freqText);

            frequencyList.appendChild(li);
        });
    }



    // --- Event Handlers ---
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
        updateInfoPanel(); // This function now uses selectedCellIdDisplay etc.
    }

    function handleGridMouseOut(event) {
        if (modal.style.display === 'block') return;
        if (!event.relatedTarget || !gridContainer.contains(event.relatedTarget)) {
            if (selectedCellElement) {
                selectedCellElement.classList.remove('selected');
                selectedCellElement = null;
                updateInfoPanel(); // This function now uses selectedCellIdDisplay etc.
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
            updateInfoPanel(); // This function now uses selectedCellIdDisplay etc.
        }
    }


    // --- Modal Logic ---
    function populateRoomSelectorGrid() {
        // ** Check if element exists **
        if (!roomSelectorGrid) return;

        roomSelectorGrid.innerHTML = '';
        roomSelectorGrid.style.gridTemplateColumns = `repeat(10, 1fr)`;

        PREDEFINED_ROOMS.forEach(room => {
            const button = document.createElement('button');
            button.classList.add('room-selector-button');
            button.textContent = room.name;
            button.title = room.name;
            button.style.backgroundColor = room.color;
            button.style.color = getContrastYIQ(room.color);
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
        const roomInfo = PREDEFINED_ROOMS.find(r => r.name === roomName); // Renamed variable

        if (!roomInfo) return;

        const isSelected = currentModalOffers.some(offer => offer.name === roomName);
        const canSelectMore = currentModalOffers.length < MAX_OFFERS;

        if (isSelected) {
            currentModalOffers = currentModalOffers.filter(offer => offer.name !== roomName);
            button.classList.remove('selected');
        } else if (canSelectMore) {
            currentModalOffers.push(roomInfo); // Push the whole room info object
            button.classList.add('selected');
        } else {
            alert(`You can only select ${MAX_OFFERS} rooms.`);
            return;
        }

        updateChosenOffersDisplay();
        updateModalSelectionOptions();
    }

    function updateChosenOffersDisplay() {
        if (!chosenOffersDisplay) return;

        chosenOffersDisplay.innerHTML = ''; // Clear previous
        if (currentModalOffers.length === 0) {
            chosenOffersDisplay.innerHTML = '<em>No offers selected yet.</em>';
            return;
        }
        currentModalOffers.forEach(offer => {
            // Use the reusable function here
            const tag = createRoomTagElement(offer.name, offer.color);
            // Remove the specific class if you simplified the CSS
            // tag.classList.add('chosen-offer-tag'); // This might not be needed anymore
            chosenOffersDisplay.appendChild(tag);
        });
    }

    function openModal() {
        // ** Check if elements exist **
        if (!selectedCellElement || !modal || !modalTitle || !editDayIndexInput || !submitDayButton) return;

        const cellId = selectedCellElement.id;
        currentModalOffers = [];

        const days = roomData[cellId] || [];
        const existingDayIndex = days.findIndex(d => d.day === currentDay);
        const existingDayData = existingDayIndex !== -1 ? days[existingDayIndex] : null;

        editDayIndexInput.value = existingDayIndex;

        populateRoomSelectorGrid(); // Requires roomSelectorGrid

        if (existingDayData) {
            modalTitle.textContent = `Edit Day ${currentDay} for Cell: ${cellId}`;
            submitDayButton.textContent = 'Update Day';

            currentModalOffers = (existingDayData.offered || [])
                .map(offerData => {
                    const offerName = offerData?.name || offerData;
                    return PREDEFINED_ROOMS.find(r => r.name === offerName);
                })
                .filter(Boolean);

            // Update grid button visual state (requires roomSelectorGrid)
            if (roomSelectorGrid) {
                roomSelectorGrid.querySelectorAll('.room-selector-button').forEach(button => {
                    if (currentModalOffers.some(offer => offer.name === button.dataset.roomName)) {
                        button.classList.add('selected');
                    } else {
                        button.classList.remove('selected');
                    }
                });
            }

            updateChosenOffersDisplay(); // Requires chosenOffersDisplay
            updateModalSelectionOptions(existingDayData.selected); // Requires selectionOptionsContainer

        } else {
            modalTitle.textContent = `Log Day ${currentDay} for Cell: ${cellId}`;
            submitDayButton.textContent = 'Log This Day';
            updateChosenOffersDisplay(); // Requires chosenOffersDisplay
            updateModalSelectionOptions(null); // Requires selectionOptionsContainer
        }

        modal.style.display = 'block';
    }

    function updateModalSelectionOptions(preSelection = null) {
        // ** Check if element exists **
        if (!selectionOptionsContainer) return;

        selectionOptionsContainer.innerHTML = '';
        const enableSelection = currentModalOffers.length === MAX_OFFERS;

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

        if (!enableSelection && currentModalOffers.length < MAX_OFFERS) {
             selectionOptionsContainer.insertAdjacentHTML('beforeend', `<p><em>Select ${MAX_OFFERS - currentModalOffers.length} more room(s) to enable final selection.</em></p>`);
        } else if (!enableSelection && currentModalOffers.length > MAX_OFFERS) {
             selectionOptionsContainer.insertAdjacentHTML('beforeend', `<p><em>Too many offers selected. Please deselect some.</em></p>`);
        }
    }


    function closeModal() {
        // ** Check if element exists **
        if (!modal || !editDayIndexInput) return;
        modal.style.display = 'none';
        editDayIndexInput.value = "-1";
        currentModalOffers = [];
    }

    function handleSubmitDay() {
        // ** Check if elements exist **
        if (!selectedCellElement || !selectionOptionsContainer) return;

        const cellId = selectedCellElement.id;
        const editIndex = parseInt(editDayIndexInput.value, 10);

        if (currentModalOffers.length !== MAX_OFFERS) {
            alert(`Please select exactly ${MAX_OFFERS} rooms from the grid.`);
            return;
        }
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
        updateInfoPanel(); // Requires info panel elements
        closeModal(); // Requires modal elements
    }

// --- Helper Functions ---
function getContrastYIQ(hexcolor){
    // ... (keep existing code) ...
    if (!hexcolor) return 'black';
    hexcolor = hexcolor.replace("#", "");
    if (hexcolor.length !== 6) return 'black';
    const r = parseInt(hexcolor.substr(0,2),16);
    const g = parseInt(hexcolor.substr(2,2),16);
    const b = parseInt(hexcolor.substr(4,2),16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return 'black';
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? 'black' : 'white';
}

/**
 * Creates a styled span element representing a room tag.
 * @param {string} roomName - The name of the room.
 * @param {string} roomColor - The hex color code for the room.
 * @returns {HTMLSpanElement} - The styled span element.
 */
function createRoomTagElement(roomName, roomColor) {
    const span = document.createElement('span');
    span.classList.add('room-tag'); // Use a generic class for styling
    span.textContent = roomName;
    span.style.backgroundColor = roomColor || '#eee'; // Default color if missing
    span.style.color = getContrastYIQ(roomColor);
    span.title = roomName; // Tooltip
    return span;
}
// --- End Helper Functions ---


    // --- Initialization ---
    loadData();
    createGrid();
    updateAllCellDisplays();

    // --- Event Listeners ---
    // ** Add checks for element existence before adding listeners **
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
             if (modal && modal.style.display === 'block') closeModal(); // Check modal exists
            if (confirm('Are you sure you want to clear ALL logged data for ALL cells? This cannot be undone.')) {
                roomData = {};
                currentDay = 1;
                try { localStorage.setItem('bluePrinceRoomData', JSON.stringify(roomData)); } catch(e) { console.error("Error clearing room data:", e); }
                try { localStorage.setItem('bluePrinceCurrentDay', currentDay.toString()); } catch(e) { console.error("Error resetting current day:", e); }
                if (selectedCellElement) {
                    selectedCellElement.classList.remove('selected');
                    selectedCellElement = null;
                }
                updateCurrentDayDisplay(); // Requires currentDayInput
                updateAllCellDisplays(); // Requires gridContainer
                updateInfoPanel(); // Requires info panel elements
                alert('All data cleared.');
            }
        });
    }

}); // End of DOMContentLoaded

