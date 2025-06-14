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

// Asegúrate de que el canvas tenga el tamaño correcto
canvas.width = wheelSize;
canvas.height = wheelSize;

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
    '#87CEEB', // SkyBlue
    '#DA70D6', // Orchid
    '#CD853F', // Peru
    '#B0C4DE', // LightSteelBlue
    '#F08080', // LightCoral
    '#20B2AA'  // LightSeaGreen
];

let currentRotation = 0; // Rotación actual de la ruleta
let spinning = false; // Estado para evitar giros múltiples

// --- Audio (Necesitarás archivos de sonido. Crea una carpeta 'sounds' y pon tus archivos .mp3) ---
const spinSound = new Audio('sounds/spin-sound.mp3'); 
const winSound = new Audio('sounds/win-sound.mp3'); 

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
    // Asegurarse de que el canvas esté listo
    if (!canvas || !ctx) {
        console.error("Canvas o contexto 2D no disponibles.");
        return;
    }

    ctx.clearRect(0, 0, wheelSize, wheelSize); // Limpiar el canvas antes de dibujar

    if (players.length === 0) {
        // Dibuja un círculo vacío o un mensaje si no hay jugadores
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#444466'; // Color de fondo si está vacía
        ctx.fill();
        ctx.strokeStyle = '#8888AA'; // Borde
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#FFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Agrega IDs', centerX, centerY - 20);
        ctx.fillText('para girar', centerX, centerY + 10);
        return;
    }

    const arcSize = 2 * Math.PI / players.length; // Tamaño del arco para cada jugador
    
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
        ctx.font = 'bold 16px Arial'; // Fuente y tamaño (ajustar si es necesario)

        // Calcular la posición del texto para que no quede muy cerca del centro
        const textRadius = radius * 0.75; // Ajusta este valor para acercar/alejar el texto del centro
        ctx.fillText(player, textRadius, 5); // Dibuja el texto

        ctx.restore(); // Restaura el estado del canvas
    });
    
    // Dibuja el círculo central (opcional, para estética)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.15, 0, 2 * Math.PI); // Pequeño círculo central
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();
    ctx.strokeStyle = '#8be9fd';
    ctx.lineWidth = 3;
    ctx.stroke();
}

// --- Lógica de Giro de la Ruleta con GSAP ---
function spinRoulette() {
    if (players.length === 0) {
        resultWarning.textContent = '¡Agrega IDs a la lista para girar la ruleta!';
        resultWarning.style.display = 'block';
        return;
    }
    if (players.length === 1) {
        resultWarning.textContent = '¡Necesitas al menos 2 IDs para un giro significativo!';
        resultWarning.style.display = 'block';
        return;
    }

    if (spinning) return; // Evitar giros múltiples
    spinning = true;
    spinButton.disabled = true; // Deshabilitar botón durante el giro
    winnerDisplay.textContent = '¡Girando...!';
    resultWarning.style.display = 'none'; // Ocultar advertencia

    // Reproducir y loopear el sonido de giro si quieres que suene mientras gira
    spinSound.loop = true;
    spinSound.play(); 

    // Calcular un ángulo aleatorio para que se detenga en un jugador específico
    const totalPlayers = players.length;
    const degreesPerSegment = 360 / totalPlayers;
    
    // Seleccionar un índice ganador aleatorio
    const winnerIndex = Math.floor(Math.random() * totalPlayers);
    const winnerPlayer = players[winnerIndex];

    // Calcular el ángulo de parada objetivo para el ganador
    // Ajustamos para que el puntero apunte al centro del segmento ganador
    // La ruleta gira en sentido horario, los ángulos en canvas son en sentido horario.
    // El puntero está en la parte superior (0 grados).
    // El primer segmento (índice 0) va de 0 a arcSize.
    // Si winnerIndex es 0, queremos que el puntero apunte al centro de ese segmento.
    // Para que el puntero (que está arriba, 90 grados en sistema cartesiano) apunte al centro del segmento:
    // El centro del segmento 'winnerIndex' está en (winnerIndex * degreesPerSegment) + (degreesPerSegment / 2).
    // Queremos que el puntero se alinee con este ángulo.
    // La rotación inicial del canvas es 0. Necesitamos girar de forma que el puntero apunte al segmento deseado.
    // La compensación de 90 grados es por la convención del canvas (0deg es a la derecha, 90deg es abajo).
    // Si el puntero está en la parte superior, apunta a -90 grados (o 270 grados).
    // Por lo tanto, el ángulo final debe ser el opuesto al centro del segmento.
    const targetAngleForSegmentCenter = (winnerIndex * degreesPerSegment) + (degreesPerSegment / 2);
    // Para que el puntero de arriba (posición "12 en punto") apunte a este centro, necesitamos una rotación específica.
    // La rotación deseada es tal que (360 - targetAngleForSegmentCenter) + 90 (compensación del puntero).
    // Simplificando, para que el puntero apunte al centro del segmento, necesitamos rotar la ruleta
    // de manera que el centro del segmento quede "debajo" del puntero.
    // Calculamos el ángulo que debe tener la ruleta para que el segmento ganador esté bajo el puntero.
    // Sumamos giros completos para hacer la animación más larga y dramática.
    const extraRotations = 5; // Número de giros completos adicionales
    const totalSpinDegrees = extraRotations * 360;

    // Calcular el ángulo exacto para que el puntero apunte al centro del segmento ganador
    // El centro del puntero es la parte superior del círculo (que corresponde a -90 grados o 270 grados en un círculo trigonométrico).
    // Los segmentos se dibujan desde 0 grados (derecha), en sentido horario.
    // El ángulo del centro del segmento es `(winnerIndex * degreesPerSegment) + (degreesPerSegment / 2)`.
    // Queremos que este ángulo esté alineado con el puntero.
    // Si el puntero está fijo arriba, y la ruleta gira, necesitamos que el ángulo del centro del segmento
    // se alinee con la parte superior. Esto significa que la ruleta debe girar hasta que ese ángulo esté en 270 grados (sentido horario desde el eje x positivo).
    // O más sencillo, si el puntero está arriba, y los segmentos empiezan a dibujarse desde la derecha (0 grados),
    // si el índice 0 debe quedar arriba, la ruleta debe girar 90 grados en sentido anti-horario, o 270 en sentido horario.
    // Es decir, el ángulo del segmento + la cantidad para que se alinee con el puntero.
    let finalAngle = 360 - (targetAngleForSegmentCenter - 90); // Ajuste para el puntero arriba
    finalAngle += totalSpinDegrees; // Añadir giros completos para dramatismo

    // Asegurarse de que la rotación de GSAP se base en la rotación acumulada
    const currentVisualRotation = parseFloat(gsap.getProperty(canvas, "rotation")); // Obtener rotación actual aplicada por GSAP
    
    gsap.to(canvas, {
        rotation: currentVisualRotation + finalAngle, // Sumar a la rotación actual para continuidad
        duration: 5, // Duración del giro en segundos
        ease: 'power4.out', // Tipo de easing para desaceleración suave
        onUpdate: () => {
            // GSAP ya maneja la transformación 'rotation' automáticamente en el elemento.
            // No necesitamos canvas.style.transform si GSAP lo está controlando.
        },
        onComplete: () => {
            spinning = false;
            spinButton.disabled = false;
            spinSound.pause(); // Pausar sonido de giro
            spinSound.currentTime = 0; // Reiniciar para la próxima vez
            winSound.play(); // Reproducir sonido de victoria

            winnerDisplay.textContent = `¡Ganador: ${winnerPlayer}!`;
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

spinButton.addEventListener('click', spinRoulette); // Evento para el botón de giro

// --- Inicialización ---
// Asegurarse de que el canvas esté listo antes de dibujar
window.onload = () => {
    renderPlayerList(); // Renderiza la lista al cargar la página
    drawRoulette();     // Dibuja la ruleta inicial al cargar la página
};

// Asegurar que el canvas tenga el tamaño correcto si se redimensiona la ventana
window.addEventListener('resize', () => {
    canvas.width = wheelSize;
    canvas.height = wheelSize;
    drawRoulette();
});
