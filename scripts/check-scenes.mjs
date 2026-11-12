import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const main = readFileSync(join(srcDir, 'main.ts'), 'utf8');

const registered = new Set();
for (const m of main.matchAll(/import \{ (\w+) \} from '\.\/scenes\/(\w+)'/g)) {
  const content = readFileSync(join(srcDir, 'scenes', `${m[2]}.ts`), 'utf8');
  const key = content.match(/super\('([^']+)'\)/);
  if (key) registered.add(key[1]);
}

const files = [];
const walk = (d) => {
  for (const f of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, f.name);
    if (f.isDirectory()) walk(p);
    else if (p.endsWith('.ts')) files.push(p);
  }
};
walk(srcDir);

let bad = 0;
for (const f of files) {
  const c = readFileSync(f, 'utf8');
  for (const m of c.matchAll(/scene\.(?:start|launch|stop)\('([^']+)'/g)) {
    if (m[0].includes('.stop(')) continue;
    if (!registered.has(m[1])) {
      console.error(`BAD ${f.replace(srcDir, 'src')}: ${m[0]} -> escena no registrada`);
      bad++;
    }
  }
}

console.log(`Escenas registradas: ${[...registered].join(', ')}`);
if (bad > 0) {
  console.error(`FALLO: ${bad} transicion(es) a escenas inexistentes`);
  process.exit(1);
}
console.log('OK: todas las transiciones scene.start/launch apuntan a escenas registradas');
