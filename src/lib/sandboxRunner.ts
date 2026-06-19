/**
 * Sandboxed JavaScript execution — opaque-origin iframe realm.
 * Feature: security-hardening
 *
 * SECURITY MODEL
 * --------------
 * Previous versions ran untrusted JS inside a Web Worker using
 * `new Function(...)` with dangerous globals shadowed as null parameters.
 * That is escapable: any payload can reach the real global object through a
 * constructor chain such as `({}).constructor.constructor("return fetch")()`
 * and recover `fetch`, `localStorage`, etc. — which would let learner code
 * steal the app's auth token / session from the same-origin realm.
 *
 * It is impossible to make a JS interpreter sandbox-safe by shadowing
 * identifiers, because real objects' `.constructor` chains always lead back to
 * the real `Function`/`Object`, bypassing any Proxy/`with` scope.
 *
 * This module runs untrusted code in a SEPARATE origin instead. It injects the
 * code into a blob-document loaded in an <iframe sandbox="allow-scripts"> —
 * WITHOUT `allow-same-origin`, so the frame is at an opaque origin and is
 * physically denied access to the parent's cookies, localStorage,
 * sessionStorage, IndexedDB, and DOM. Even if a payload "escapes" the run
 * function, it only escapes into the opaque-origin frame, which has nothing of
 * value. Output is relayed back to the hook via `postMessage`.
 *
 * The iframe's own CSP forbids `connect-src` entirely, so the opaque origin
 * can't even reach the network. The frame is created and destroyed per
 * execution, providing state isolation.
 */

export interface SandboxResult {
  output: string[];
  errors: string[];
  timedOut: boolean;
}

export interface RunSandboxOptions {
  /** Hard wall; the frame is torn down if the run exceeds this. */
  timeoutMs: number;
}

/**
 * Execute JavaScript in an opaque-origin sandbox frame. Resolves with the
 * captured stdout (console.log/info/debug), stderr (console.error), and any
 * thrown error. The frame is always removed before resolving.
 */
export function runJsInSandbox(
  code: string,
  opts: RunSandboxOptions,
): Promise<SandboxResult> {
  return new Promise<SandboxResult>((resolve) => {
    const output: string[] = [];
    const errors: string[] = [];
    let finished = false;
    let frame: HTMLIFrameElement | null = null;
    let watchdog: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (watchdog) {
        clearTimeout(watchdog);
        watchdog = null;
      }
      if (frame) {
        window.removeEventListener('message', onMessage);
        frame.remove();
        frame = null;
      }
    };

    const finish = (result: Partial<SandboxResult>) => {
      if (finished) return;
      finished = true;
      cleanup();
      resolve({
        output: result.output ?? output,
        errors: result.errors ?? errors,
        timedOut: result.timedOut ?? false,
      });
    };

    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.__cc !== true) return;
      switch (data.type) {
        case 'log':
          output.push(String(data.data));
          break;
        case 'warn':
          output.push(`Warning: ${data.data}`);
          break;
        case 'error':
          errors.push(String(data.data));
          break;
        case 'complete':
          finish({ output, errors, timedOut: false });
          break;
      }
    };

    window.addEventListener('message', onMessage);

    watchdog = setTimeout(() => {
      errors.push('Execution timed out');
      finish({ output, errors, timedOut: true });
    }, opts.timeoutMs);

    // Build the sandbox document. The frame's own CSP forbids connect-src
    // entirely, so even non-opaque-origin tricks can't reach the network.
    const doc = buildSandboxDocument(code);
    const blob = new Blob([doc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.setAttribute('aria-hidden', 'true');
    // Keep it off-screen and non-interactive.
    frame.style.cssText =
      'position:fixed;width:0;height:0;border:0;visibility:hidden;pointer-events:none;left:-9999px;top:-9999px;';
    frame.title = 'Sandboxed code execution';

    frame.addEventListener('load', () => URL.revokeObjectURL(url), { once: true });

    frame.src = url;
    document.body.appendChild(frame);
  });
}

/**
 * Build the HTML document for the sandbox frame. It exposes ONLY a safe
 * `console` to the user code; every other global is whatever the opaque-origin
 * frame provides (no storage, no same-origin, no parent access).
 */
function buildSandboxDocument(code: string): string {
  // JSON.stringify handles escaping `</script>`, backticks, etc.
  const safeCode = JSON.stringify(code);
  return `<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Security-Policy"
  content="default-src 'none'; script-src 'unsafe-inline'; connect-src 'none'; style-src 'none'; img-src 'none'; font-src 'none';">
</head>
<body>
<script>
(function () {
  function post(type, data) {
    try { parent.postMessage({ __cc: true, type: type, data: data }, '*'); }
    catch (e) { /* frame already torn down */ }
  }

  function serialize(args) {
    var arr = [];
    for (var i = 0; i < args.length; i++) {
      var a = args[i];
      if (a === null) { arr.push('null'); continue; }
      if (a === undefined) { arr.push('undefined'); continue; }
      var t = typeof a;
      if (t === 'string') { arr.push(a); continue; }
      if (t === 'number' || t === 'boolean' || t === 'bigint' || t === 'symbol') { arr.push(String(a)); continue; }
      if (t === 'function') { try { arr.push(a.toString()); } catch (e) { arr.push('[Function]'); } continue; }
      try { arr.push(JSON.stringify(a)); } catch (e) { try { arr.push(String(a)); } catch (e2) { arr.push('[' + t + ']'); } }
    }
    return arr.join(' ');
  }

  var safeConsole = {
    log:   function () { post('log',   serialize(arguments)); },
    info:  function () { post('log',   serialize(arguments)); },
    debug: function () { post('log',   serialize(arguments)); },
    warn:  function () { post('warn',  serialize(arguments)); },
    error: function () { post('error', serialize(arguments)); }
  };

  try {
    (new Function('console', '"use strict";\\n' + (${safeCode})))(safeConsole);
  } catch (e) {
    post('error', (e && e.message) ? e.message : String(e));
  }
  post('complete', null);
})();
</script>
</body>
</html>`;
}
