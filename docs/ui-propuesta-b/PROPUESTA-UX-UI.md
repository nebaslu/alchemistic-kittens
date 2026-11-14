# Propuesta UX/UI — Alchemistic Kittens (demo)

> Gatitos alquimistas, torre de mago, pociones y tiempo corriendo. Jugador casual web (2–10 min), escritorio y móvil. Esta propuesta cubre dirección visual, sistema de diseño, arquitectura de pantallas, patrones de interacción, responsive y accesibilidad.

---

## 1. Principios de diseño

1. **Legible primero, bonito después.** En una sesión de 2 minutos, el jugador debe entender *qué pedir, dónde está y cuánto queda* en menos de 1 segundo. El HUD manda sobre la decoración.
2. **Una acción por objeto.** Cada estación (almirez 🥣, tabla 🔪, caldero 🍲, varita 🪄, expendedor 🛒) tiene un único rol visualmente inequívoco: forma + color + icono = función.
3. **El tiempo se ve, no se lee.** Temporizadores de pedidos son barras/anillos con código de color, no solo números. La quemadura del caldero es visual (humo → llamas) antes que numérica.
4. **Feedback a cada input.** Todo toque/tecla produce respuesta en <100 ms (squash del gatito, chispas, SFX procedural). Con `prefers-reduced-motion`, se sustituye shake/partículas por flashes y overlays estáticos.
5. **Frustración con salida.** Explosión 💥 y pedido perdido son eventos grandes pero legibles: siempre hay un "¿qué ha pasado?" flotante ("¡Caldero quemado!") y un CTA claro ("🪄 Mantén E para limpiar").

---

## 2. Dirección de arte

### 2.1 Estilo
Pixel art isométrico low-res (tile ~32×32 px, sprites escalados ×2 con `image-rendering: pixelated`), paleta cálida y saturada estilo cozy-fantasy. Personajes legibles en silueta: gatitos redondos con delantales de color según pantalla.

### 2.2 Paleta (tokens CSS)

```css
:root {
  /* Superficies */
  --bg-tower-1: #3b2a4f;      /* Sótano: violeta profundo */
  --bg-tower-2: #4a3060;      /* Sala del caldero */
  --bg-tower-3: #5d3a72;      /* Ático: más cálido/luminoso */

  /* Acción primaria */
  --primary: #6d4aff;         /* Violeta Proton-ish, botones grandes */
  --primary-hover: #7d5eff;

  /* Estados */
  --ok: #47c86a;              /* Orden listo, ingrediente válido */
  --warn: #f5a623;            /* Timer medio, cocina casi lista */
  --danger: #ff5252;          /* Timer crítico, explosión, quemado */
  --locked: #8a83a3;          /* Pantalla bloqueada */

  /* Meta-recurso */
  --tuna: #ffb35c;            /* Latas de atún / moneda */

  /* Neutros */
  --ink: #1c1430;             /* Texto sobre claro */
  --paper: #fff8ec;           /* Paneles tipo pergamino */
  --panel: rgba(28, 20, 48, .82); /* HUD translúcido sobre juego */
}
```

Jerarquía cromática regla de oro: **violeta = navegar, naranja atún = ganar, verde = hacerlo bien, rojo = peligro inmediato**. No se usan esos colores para nada ajeno a su significado.

### 2.3 Tipografía
- **Display / títulos:** "Fredoka" o similar redondeada (cozy, gaming, sin coste).
- **UI / HUD:** la misma familia en pesos bajos; números tabulares (`font-variant-numeric: tabular-nums`) para timers y contadores.
- **Pixel fallback** para banners internos del juego (opcional, "Press Start 2P" solo en títulos de nivel).

### 2.4 Iconografía
Regla actual del GDD (emoji) aceptada para demo **con plan de migración** (riesgo ya identificado): capa de UI pinta emojis como texto sobre chips con fondo, y se preparan sprites pixel propios para P2. Mientras tanto: emoji siempre dentro de un contenedor (chip/medallón) para uniformizar tamaño entre fuentes.

---

## 3. Arquitectura de pantallas

Mapa navegacional (identical al GDD, cada nodo = pantalla HTML/CSS salvo Partida, que es escena Phaser):

```
Boot → Login → Menú principal → Partidas (rascador 🗼) → Modal → Partida → Resultados
```

Nueva convención que propongo: **todas las pantallas de menú comparten un "stage tower"** — un lateral fijo con la torre 🗼 ilustrada que se ilumina piso a piso según el progreso del usuario. Da identidad continua y refuerza la progresión sin textos tutoriales.

### 3.1 Boot / carga
Pantalla mínima: logo (gatito con sombrero alquimista), barra de progreso finísima (violeta), tips rotativos ("La propina crece con la rapidez 🐟"). Duración máx 2 s; no bloquea por assets: degraded a texto mientras carga.

### 3.2 Login
Tarjeta central sobre fondo del stage tower. Campos usuario/contraseña con validación inline (borde rojo + mensaje bajo el campo, nunca alerts). CTA único **Entrar**; secundario en texto simple ("¿Solo quieres probar? → Invitado"). Demo local: se comunica honestamente "guardado en este dispositivo".

### 3.3 Menú principal
Vertical stack centrado, máximo 3 elementos visibles:

```
        [Logo Alchemistic Kittens]
        🐱 "¡Hola, {usuario}!"
        ┌──────────────────────┐
        │   ▶  Jugar           │  ← primario, grande (min 56px alto)
        ├──────────────────────┤
        │   🗼  Mis pantallas   │  ← acceso directo a progreso
        └──────────────────────┘
           Salir (enlace texto)
```

Fondo: la torre con burbujas de poción animadas (CSS keyframes, pausable con reduced-motion). Ningún HUD aquí: cero ruido.

### 3.4 Partidas — selección de pantalla (rascador 🗼)
Layout propuesto: **tarjetas verticales apiladas como pisos de la torre** (metáfora directa del GDD: sótano → sala del caldero → ático). Se navega con scroll y cada tarjeta es literalmente el piso:

```
┌─────────────────────────────────────────┐
│  PISO 3 · Ático            🐟🐟🐟 oro    │  ← desbloqueada si plata en piso 2
│  ★★ Antídoto · Sirena · Gato Montés     │
│  [▶ Empezar]        máx 3 pedidos activos│
├─────────────────────────────────────────┤
│  PISO 2 · Sala del caldero  🐟 plata ✓   │
│  ★ Ronroneo · ★★ Anti-Pelos · Sirena    │
│  [▶ Empezar]                            │
├─────────────────────────────────────────┤
│  PISO 1 · Sótano             🐟 bronce ✓ │
│  ★ Ronroneo                             │
│  [▶ Empezar]          siempre disponible  │
└─────────────────────────────────────────┘
```

- **Lock state:** piso 3 gris con candado 🔒 + tooltip "Consigue atún de plata en la Sala del caldero". El requisito *se explica en el lugar*, no en un manual.
- **Atún teñido 🐟** como badge de logro en cada tarjeta (progreso persistido `ak-progress-<user>`): contador pequeño "400/650".
- Micro-interacción: al pasar hover/focus por un piso, la ventana del piso se enciende con luz cálida.

### 3.5 Modal pre-partida
Overlay con blur del listado. Contenido:

- Nombre de pantalla + pool de recetas con sus estaciones (iconos 🥣🔪→🍲).
- Regla de propina traducida a humano: *"Entrega rápido = más latas 🐟 (segundos restantes × 1.5)"*.
- Controles: 2 iconos inline (WASD mover · E interactuar) — no párrafos.
- Botones: **▶ Empezar** (primario) y **✖ Cerrar** (fantasma). Esc también cierra (accesible y natural en escritorio).

### 3.6 Partida — HUD (momento crítico)

Principio: el HUD vive en los bordes, el tablero isométrico respira en el centro.

```
┌────────────────────────────────────────────────────────────┐
│ ⏱ 02:31  ████████████░░        🧡🧡🧡        🐟 340          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│   [Pedidos activos — columna izquierda, tarjetas_ticket]   │
│                                                            │
│         TABLERO ISOMÉTRICO (lienzo Phaser)                 │
│                                                            │
│   Banner de nivel / avisos flotantes (centro-superior)     │
├────────────────────────────────────────────────────────────┤
│  "Mantén E para limpiar el caldero 🪄"  ← hint contextual  │
└────────────────────────────────────────────────────────────┘
```

**Barra superior (global):**
- Tiempo restante de partida con barra fina que cambia de color (blanco → warn → danger en últimos 30 s; últimos 10 s parpadeo suave).
- Corazones 🧡: pérdida animada (encoge + cae), sin número — lectura instantánea.
- Latas de atún 🐟 acumuladas con "+45" flotante al ganar (texto flotante ya previsto en el GDD).

**Tickets de pedido (izquierda):**
- Tarjeta por pedido: icono de poción, mini-receta como flujo de chips (`🌿🔪 → 🍲`), y **ring de tiempo** alrededor del icono.
- Estados del ticket: *normal* (anillo blanco), *aviso* (amarillo, <50% tiempo), *crítico* (rojo, pulso sutil), *expirado* (gris con 🧡−1 animación).
- Máximo 3 tickets → reservar 3 slots fijos para evitar reflow cuando llega el pedido 3.
- Receta como chips-en-cadena **refuerza el orden del caldero** (regla core del loop) sin memorizar texto.

**Hint contextual inferior** (ya existe en el proyecto): única línea, máx ~60 caracteres, aparece solo cuando hay acción posible y desaparece tras usarla 2 veces (anti-ruido).

**Estaciones en el tablero:** glow del color de estado — verde = ingredient válido aquí, violeta = en proceso, rojo = quemándose. El caldero muestra su contenido como fila de mini-chips en el orden echado.

**Explosión:** flash blanco 80 ms + shake (si reduced-motion: solo flash) + overlay de humo sobre el caldero con icono 🪄 pulsante = "aquí se limpia".

### 3.7 Resultados
Pantalla ceremoniosa, no dashboard: primer plano las **3 latas de atún** grandes (bronce/plata/oro), apiladas como podio con contador **N/M** y barra interior de relleno. Solo la de oro admite overflow (contorno brillante + 🐟 extra alrededor).

Momento firma: al entrar, cada lata se llena **secuencialmente con sonido** (tick-tick-tick procedural) — el jugador ve ganar. Si desbloquea piso nuevo: banner entre latas y CTA "🗼 Ir al Ático" prominente, sustituyendo a "Volver a jugar".

```
        ¡Turno terminado!
   [🥫 bronce  480/500  ████████░░]
   [🥫 plata   480/650  ██████░░░░]
   [🥫 oro     300/∞    🔥 NUEVO RÉCORD]
        ✨ ¡Ático desbloqueado! ✨
   [↻ Volver a jugar]   [↩ Salir]
```

Botones abajo siempre en el mismo orden (memoria muscular tras varias runs de 3 min).

---

## 4. Responsive y entrada

| Breakpoint | Tablero | Tickets | Barra superior |
|---|---|---|---|
| ≥1024 px (desktop) | Centrado, ~70% viewport | Columna izquierda fija, 3 slots | Fila completa arriba |
| 640–1023 px (tablet) | 60% | Tickets colapsan a iconos con ring; tap abre detalle | Comprimida: timer + corazones |
| <640 px (móvil) | Pantalla casi completa | Drawer lateral deslizante con badge contador | Dos filas compactas |

**Táctil (P2, joystick virtual):** joystick en zona inferior-izquierda con zona muerta amplia; botón **E** grande inferior-derecha con *hold-to-repeat* visual (anillo que se llena en interacciones de 1.5 s: moler/cortar/limpiar — el anillo ES el feedback de progreso). Toda zona táctil ≥ 44×44 px.

**Teclado:** `E` interacción con el mismo anillo de progreso sobre la estación; `Esc` = pausa; foco visible en todos los controles HTML (outline violeta).

---

## 5. Accesibilidad

- Contraste AA en todos los textos sobre paneles; los chips de ingrediente llevan **nombre corto además del emoji** (riesgo de fuentes ya registrado).
- `prefers-reduced-motion`: sin shake, partículas → flashes, animaciones de tickets → cambios de color.
- Game over, lock de pantallas y reglas de propina nunca se comunican **solo** por color: siempre icono + texto.
- Navegación completa por teclado en menús (HTML real, no canvas) — ventaja de la arquitectura elegida.
- Objetivos táctiles ≥44 px y timers nunca codificados únicamente por color (ring + número).

---

## 6. Sistema de componentes (inventario mínimo)

| Componente | Uso | Estados |
|---|---|---|
| `BtnPrimary / BtnGhost` | CTA en todas las pantallas | default/hover/focus/disabled |
| `TicketPedido` | HUD partida | normal/aviso/crítico/expirado |
| `ChipIngrediente` | Recetas, caldero, estación | vacío/preparando/listo/error |
| `RingTiempo` | Tickets y hold-E | progreso 0–1, color por umbral |
| `CardPiso` | Selección de pantallas | unlocked/completed/locked |
| `TunaCan` | Resultados | bronce/plata/oro, filling, overflow |
| `FloatingText` | Recompensas/avisos | spawn → rise → fade |
| `BannerNivel` | Entrada a partida | slide-in/out |
| `ModalEmpezar` | Pre-partida | open/closing |

Todos definidos como clases CSS reutilizables en `src/ui/` para que los menús HTML comparen estado con `game.config.json` sin recompilar.

---

## 7. Copy y tono

- Voz: cariñosa y gamberreta. Segunda persona, exclamaciones moderadas.
- Errores explican **causa + remedio** en una línea: "💥 ¡Caldero quemado! — varita miaugica 🪄, mantén E".
- Nunca culpar: "¡Casi!" en expirado mejor que "Fallaste".
- Números siempre con unidad: "340 🐟" y "+45 🐟", no "340" a secas.

---

## 8. Roadmap UX (alineado con prioridades del GDD)

- **P0 → UX:** estados de ticket y ring de tiempo; hint contextual con auto-apagado; flujo resultados → replay sin fricción (un botón = nueva run).
- **P1 → UX:** tutorial por sugerencias del nivel 1 (chips-en-cadena en tickets ya enseñan la receta); micro-onboarding en el modal (3 iconos, no texto).
- **P2 → UX:** joystick + botón táctil; sprites pixel propios sustituyendo emoji (capa `Icon` que resuelve sprite→emoji→texto en cascada, eliminando el riesgo de fuentes).
