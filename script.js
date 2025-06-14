const playerInput = document.getElementById('playerInput');
const addPlayerBtn = document.getElementById('addPlayerBtn');
const playerListUl = document.getElementById('playerList');
const clearPlayersBtn = document.getElementById('clearPlayersBtn');
const modeButtons = document.querySelectorAll('.mode-button');
const teamsDisplay = document.getElementById('teamsDisplay');
const resultWarning = document.querySelector('.result-warning');
const rouletteWheel = document.getElementById('rouletteWheel');
const spinBtn = document.getElementById('spinBtn');
const spinResultDisplay = document.getElementById('spinResult');

let players = []; // Array para almacenar los IDs de los jugadores
let remainingPlayersForSpin = []; // Copia para la ruleta
let currentModePlayersPerTeam = 0; // Para saber cuántos jugadores por equipo necesitamos
let currentTeamBeingFormed = 0; // Para llevar la cuenta de qué equipo se está formando
let currentTeamMembers = []; // Para almacenar los miembros del equipo actual
let teamsFormed = []; // Para almacenar todos los equipos finales

const colors = ['#bd1e51', '#50fa7b', '#8be9fd', '#ffcc00', '#ff7f50', '#a020f0']; // Colores para los segmentos

// --- Funciones para gestionar la lista de jugadores ---

function addPlayer() {
    const playerName = playerInput.value.trim();
    if (playerName && !players.includes(playerName)) {
        players.push(playerName);
        renderPlayerList();
        playerInput.value = '';
        resultWarning.style.display = 'none';
        spinBtn.style.display = 'none'; // Ocultar botón girar si se añade jugador después de elegir modo
        teamsDisplay.innerHTML = ''; // Limpiar equipos anteriores
        spinResultDisplay.textContent = '';
        rouletteWheel.innerHTML = ''; // Limpiar segmentos de ruleta
        resetGameVariables();
    } else if (players.includes(playerName)) {
        alert('¡Ese ID ya está en la lista!');
    }
}

function renderPlayerList() {
    playerListUl.innerHTML = '';
    players.forEach((player, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = player;
        const removeButton = document.createElement('button');
        removeButton.textContent = 'X';
        removeButton.onclick = () => removePlayer(index);
        listItem.appendChild(removeButton);
        playerListUl.appendChild(listItem);
    });
}

function removePlayer(index) {
    players.splice(index, 1);
    renderPlayerList();
    spinBtn.style.display = 'none'; // Ocultar botón girar si se elimina jugador después de elegir modo
    teamsDisplay.innerHTML = ''; // Limpiar equipos anteriores
    spinResultDisplay.textContent = '';
    rouletteWheel.innerHTML = ''; // Limpiar segmentos de ruleta
    resetGameVariables();
}

function clearPlayers() {
    if (confirm('¿Estás seguro de que quieres limpiar la lista de jugadores?')) {
        players = [];
        renderPlayerList();
        teamsDisplay.innerHTML = '';
        resultWarning.style.display = 'none';
        spinBtn.style.display = 'none';
        spinResultDisplay.textContent = '';
        rouletteWheel.innerHTML = '';
        resetGameVariables();
    }
}

function resetGameVariables() {
    remainingPlayersForSpin = [];
    currentModePlayersPerTeam = 0;
    currentTeamBeingFormed = 0;
    currentTeamMembers = [];
    teamsFormed = [];
    displayTeams(teamsFormed); // Limpia la visualización de equipos
}

// --- Lógica de la Ruleta Gráfica y Formación de Equipos ---

function generateRouletteWheel() {
    rouletteWheel.innerHTML = ''; // Limpiar segmentos anteriores
    if (remainingPlayersForSpin.length === 0) {
        spinBtn.style.display = 'none';
        return;
    }

    const segmentCount = remainingPlayersForSpin.length;
    const segmentAngle = 360 / segmentCount;
    const skewY = 90 - segmentAngle; // Ángulo para 'aplastar' el triángulo

    remainingPlayersForSpin.forEach((player, index) => {
        const segment = document.createElement('div');
        segment.className = 'roulette-segment';
        segment.textContent = player;
        
        // Calcular ángulo y color para cada segmento
        const rotation = index * segmentAngle;
        segment.style.setProperty('--angle', `${rotation}deg`);
        segment.style.setProperty('--skew', `${skewY}deg`);
        segment.style.backgroundColor = colors[index % colors.length]; // Ciclo de colores

        rouletteWheel.appendChild(segment);
    });

    spinBtn.style.display = 'block'; // Mostrar el botón de girar
}

async function spinRoulette() {
    if (remainingPlayersForSpin.length === 0) {
        spinResultDisplay.textContent = 'No hay más jugadores para seleccionar.';
        spinBtn.style.display = 'none';
        return;
    }

    spinBtn.disabled = true; // Deshabilitar botón durante el giro

    const selectedIndex = Math.floor(Math.random() * remainingPlayersForSpin.length);
    const selectedPlayer = remainingPlayersForSpin[selectedIndex];

    // Calcula el ángulo de giro final para que el puntero apunte al jugador seleccionado
    // Asegura que gire varias veces (ej: 5 vueltas completas) + el ángulo exacto.
    const totalRotation = (360 * 5) + (360 - (selectedIndex * (360 / remainingPlayersForSpin.length) + (360 / remainingPlayersForSpin.length) / 2));
    
    rouletteWheel.style.transition = 'transform 4s cubic-bezier(0.2, 0.9, 0.3, 1)';
    rouletteWheel.style.transform = `rotate(${totalRotation}deg)`;

    spinResultDisplay.textContent = 'Girando...';

    // Esperar a que la animación termine
    await new Promise(resolve => setTimeout(resolve, 4000)); 
    
    spinResultDisplay.textContent = `¡Seleccionado: ${selectedPlayer}!`;

    // Añadir al jugador al equipo actual
    currentTeamMembers.push(selectedPlayer);
    
    // Eliminar jugador de la lista de pendientes para la ruleta
    remainingPlayersForSpin.splice(selectedIndex, 1);

    // Actualizar la visualización de equipos
    updateTeamDisplay();

    // Reiniciar la ruleta para el siguiente giro
    rouletteWheel.style.transition = 'none'; // Quitar transición para reseteo instantáneo
    rouletteWheel.style.transform = 'rotate(0deg)'; // Resetear a la posición original antes de regenerar
    setTimeout(() => { // Pequeño retraso para que el navegador aplique el reset
        generateRouletteWheel(); // Regenera los segmentos con los jugadores restantes
        spinBtn.disabled = false; // Habilitar botón para el siguiente giro
        if (remainingPlayersForSpin.length === 0) {
            spinResultDisplay.textContent = '¡Todos los jugadores han sido asignados!';
            spinBtn.style.display = 'none';
        }
    }, 50);
}


function startTeamFormation(playersPerTeam) {
    currentModePlayersPerTeam = playersPerTeam;
    currentTeamBeingFormed = 1;
    currentTeamMembers = [];
    teamsFormed = []; // Limpiar equipos formados anteriormente
    teamsDisplay.innerHTML = ''; // Limpiar display de equipos

    if (players.length < playersPerTeam) {
        resultWarning.textContent = `¡Necesitas al menos ${playersPerTeam} jugadores para el modo ${playersPerTeam}v${playersPerTeam}!`;
        resultWarning.style.display = 'block';
        spinBtn.style.display = 'none';
        rouletteWheel.innerHTML = '';
        spinResultDisplay.textContent = '';
        return;
    }
    resultWarning.style.display = 'none';
    
    // Copiar la lista original de jugadores y mezclarla
    remainingPlayersForSpin = shuffleArray([...players]); 
    generateRouletteWheel(); // Genera la ruleta con todos los jugadores disponibles
    spinResultDisplay.textContent = `Gira para el Equipo ${currentTeamBeingFormed}. Jugadores restantes: ${remainingPlayersForSpin.length}`;
}

function updateTeamDisplay() {
    if (currentTeamMembers.length === currentModePlayersPerTeam || remainingPlayersForSpin.length === 0) {
        // Si el equipo actual está completo o no quedan más jugadores, añadirlo a los equipos formados
        if (currentTeamMembers.length > 0) {
            teamsFormed.push([...currentTeamMembers]); // Añadir una copia del equipo
        }
        currentTeamMembers = []; // Resetear para el siguiente equipo

        displayTeams(teamsFormed); // Actualiza la visualización de todos los equipos

        if (remainingPlayersForSpin.length > 0) {
            currentTeamBeingFormed++;
            spinResultDisplay.textContent = `Gira para el Equipo ${currentTeamBeingFormed}. Jugadores restantes: ${remainingPlayersForSpin.length}`;
        } else {
            spinResultDisplay.textContent = '¡Todos los jugadores han sido asignados a equipos!';
            spinBtn.style.display = 'none';
        }
    } else {
         spinResultDisplay.textContent = `Gira para el Equipo ${currentTeamBeingFormed}. Faltan ${currentModePlayersPerTeam - currentTeamMembers.length} jugador(es). Jugadores restantes: ${remainingPlayersForSpin.length}`;
    }
}


function displayTeams(teams) {
    teamsDisplay.innerHTML = '';
    if (teams.length === 0 && players.length > 0) { // Si no hay equipos formados pero sí jugadores, mostrar solo la lista de jugadores pendientes
        return;
    }
    
    teams.forEach((team, index) => {
        const teamBox = document.createElement('div');
        teamBox.className = 'team-box';
        const teamTitle = document.createElement('h3');
        teamTitle.textContent = `Equipo ${index + 1}`;
        teamBox.appendChild(teamTitle);

        const teamList = document.createElement('ul');
        team.forEach(player => {
            const playerItem = document.createElement('li');
            playerItem.textContent = player;
            teamList.appendChild(playerItem);
        });
        teamBox.appendChild(teamList);
        teamsDisplay.appendChild(teamBox);
    });

    // Manejar jugadores sobrantes (si no forman un equipo completo y el sorteo terminó)
    if (remainingPlayersForSpin.length > 0 && players.length > 0 && teams.length > 0 && teamsFormed.some(t => t.length > 0)) { // Asegurarse que haya jugadores y ya se haya empezado a formar equipos
        const leftoverBox = document.createElement('div');
        leftoverBox.className = 'team-box';
        const leftoverTitle = document.createElement('h3');
        leftoverTitle.textContent = 'Jugadores en Espera';
        leftoverBox.appendChild(leftoverTitle);
        const leftoverList = document.createElement('ul');
        remainingPlayersForSpin.forEach(player => {
            const playerItem = document.createElement('li');
            playerItem.textContent = player;
            leftoverList.appendChild(playerItem);
        });
        leftoverBox.appendChild(leftoverList);
        teamsDisplay.appendChild(leftoverBox);
    } else if (players.length > 0 && teams.length === 0) {
        // No hacer nada si no se ha iniciado el sorteo y no hay equipos
    }
}


// --- Algoritmo de Fisher-Yates para mezclar arrays ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


// --- Event Listeners ---
addPlayerBtn.addEventListener('click', addPlayer);
playerInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addPlayer();
    }
});
clearPlayersBtn.addEventListener('click', clearPlayers);

modeButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const mode = event.target.dataset.mode;
        let playersPerTeam = 0;
        if (mode === '1v1') playersPerTeam = 1;
        else if (mode === '2v2') playersPerTeam = 2;
        else if (mode === '3v3') playersPerTeam = 3;
        
        startTeamFormation(playersPerTeam);
    });
});

spinBtn.addEventListener('click', spinRoulette);

// Inicializar
renderPlayerList();
