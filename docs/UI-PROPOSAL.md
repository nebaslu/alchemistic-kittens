# Propuesta de interfaces — Alchemistic Kittens

Documento de diseño (game-designer + game-ui-ux). Estado actual: menús en HTML/CSS con UI Pack Adventure (Kenney CC0), partida en Phaser (canvas 960×640, Scale.FIT). Filosofía: **mobile-first**, un elemento principal por pantalla, feedback inmediato, botones ≥48 px y ancho uniforme por pantalla.

## 1. Login
```
┌────────────────────────────┐
│   🐱⚗️  ALCHEMISTIC        │
│      KITTENS               │
│  Inicia sesión…            │
│  ┌──────────────────────┐  │
│  │ Usuario              │  │
│  │ Contraseña           │  │
│  │ [ ▶ ENTRAR ]         │  │  <- primario, ancho completo (max 320)
│  └──────────────────────┘  │
└────────────────────────────┘
```
- P2: mensaje de error inline bajo el formulario (ya existe), hint "demo local".

## 2. Menú principal
```
┌────────────────────────────┐
│  🗼🐱  ALCHEMISTIC KITTENS  │
│  Sesión: <usuario>    ⛶    │
│                            │
│  [ ▶ JUGAR ]               │  <- primario, prominente
│  [ 🔊 Sonido ]             │  <- secundario, mismo ancho
│  [ ⏻ Salir ]               │
└────────────────────────────┘
```
- P2: mostrar progreso rápido (mejor atún por pantalla) bajo el título.

## 3. Partidas (selección de rascador/pantalla)
```
┌──────────────────────────────────────┐
│ ← Volver      ELIGE TU RASCADOR  ⛶   │
│  ┌────────────┐                      │
│  │    🗼      │  Rascador de la      │
│  │ Rascador…  │  Torre del Mago      │
│  └────────────┘                      │
│  Pantalla 1   Pantalla 2   Pantalla 3│
│   🐾 🥈        🔒          🔒        │
│  🐟 mejor:120  sin jugar   sin jugar │
└──────────────────────────────────────┘
   Modal al pulsar pantalla desbloqueada:
   [ Pantalla 1 · Sótano ]  duración/atunes
   [ ▶ Empezar partida ]  [ ✖ Cerrar ]
```
- Tarjetas: mismo ancho (100%, máx 200 px), wrap en móvil.
- P1: decoración con props del pack (barril, cofre) alrededor del rascador.

## 4. Partida (HUD sobre canvas)
```
┌────────────────────────────────────────┐
│ Pantalla 1 · Puntos: 12 · 🐟 30 · ⏱ 2:47 · 🐾🧪 · [⏸][⛶] │  <- panel gris
│ ┌──────────┐                           │
│ │🧪 Ronroneo│ barra tiempo             │  <- tarjeta pedido (máx 3)
│ │Falta: 🌿 │                           │
│ └──────────┘                           │
│         [tablero Phaser]               │
│  (móvil: joystick izq, [Q][E] dcha)    │
│  hint contextual abajo                 │
└────────────────────────────────────────┘
```
- P1: barra de progreso de moler/limpiar (ya existe), contador de latas animado (+N flotante, ya existe en canvas).

## 5. Pausa (overlay centrado)
```
│  ┌──────────────┐  │
│  │  ⏸ PAUSA     │  │
│  │ [▶ Continuar]│  │
│  │ [🔊 Sonido]  │  │
│  │ [↩ Salir]    │  │
│  └──────────────┘  │
```
- Botones mismo ancho (320 máx). Esc/P también pausa.

## 6. Sonido (overlay)
Música 🎵 [slider] % · Efectos 🔔 [slider] % · [✔ Cerrar]. Persiste en localStorage.

## 7. Resultados
```
┌────────────────────────────┐
│ ⏱ ¡Tiempo! Resultados     │
│ Pantalla 1 · Sótano        │
│ Puntos: 240 · 🐟 380 latas │
│ 🐟 Atún de oro conseguido  │
│   [lata bronce][plata][oro]│  <- N/M y relleno
│   150/150   200/300  380/500│
│ [↻ Volver a jugar] [↩ Salir]│
└────────────────────────────┘
```

## Accesibilidad (aplicada y pendiente)
- Contraste AA: texto claro sobre fondos oscuros; oscuro sobre botones grises claros.
- Táctil ≥48 px, ancho uniforme por pantalla, foco visible, `prefers-reduced-motion` respetado en Fx.
- P2: modo daltónico (iconos además de color en barras de tiempo), tamaño de texto ajustable.

## Prioridades (game-designer)
- **P0**: nada bloqueante — flujo actual funciona.
- **P1**: decoración de partidas con props del pack; progreso visible en principal; carga con barra en preload.
- **P2**: animaciones de transición entre pantallas, tema claro, daltónicos, tutorial contextual en la primera partida.
