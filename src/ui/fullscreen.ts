let onChange: (() => void) | null = null;

/** Botón de pantalla completa (Fullscreen API + prefijo webkit) con aviso fallback en navegadores sin soporte. */
export function isFullscreenSupported(): boolean {
  const el = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => void;
  };
  return (
    typeof el.requestFullscreen === 'function' ||
    typeof el.webkitRequestFullscreen === 'function'
  );
}

export function isFullscreenActive(): boolean {
  const doc = document as Document & { webkitFullscreenElement?: Element };
  return Boolean(document.fullscreenElement ?? doc.webkitFullscreenElement);
}

export function toggleFullscreen(): void {
  const el = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => void;
  };
  const doc = document as Document & { webkitExitFullscreen?: () => void };
  if (isFullscreenActive()) {
    if (document.exitFullscreen) void document.exitFullscreen();
    else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
  } else if (typeof el.requestFullscreen === 'function') {
    void el.requestFullscreen();
  } else if (typeof el.webkitRequestFullscreen === 'function') {
    el.webkitRequestFullscreen();
  }
}

function updateIcons(): void {
  const icon = isFullscreenActive() ? '🗗' : '⛶';
  for (const id of ['btn-fullscreen', 'btn-fullscreen-global']) {
    const b = document.getElementById(id);
    if (b) b.textContent = icon;
  }
  if (onChange) onChange();
}

export function initFullscreenButtons(onUnsupported?: () => void): void {
  for (const id of ['btn-fullscreen', 'btn-fullscreen-global']) {
    const b = document.getElementById(id);
    if (!b) continue;
    b.addEventListener('click', () => {
      if (!isFullscreenSupported()) {
        if (onUnsupported) onUnsupported();
        return;
      }
      toggleFullscreen();
    });
  }
  document.addEventListener('fullscreenchange', updateIcons);
  const doc = document as Document & {
    addEventListener: Document['addEventListener'];
    webkitfullscreenchange?: never;
  };
  doc.addEventListener('webkitfullscreenchange', updateIcons);
  updateIcons();
}

export function onFullscreenChange(cb: () => void): void {
  onChange = cb;
}
