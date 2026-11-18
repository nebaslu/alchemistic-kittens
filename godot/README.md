# Alchemistic Kittens — port a Godot 4 (`feature/godot`)

Mismo juego que la versión web (Phaser + TS en la raíz del repo), portado a **Godot 4.4** (GDScript).

## Cómo ejecutar

1. Descarga Godot 4.4+ (editor estándar o headless): https://godotengine.org
2. Importa/abre la carpeta `godot/` como proyecto (`project.godot`).
3. Pulsa **Play** (F5). En móvil: exporta con preset Android/iOS (el HUD muestra joystick + botones E/Q táctiles).

## Estructura

- `scenes/main.tscn` + `scripts/main.gd` — login, menú, partidas (rascador 🗼 con 3 pisos) + modal, resultados con latas N/M, pausa, sonido, HUD y cambio de tema 🎨 (Kenney / Lumo / Gemini, igual que la web).
- `scripts/match.gd` — la partida: tablero isométrico, jugador (char-run + char-hat), estaciones, mortero automático, caldero (empty→cooking→ready→exploded), pedidos continuos con propina ×tipMultiplier, ENTREGA con ⭐ pulsante, 3 min sin vidas, game over diferido un frame.
- `scripts/cfg.gd` (autoload) — config en runtime: `user://game.config.json` si existe; si no, `res://config/game.config.json` (mismos parámetros que `public/config/game.config.json`).
- `scripts/store.gd` (autoload) — sesión y progreso en `user://` (equivalente a localStorage): `user.txt`, `progress-<user>.json`, medallas (plata desbloquea el siguiente piso).
- `scripts/data.gd` — ingredientes, recetas y layout de las 3 pantallas (datos puros).
- `scripts/ui_style.gd` — estilos de los 3 temas aplicados a botones/paneles/labels.
- `assets/` — mismos PNG que la web (`public/assets/`), copiados.

## Controles

- Teclado: WASD/flechas mover · E interactuar (mantener para limpiar) · Q tirar · Esc/P pausa · ⛶ pantalla completa.
- Táctil: joystick virtual abajo-izquierda + botones Q/E abajo-derecha (aparecen en pantallas táctiles).

## Diferencias con la web

- Persistencia en `user://` en vez de localStorage; config editable en `user://game.config.json`.
- Música procedural sustituida por beeps WAV generados en código (`sfx()` en match.gd); volúmenes en el panel de sonido.
- Temas aplicados como paletas de estilos (StyleBoxFlat) en vez de CSS.

## QA

Sin Godot instalado en el entorno de agentes no se puede ejecutar aquí; validación mínima con Godot headless:

```bash
godot --headless --path godot --quit   # importa el proyecto y parsea todos los scripts
```
