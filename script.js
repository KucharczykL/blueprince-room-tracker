document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const gridContainer = document.getElementById('mansion-grid');
    const cellInfoPanel = document.getElementById('cell-info');
    const selectedCellIdDisplay = document.getElementById('selected-cell-id');
    const visitCountDisplay = document.getElementById('visit-count');
    const visitList = document.getElementById('visit-list');
    const probabilityList = document.getElementById('probability-list');
    const modal = document.getElementById('input-modal');
    const modalTitle = document.getElementById('modal-title');
    const closeModalButton = document.querySelector('.close-button');
    const submitRoomsButton = document.getElementById('submit-rooms');
    const roomInputs = [document.getElementById('room1'), document.getElementById('room2'), document.getElementById('room3')];
    const clearVisitsButton = document.getElementById('clear-visits');
    const clearProbabilitiesButton = document.getElementById('clear-probabilities');
    const recalculateButton = document.getElementById('recalculate-probabilities');

    // --- Constants and State ---
    const ROWS = 9;
    const COLS = 5;
    let selectedCell = null; // Holds the currently selected cell element (selected by hover)
    let roomData = {}; // Main data store

    // --- Data Persistence ---
    function loadData() {
        const storedData = localStorage.getItem('bluePrinceRoomData');
        if (storedData) {
            try {
                roomData = JSON.parse(storedData);
                console.log("Data loaded from localStorage.");
            } catch (e) {
                console.error("Error parsing data from localStorage:", e);
                roomData = {}; // Reset to empty if data is corrupt
            }
        } else {
            roomData = {};
            console.log("No data found in localStorage. Initializing empty data.");
        }
    }

    function saveData() {
        try {
            // Clean up empty arrays before saving
            for (const cellId in roomData) {
                if (Array.isArray(roomData[cellId]) && roomData[cellId].length === 0) {
                    delete roomData[cellId];
                    console.log(`Removed empty visit array for ${cellId}`);
                }
            }
            localStorage.setItem('bluePrinceRoomData', JSON.stringify(roomData));
            console.log("Data saved to localStorage.");
        } catch (e) {
            console.error("Error saving data to localStorage:", e);
            alert("Could not save room data. LocalStorage might be full or unavailable.");
        }
    }


    // --- Grid Generation ---
    function createGrid() {
        gridContainer.innerHTML = ''; // Clear existing grid
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
                    // --- Standard, interactive cell ---
                    cell.textContent = cellId;
                    // Add listener for SELECTION via HOVER
                    cell.addEventListener('mouseover', handleCellMouseOver);
                    // Add listener for OPENING MODAL via CLICK
                    cell.addEventListener('click', handleCellClick);
                }
                gridContainer.appendChild(cell);
            }
        }
        // Add listener to the whole grid for mouse leaving
        gridContainer.addEventListener('mouseout', handleGridMouseOut);
    }

    // --- UI Updates ---
    function updateInfoPanel() {
        if (!selectedCell) {
            selectedCellIdDisplay.textContent = 'No cell selected';
            visitCountDisplay.textContent = '0';
            visitList.innerHTML = '';
            probabilityList.innerHTML = '';
            return;
        }

        const cellId = selectedCell.id;
        selectedCellIdDisplay.textContent = `Selected: ${cellId}`;

        const visits = roomData[cellId] || [];
        visitCountDisplay.textContent = visits.length;

        visitList.innerHTML = ''; // Clear previous list
        visits.forEach((visit, index) => {
            const li = document.createElement('li');
            li.classList.add('visit-item'); // Add class for styling

            // Display visit info
            const visitText = document.createElement('span');
            const offeredText = Array.isArray(visit.offered) ? visit.offered.join(', ') || 'None' : 'Invalid data';
            visitText.textContent = `Visit ${index + 1}: ${offeredText}`;
            li.appendChild(visitText);

            // --- Add Delete Button ---
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '❌'; // Or 'Delete', 'X', etc.
            deleteButton.classList.add('delete-visit-button');
            deleteButton.title = `Delete Visit ${index + 1}`;
            deleteButton.dataset.cellId = cellId; // Store cell ID
            deleteButton.dataset.visitIndex = index; // Store index of this visit
            deleteButton.addEventListener('click', handleDeleteVisit);
            li.appendChild(deleteButton);
            // --- End Delete Button ---

            visitList.appendChild(li);
        });

        updateProbabilityList(cellId);
    }

    function updateProbabilityList(cellId) {
        probabilityList.innerHTML = '';
        const visits = roomData[cellId] || [];

        if (visits.length === 0) {
            probabilityList.innerHTML = '<li>No data logged for this cell.</li>';
            return;
        }

        const roomCounts = {};
        let totalOffers = 0;

        visits.forEach(visit => {
            if (Array.isArray(visit.offered)) {
                visit.offered.forEach(room => {
                    const trimmedRoom = room ? room.trim() : '';
                    if (trimmedRoom !== '') {
                        roomCounts[trimmedRoom] = (roomCounts[trimmedRoom] || 0) + 1;
                        totalOffers++;
                    }
                });
            } else {
                console.warn(`Invalid 'offered' data found for cell ${cellId}:`, visit);
            }
        });

        if (totalOffers === 0) {
             probabilityList.innerHTML = '<li>No valid room offers logged.</li>';
             return;
        }

        const sortedRooms = Object.entries(roomCounts).sort(([, countA], [, countB]) => countB - countA);

        sortedRooms.forEach(([room, count]) => {
            const probability = ((count / totalOffers) * 100).toFixed(1);
            const li = document.createElement('li');
            li.textContent = `${room}: ${count} time(s) (${probability}%)`;
            probabilityList.appendChild(li);
        });
    }


    // --- Event Handlers ---

    // Handles hovering over a cell for SELECTION
    function handleCellMouseOver(event) {
        if (modal.style.display === 'block') {
            return;
        }
        const hoveredElement = event.target.closest('.grid-cell');
        if (!hoveredElement || hoveredElement.classList.contains('fixed-cell') || hoveredElement === selectedCell) {
            return;
        }
        if (selectedCell) {
            selectedCell.classList.remove('selected');
        }
        selectedCell = hoveredElement;
        selectedCell.classList.add('selected');
        updateInfoPanel();
    }

    // Handles mouse leaving the grid container to clear selection
    function handleGridMouseOut(event) {
        if (modal.style.display === 'block') {
            return;
        }
        if (!event.relatedTarget || !gridContainer.contains(event.relatedTarget)) {
            if (selectedCell) {
                selectedCell.classList.remove('selected');
                selectedCell = null;
                updateInfoPanel();
            }
        }
    }

    // Handles clicking a cell to potentially OPEN MODAL
    function handleCellClick(event) {
        const clickedElement = event.target.closest('.grid-cell');
        // Prevent modal opening if the click was on a delete button inside the info panel
        if (event.target.classList.contains('delete-visit-button')) {
            return;
        }
        if (clickedElement && !clickedElement.classList.contains('fixed-cell') && clickedElement === selectedCell) {
            openModal();
        }
    }

    // *** NEW: Handles clicking the delete button for a specific visit ***
    function handleDeleteVisit(event) {
        const button = event.target;
        const cellIdToDelete = button.dataset.cellId;
        const visitIndexToDelete = parseInt(button.dataset.visitIndex, 10); // Ensure it's a number

        // Make sure we have valid data
        if (!cellIdToDelete || isNaN(visitIndexToDelete) || !roomData[cellIdToDelete]) {
            console.error("Could not delete visit: Invalid data attributes on button.");
            return;
        }

        // Confirm deletion
        if (confirm(`Are you sure you want to delete Visit ${visitIndexToDelete + 1} for cell ${cellIdToDelete}?`)) {
            // Remove the visit from the array
            roomData[cellIdToDelete].splice(visitIndexToDelete, 1);
            console.log(`Deleted visit index ${visitIndexToDelete} for cell ${cellIdToDelete}`);

            // Save the updated data (saveData now also handles cleanup of empty arrays)
            saveData();

            // Refresh the info panel for the currently selected cell
            // (which should be the one we just modified)
            if (selectedCell && selectedCell.id === cellIdToDelete) {
                updateInfoPanel();
            } else {
                // This case shouldn't normally happen if the UI is working correctly,
                // but as a fallback, maybe re-select and update?
                console.warn("Deleted visit for a cell that wasn't currently selected.");
                // Optionally find the cell element, select it, and update
                const cellElement = document.getElementById(cellIdToDelete);
                if (cellElement) {
                    if (selectedCell) selectedCell.classList.remove('selected');
                    selectedCell = cellElement;
                    selectedCell.classList.add('selected');
                    updateInfoPanel();
                }
            }
        }
    }


    // Opens the data input modal
    function openModal() {
        if (!selectedCell) return;
        modalTitle.textContent = `Log Room Offers for Cell: ${selectedCell.id}`;
        roomInputs.forEach(input => {
            input.value = '';
        });
        modal.style.display = 'block';
        requestAnimationFrame(() => {
             roomInputs[0].focus();
        });
    }

    // Closes the data input modal
    function closeModal() {
        modal.style.display = 'none';
    }

    // Handles submission of room data from the modal
    function handleSubmitRooms() {
        if (!selectedCell) {
            console.error("Submit attempted without a selected cell.");
            return;
        }
        const finalOffered = roomInputs.map(input => input.value.trim());
        if (finalOffered.every(room => room === '')) {
             alert("Please enter at least one room name.");
             roomInputs[0].focus();
             return;
        }
        const cellId = selectedCell.id;
        if (!roomData[cellId]) {
            roomData[cellId] = [];
        }
        roomData[cellId].push({ offered: finalOffered });
        saveData();
        updateInfoPanel();
        closeModal();
    }

    // --- Initialization ---
    loadData();
    createGrid();

    // --- Modal Event Listeners ---
    closeModalButton.addEventListener('click', closeModal);
    submitRoomsButton.addEventListener('click', handleSubmitRooms);
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
    roomInputs.forEach(input => {
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                 e.preventDefault();
                 handleSubmitRooms();
            }
        });
    });


    // --- Control Button Event Listeners ---
    if (clearVisitsButton) {
        clearVisitsButton.addEventListener('click', () => {
            if (modal.style.display === 'block') {
                closeModal();
            }
            if (confirm('Are you sure you want to clear ALL logged visits for ALL cells? This cannot be undone.')) {
                roomData = {};
                saveData();
                if (selectedCell) {
                    selectedCell.classList.remove('selected');
                    selectedCell = null;
                }
                updateInfoPanel();
                alert('All visit data cleared.');
            }
        });
    }
    if (clearProbabilitiesButton) {
         clearProbabilitiesButton.addEventListener('click', () => {
            alert('Probabilities are calculated automatically from logged visits. To clear probabilities, please clear the visits using the "Clear All Visits" button.');
         });
    }
    if (recalculateButton) {
        recalculateButton.addEventListener('click', () => {
            if (selectedCell) {
                updateProbabilityList(selectedCell.id);
                alert(`Probabilities recalculated for ${selectedCell.id}. (Note: This usually happens automatically)`);
            } else {
                alert('Select a cell first to recalculate its probabilities.');
            }
        });
    }

}); // End of DOMContentLoaded
