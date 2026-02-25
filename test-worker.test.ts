import { describe, it, expect } from 'vitest';

describe('Worker test', () => {
  it('should run a worker', async () => {
    const workerCode = `postMessage('hello');`;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    const res = await new Promise((resolve) => {
      worker.onmessage = (e) => resolve(e.data);
    });
    expect(res).toBe('hello');
  });
});
