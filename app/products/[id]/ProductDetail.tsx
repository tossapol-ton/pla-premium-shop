"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CheckCircleIcon, ClockIcon, GiftIcon, ShieldCheckIcon, TruckIcon } from "@/components/icons";
import { ProductImage } from "@/components/ProductImage";
import { buttonLg, buttonMd, buttonPrimary, pill } from "@/components/ui";
import { addToBag, quantityInCart, useCart } from "@/lib/cart";
import { formatBaht } from "@/lib/format";
import {
  OPTION_COLORS,
  OPTION_KIND_LABEL,
  optionKind,
  SHIPPING_METHODS,
  stockStatus,
  type Product,
} from "@/lib/shop";

const STATUS_TONE = { in: "text-success", low: "text-accent-text", out: "text-muted" } as const;

type Purchase = {
  option: string;
  setOption: (option: string) => void;
  quantity: number;
  setQuantity: (quantity: number) => void;
  maxQuantity: number;
};

/** Options + quantity + stock + add button. Rendered inline (desktop) and in the mobile sheet. */
function PurchaseControls({
  product,
  purchase,
  idPrefix,
  onAdd,
  notice,
}: {
  product: Product;
  purchase: Purchase;
  idPrefix: string;
  onAdd: () => void;
  notice: string | null;
}) {
  const kind = optionKind(product.options);
  const kindLabel = OPTION_KIND_LABEL[kind];
  const status = stockStatus(product.stock);
  const soldOut = status.kind === "out";
  const { option, setOption, quantity, setQuantity, maxQuantity } = purchase;

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
        <legend className="mb-3 p-0 text-base font-bold">
          {kindLabel} <span className="font-normal text-muted">· {option}</span>
        </legend>
        {kind === "color" ? (
          <div className="flex flex-wrap gap-3">
            {product.options.map((name) => {
              const selected = option === name;
              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={selected}
                  aria-label={`สี${name}`}
                  onClick={() => setOption(name)}
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-pill bg-white ${
                    selected ? "border-2 border-navy-600" : "border border-line-strong hover:border-navy-600"
                  }`}
                >
                  <span
                    className="h-[34px] w-[34px] rounded-pill shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]"
                    style={{ backgroundColor: OPTION_COLORS[name] }}
                  />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-2">
            {product.options.map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={option === name}
                onClick={() => setOption(name)}
                className={`min-h-12 rounded-chip border px-3 text-base font-bold ${pill(option === name)}`}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </fieldset>

      <div className="flex flex-col gap-3">
        <span id={`${idPrefix}-qty`} className="text-base font-bold">
          จำนวน
        </span>
        <div className="flex flex-wrap items-center gap-4">
          <div
            role="group"
            aria-labelledby={`${idPrefix}-qty`}
            className="inline-flex items-center rounded-pill border border-line-strong bg-white"
          >
            <button
              type="button"
              aria-label="ลดจำนวน"
              onClick={() => setQuantity(quantity - 1)}
              disabled={soldOut || quantity <= 1}
              className="h-11 w-11 rounded-pill text-xl text-navy-600 disabled:text-line-strong"
            >
              −
            </button>
            <span aria-live="polite" data-testid="qty" className="min-w-8 text-center text-base font-bold">
              {soldOut ? 0 : quantity}
            </span>
            <button
              type="button"
              aria-label="เพิ่มจำนวน"
              onClick={() => setQuantity(quantity + 1)}
              disabled={soldOut || quantity >= maxQuantity}
              className="h-11 w-11 rounded-pill text-xl text-navy-600 disabled:text-line-strong"
            >
              +
            </button>
          </div>
          <span data-testid="stock-status" className={`inline-flex items-center gap-1.5 text-sm font-bold ${STATUS_TONE[status.kind]}`}>
            {status.kind === "in" ? <CheckCircleIcon size={18} /> : <ClockIcon size={18} />}
            {status.label}
          </span>
        </div>
      </div>

      <button type="button" onClick={onAdd} disabled={soldOut} className={`${buttonPrimary} min-h-[52px] text-base`}>
        {soldOut ? "สินค้าหมด" : `เพิ่มลงตะกร้า · ${formatBaht(product.price * quantity)}`}
      </button>
      {notice && (
        <p role="status" className="m-0 rounded-panel border border-orange-500 bg-orange-100 px-4 py-3 text-sm">
          {notice}
        </p>
      )}
    </div>
  );
}

export function ProductDetail({ product, children }: { product: Product; children: ReactNode }) {
  const cart = useCart();
  const [option, setOptionState] = useState(product.options[0]);
  const [quantity, setQuantityState] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetRef = useRef<HTMLDialogElement>(null);

  const kind = optionKind(product.options);
  const kindLabel = OPTION_KIND_LABEL[kind];
  const soldOut = product.stock <= 0;
  const maxQuantity = Math.max(1, product.stock);
  const inCart = quantityInCart(cart, product.id);

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    if (sheetOpen && !sheet.open) sheet.showModal();
    if (!sheetOpen && sheet.open) sheet.close();
  }, [sheetOpen]);

  const purchase: Purchase = {
    option,
    setOption: (next) => {
      setOptionState(next);
      setNotice(null);
    },
    quantity,
    setQuantity: (next) => {
      setQuantityState(Math.min(maxQuantity, Math.max(1, next)));
      setNotice(null);
    },
    maxQuantity,
  };

  function handleAdd() {
    if (soldOut) return;
    setSheetOpen(false);
    const added = addToBag(product.id, option, quantity, product.stock);
    setNotice(added === 0 ? "ในตะกร้ามีสินค้านี้ครบจำนวนคงเหลือแล้ว" : null);
  }

  const { standard, express } = SHIPPING_METHODS;
  const mobileCta = soldOut
    ? "สินค้าหมด"
    : product.options.length > 1
      ? `เลือก${kindLabel}และซื้อ`
      : "เพิ่มลงตะกร้า";

  return (
    <div>
      {/* Desktop: frosted buy bar that stays under the header while scrolling. */}
      <div className="bg-frosted sticky top-[53px] z-20 hidden border-b border-line md:block">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-2">
          <span className="text-lg font-bold">{product.name}</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">
              {option} · {formatBaht(product.price)}
            </span>
            <button
              type="button"
              onClick={handleAdd}
              disabled={soldOut}
              aria-label={soldOut ? "สินค้าหมด" : `ซื้อ ${product.name} ${option}`}
              className={`${buttonPrimary} ${buttonMd} px-5`}
            >
              {soldOut ? "สินค้าหมด" : "ซื้อ"}
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 pt-4 sm:px-6">
        <nav aria-label="breadcrumb" className="flex flex-wrap gap-2 text-sm text-muted">
          <Link href="/">หน้าแรก</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/?cat=${encodeURIComponent(product.category)}#shop`}>{product.category}</Link>
          <span aria-hidden="true">/</span>
          <span>{product.name}</span>
        </nav>

        <div className="flex flex-wrap items-start gap-10">
          <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-3 md:sticky md:top-[130px]">
            <div className="relative overflow-hidden rounded-card bg-brand-soft">
              <div aria-hidden="true" className="absolute -right-24 -bottom-36 h-80 w-80 rounded-pill bg-orange-500 opacity-30" />
              <ProductImage
                src={product.imageUrl}
                alt={product.name}
                size="lg"
                className="relative h-[300px] sm:h-[420px] md:h-[520px]"
                bare
              />
            </div>
            <p className="m-0 text-[13px] text-muted">ภาพประกอบ · สินค้าจริงอาจแตกต่าง</p>
          </div>

          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-6">
            <div className="flex flex-col gap-2">
              {product.tag && <span className="text-sm font-bold text-accent-text">{product.tag}</span>}
              <h1 className="m-0 text-[28px] leading-tight font-bold text-navy-600 sm:text-[32px]">{product.name}</h1>
              <p className="m-0 text-base leading-relaxed">{product.description}</p>
              <span className="text-[38px] leading-tight font-bold">{formatBaht(product.price)}</span>
              {inCart > 0 && <span className="text-sm text-muted">ในตะกร้าแล้ว {inCart} ชิ้น</span>}
            </div>

            <div className="hidden md:block">
              <PurchaseControls product={product} purchase={purchase} idPrefix="inline" onAdd={handleAdd} notice={notice} />
            </div>

            <ul className="m-0 flex list-none flex-col gap-4 rounded-panel border border-line bg-white p-5">
              <li className="flex items-start gap-3">
                <TruckIcon size={24} strokeWidth={1.75} className="shrink-0 text-navy-600" />
                <div className="flex flex-col">
                  <span className="font-bold">จัดส่ง</span>
                  <span className="text-sm text-muted">
                    {standard.label} {standard.eta} {formatBaht(standard.fee)} · {express.label} {express.eta}{" "}
                    {formatBaht(express.fee)}
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheckIcon size={24} strokeWidth={1.75} className="shrink-0 text-navy-600" />
                <div className="flex flex-col">
                  <span className="font-bold">ชำระเงิน</span>
                  <span className="text-sm text-muted">PromptPay QR (จำลอง) หรือเก็บเงินปลายทาง</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <GiftIcon size={24} strokeWidth={1.75} className="shrink-0 text-navy-600" />
                <div className="flex flex-col">
                  <span className="font-bold">สั่งจำนวนมาก</span>
                  <span className="text-sm text-muted">[ติดต่อฝ่ายการตลาด]</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {children}
      </main>

      {/* Phone: price bar pinned to the bottom; options open in a bottom sheet. */}
      <div
        data-mobile-buybar
        className="bg-frosted fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t border-line px-4 pt-3 pb-6 md:hidden"
      >
        <div className="flex flex-col">
          <span className="text-[13px] text-muted">
            {kindLabel} {option}
          </span>
          <span className="text-lg font-bold">{formatBaht(product.price)}</span>
        </div>
        <button
          type="button"
          disabled={soldOut}
          onClick={() => (product.options.length > 1 ? setSheetOpen(true) : handleAdd())}
          className={`${buttonPrimary} ${buttonLg} px-6`}
        >
          {mobileCta}
        </button>
      </div>

      <dialog
        ref={sheetRef}
        onClose={() => setSheetOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setSheetOpen(false);
        }}
        aria-labelledby="sheet-title"
        data-testid="option-sheet"
        className="fixed inset-x-0 top-auto bottom-0 m-0 max-h-[85dvh] w-full max-w-none rounded-t-section bg-white p-0 text-body backdrop:bg-brand-deep/40"
      >
        <div className="flex flex-col gap-5 overflow-y-auto px-5 pt-3 pb-7">
          <span aria-hidden="true" className="h-[5px] w-10 self-center rounded-pill bg-line" />
          <div className="flex items-center gap-3">
            <ProductImage src={product.imageUrl} size="sm" className="h-16 w-16 shrink-0 rounded-panel" />
            <div className="flex flex-col">
              <h2 id="sheet-title" className="m-0 text-lg font-bold">
                {product.name}
              </h2>
              <span className="font-bold">{formatBaht(product.price * quantity)}</span>
            </div>
          </div>
          <PurchaseControls product={product} purchase={purchase} idPrefix="sheet" onAdd={handleAdd} notice={notice} />
        </div>
      </dialog>
    </div>
  );
}
