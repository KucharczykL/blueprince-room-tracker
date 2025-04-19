document.addEventListener('DOMContentLoaded', () => {
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

    const ROWS = 10;
    const COLS = 5;
    let selectedCell = null;
    let roomData = {}; // { "R1C1": },...],... }

    // --- Data Persistence ---
    function loadData() {
        const storedData = localStorage.getItem('bluePrinceRoomData');
        if (storedData) {
            roomData = JSON.parse(storedData);
            console.log("Data loaded from localStorage.");
        } else {
            roomData = {};
            console.log("No data found in localStorage. Initializing empty data.");
        }
    }

    function saveData() {
        localStorage.setItem('bluePrinceRoomData', JSON.stringify(roomData));
        console.log("Data saved to localStorage.");
    }

    // --- Grid Generation ---
    function createGrid() {
        gridContainer.innerHTML = ''; // Clear existing grid
        for (let r = 1; r <= ROWS; r++) {
            for (let c = 1; c <= COLS; c++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.id = `R${r}C${c}`;
                cell.textContent = `R${r}C${c}`; // Display cell ID
                cell.addEventListener('click', handleCellClick);
                gridContainer.appendChild(cell);
            }
        }
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

        const visits = roomData[cellId] || 0;
        visitCountDisplay.textContent = visits.length;

        // Update visit list
        visitList.innerHTML = '';
        visits.forEach((visit, index) => {
            const li = document.createElement('li');
            li.textContent = `Visit ${index + 1}: ${visit.offered.join(', ')}`;
            visitList.appendChild(li);
        });

        // Update probability list
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
            visit.offered.forEach(room => {
                if (room && room.trim()!== '') { // Count non-empty rooms
                    roomCounts[room] = (roomCounts[room] || 0) + 1;
                    totalOffers++;
                }
            });
        });

        if (totalOffers === 0) {
             probabilityList.innerHTML = '<li>No valid room offers logged.</li>';
             return;
        }

        // Sort rooms by frequency (descending)
        const sortedRooms = Object.entries(roomCounts).sort(([, countA],) => countB - countA);

        sortedRooms.forEach(([room, count]) => {
            const probability = ((count / totalOffers) * 100).toFixed(1);
            const li = document.createElement('li');
            li.textContent = `${room}: ${count} time(s) (${probability}%)`;
            probabilityList.appendChild(li);
        });
    }

    // --- Event Handlers ---
    function handleCellClick(event) {
        // Remove selection highlight from previously selected cell
        if (selectedCell) {
            selectedCell.classList.remove('selected');
        }

        // Set new selected cell and highlight it
        selectedCell = event.target;
        selectedCell.classList.add('selected');

        updateInfoPanel();
        openModal(); // Open modal when a cell is clicked
    }

    function openModal() {
        if (!selectedCell) return;
        modalTitle.textContent = `Log Room Offers for Cell: ${selectedCell.id}`;
        // Clear previous inputs and focus the first one
        roomInputs.forEach(input => {
            input.value = '';
        });
        modal.style.display = 'block';
        roomInputs[0].focus(); // Focus the first input field
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    function handleSubmitRooms() {
        if (!selectedCell) return;
        
        const offeredRooms = roomInputs.map(input => input.value.trim()).filter(room => room!== ''); // Get non-empty inputs

        if (offeredRooms.length === 0) {
            alert("Please enter at least one room name.");
            return;
        }
        // Ensure we always log 3 entries, even if some are empty strings initially
        const finalOffered = [
            roomInputs[0].value.trim(),
            roomInputs[1].value.trim(),
            roomInputs[2].value.trim()
        ];


        const cellId = selectedCell.id;
        if (!roomData[cellId]) { 
            roomData[cellId] = [];
        }

        roomData[cellId].push({ offered: finalOffered });
        saveData();
        updateInfoPanel(); // Update display after adding data
        closeModal();
    }

    // --- Initialization ---
    loadData();
    createGrid();

    // Modal event listeners
    closeModalButton.addEventListener('click', closeModal);
    submitRoomsButton.addEventListener('click', handleSubmitRooms);
    window.addEventListener('click', (event) => { // Close modal if clicking outside of it
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Allow submitting with Enter key from the last input field
    if (roomInputs.length > 0) {
        roomInputs[roomInputs.length - 1].addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                handleSubmitRooms();
            }
        });
    }

});
