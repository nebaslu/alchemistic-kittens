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

## Reglas de entrega

- Rama `vibe/<tema>-f17f51` desde `main`; nunca push directo a `main`.
- PR en draft con resumen + verificación; cuerpo en Markdown vía `--body-file`.
- Build: `npm test` = `tsc --noEmit && vite build && node scripts/check-scenes.mjs`.
- Config editable en runtime: `public/config/game.config.json`.
- Assets externos: dejar en `assets-src/` y avisar para integrarlos.
