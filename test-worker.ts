import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

if (isMainThread) {
  function runSandbox(code: string) {
    return new Promise((resolve) => {
      const worker = new Worker(__filename, {
        workerData: { code },
      });

      const timeout = setTimeout(() => {
        worker.terminate();
        resolve({ output: [], errors: ['TIMEOUT'] });
      }, 500);

      worker.on('message', (msg) => {
        clearTimeout(timeout);
        worker.terminate();
        resolve(msg);
      });

      worker.on('error', (err) => {
        clearTimeout(timeout);
        worker.terminate();
        resolve({ output: [], errors: [err.message] });
      });
    });
  }

  (async () => {
    console.log('Testing normal code:');
    console.log(await runSandbox('console.log("hello");'));
    console.log('Testing infinite loop:');
    console.log(await runSandbox('while(true){}'));
  })();
} else {
  const { code } = workerData;
  const output: string[] = [];
  const errors: string[] = [];

  const safeConsole = {
    log: (...args: unknown[]) => output.push(args.map(String).join(' ')),
    error: (...args: unknown[]) => errors.push(args.map(String).join(' ')),
    warn: (...args: unknown[]) => output.push('Warning: ' + args.map(String).join(' ')),
    info: (...args: unknown[]) => output.push(args.map(String).join(' ')),
    debug: (...args: unknown[]) => output.push(args.map(String).join(' ')),
  };

  try {
    const sandboxedFn = new Function(
      'console', 'window', 'document', 'fetch', 'XMLHttpRequest',
      'localStorage', 'sessionStorage', 'indexedDB', 'navigator',
      'location', 'self', 'globalThis', 'importScripts', 'WebSocket',
      'EventSource',
      '"use strict";\\n' + code
    );

    sandboxedFn(
      safeConsole, null, null, null, null, null, null, null, null, null, null, null, null, null, null
    );
  } catch (err: unknown) {
    errors.push((err as Error).message || String(err));
  }

  parentPort?.postMessage({ output, errors });
}
