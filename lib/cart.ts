import { useSyncExternalStore } from "react";

/**
 * Client-side cart kept in localStorage under "pla.cart" (same key as the
 * Claude Design prototype). Only ids, options and quantities are stored —
 * names, prices and stock always come from the database.
 */
export type CartLine = { productId: string; option: string; quantity: number };

const STORAGE_KEY = "pla.cart";
const CHANGE_EVENT = "pla-cart-change";
const EMPTY: CartLine[] = [];

let cachedRaw: string | null = null;
let cachedLines: CartLine[] = EMPTY;

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== "object" || value === null) return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.productId === "string" &&
    typeof line.option === "string" &&
    typeof line.quantity === "number" &&
    Number.isInteger(line.quantity) &&
    line.quantity > 0
  );
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getSnapshot(): CartLine[] {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedLines;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cachedLines = Array.isArray(parsed) ? parsed.filter(isCartLine) : EMPTY;
  } catch {
    cachedLines = EMPTY;
  }
  return cachedLines;
}

function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

function subscribe(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function write(lines: CartLine[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // storage full or blocked: cart simply won't persist
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

const sameLine = (line: CartLine, productId: string, option: string) =>
  line.productId === productId && line.option === option;

export function useCart(): CartLine[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useCartCount(): number {
  return useCart().reduce((sum, line) => sum + line.quantity, 0);
}

/** Quantity of a product already in the cart across all its options. */
export function quantityInCart(lines: CartLine[], productId: string): number {
  return lines.filter((line) => line.productId === productId).reduce((sum, line) => sum + line.quantity, 0);
}

/**
 * Adds up to `quantity` units, never exceeding `stock` for the product across
 * all options. Returns how many units were actually added.
 */
export function addToCart(productId: string, option: string, quantity: number, stock: number): number {
  const lines = getSnapshot().map((line) => ({ ...line }));
  const room = Math.max(0, stock - quantityInCart(lines, productId));
  const added = Math.min(quantity, room);
  if (added <= 0) return 0;

  const existing = lines.find((line) => sameLine(line, productId, option));
  if (existing) existing.quantity += added;
  else lines.push({ productId, option, quantity: added });
  write(lines);
  return added;
}

export function setLineQuantity(productId: string, option: string, quantity: number): void {
  const lines = getSnapshot().map((line) =>
    sameLine(line, productId, option) ? { ...line, quantity: Math.max(1, Math.floor(quantity)) } : line,
  );
  write(lines);
}

export function removeLine(productId: string, option: string): void {
  write(getSnapshot().filter((line) => !sameLine(line, productId, option)));
}

export function clearCart(): void {
  write([]);
}

export type ResolvedLine = CartLine & {
  name: string;
  unitPrice: number;
  lineTotal: number;
  stock: number;
  imageUrl: string | null;
};

/**
 * Joins cart lines with current product data. Lines whose product or option
 * no longer exists are dropped (and reported in `unavailable`).
 */
export function resolveCart(
  lines: readonly CartLine[],
  products: {
    id: string;
    name: string;
    price: number;
    stock: number;
    options: string[];
    imageUrl: string | null;
  }[],
): { lines: ResolvedLine[]; unavailable: CartLine[]; itemCount: number; subtotal: number } {
  const byId = new Map(products.map((product) => [product.id, product]));
  const resolved: ResolvedLine[] = [];
  const unavailable: CartLine[] = [];
  for (const line of lines) {
    const product = byId.get(line.productId);
    if (!product || !product.options.includes(line.option)) {
      unavailable.push(line);
      continue;
    }
    resolved.push({
      ...line,
      name: product.name,
      unitPrice: product.price,
      lineTotal: product.price * line.quantity,
      stock: product.stock,
      imageUrl: product.imageUrl,
    });
  }
  return {
    lines: resolved,
    unavailable,
    itemCount: resolved.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: resolved.reduce((sum, line) => sum + line.lineTotal, 0),
  };
}

// ---------------------------------------------------------------------------
// Bag drawer (the slide-in cart panel). Separate tiny store so any page can
// open it after adding to the cart, and the header button can toggle it.

export type BagState = {
  open: boolean;
  /** The line just added, shown as "เพิ่มลงตะกร้าแล้ว"; null when opened from the header. */
  justAdded: CartLine | null;
};

const BAG_CLOSED: BagState = { open: false, justAdded: null };
let bagState: BagState = BAG_CLOSED;
const bagListeners = new Set<() => void>();

function setBag(next: BagState): void {
  bagState = next;
  for (const listener of bagListeners) listener();
}

function subscribeBag(listener: () => void): () => void {
  bagListeners.add(listener);
  return () => bagListeners.delete(listener);
}

export function useBag(): BagState {
  return useSyncExternalStore(subscribeBag, () => bagState, () => BAG_CLOSED);
}

export function openBag(justAdded: CartLine | null = null): void {
  setBag({ open: true, justAdded });
}

export function closeBag(): void {
  setBag(BAG_CLOSED);
}

/** Adds to the cart and opens the Bag drawer. Returns the units actually added. */
export function addToBag(productId: string, option: string, quantity: number, stock: number): number {
  const added = addToCart(productId, option, quantity, stock);
  openBag(added > 0 ? { productId, option, quantity: added } : null);
  return added;
}
