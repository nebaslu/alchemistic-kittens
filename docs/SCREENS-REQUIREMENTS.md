# Requisitos de pantallas/ventanas — Alchemistic Kittens (desde cero)

Documento de game-designer + game-ui-ux + story-architect. **Ignora el diseño actual**: esto es la lista completa de ventanas que el juego necesita, con los elementos de cada una.

## Resumen de ventanas

| # | Pantalla | Tipo | Datos clave que muestra | Navega a |
|---|---|---|---|---|
| 0 | Carga (boot) | overlay | barra de progreso % | 1 |
| 1 | Login | pantalla | usuario, error de validación | 2 (o 1 si falla) |
| 2 | Menú principal | pantalla | usuario, progreso resumen | 3, 4, 8, 10 |
| 3 | Partidas (mapa rascadores) | pantalla | mundos, pantallas, candados, medallas | 2, 5 (modal) |
| 4 | Ajustes | pantalla/modal | volumen música/SFX, idioma, accesibilidad | 2 |
| 5 | Detalle pantalla + empezar | modal | nombre, duración, medallas, récord | 6 (empezar), 3 (cerrar) |
| 6 | Partida | canvas+HUD | pedidos, tiempo, puntos, latas, objeto en mano, hint | 7 (pausa), 9 (fin) |
| 7 | Pausa | modal | — | 6, 4, 3 |
| 8 | Resultados | pantalla | puntos, latas, medalla, N/M por lata | 6 (repetir), 3 |
| 9 | (fin de partida lo cubre 8) | — | — | — |
| 10 | Créditos | pantalla/modal | autores, licencias (CC0/CC-BY) | 2 |

## Detalle por ventana

### 0 · Carga
- Barra de progreso + % + consejo/hint rotatorio ("El mortero muele solo mientras cocinas").
- Estado error de red/assets: mensaje + reintentar.

### 1 · Login
- Logo/título, input usuario, input contraseña, botón Entrar (primario), error inline, hint demo.
- Estados: vacío (error), cargando (spinner en botón), ok → 2.

### 2 · Menú principal
- Logo, botón **Jugar** (primario, prominente), **Ajustes**, **Créditos**, **Salir** (cierra sesión → 1); mostrar usuario; resumen de progreso (mejor medalla por pantalla).
- Botón fullscreen ⛶ (global, esquina).

### 3 · Partidas (selección)
- Header: ← Volver, título. Lista de **rascadores** (mundo temático: torre, árbol rascador, cueva…): icono grande, nombre, progreso.
- Al seleccionar rascador: sus **pantallas** (tarjetas): número, candado 🔒 si bloqueada, medalla/atún conseguido, mejor marca 🐟.
- Pulsar desbloqueada → modal 5.
- Estado vacío: "sin rascadores desbloqueados" (no aplica, el 1º siempre abierto).

### 4 · Ajustes
- Sliders: volumen maestro, música, efectos; toggle: reducir movimiento, daltónicos; idioma; botón cerrar.
- Persiste en localStorage; accesible también desde pausa (7).

### 5 · Modal detalle de pantalla
- Nombre de pantalla, duración, umbrales de atún (bronce/plata/oro), récord personal, botones **Empezar partida** (primario) y **Cerrar** (rojo).
- Cierra con ✖, clic fuera o Esc.

### 6 · Partida (canvas 960×640 + HUD HTML)
- HUD: barra superior (pantalla, puntos, latas 🐟, tiempo ⏱ con color <30 s, objeto en mano 🐾, botones ⏸ ⛶).
- Tarjetas de pedidos (máx 3): emoji receta, nombre, barra de tiempo, ingredientes que faltan.
- Tablero: suelo, estaciones (ingredientes, mortero, caldero, expendedor, varita), personaje, partículas/textos flotantes.
- Barra de progreso (moler/limpiar), hint contextual abajo.
- Móvil: joystick + botones E/Q; aviso "gira el dispositivo" en vertical.
- Pausa con Esc/P/⏸ → 7. Fin de tiempo → 8.

### 7 · Pausa (modal sobre partida congelada)
- **Continuar**, **Ajustes** (abre 4 encima), **Salir a partidas** (→ 3, descarta partida).
- El juego se detiene de verdad (timers pausados).

### 8 · Resultados
- Título, pantalla jugada, puntos, latas ganadas, atún conseguido (pez coloreado bronce/plata/oro).
- Rascador con 3 latas N/M y relleno; desbloqueo avisado si se consigue plata ("¡Pantalla 2 desbloqueada!").
- Botones: **Volver a jugar** (→ 6 misma pantalla), **Salir** (→ 3). Mismo ancho.

### 10 · Créditos
- Lista de autores/licencias (Kenney CC0, game-icons CC-BY, procedurales propios) + botón volver.

## Reglas transversales (UX)
- Un elemento principal por pantalla; botones de una pantalla con el mismo ancho; táctil ≥48 px.
- Contraste WCAG AA; foco visible; `prefers-reduced-motion` respetado.
- Todo navegable con teclado (Tab/Enter/Esc) además de ratón/táctil.
- Estados vacíos y de error definidos en cada pantalla.
- Fullscreen ⛶ disponible en menús y en HUD de partida.
