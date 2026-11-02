"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { buttonLg, buttonPrimary, card, fieldInput, fieldLabel } from "@/components/ui";
import { clearCart, resolveCart, useCart } from "@/lib/cart";
import { formatBaht } from "@/lib/format";
import {
  ORDER_STATUS,
  PAYMENT_METHOD_IDS,
  PAYMENT_METHODS,
  SHIPPING_METHOD_IDS,
  SHIPPING_METHODS,
  type Address,
  type Order,
  type PaymentMethod,
  type Product,
  type ShippingMethod,
} from "@/lib/shop";
import { addressSchema } from "@/lib/validation";

type FieldDef = {
  key: keyof Address;
  label: string;
  type: "text" | "tel";
  autoComplete: string;
  inputMode?: "numeric" | "tel";
  placeholder?: string;
};

const FIELDS: FieldDef[] = [
  { key: "recipientName", label: "ชื่อผู้รับ", type: "text", autoComplete: "name" },
  { key: "phone", label: "เบอร์โทรศัพท์", type: "tel", autoComplete: "tel", inputMode: "tel", placeholder: "0812345678" },
  { key: "address", label: "ที่อยู่", type: "text", autoComplete: "street-address" },
  { key: "province", label: "จังหวัด", type: "text", autoComplete: "address-level1" },
  { key: "postalCode", label: "รหัสไปรษณีย์", type: "text", autoComplete: "postal-code", inputMode: "numeric", placeholder: "10110" },
];

const EMPTY_ADDRESS: Address = { recipientName: "", phone: "", address: "", province: "", postalCode: "" };

type FieldErrors = Partial<Record<keyof Address, string>>;

function choiceCard(selected: boolean): string {
  return `flex min-h-14 cursor-pointer items-center gap-3 rounded-panel border-2 px-4 py-2 text-[15px] text-navy-900 ${
    selected ? "border-navy-600 bg-navy-100" : "border-line bg-white hover:border-line-strong"
  }`;
}

export function CheckoutForm({ products }: { products: Product[] }) {
  const router = useRouter();
  const cart = useCart();
  const { lines, subtotal } = resolveCart(cart, products);

  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("promptpay");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  const shipping = SHIPPING_METHODS[shippingMethod];
  const total = subtotal + shipping.fee;
  const isEmpty = lines.length === 0;

  if (order) {
    return <OrderSuccess order={order} />;
  }

  function validate(next: Address): FieldErrors {
    const result = addressSchema.safeParse(next);
    if (result.success) return {};
    const found: FieldErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && key in EMPTY_ADDRESS && !found[key as keyof Address]) {
        found[key as keyof Address] = issue.message;
      }
    }
    return found;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isEmpty || submitting) return;
    const found = validate(address);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const firstKey = FIELDS.find((f) => found[f.key])?.key;
      if (firstKey) document.getElementById(`co-${firstKey}`)?.focus();
      return;
    }

    setSubmitting(true);
    setServerError(null);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map(({ productId, option, quantity }) => ({ productId, option, quantity })),
          address,
          shippingMethod,
          paymentMethod,
        }),
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
            ? body.error
            : "ไม่สามารถสร้างคำสั่งซื้อได้ กรุณาลองใหม่";
        setServerError(message);
        router.refresh(); // pick up current stock
        return;
      }
      const created = (body as { order: Order }).order;
      clearCart();
      setOrder(created);
      window.scrollTo({ top: 0 });
      router.refresh();
    } catch {
      setServerError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="m-0 text-[30px] font-bold text-navy-900">ชำระเงิน</h1>
        <ol aria-label="ขั้นตอนการสั่งซื้อ" className="m-0 flex list-none flex-wrap items-center gap-2.5 p-0 text-sm">
          <li>
            <Link href="/cart" className="font-bold">
              1 ตะกร้า
            </Link>
          </li>
          <li aria-hidden="true" className="text-gray-500">
            ›
          </li>
          <li aria-current="step" className="font-bold text-navy-900">
            2 ชำระเงิน
          </li>
          <li aria-hidden="true" className="text-gray-500">
            ›
          </li>
          <li className="text-muted">3 สำเร็จ</li>
        </ol>
      </div>

      {isEmpty && (
        <div role="note" className="rounded-panel border border-orange-200 bg-orange-100 px-[18px] py-3.5 text-sm text-orange-ink">
          ตะกร้ายังว่าง ·{" "}
          <Link href="/" className="font-bold text-orange-ink hover:text-orange-ink">
            เลือกสินค้าก่อน
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <section aria-labelledby="summary-title" className={`${card} flex flex-col gap-3.5 p-6`}>
          <h2 id="summary-title" className="m-0 text-lg font-bold text-navy-900">
            สรุปคำสั่งซื้อ
          </h2>
          <ul className="m-0 flex list-none flex-col p-0">
            {lines.map((line) => (
              <li
                key={`${line.productId}|${line.option}`}
                className="flex justify-between gap-3 border-b border-line py-3 text-[15px]"
              >
                <span>
                  <strong className="text-navy-900">{line.name}</strong>
                  <br />
                  <span className="text-[13px] text-muted">
                    {line.option} × {line.quantity}
                  </span>
                </span>
                <span className="font-bold whitespace-nowrap">{formatBaht(line.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="m-0 flex flex-col gap-2 text-[15px]">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">ราคาสินค้า</dt>
              <dd className="m-0 font-bold">{formatBaht(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">ค่าจัดส่ง ({shipping.label})</dt>
              <dd className="m-0 font-bold">{formatBaht(shipping.fee)}</dd>
            </div>
          </dl>
          <div className="flex items-baseline justify-between gap-3 border-t border-line pt-3">
            <span className="text-[15px] font-bold text-navy-900">ยอดชำระ</span>
            <span className="text-[28px] font-bold text-navy-600" data-testid="checkout-total">
              {formatBaht(total)}
            </span>
          </div>
        </section>

        <section aria-labelledby="ship-title" className={`${card} flex flex-col gap-4 p-6`}>
          <h2 id="ship-title" className="m-0 text-lg font-bold text-navy-900">
            ที่อยู่จัดส่ง
          </h2>
          {FIELDS.map((field) => {
            const error = errors[field.key];
            const id = `co-${field.key}`;
            return (
              <div key={field.key} className="flex flex-col gap-1.5">
                <label htmlFor={id} className={fieldLabel}>
                  {field.label} <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <input
                  id={id}
                  name={field.key}
                  type={field.type}
                  required
                  autoComplete={field.autoComplete}
                  inputMode={field.inputMode}
                  placeholder={field.placeholder}
                  value={address[field.key]}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? `${id}-error` : undefined}
                  onChange={(event) => {
                    const next = { ...address, [field.key]: event.target.value };
                    setAddress(next);
                    if (errors[field.key]) setErrors({ ...errors, [field.key]: validate(next)[field.key] });
                  }}
                  className={fieldInput}
                />
                {error && (
                  <span id={`${id}-error`} className="text-[13px] text-danger">
                    {error}
                  </span>
                )}
              </div>
            );
          })}
        </section>
      </div>

      <section aria-labelledby="pay-title" className={`${card} flex flex-col gap-5 p-6`}>
        <h2 id="pay-title" className="m-0 text-lg font-bold text-navy-900">
          การจัดส่งและชำระเงิน
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
            <legend className="mb-2.5 p-0 text-sm font-bold text-navy-900">วิธีจัดส่ง</legend>
            {SHIPPING_METHOD_IDS.map((id) => {
              const method = SHIPPING_METHODS[id];
              return (
                <label key={id} className={choiceCard(shippingMethod === id)}>
                  <input
                    type="radio"
                    name="shippingMethod"
                    value={id}
                    checked={shippingMethod === id}
                    onChange={() => setShippingMethod(id)}
                    className="h-4 w-4 accent-navy-600"
                  />
                  <span className="grow">
                    <strong>{method.label}</strong> · <span className="text-muted">{method.eta}</span>
                  </span>
                  <strong>{formatBaht(method.fee)}</strong>
                </label>
              );
            })}
          </fieldset>
          <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
            <legend className="mb-2.5 p-0 text-sm font-bold text-navy-900">วิธีชำระเงิน</legend>
            {PAYMENT_METHOD_IDS.map((id) => {
              const method = PAYMENT_METHODS[id];
              return (
                <label key={id} className={choiceCard(paymentMethod === id)}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={id}
                    checked={paymentMethod === id}
                    onChange={() => setPaymentMethod(id)}
                    className="h-4 w-4 accent-navy-600"
                  />
                  <span className="flex flex-col">
                    <strong>{method.label}</strong>
                    <span className="text-[13px] text-muted">{method.hint}</span>
                  </span>
                </label>
              );
            })}
          </fieldset>
        </div>

        {serverError && (
          <div role="alert" className="rounded-panel border border-danger bg-danger-50 px-4 py-3 text-sm text-danger">
            {serverError}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3.5 border-t border-line pt-4">
          <Link href="/cart" className="text-sm font-bold">
            ← กลับไปแก้ตะกร้า
          </Link>
          <button type="submit" disabled={isEmpty || submitting} className={`${buttonPrimary} ${buttonLg}`}>
            {submitting ? "กำลังสร้างคำสั่งซื้อ…" : `ยืนยันคำสั่งซื้อ · ${formatBaht(total)}`}
          </button>
        </div>
      </section>
    </form>
  );
}

function OrderSuccess({ order }: { order: Order }) {
  const shipping = SHIPPING_METHODS[order.shippingMethod];
  return (
    <section
      role="status"
      data-testid="order-success"
      className={`${card} flex flex-col items-center gap-3.5 px-6 py-14 text-center`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-pill bg-navy-100">
        <svg
          aria-hidden="true"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-navy-600"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h1 className="m-0 text-[28px] font-bold text-navy-900">สั่งซื้อสำเร็จ</h1>
      <p className="m-0 text-base text-body">
        เลขที่คำสั่งซื้อ <strong data-testid="order-number">{order.number}</strong> · ยอดชำระ{" "}
        <strong>{formatBaht(order.total)}</strong>
      </p>
      <p className="m-0 text-sm text-muted">
        สถานะ: {ORDER_STATUS[order.status]} ·{" "}
        {order.paymentMethod === "promptpay"
          ? "QR PromptPay ยังเป็นระบบจำลอง ไม่มีการตัดเงินจริง"
          : "ชำระเงินเมื่อได้รับสินค้า"}
      </p>
      <p className="m-0 text-sm text-muted">เราจะจัดส่งตามที่อยู่ที่ระบุภายใน {shipping.eta}</p>
      <Link href="/" className={`${buttonPrimary} ${buttonLg} mt-1.5`}>
        กลับไปหน้าร้าน
      </Link>
    </section>
  );
}
