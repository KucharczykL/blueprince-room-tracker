document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    // ... (references remain the same) ...
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
    const roomOfferInputs = [document.getElementById('room1'), document.getElementById('room2'), document.getElementById('room3')];
    const selectionOptionsContainer = document.getElementById('selection-options');
    const clearDataButton = document.getElementById('clear-all-data');
    const currentDayInput = document.getElementById('current-day-input');
    const prevDayButton = document.getElementById('prev-day');
    const nextDayButton = document.getElementById('next-day');
    const editDayIndexInput = document.getElementById('edit-day-index');


    // --- Constants and State ---
    // ... (constants remain the same) ...
    const ROWS = 9;
    const COLS = 5;
    let selectedCellElement = null;
    let roomData = {};
    let currentDay = 1;

    // --- Current Day Logic ---
    function updateCurrentDayDisplay() {
        // Only update the input value here. Grid/Info updates are triggered separately.
        currentDayInput.value = currentDay;
        console.log("Current Day set to:", currentDay);
    }

    function changeCurrentDay(delta) {
        const newDay = currentDay + delta;
        if (newDay >= 1) {
            currentDay = newDay;
            updateCurrentDayDisplay(); // Update input display
            updateAllCellDisplays(); // Update grid for new day
            if (selectedCellElement) { // Update info panel if needed
                updateInfoPanel();
            }
            // Save currentDay change immediately
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
                updateCurrentDayDisplay(); // Update input display
                updateAllCellDisplays(); // Update grid for new day
                if (selectedCellElement) { // Update info panel if needed
                    updateInfoPanel();
                }
                // Save currentDay change immediately
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
        // Load room data
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

        // Load current day
        const storedDay = localStorage.getItem('bluePrinceCurrentDay');
        if (storedDay) {
            const parsedDay = parseInt(storedDay, 10);
            if (!isNaN(parsedDay) && parsedDay >= 1) {
                currentDay = parsedDay;
                console.log("Current day loaded:", currentDay);
            }
        }
        // *** DO NOT trigger UI updates here yet ***
        // Just update the input field's initial value
        currentDayInput.value = currentDay;
    }

    function saveData() {
        // This function now ONLY saves roomData. Current day is saved separately.
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
        // ... (grid creation logic remains the same) ...
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
        // Ensure we have a valid, non-fixed cell element
        if (!cellElement || cellElement.classList.contains('fixed-cell')) {
            return;
        }

        const days = roomData[cellId] || []; // Get data for this cell, or empty array
        let selectionToShow = null; // Default: show cell ID

        // Find the entry for the EXACT current day using Array.prototype.find
        const entryForCurrentDay = days.find(dayEntry => dayEntry && typeof dayEntry.day === 'number' && dayEntry.day === currentDay);

        // If an entry exists specifically for the current day, get its selection status
        if (entryForCurrentDay) {
            selectionToShow = entryForCurrentDay.selected; // This could be null (if "None" selected) or a room name string
        }
        // If no entry exists for the exact current day, selectionToShow remains null.

        // Now update the cell's appearance based ONLY on the selection for the exact current day
        if (selectionToShow) {
            // If selectionToShow is a non-empty string (a room name)
            cellElement.textContent = selectionToShow;
            cellElement.classList.add('has-selection');
        } else {
            // If selectionToShow is null, undefined, or ""
            // (meaning no entry for current day, or "None" was selected for current day)
            cellElement.textContent = cellId; // Revert to showing the cell ID
            cellElement.classList.remove('has-selection'); // Remove bold styling
        }

        // --- Tooltip logic can still show the absolute latest selection for reference ---
        const absoluteLatestDay = days.length > 0 ? days[days.length - 1] : null;
        const tooltipSelection = absoluteLatestDay?.selected;
        cellElement.title = tooltipSelection ? `${cellId} - ${tooltipSelection} (Latest)` : cellId;
    }


    function updateAllCellDisplays() {
        console.log("Updating all displays for day:", currentDay); // Keep this log for debugging
        const cells = gridContainer.querySelectorAll('.grid-cell:not(.fixed-cell)');
        cells.forEach(cell => updateCellDisplay(cell.id));
        // No need to update info panel here, it updates on hover or data change
    }


    // --- UI Updates (Info Panel) ---
    function updateInfoPanel() {
        // ... (this function remains the same) ...
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
            const offeredText = Array.isArray(dayEntry.offered) ? dayEntry.offered.filter(r => r).join(', ') : 'N/A';
            offersDiv.textContent = `Offered: ${offeredText || 'None'}`;
            li.appendChild(offersDiv);

            const selectionDiv = document.createElement('div');
            selectionDiv.classList.add('day-selection-controls');
            selectionDiv.dataset.cellId = cellId;
            selectionDiv.dataset.dayNumber = dayEntry.day;

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

            if (Array.isArray(dayEntry.offered)) {
                dayEntry.offered.forEach(room => {
                    if (room) {
                        const label = document.createElement('label');
                        const radio = document.createElement('input');
                        radio.type = 'radio';
                        radio.name = `day-${cellId}-${dayEntry.day}-selection`;
                        radio.value = room;
                        radio.checked = dayEntry.selected === room;
                        radio.addEventListener('change', handleChangeSelection);
                        label.appendChild(radio);
                        label.appendChild(document.createTextNode(` ${room}`));
                        selectionDiv.appendChild(label);
                    }
                });
            }
            li.appendChild(selectionDiv);

            dayList.appendChild(li);
        });

        updateFrequencyList(cellId);
    }

    function updateFrequencyList(cellId) {
        // ... (this function remains the same) ...
        frequencyList.innerHTML = '';
        const days = roomData[cellId] || [];
        if (days.length === 0) {
            frequencyList.innerHTML = '<li>No data logged.</li>';
            return;
        }
        const roomCounts = {};
        let totalOffers = 0;
        days.forEach(dayEntry => {
            if (Array.isArray(dayEntry.offered)) {
                dayEntry.offered.forEach(room => {
                    const trimmedRoom = room ? room.trim() : '';
                    if (trimmedRoom !== '') {
                        roomCounts[trimmedRoom] = (roomCounts[trimmedRoom] || 0) + 1;
                        totalOffers++;
                    }
                });
            }
        });
        if (totalOffers === 0) {
             frequencyList.innerHTML = '<li>No valid room offers logged.</li>';
             return;
        }
        const sortedRooms = Object.entries(roomCounts).sort(([, countA], [, countB]) => countB - countA);
        sortedRooms.forEach(([room, count]) => {
            const probability = ((count / totalOffers) * 100).toFixed(1);
            const li = document.createElement('li');
            li.textContent = `${room}: ${count} time(s) (${probability}%)`;
            frequencyList.appendChild(li);
        });
    }

    // --- Event Handlers ---
    // ... (handleCellMouseOver, handleGridMouseOut, handleCellClick remain the same) ...
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
        // ... (this function remains the same) ...
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
        saveData(); // Save roomData change
        updateCellDisplay(cellId); // Update grid cell display
    }

    function handleDeleteDay(event) {
        // ... (this function remains the same) ...
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
            saveData(); // Save roomData change
            updateCellDisplay(cellId);
            updateInfoPanel();
        }
    }

    // --- Modal Logic ---
    // ... (openModal, handleModalOfferInputChange, updateModalSelectionOptions, closeModal, handleSubmitDay remain the same) ...
    function openModal() {
        if (!selectedCellElement) return;
        const cellId = selectedCellElement.id;
        const days = roomData[cellId] || [];
        const existingDayIndex = days.findIndex(d => d.day === currentDay);
        const existingDayData = existingDayIndex !== -1 ? days[existingDayIndex] : null;
        editDayIndexInput.value = existingDayIndex;

        if (existingDayData) {
            modalTitle.textContent = `Edit Day ${currentDay} for Cell: ${cellId}`;
            submitDayButton.textContent = 'Update Day';
            roomOfferInputs.forEach((input, i) => {
                input.value = existingDayData.offered[i] || '';
            });
            updateModalSelectionOptions(existingDayData.selected);
        } else {
            modalTitle.textContent = `Log Day ${currentDay} for Cell: ${cellId}`;
            submitDayButton.textContent = 'Log This Day';
            roomOfferInputs.forEach(input => input.value = '');
            updateModalSelectionOptions(null);
        }
        roomOfferInputs.forEach(input => {
            input.removeEventListener('input', handleModalOfferInputChange);
            input.addEventListener('input', handleModalOfferInputChange);
        });
        modal.style.display = 'block';
        requestAnimationFrame(() => {
             roomOfferInputs[0].focus();
        });
    }

    function handleModalOfferInputChange() {
        updateModalSelectionOptions();
    }

    function updateModalSelectionOptions(preSelection = null) {
        selectionOptionsContainer.innerHTML = '';
        const offers = roomOfferInputs.map(input => input.value.trim()).filter(offer => offer !== '');
        const uniqueOffers = [...new Set(offers)];
        const noneLabel = document.createElement('label');
        const noneRadio = document.createElement('input');
        noneRadio.type = 'radio';
        noneRadio.name = 'modal-selection';
        noneRadio.value = '';
        noneRadio.checked = preSelection == null;
        noneLabel.appendChild(noneRadio);
        noneLabel.appendChild(document.createTextNode(' None (No Selection)'));
        selectionOptionsContainer.appendChild(noneLabel);
        uniqueOffers.forEach(offer => {
            const label = document.createElement('label');
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'modal-selection';
            radio.value = offer;
            radio.checked = preSelection === offer;
            label.appendChild(radio);
            label.appendChild(document.createTextNode(` ${offer}`));
            selectionOptionsContainer.appendChild(label);
        });
        if (uniqueOffers.length === 0 && preSelection == null) {
             selectionOptionsContainer.insertAdjacentHTML('beforeend', '<p><em>Enter offers to enable selection.</em></p>');
        }
    }

    function closeModal() {
        modal.style.display = 'none';
        roomOfferInputs.forEach(input => {
            input.removeEventListener('input', handleModalOfferInputChange);
        });
        editDayIndexInput.value = "-1";
    }

    function handleSubmitDay() {
        if (!selectedCellElement) return;
        const cellId = selectedCellElement.id;
        const editIndex = parseInt(editDayIndexInput.value, 10);
        const offered = roomOfferInputs.map(input => input.value.trim());
        if (offered.every(room => room === '')) {
             alert("Please enter at least one room offer.");
             roomOfferInputs[0].focus();
             return;
        }
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
                 console.error(`Error updating: Index ${editIndex} does not correspond to Day ${currentDay} for ${cellId}.`);
                 alert(`Error updating day data. Data mismatch detected.`);
                 closeModal();
                 return;
            }
        } else {
            if (roomData[cellId].some(d => d.day === currentDay)) {
                alert(`Data for Day ${currentDay} already exists. Cannot add duplicate. Please edit instead.`);
                closeModal();
                return;
            }
            const newDayEntry = { day: currentDay, offered: offered, selected: selected };
            roomData[cellId].push(newDayEntry);
            roomData[cellId].sort((a, b) => a.day - b.day);
            console.log(`Added Day ${currentDay} for ${cellId}:`, newDayEntry);
        }
        saveData(); // Save roomData change
        updateCellDisplay(cellId);
        updateInfoPanel();
        closeModal();
    }


    // --- Initialization ---
    loadData(); // 1. Load data and current day value
    createGrid(); // 2. Create the grid DOM elements
    updateAllCellDisplays(); // 3. *** NOW update the grid display based on loaded data ***

    // --- Event Listeners ---
    // Day Controls
    prevDayButton.addEventListener('click', () => changeCurrentDay(-1));
    nextDayButton.addEventListener('click', () => changeCurrentDay(1));
    currentDayInput.addEventListener('change', (e) => setCurrentDay(e.target.value));

    // Modal
    closeModalButton.addEventListener('click', closeModal);
    submitDayButton.addEventListener('click', handleSubmitDay);
    window.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });
    document.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && modal.style.display === 'block') {
             if (modal.contains(document.activeElement) && document.activeElement.tagName === 'INPUT') {
                 e.preventDefault();
                 handleSubmitDay();
             }
        }
    });

    // Clear Data
    if (clearDataButton) {
        clearDataButton.addEventListener('click', () => {
            if (modal.style.display === 'block') closeModal();
            if (confirm('Are you sure you want to clear ALL logged data for ALL cells? This cannot be undone.')) {
                roomData = {};
                currentDay = 1;
                // Save empty room data
                try { localStorage.setItem('bluePrinceRoomData', JSON.stringify(roomData)); } catch(e) { console.error("Error clearing room data:", e); }
                // Save reset current day
                try { localStorage.setItem('bluePrinceCurrentDay', currentDay.toString()); } catch(e) { console.error("Error resetting current day:", e); }

                if (selectedCellElement) {
                    selectedCellElement.classList.remove('selected');
                    selectedCellElement = null;
                }
                updateCurrentDayDisplay(); // Update input field
                updateAllCellDisplays(); // Reset grid display
                updateInfoPanel(); // Clear info panel
                alert('All data cleared.');
            }
        });
    }

}); // End of DOMContentLoaded
