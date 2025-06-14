const playerInput = document.getElementById('playerInput');
const addPlayerBtn = document.getElementById('addPlayerBtn');
const playerListUl = document.getElementById('playerList');
const clearPlayersBtn = document.getElementById('clearPlayersBtn');
const modeButtons = document.querySelectorAll('.mode-button');
const teamsDisplay = document.getElementById('teamsDisplay');
const resultWarning = document.querySelector('.result-warning');

let players = []; // Array para almacenar los IDs de los jugadores

// --- Funciones para gestionar la lista de jugadores ---

// Función para añadir un jugador
function addPlayer() {
    const playerName = playerInput.value.trim(); // .trim() quita espacios al inicio/final
    if (playerName && !players.includes(playerName)) { // Asegura que no esté vacío y no sea repetido
        players.push(playerName);
        renderPlayerList();
        playerInput.value = ''; // Limpiar el input después de añadir
        resultWarning.style.display = 'none'; // Ocultar advertencia si estaba visible
    } else if (players.includes(playerName)) {
        alert('¡Ese ID ya está en la lista!');
    }
}

// Función para renderizar la lista de jugadores en el HTML
function renderPlayerList() {
    playerListUl.innerHTML = ''; // Limpiar la lista actual
    players.forEach((player, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = player;

        const removeButton = document.createElement('button');
        removeButton.textContent = 'X';
        removeButton.onclick = () => removePlayer(index); // Asigna función para eliminar
        
        listItem.appendChild(removeButton);
        playerListUl.appendChild(listItem);
    });
}

// Función para eliminar un jugador
function removePlayer(index) {
    players.splice(index, 1); // Elimina el elemento en la posición 'index'
    renderPlayerList(); // Vuelve a renderizar la lista
}

// Función para limpiar todos los jugadores
function clearPlayers() {
    if (confirm('¿Estás seguro de que quieres limpiar la lista de jugadores?')) {
        players = [];
        renderPlayerList();
        teamsDisplay.innerHTML = ''; // También limpia los equipos mostrados
        resultWarning.style.display = 'none';
    }
}

// --- Funciones para la lógica de la ruleta y equipos ---

// Función para mezclar un array (algoritmo Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Función principal para formar y mostrar los equipos
function formTeams(playersPerTeam) {
    teamsDisplay.innerHTML = ''; // Limpiar resultados anteriores
    resultWarning.style.display = 'none';

    const numPlayersNeeded = players.length;
    let totalTeams = 0;
    
    // Determinar cuántos equipos se formarán y si hay suficientes jugadores
    if (playersPerTeam === 1) { // 1v1
        totalTeams = numPlayersNeeded; // Cada jugador es un "equipo"
        if (numPlayersNeeded < 1) { // Necesita al menos 1 jugador
             resultWarning.textContent = '¡No hay suficientes jugadores para 1v1!';
             resultWarning.style.display = 'block';
             return;
        }
    } else if (playersPerTeam === 2) { // 2v2
        totalTeams = Math.floor(numPlayersNeeded / 2);
        if (numPlayersNeeded < 2) { // Necesita al menos 2 jugadores
            resultWarning.textContent = '¡No hay suficientes jugadores para 2v2 (mínimo 2)!';
            resultWarning.style.display = 'block';
            return;
        }
    } else if (playersPerTeam === 3) { // 3v3
        totalTeams = Math.floor(numPlayersNeeded / 3);
        if (numPlayersNeeded < 3) { // Necesita al menos 3 jugadores
            resultWarning.textContent = '¡No hay suficientes jugadores para 3v3 (mínimo 3)!';
            resultWarning.style.display = 'block';
            return;
        }
    }

    if (totalTeams === 0) {
        resultWarning.textContent = '¡No hay suficientes jugadores para formar equipos con este modo!';
        resultWarning.style.display = 'block';
        return;
    }

    // Copiar y mezclar jugadores para el sorteo
    const shuffledPlayers = shuffleArray([...players]); // Usamos una copia para no modificar el original

    let currentPlayers = [...shuffledPlayers]; // Usamos una copia mutable

    // Mostrar animación básica de "giro" (resaltando jugadores brevemente)
    const highlightDuration = 100; // ms por jugador
    let highlightIndex = 0;
    const highlightInterval = setInterval(() => {
        if (highlightIndex < players.length) {
            const playerItems = playerListUl.children;
            if (playerItems[highlightIndex]) {
                playerItems[highlightIndex].style.backgroundColor = '#50fa7b'; // Resalta
                playerItems[highlightIndex].style.transition = 'background-color 0.1s ease';
            }
            if (highlightIndex > 0 && playerItems[highlightIndex - 1]) {
                 playerItems[highlightIndex - 1].style.backgroundColor = ''; // Quita resaltado del anterior
            }
            highlightIndex++;
        } else {
            clearInterval(highlightInterval);
            // Retrasar la muestra de resultados para que la animación se vea
            setTimeout(() => {
                 displayTeams(currentPlayers, playersPerTeam, totalTeams);
                 playerListUl.querySelectorAll('li').forEach(li => li.style.backgroundColor = ''); // Quita todos los resaltados
            }, 500); // Pequeño retraso después de la animación
        }
    }, highlightDuration);
}

// Función para mostrar los equipos en el HTML
function displayTeams(shuffledPlayers, playersPerTeam, totalTeams) {
    teamsDisplay.innerHTML = ''; // Limpiar resultados anteriores

    let playerCounter = 0;
    for (let i = 0; i < totalTeams; i++) {
        const teamBox = document.createElement('div');
        teamBox.className = 'team-box';
        const teamTitle = document.createElement('h3');
        teamTitle.textContent = `Equipo ${i + 1}`;
        teamBox.appendChild(teamTitle);

        const teamList = document.createElement('ul');
        for (let j = 0; j < playersPerTeam; j++) {
            if (playerCounter < shuffledPlayers.length) { // Asegurarse de no ir más allá de los jugadores disponibles
                const playerItem = document.createElement('li');
                playerItem.textContent = shuffledPlayers[playerCounter];
                teamList.appendChild(playerItem);
                playerCounter++;
            }
        }
        teamBox.appendChild(teamList);
        teamsDisplay.appendChild(teamBox);
    }

    // Manejar jugadores sobrantes (si no forman un equipo completo)
    if (playerCounter < shuffledPlayers.length) {
        const leftoverPlayers = shuffledPlayers.slice(playerCounter);
        const leftoverBox = document.createElement('div');
        leftoverBox.className = 'team-box';
        const leftoverTitle = document.createElement('h3');
        leftoverTitle.textContent = 'Jugadores en Espera';
        leftoverBox.appendChild(leftoverTitle);
        const leftoverList = document.createElement('ul');
        leftoverPlayers.forEach(player => {
            const playerItem = document.createElement('li');
            playerItem.textContent = player;
            leftoverList.appendChild(playerItem);
        });
        leftoverBox.appendChild(leftoverList);
        teamsDisplay.appendChild(leftoverBox);
    }
}


// --- Event Listeners (para responder a las interacciones del usuario) ---

// Al hacer clic en el botón de agregar jugador
addPlayerBtn.addEventListener('click', addPlayer);

// Al presionar Enter en el campo de texto del jugador
playerInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addPlayer();
    }
});

// Al hacer clic en el botón de limpiar lista
clearPlayersBtn.addEventListener('click', clearPlayers);

// Al hacer clic en los botones de modo de juego
modeButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const mode = event.target.dataset.mode; // Obtiene el valor del atributo data-mode (ej. "2v2")
        let playersPerTeam = 0;
        if (mode === '1v1') playersPerTeam = 1;
        else if (mode === '2v2') playersPerTeam = 2;
        else if (mode === '3v3') playersPerTeam = 3;
        
        formTeams(playersPerTeam);
    });
});

// Renderizar la lista inicial (estará vacía al principio)
renderPlayerList();