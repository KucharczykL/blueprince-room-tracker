document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const gridContainer = document.getElementById('mansion-grid');
    const cellInfoPanel = document.getElementById('cell-info');
    const selectedCellIdDisplay = document.getElementById('selected-cell-id');
    const dayCountDisplay = document.getElementById('day-count'); // Renamed
    const dayList = document.getElementById('day-list'); // Renamed
    const frequencyList = document.getElementById('frequency-list'); // Renamed
    const modal = document.getElementById('input-modal');
    const modalTitle = document.getElementById('modal-title');
    const closeModalButton = document.querySelector('.close-button');
    const submitDayButton = document.getElementById('submit-day'); // Renamed
    const roomOfferInputs = [document.getElementById('room1'), document.getElementById('room2'), document.getElementById('room3')];
    const selectionOptionsContainer = document.getElementById('selection-options');
    const clearDataButton = document.getElementById('clear-all-data'); // Renamed

    // --- Constants and State ---
    const ROWS = 9;
    const COLS = 5;
    let selectedCellElement = null; // Holds the currently selected cell DOM element
    // New Data Structure: { "R1C1": [ { day: 1, offered: ["A","B","C"], selected: "B" }, ... ], ... }
    let roomData = {};

    // --- Data Persistence ---
    function loadData() {
        const storedData = localStorage.getItem('bluePrinceRoomData');
        if (storedData) {
            try {
                roomData = JSON.parse(storedData);
                console.log("Data loaded from localStorage.");
                // Optional: Add migration logic here if old data structure exists
            } catch (e) {
                console.error("Error parsing data from localStorage:", e);
                roomData = {};
            }
        } else {
            roomData = {};
            console.log("No data found in localStorage. Initializing empty data.");
        }
        // Update grid display after loading data
        updateAllCellDisplays();
    }

    function saveData() {
        try {
            // Clean up empty arrays before saving
            for (const cellId in roomData) {
                if (Array.isArray(roomData[cellId]) && roomData[cellId].length === 0) {
                    delete roomData[cellId];
                    console.log(`Removed empty day array for ${cellId}`);
                }
            }
            localStorage.setItem('bluePrinceRoomData', JSON.stringify(roomData));
            console.log("Data saved to localStorage.");
        } catch (e) {
            console.error("Error saving data to localStorage:", e);
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

                if (rank === ROWS && c === centerCol) { // Antechamber
                    cell.textContent = 'Antechamber';
                    cell.classList.add('fixed-cell', 'antechamber');
                } else if (rank === 1 && c === centerCol) { // Entrance Hall
                    cell.textContent = 'Entrance Hall';
                    cell.classList.add('fixed-cell', 'entrance-hall');
                } else { // Standard cell
                    // Initial display is set by updateCellDisplay after load/save
                    cell.textContent = cellId; // Default text
                    cell.addEventListener('mouseover', handleCellMouseOver);
                    cell.addEventListener('click', handleCellClick);
                }
                gridContainer.appendChild(cell);
            }
        }
        gridContainer.addEventListener('mouseout', handleGridMouseOut);
    }

    // Updates the text content of a single cell based on latest selected room
    function updateCellDisplay(cellId) {
        const cellElement = document.getElementById(cellId);
        if (!cellElement || cellElement.classList.contains('fixed-cell')) return;

        const days = roomData[cellId] || [];
        const latestDay = days.length > 0 ? days[days.length - 1] : null;
        const latestSelection = latestDay?.selected; // Use optional chaining

        if (latestSelection) {
            cellElement.textContent = latestSelection;
            cellElement.classList.add('has-selection');
            cellElement.title = `${cellId} - ${latestSelection}`; // Tooltip
        } else {
            cellElement.textContent = cellId;
            cellElement.classList.remove('has-selection');
            cellElement.title = cellId; // Reset tooltip
        }
    }

    // Updates display for all non-fixed cells
    function updateAllCellDisplays() {
        const cells = gridContainer.querySelectorAll('.grid-cell:not(.fixed-cell)');
        cells.forEach(cell => updateCellDisplay(cell.id));
    }


    // --- UI Updates (Info Panel) ---
    function updateInfoPanel() {
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
        dayCountDisplay.textContent = days.length;

        // Update Day List
        dayList.innerHTML = '';
        days.forEach((dayEntry, index) => {
            const li = document.createElement('li');
            li.classList.add('day-list-item');

            // --- Day Header (Number + Delete Button) ---
            const header = document.createElement('h5');
            header.textContent = `Day ${dayEntry.day || (index + 1)}`; // Use stored day number or index+1

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '❌';
            deleteButton.classList.add('delete-day-button');
            deleteButton.title = `Delete Day ${dayEntry.day || (index + 1)}`;
            deleteButton.dataset.cellId = cellId;
            deleteButton.dataset.dayIndex = index;
            deleteButton.addEventListener('click', handleDeleteDay);
            header.appendChild(deleteButton);
            li.appendChild(header);

            // --- Offered Rooms ---
            const offersDiv = document.createElement('div');
            offersDiv.classList.add('day-offers');
            const offeredText = Array.isArray(dayEntry.offered) ? dayEntry.offered.filter(r => r).join(', ') : 'N/A';
            offersDiv.textContent = `Offered: ${offeredText || 'None'}`;
            li.appendChild(offersDiv);

            // --- Selection Controls ---
            const selectionDiv = document.createElement('div');
            selectionDiv.classList.add('day-selection-controls');
            selectionDiv.dataset.cellId = cellId; // Add data for event delegation if needed
            selectionDiv.dataset.dayIndex = index;

            // Add "None" option first
            const noneLabel = document.createElement('label');
            const noneRadio = document.createElement('input');
            noneRadio.type = 'radio';
            noneRadio.name = `day-${cellId}-${index}-selection`;
            noneRadio.value = ''; // Represent "None" with empty string
            noneRadio.checked = !dayEntry.selected;
            noneRadio.addEventListener('change', handleChangeSelection);
            noneLabel.appendChild(noneRadio);
            noneLabel.appendChild(document.createTextNode(' None'));
            selectionDiv.appendChild(noneLabel);

            // Add options for each offered room
            if (Array.isArray(dayEntry.offered)) {
                dayEntry.offered.forEach(room => {
                    if (room) { // Only add valid room names
                        const label = document.createElement('label');
                        const radio = document.createElement('input');
                        radio.type = 'radio';
                        radio.name = `day-${cellId}-${index}-selection`; // Unique name per day
                        radio.value = room;
                        radio.checked = dayEntry.selected === room;
                        radio.addEventListener('change', handleChangeSelection); // Add listener
                        label.appendChild(radio);
                        label.appendChild(document.createTextNode(` ${room}`));
                        selectionDiv.appendChild(label);
                    }
                });
            }
            li.appendChild(selectionDiv);

            dayList.appendChild(li);
        });

        // Update Frequency List
        updateFrequencyList(cellId);
    }

    function updateFrequencyList(cellId) {
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
        // Prevent modal opening if click was on delete button or selection controls in info panel
        if (event.target.closest('.delete-day-button') || event.target.closest('.day-selection-controls')) {
            return;
        }
        // Open modal only if clicking the currently hovered/selected cell
        if (clickedElement && !clickedElement.classList.contains('fixed-cell') && clickedElement === selectedCellElement) {
            openModal();
        }
    }

    // Handles changing the selected room for a day via radio buttons in the info panel
    function handleChangeSelection(event) {
        const radio = event.target;
        const controlsDiv = radio.closest('.day-selection-controls');
        const cellId = controlsDiv.dataset.cellId;
        const dayIndex = parseInt(controlsDiv.dataset.dayIndex, 10);
        const newSelection = radio.value || null; // Use null if value is empty string (for "None")

        if (!cellId || isNaN(dayIndex) || !roomData[cellId] || !roomData[cellId][dayIndex]) {
            console.error("Failed to change selection: Invalid data.");
            return;
        }

        // Update data
        roomData[cellId][dayIndex].selected = newSelection;
        console.log(`Changed selection for ${cellId}, Day Index ${dayIndex} to: ${newSelection}`);

        saveData();
        updateCellDisplay(cellId); // Update grid cell text if it was the latest day
        updateInfoPanel(); // Refresh panel to show change (though radio state already changed)
    }

    // Handles deleting an entire day's entry
    function handleDeleteDay(event) {
        const button = event.target.closest('.delete-day-button');
        const cellId = button.dataset.cellId;
        const dayIndex = parseInt(button.dataset.dayIndex, 10);

        if (!cellId || isNaN(dayIndex) || !roomData[cellId] || !roomData[cellId][dayIndex]) {
            console.error("Could not delete day: Invalid data attributes.");
            return;
        }

        const dayNum = roomData[cellId][dayIndex].day || (dayIndex + 1);

        if (confirm(`Are you sure you want to delete Day ${dayNum} for cell ${cellId}? This will remove offers and selection.`)) {
            roomData[cellId].splice(dayIndex, 1);
            console.log(`Deleted Day Index ${dayIndex} for cell ${cellId}`);

            // Optional: Renumber subsequent days? For simplicity, let's not renumber now.
            // The displayed day number will rely on the index if 'day' property isn't reliable.

            saveData();
            updateCellDisplay(cellId); // Update grid cell if latest day was deleted
            updateInfoPanel(); // Refresh info panel
        }
    }

    // --- Modal Logic ---
    function openModal() {
        if (!selectedCellElement) return;
        const cellId = selectedCellElement.id;
        const nextDayNum = (roomData[cellId]?.length || 0) + 1; // Suggest next day number

        modalTitle.textContent = `Log Day ${nextDayNum} for Cell: ${cellId}`;
        roomOfferInputs.forEach(input => input.value = ''); // Clear offer inputs
        selectionOptionsContainer.innerHTML = '<p><em>Enter offers first to see selection options.</em></p>'; // Clear old radios

        // Add listeners to offer inputs to update radio buttons dynamically
        roomOfferInputs.forEach(input => {
            input.removeEventListener('input', updateModalSelectionOptions); // Remove old listener first
            input.addEventListener('input', updateModalSelectionOptions);
        });

        modal.style.display = 'block';
        requestAnimationFrame(() => {
             roomOfferInputs[0].focus();
        });
    }

    // Dynamically updates radio buttons in the modal based on entered offers
    function updateModalSelectionOptions() {
        selectionOptionsContainer.innerHTML = ''; // Clear previous options

        const offers = roomOfferInputs.map(input => input.value.trim()).filter(offer => offer !== '');
        const uniqueOffers = [...new Set(offers)]; // Get unique non-empty offers

        // Add "None" option
        const noneLabel = document.createElement('label');
        const noneRadio = document.createElement('input');
        noneRadio.type = 'radio';
        noneRadio.name = 'modal-selection';
        noneRadio.value = ''; // Empty value for "None"
        noneRadio.checked = true; // Default to None
        noneLabel.appendChild(noneRadio);
        noneLabel.appendChild(document.createTextNode(' None (No Selection)'));
        selectionOptionsContainer.appendChild(noneLabel);

        // Add options for each unique offer
        uniqueOffers.forEach(offer => {
            const label = document.createElement('label');
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'modal-selection';
            radio.value = offer;
            label.appendChild(radio);
            label.appendChild(document.createTextNode(` ${offer}`));
            selectionOptionsContainer.appendChild(label);
        });

        if (uniqueOffers.length === 0) {
             selectionOptionsContainer.insertAdjacentHTML('beforeend', '<p><em>Enter offers to enable selection.</em></p>');
        }
    }


    function closeModal() {
        modal.style.display = 'none';
        // Remove dynamic listeners when closing
        roomOfferInputs.forEach(input => {
            input.removeEventListener('input', updateModalSelectionOptions);
        });
    }

    // Handles submission of new day data from the modal
    function handleSubmitDay() {
        if (!selectedCellElement) {
            console.error("Submit attempted without a selected cell.");
            return;
        }
        const cellId = selectedCellElement.id;

        // Get Offers
        const offered = roomOfferInputs.map(input => input.value.trim());
        if (offered.every(room => room === '')) {
             alert("Please enter at least one room offer.");
             roomOfferInputs[0].focus();
             return;
        }

        // Get Selection
        const selectedRadio = selectionOptionsContainer.querySelector('input[name="modal-selection"]:checked');
        const selected = selectedRadio ? (selectedRadio.value || null) : null; // null if "None" is chosen

        // Determine Day Number
        const currentDays = roomData[cellId] || [];
        const nextDayNum = currentDays.length > 0 ? (currentDays[currentDays.length - 1].day || currentDays.length) + 1 : 1;

        // Create new day entry
        const newDayEntry = {
            day: nextDayNum,
            offered: offered,
            selected: selected
        };

        // Add to data
        if (!roomData[cellId]) {
            roomData[cellId] = [];
        }
        roomData[cellId].push(newDayEntry);
        console.log(`Added Day ${nextDayNum} for ${cellId}:`, newDayEntry);

        saveData();
        updateCellDisplay(cellId); // Update the grid cell's text
        updateInfoPanel(); // Refresh the info panel
        closeModal();
    }

    // --- Initialization ---
    loadData(); // Load data first
    createGrid(); // Then create grid (display depends on loaded data)

    // --- Event Listeners ---
    closeModalButton.addEventListener('click', closeModal);
    submitDayButton.addEventListener('click', handleSubmitDay); // Renamed
    window.addEventListener('click', (event) => { // Close modal on outside click
        if (event.target === modal) {
            closeModal();
        }
    });
    // Enter key listener (apply only when modal is open?) - simplified for now
    // This might need refinement if Enter is needed elsewhere
    document.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && modal.style.display === 'block') {
             // Check if focus is within the modal inputs to prevent accidental submission
             if (modal.contains(document.activeElement) && document.activeElement.tagName === 'INPUT') {
                 e.preventDefault();
                 handleSubmitDay();
             }
        }
    });

    // Control Button Listener
    if (clearDataButton) {
        clearDataButton.addEventListener('click', () => {
            if (modal.style.display === 'block') closeModal(); // Close modal first
            if (confirm('Are you sure you want to clear ALL logged data for ALL cells? This cannot be undone.')) {
                roomData = {};
                saveData();
                if (selectedCellElement) {
                    selectedCellElement.classList.remove('selected');
                    selectedCellElement = null;
                }
                updateAllCellDisplays(); // Reset all cell text
                updateInfoPanel(); // Clear info panel
                alert('All data cleared.');
            }
        });
    }

}); // End of DOMContentLoaded
