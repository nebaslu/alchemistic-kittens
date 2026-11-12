import { loadConfig } from './game/config';
import { initUI } from './ui/screens';

async function boot(): Promise<void> {
  await loadConfig();
  initUI();
}

void boot();
