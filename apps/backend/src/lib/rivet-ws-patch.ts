// Cloudflare Workers' native WebSocket constructor rejects URLs that don't
// start with `ws://` or `wss://`. rivetkit's client builds actor gateway URLs
// from the configured endpoint (which must also serve HTTP), so in a Worker it
// ends up calling `new WebSocket("http://.../gateway/...")` and throws
// `SyntaxError: WebSocket Constructor: The url scheme must be ws or wss.`.
//
// Node's `ws` package silently accepts http:// URLs; the Worker doesn't. We
// monkey-patch the global WebSocket once so it rewrites `http(s)://` →
// `ws(s)://` before delegating to the real constructor. Idempotent.
//
// Remove this shim once rivetkit handles scheme conversion in the browser
// client, or when we move the rivet client out of the Worker entirely.

const PATCHED_FLAG = "__rivetHttpSchemeShim";

export function ensureWebSocketAcceptsHttpScheme(): void {
  const g = globalThis as unknown as {
    WebSocket?: typeof WebSocket;
  };
  const Orig = g.WebSocket as (typeof WebSocket & { [key: string]: unknown }) | undefined;
  if (!Orig || Orig[PATCHED_FLAG] === true) return;

  const Patched = function (
    this: WebSocket,
    url: string | URL,
    protocols?: string | string[]
  ) {
    let finalUrl: string = typeof url === "string" ? url : url.toString();
    if (/^https?:/i.test(finalUrl)) {
      finalUrl = finalUrl.replace(/^http/i, (m) => (m[0] === "H" ? "WS" : "ws"));
    }
    return new Orig(finalUrl, protocols);
  } as unknown as typeof WebSocket & { [key: string]: unknown };

  Patched[PATCHED_FLAG] = true;
  Patched.prototype = Orig.prototype;
  Object.setPrototypeOf(Patched, Orig);
  g.WebSocket = Patched;
}
