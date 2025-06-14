// --- Elementos del DOM existentes (se mantienen) ---
const playerInput = document.getElementById('playerInput');
const addPlayerBtn = document.getElementById('addPlayerBtn');
const playerListUl = document.getElementById('playerList');
const clearPlayersBtn = document.getElementById('clearPlayersBtn');
// const modeButtons = document.querySelectorAll('.mode-button'); // Ya no se usan directamente en esta versión
// const teamsDisplay = document.getElementById('teamsDisplay'); // Ocultado en HTML para enfoque en ruleta
const resultWarning = document.querySelector('.result-warning'); // Se usa para la ruleta ahora

// --- Nuevos elementos del DOM para la Ruleta ---
const spinButton = document.getElementById('spinButton');
const winnerDisplay = document.getElementById('winnerDisplay');
const canvas = document.getElementById('rouletteCanvas');
const ctx = canvas.getContext('2d');
const roulettePointer = document.querySelector('.roulette-pointer');

let players = []; // Array para almacenar los IDs de los jugadores

// --- Configuración de la Ruleta ---
const wheelSize = 400; // Coincide con el CSS
const centerX = wheelSize / 2;
const centerY = wheelSize / 2;
const radius = wheelSize / 2;

// Colores para los segmentos de la ruleta (puedes añadir más si tienes muchos jugadores)
const segmentColors = [
    '#FF6347', // Tomato
    '#6A5ACD', // SlateBlue
    '#3CB371', // MediumSeaGreen
    '#FFD700', // Gold
    '#00BFFF', // DeepSkyBlue
    '#FF69B4', // HotPink
    '#9370DB', // MediumPurple
    '#ADFF2F', // GreenYellow
    '#FF4500', // OrangeRed
    '#87CEEB'  // SkyBlue
];

let currentRotation = 0; // Rotación actual de la ruleta
let spinning = false; // Estado para evitar giros múltiples

// --- Audio (Necesitarás archivos de sonido. Cárgalos aquí) ---
const spinSound = new Audio('sounds/spin-sound.mp3'); // Crea una carpeta 'sounds' y pon tu archivo .mp3
const winSound = new Audio('sounds/win-sound.mp3');   // Crea una carpeta 'sounds' y pon tu archivo .mp3

// Ajustar el volumen (opcional)
spinSound.volume = 0.5;
winSound.volume = 0.7;

// --- Funciones para gestionar la lista de jugadores (adaptadas) ---

function addPlayer() {
    const playerName = playerInput.value.trim();
    if (playerName && !players.includes(playerName)) {
        players.push(playerName);
        renderPlayerList();
        drawRoulette(); // Redibujar la ruleta al añadir un jugador
        playerInput.value = '';
        resultWarning.style.display = 'none';
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
    drawRoulette(); // Redibujar la ruleta al eliminar un jugador
    resultWarning.style.display = 'none';
}


function clearPlayers() {
    if (confirm('¿Estás seguro de que quieres limpiar la lista de jugadores?')) {
        players = [];
        renderPlayerList();
        drawRoulette(); // Redibujar la ruleta vacía
        winnerDisplay.textContent = '¡Gira para ver al ganador!'; // Resetear mensaje del ganador
        resultWarning.style.display = 'none';
    }
}


// --- Funciones para Dibujar la Ruleta en Canvas ---
function drawRoulette() {
    if (players.length === 0) {
        ctx.clearRect(0, 0, wheelSize, wheelSize); // Limpiar el canvas si no hay jugadores
        return;
    }

    const arcSize = 2 * Math.PI / players.length; // Tamaño del arco para cada jugador

    ctx.clearRect(0, 0, wheelSize, wheelSize); // Limpiar el canvas antes de dibujar
    
    players.forEach((player, index) => {
        const startAngle = index * arcSize;
        const endAngle = (index + 1) * arcSize;
        const color = segmentColors[index % segmentColors.length]; // Ciclo de colores

        // Dibujar el segmento
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#333'; // Borde para los segmentos
        ctx.lineWidth = 2;
        ctx.stroke();

        // Dibujar el texto del jugador
        ctx.save(); // Guarda el estado actual del canvas
        ctx.translate(centerX, centerY); // Mueve el origen al centro
        ctx.rotate(startAngle + arcSize / 2); // Rota al centro del segmento
        ctx.textAlign = 'right'; // Alinea el texto a la derecha del arco
        ctx.fillStyle = '#fff'; // Color del texto
        ctx.font = 'bold 16px Arial'; // Fuente y tamaño

        // Calcular la posición del texto para que no quede muy cerca del centro
        const textRadius = radius * 0.75; // Ajusta este valor para acercar/alejar el texto del centro
        ctx.fillText(player, textRadius, 5); // Dibuja el texto

        ctx.restore(); // Restaura el estado del canvas
    });
}

// --- Lógica de Giro de la Ruleta con GSAP ---
function spinRoulette() {
    if (players.length === 0) {
        resultWarning.textContent = '¡Agrega IDs a la lista para girar la ruleta!';
        resultWarning.style.display = 'block';
        return;
    }

    if (spinning) return; // Evitar giros múltiples
    spinning = true;
    spinButton.disabled = true; // Deshabilitar botón durante el giro
    winnerDisplay.textContent = '¡Girando...!';
    resultWarning.style.display = 'none'; // Ocultar advertencia

    spinSound.play(); // Reproducir sonido de giro

    // Calcular un ángulo aleatorio para que se detenga en un jugador específico
    const totalPlayers = players.length;
    const degreesPerSegment = 360 / totalPlayers;
    
    // Seleccionar un índice ganador aleatorio
    const winnerIndex = Math.floor(Math.random() * totalPlayers);
    const winnerPlayer = players[winnerIndex];

    // Calcular el ángulo de parada objetivo para el ganador
    // Ajustamos para que el puntero apunte al centro del segmento ganador
    // Restamos 90 grados para que la punta del puntero (que apunta hacia arriba)
    // apunte al centro del segmento
    const targetAngleOffset = (totalPlayers - 1 - winnerIndex) * degreesPerSegment + (degreesPerSegment / 2);
    
    // Añadimos múltiples giros completos para un efecto más dramático
    const extraRotations = 5 * 360; // 5 giros completos
    const targetRotation = extraRotations + targetAngleOffset;

    // Animación con GSAP
    gsap.to(canvas, {
        rotation: targetRotation,
        duration: 5, // Duración del giro en segundos
        ease: 'power4.out', // Tipo de easing para desaceleración suave
        onUpdate: () => {
            // Actualizar la rotación del canvas para que el puntero siempre apunte
            canvas.style.transform = `rotate(${canvas.rotation}deg)`;
        },
        onComplete: () => {
            spinning = false;
            spinButton.disabled = false;
            spinSound.pause(); // Pausar sonido de giro
            spinSound.currentTime = 0; // Reiniciar para la próxima vez
            winSound.play(); // Reproducir sonido de victoria

            winnerDisplay.textContent = `¡Ganador: ${winnerPlayer}!`;

            // Resetear la rotación del canvas visualmente sin afectar la lógica
            // para futuras animaciones (GSAP maneja esto internamente si se usa .to() de nuevo)
            currentRotation = targetRotation % 360; 
            if (currentRotation < 0) currentRotation += 360; // Asegurar valor positivo
        }
    });
}

// --- Event Listeners ---

addPlayerBtn.addEventListener('click', addPlayer);


playerInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addPlayer();
    }
});


clearPlayersBtn.addEventListener('click', clearPlayers);


spinButton.addEventListener('click', spinRoulette); // Nuevo evento para el botón de giro

// --- Inicialización ---
renderPlayerList(); // Renderiza la lista al cargar la página
drawRoulette();     // Dibuja la ruleta inicial al cargar la página
