export function spawnOcrWorker(): Worker {
  return new Worker(new URL('../../workers/supOcr.ts', import.meta.url), { type: 'module' });
}
