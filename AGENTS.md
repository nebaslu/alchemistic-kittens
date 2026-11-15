# Reglas del proyecto — orquestación GameForge

**Toda petición del usuario en este repo se trata SIEMPRE con el flujo de `gameforge-director`** (skill en `.vibe/skills/gameforge-director/`). No se abordan tareas "a pelo": primero se orquesta.

## Protocolo obligatorio por tarea

1. **Cargar `/gameforge-director`** y seguir su flujo: descomponer la petición en sprints/tareas atómicas.
2. **Asignar especialistas** (una skill de `.vibe/skills/` por tarea) y aplicarlas en orden:
   - Diseño/jugabilidad → `/game-designer`
   - Calidad/QA → `/qa-tester` (ejecutar `npm test`) y `/best-practices-reviewer`
   - Assets → `/asset-scout`
   - Código TS/Phaser → `/lead-ts-engineer`
   - UI/UX → `/game-ui-ux`
   - Sonido → `/sound-designer`
   - Publicación web → `/web-publisher`
   - Seguridad/legal → `/security-lead`, `/legal-privacy` cuando aplique
3. **Ejecutar** las tareas en rama `vibe/<slug>-f17f51`, commit, push y PR.
4. **Verificar** con `/qa-tester` (`npm test`) antes de entregar.
5. **Informar** al usuario con el resumen del director (qué hizo cada especialista).

## Protocolo de referencias visuales (imágenes)

Cuando la petición del usuario incluya imágenes (dos propuestas de UI, moodboard, mocks...):

1. **El modelo SÍ puede ver imágenes.** Las adjuntas en el chat llegan como recursos `file:///mnt/vibefs/uploads/...` y las del repo/workspace se leen del disco. No alegar incapacidad: abrirlas con `analyze_image` (y `ocr_document` si hay texto en la imagen).
2. **El director pasa SIEMPRE las rutas de las imágenes al especialista** (`/game-ui-ux`, `/asset-scout`, `/game-designer`) con la instrucción explícita: "abre estas imágenes con `analyze_image` antes de proponer nada y cita lo que ves".
3. **Prioridad de fuentes**: 1) imágenes ya en el repo (`docs/moodboard/`, `docs/ui-mocks/`, `docs/ui-propuesta-b/`, `docs/art-styles/`), 2) adjuntos del chat, 3) descripción textual.
4. Si una imagen llega ilegible (compresión del chat, foto de pantalla con reflejos, formato raro): pedir que la re-suban en **PNG nítido, una pantalla por imagen, ancho >= 1024 px**, y que la dejen en el repo (ej. `docs/`) para no perder calidad. Nunca inventar contenido de una imagen no legible.
5. Si la propuesta trae texto (md/html), pedirlo también como archivo de texto: el OCR de letra pequeña falla.

## Reglas de entrega

- Rama `vibe/<tema>-f17f51` desde `main`; nunca push directo a `main`.
- PR en draft con resumen + verificación; cuerpo en Markdown vía `--body-file`.
- Build: `npm test` = `tsc --noEmit && vite build && node scripts/check-scenes.mjs`.
- Config editable en runtime: `public/config/game.config.json`.
- Assets externos: dejar en `assets-src/` y avisar para integrarlos.

## Informe de agentes (obligatorio al final de cada entrega)

Cada respuesta que entregue una tarea debe terminar con:

```
## Informe de agentes
| Fase | Agente (skill) | Qué hizo |
|---|---|---|
| Orquestación | gameforge-director | Descomposición en tareas y asignación |
| <fase> | <skill usada> | <acción concreta> |
| QA | qa-tester | npm test OK / fallos |
```

Siempre incluir la fila de `gameforge-director` y la de `qa-tester`; las demás según las skills aplicadas de verdad.
