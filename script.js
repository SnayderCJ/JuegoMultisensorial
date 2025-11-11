// --- "Traducción" de la Lógica de Arduino a JavaScript ---

// --- 1. Definición de "Hardware" (Elementos HTML) ---
const ledRGB = document.getElementById('led-rgb');
const botonRojo = document.getElementById('boton-rojo');
const botonAmarillo = document.getElementById('boton-amarillo');
const botonVerde = document.getElementById('boton-verde');
const botonAzul = document.getElementById('boton-azul');
const botonInicio = document.getElementById('boton-inicio');
const textoNivel = document.getElementById('nivel-actual');

// Array de los botones para facilitar el acceso
const botones = [botonRojo, botonAmarillo, botonVerde, botonAzul];

// Equivalente a tu "AudioContext" para el buzzer
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// --- 2. Variables del Juego (Iguales a tu .ino) ---
const MAX_NIVEL = 15;
let secuencia = [];
let nivelActual = 0;
let pasoActual = 0;
let enModoJuego = false; // Equivalente a "estadoActual"

// --- 3. Conectar los Eventos (El "setup()" de JavaScript) ---
botonInicio.addEventListener('click', iniciarNuevoJuego);

// En lugar de digitalRead(), usamos addEventListener para "escuchar"
botones.forEach((boton, index) => {
    boton.addEventListener('click', () => {
        // Solo revisa el clic si estamos en el turno del jugador
        if (enModoJuego) {
            revisarPulsador(index); // index 0=Rojo, 1=Amarillo, etc.
        }
    });
});

// --- 4. Lógica Principal del Juego ---

// Función para pausar (Equivalente a delay())
function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function iniciarNuevoJuego() {
    // Simula la animación de "Game Over" de tu código
    await flashColor(0, 500); // Rojo
    await flashColor(0, 500); // Rojo
    await esperar(1000); // Pausa
    
    nivelActual = 0;
    textoNivel.textContent = nivelActual;
    await siguienteNivel();
}

async function siguienteNivel() {
    enModoJuego = false; // Desactiva los botones mientras muestra la secuencia
    desactivarBotones();
    
    nivelActual++;
    textoNivel.textContent = nivelActual;
    
    // Añade un nuevo color aleatorio a la secuencia
    // Math.floor(Math.random() * 4) es el equivalente a random(0, 4)
    secuencia.push(Math.floor(Math.random() * 4));
    
    await esperar(1000); // Pausa antes de mostrar
    
    // Muestra la secuencia (Equivalente al for loop en mostrarSecuencia())
    for (let i = 0; i < secuencia.length; i++) {
        await flashColor(secuencia[i]);
        await esperar(200); // Pausa entre colores
    }
    
    // Pasa el turno al jugador
    pasoActual = 0;
    enModoJuego = true;
    activarBotones();
}

function revisarPulsador(botonPresionado) {
    if (botonPresionado === secuencia[pasoActual]) {
        // --- ¡CORRECTO! ---
        flashColor(botonPresionado, 150); // Muestra el color
        pasoActual++;
        
        // ¿Nivel superado?
        if (pasoActual >= nivelActual) {
            sonidoNivelSuperado();
            setTimeout(siguienteNivel, 1000); // Espera 1 seg y pasa al siguiente nivel
        }
    } else {
        // --- ¡INCORRECTO! ---
        // Se reinicia el juego (Game Over)
        secuencia = [];
        setTimeout(iniciarNuevoJuego, 500);
    }
}

// --- 5. Funciones Auxiliares (Simulación de Hardware) ---

// Equivalente a tus funciones "mostrarColor..."
async function flashColor(colorIndex, duracion = 400) {
    const boton = botones[colorIndex];
    let claseLed = '';
    let frecuenciaBuzzer = 0;

    switch (colorIndex) {
        case 0: // Rojo
            claseLed = 'led-rojo';
            frecuenciaBuzzer = 300; // Tono grave
            break;
        case 1: // Amarillo
            claseLed = 'led-amarillo';
            frecuenciaBuzzer = 400;
            break;
        case 2: // Verde
            claseLed = 'led-verde';
            frecuenciaBuzzer = 500;
            break;
        case 3: // Azul
            claseLed = 'led-azul';
            frecuenciaBuzzer = 600; // Tono agudo
            break;
    }

    // Enciende
    ledRGB.className = claseLed;
    beepBuzzer(frecuenciaBuzzer, duracion);
    
    // Espera
    await esperar(duracion);
    
    // Apaga
    ledRGB.className = 'led-apagado';
}

function sonidoNivelSuperado() {
    beepBuzzer(600, 100);
    setTimeout(() => beepBuzzer(700, 100), 150);
    setTimeout(() => beepBuzzer(800, 150), 300);
}

// Simulación del Buzzer (Equivalente a beepBuzzer() con Web Audio API)
function beepBuzzer(frecuencia, duracion) {
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine'; // Tipo de onda
    oscillator.frequency.setValueAtTime(frecuencia, audioCtx.currentTime); // Hz
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duracion / 1000); // duracion en segundos
}

function desactivarBotones() {
    botones.forEach(boton => boton.classList.add('desactivado'));
}

function activarBotones() {
    botones.forEach(boton => boton.classList.remove('desactivado'));
}