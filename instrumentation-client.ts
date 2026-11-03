// Click log for EVERY button and link, in one place (Next.js client instrumentation:
// runs before hydration, so no component needs its own onClick logging).
//
// Each click is printed to the browser console (`console.debug`, level "Verbose")
// and sent to POST /api/log in small batches. Basic data only: type, label,
// destination, page and time. Never typed text, never an IP, user agent or session id.
// This code must never break the page: it is passive, never calls preventDefault /
// stopPropagation, and swallows every error.

type ClickType = "link" | "button" | "tab";

type ClickEvent = {
  type: ClickType;
  label: string;
  href: string | null;
  page: string;
  disabled: boolean;
  at: string;
};

const CLICKABLE = 'a[href], button, [role="tab"], [role="button"]';
const MAX_LABEL = 80;
const BATCH_SIZE = 20;
const FLUSH_DELAY_MS = 1000;
const ENDPOINT = "/api/log";

const queue: ClickEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

function clickType(element: Element): ClickType {
  if (element.getAttribute("role") === "tab") return "tab";
  if (element.tagName === "A") return "link";
  return "button";
}

function labelOf(element: Element): string {
  const aria = element.getAttribute("aria-label")?.trim();
  const text = aria || (element.textContent ?? "").replace(/\s+/g, " ").trim();
  return text.slice(0, MAX_LABEL);
}

/** Internal links: path + query (no hash). External: origin only. Other schemes: scheme only. */
function destinationOf(element: Element): string | null {
  if (!(element instanceof HTMLAnchorElement)) return null;
  try {
    const url = new URL(element.href, location.href);
    if (url.protocol !== "http:" && url.protocol !== "https:") return url.protocol;
    return url.origin === location.origin ? `${url.pathname}${url.search}` : url.origin;
  } catch {
    return null;
  }
}

function send(events: ClickEvent[]): void {
  const body = JSON.stringify({ events });
  try {
    const queued = navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: "application/json" }));
    if (queued) return;
  } catch {
    // fall through to fetch
  }
  fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

function flush(): void {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
  while (queue.length > 0) send(queue.splice(0, BATCH_SIZE));
}

function onClick(event: MouseEvent): void {
  try {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const element = target.closest(CLICKABLE);
    if (!element) return; // e.g. the backdrop of a <dialog>

    const entry: ClickEvent = {
      type: clickType(element),
      label: labelOf(element),
      href: destinationOf(element),
      page: location.pathname,
      disabled:
        (element instanceof HTMLButtonElement && element.disabled) ||
        element.getAttribute("aria-disabled") === "true",
      at: new Date().toISOString(),
    };
    console.debug("[click]", entry);
    queue.push(entry);
    if (queue.length >= BATCH_SIZE) flush();
    else if (timer === null) timer = setTimeout(flush, FLUSH_DELAY_MS);
  } catch {
    // never let logging affect the page
  }
}

try {
  document.addEventListener("click", onClick, { capture: true, passive: true });
  // Leaving the page right after a click (links!) must not lose the log.
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
} catch {
  // ignore
}
