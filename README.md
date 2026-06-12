# 🏆 CAMINO A LA GLORIA - Copa del Mundo 2026

¡Bienvenido a **Camino a la Gloria**, un vibrante juego de fútbol arcade en 2D al estilo *Big Head Soccer*! Representa a tu selección favorita y compite a través de las rondas eliminatorias hasta levantar la Copa del Mundo en la gran cita mundialista de Norteamérica 2026 (USA - México - Canadá).

---

## 🎮 Características del Juego

*   **10 Selecciones Nacionales**: Juega con Argentina, Ecuador, México, Brasil, España, Francia, Alemania, Canadá, Japón o Estados Unidos. Cada una cuenta con estadísticas personalizadas de **Velocidad**, **Fuerza de Patada** y **Altura de Salto**.
*   **Físicas de Balón e Impacto de Red Realistas**: El arco cuenta con mallas de cuadrícula realistas que se deforman y estiran elásticamente al marcar gol según el punto de impacto.
*   **Fallas y Bordes LED**: Las porterías se integran orgánicamente al escenario del estadio mediante vallas publicitarias LED animadas en color neón celeste y dorado.
*   **Efectos Climáticos y de Iluminación**: Juega con cuatro configuraciones climáticas dinámicas (Sol, Noche con estrellas titilantes, Lluvia y Nieve) con renderizado optimizado de partículas.
*   **Power-Ups Activos (Burbujas)**: Recolecta modificadores durante el partido tocándolos con el balón o el cuerpo de tu jugador:
    *   ⚡ **Velocidad**: Incremento temporal del ritmo de carrera.
    *   ❄️ **Congelamiento**: Paraliza temporalmente al rival.
    *   🟢 **Balón Gigante**: Facilita los rebotes y tiros de cabeza.
    *   🔴 **Balón Pequeño**: Dificulta el control y aumenta la velocidad del juego.
*   **Menú de Pausa**: Detén el partido en cualquier momento para reanudarlo o volver al menú de inicio presionando el botón superior derecho o la tecla **Esc** / **P**.
*   **Soporte Responsivo Celular**: Incluye controles táctiles virtuales y un bloqueador inteligente de orientación que solicita rotar el celular a formato horizontal (Landscape) para jugar de forma óptima.

---

## 🕹️ Controles

### Teclado (PC)
*   **Mover a la Izquierda**: `Flecha Izquierda` / `A`
*   **Mover a la Derecha**: `Flecha Derecha` / `D`
*   **Saltar**: `Flecha Arriba` / `W`
*   **Patear**: `Espacio` / `K`
*   **Pausar / Reanudar**: `Esc` / `P`

### Controles Táctiles (Móviles / Tablets)
*   Usa el pad direccional digital (D-Pad) a la izquierda para moverte.
*   Presiona los botones virtuales `▲` (Saltar) y `⚽` (Patear) a la derecha para interactuar.

---

## 🛠️ Tecnologías Utilizadas

*   **Lógica**: JavaScript (HTML5 Canvas 2D, orientación a objetos).
*   **Diseño y Estilos**: CSS3, TailwindCSS (glassmorphism y animaciones neón).
*   **Audio**: Web Audio API (síntesis de sonido ambiental y efectos sin dependencias externas).
*   **Despliegue**: Compatible con cualquier servidor web estático (GitHub Pages, Vercel, Netlify).

---

## 🚀 Cómo Jugar en Local

El juego está desarrollado bajo la filosofía **pure offline**, lo que significa que no requiere servidores complejos ni base de datos para correr.
1.  Clona o descarga este repositorio.
2.  Haz doble clic en el archivo `index.html` para abrirlo directamente en cualquier navegador web.
3.  ¡Selecciona tu equipo, ajusta la dificultad y empieza tu camino a la gloria!

---

## 📈 Estructura del Proyecto

```bash
├── index.html       # Interfaz principal, menús de selección y overlays
├── css/
│   └── style.css    # Animaciones neón, D-pad y diseño responsivo
├── js/
│   ├── game.js      # Lógica central del juego, físicas, IA y renderizado
│   └── sound.js     # Sintetizador de audio y efectos Web Audio API
└── assets/          # Recursos gráficos y fondos
```

---

Desarrollado para ofrecer diversión rápida, fluida a 60 FPS estables y un aspecto gamer retro arcade. ¡Buena suerte rumbo a la final! 🏆
