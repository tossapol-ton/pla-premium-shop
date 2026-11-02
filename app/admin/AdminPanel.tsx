"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Badge } from "@/components/Badge";
import { buttonMd, buttonPrimary, buttonSecondary, card, fieldInput, fieldLabel } from "@/components/ui";
import { formatBaht, formatThaiDateTime } from "@/lib/format";
import { ORDER_STATUS, PAYMENT_METHODS, type Order, type Product } from "@/lib/shop";
import { parseOptionsText, productUpdateSchema } from "@/lib/validation";

type Tab = "products" | "orders";

type Draft = {
  name: string;
  price: string;
  stock: string;
  tag: string;
  optionsText: string;
  description: string;
};

function toDraft(product: Product): Draft {
  return {
    name: product.name,
    price: String(product.price),
    stock: String(product.stock),
    tag: product.tag ?? "",
    optionsText: product.options.join(", "),
    description: product.description,
  };
}

type SaveState = { kind: "idle" } | { kind: "saving" } | { kind: "saved" } | { kind: "error"; message: string };

export function AdminPanel({ products, orders }: { products: Product[]; orders: Order[] }) {
  const [tab, setTab] = useState<Tab>("products");
  const tabs: { id: Tab; label: string }[] = [
    { id: "products", label: "สินค้า" },
    { id: "orders", label: `คำสั่งซื้อ (${orders.length})` },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex items-center gap-2.5 text-xs font-bold tracking-[0.14em] text-navy-600 uppercase">
            <span aria-hidden="true" className="h-0.5 w-6 bg-orange-500" />
            Admin
          </span>
          <h1 className="m-0 text-[30px] font-bold text-navy-900">จัดการสินค้าและคำสั่งซื้อ</h1>
        </div>
        <div role="tablist" aria-label="ส่วนของ Admin" className="flex gap-1.5 rounded-panel bg-subtle p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`min-h-10 rounded-[9px] px-[18px] text-sm font-bold ${
                tab === t.id ? "bg-white text-navy-600 shadow-card" : "text-muted hover:text-navy-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "products" ? (
        <div role="tabpanel" id="panel-products" aria-labelledby="tab-products">
          <ProductsTab products={products} />
        </div>
      ) : (
        <div role="tabpanel" id="panel-orders" aria-labelledby="tab-orders">
          <OrdersTab orders={orders} />
        </div>
      )}
    </>
  );
}

function ProductsTab({ products }: { products: Product[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string>(products[0]?.id ?? "");
  const selected = products.find((p) => p.id === selectedId) ?? products[0];
  const [draft, setDraft] = useState<Draft | null>(selected ? toDraft(selected) : null);
  const [save, setSave] = useState<SaveState>({ kind: "idle" });

  if (!selected || !draft) {
    return <p className="text-muted">ยังไม่มีสินค้า — รัน npx prisma db seed</p>;
  }

  function pick(product: Product) {
    setSelectedId(product.id);
    setDraft(toDraft(product));
    setSave({ kind: "idle" });
  }

  function edit<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
    setSave({ kind: "idle" });
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    const payload = {
      name: draft.name,
      description: draft.description,
      price: Number(draft.price),
      stock: Number(draft.stock),
      tag: draft.tag.trim() === "" ? null : draft.tag.trim(),
      options: parseOptionsText(draft.optionsText),
    };
    const parsed = productUpdateSchema.safeParse(payload);
    if (!parsed.success || draft.price.trim() === "" || draft.stock.trim() === "") {
      setSave({
        kind: "error",
        message: parsed.success ? "กรุณากรอกราคาและสต็อก" : parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง",
      });
      return;
    }

    setSave({ kind: "saving" });
    try {
      const response = await fetch(`/api/products/${encodeURIComponent(selected.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
            ? body.error
            : "บันทึกไม่สำเร็จ";
        setSave({ kind: "error", message });
        return;
      }
      const updated = (body as { product: Product }).product;
      setDraft(toDraft(updated));
      setSave({ kind: "saved" });
      router.refresh();
    } catch {
      setSave({ kind: "error", message: "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้" });
    }
  }

  return (
    <div className="flex flex-wrap items-start gap-6">
      <section aria-label="รายการสินค้า" className={`${card} flex min-w-0 flex-[1_1_320px] flex-col overflow-hidden`}>
        {products.map((product) => {
          const on = product.id === selected.id;
          return (
            <button
              key={product.id}
              type="button"
              aria-pressed={on}
              onClick={() => pick(product)}
              className={`flex min-h-14 items-center justify-between gap-3 border-0 border-b border-l-4 border-b-line px-[18px] py-2.5 text-left text-[15px] text-navy-900 ${
                on ? "border-l-navy-600 bg-navy-100" : "border-l-transparent bg-white hover:bg-page"
              }`}
            >
              <span className="flex flex-col gap-0.5">
                <strong>{product.name}</strong>
                <span className="text-[13px] text-muted">
                  {product.category} · คงเหลือ {product.stock}
                </span>
              </span>
              <strong className="text-navy-600">{formatBaht(product.price)}</strong>
            </button>
          );
        })}
      </section>

      <form
        onSubmit={handleSave}
        noValidate
        aria-labelledby="edit-title"
        className={`${card} flex min-w-0 flex-[999_1_520px] flex-col gap-[18px] p-6 shadow-raised`}
      >
        <h2 id="edit-title" className="m-0 text-lg font-bold text-navy-900">
          แก้ไขสินค้า <span className="text-sm font-normal text-muted">({selected.id})</span>
        </h2>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ad-name" className={fieldLabel}>
            ชื่อสินค้า
          </label>
          <input
            id="ad-name"
            type="text"
            value={draft.name}
            onChange={(e) => edit("name", e.target.value)}
            className={fieldInput}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ad-price" className={fieldLabel}>
              ราคา (บาท)
            </label>
            <input
              id="ad-price"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={draft.price}
              onChange={(e) => edit("price", e.target.value)}
              className={fieldInput}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ad-stock" className={fieldLabel}>
              สต็อก
            </label>
            <input
              id="ad-stock"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={draft.stock}
              onChange={(e) => edit("stock", e.target.value)}
              className={fieldInput}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ad-tag" className={fieldLabel}>
              ป้าย
            </label>
            <input
              id="ad-tag"
              type="text"
              placeholder="เช่น ใหม่, ขายดี"
              value={draft.tag}
              onChange={(e) => edit("tag", e.target.value)}
              className={fieldInput}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ad-options" className={fieldLabel}>
            ตัวเลือก (คั่นด้วยจุลภาค)
          </label>
          <input
            id="ad-options"
            type="text"
            value={draft.optionsText}
            onChange={(e) => edit("optionsText", e.target.value)}
            className={fieldInput}
          />
          <span className="text-[13px] text-muted">เว้นว่างไว้ = “มาตรฐาน”</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ad-desc" className={fieldLabel}>
            รายละเอียด
          </label>
          <textarea
            id="ad-desc"
            rows={4}
            value={draft.description}
            onChange={(e) => edit("description", e.target.value)}
            className={`${fieldInput} resize-y py-3 leading-relaxed`}
          />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line pt-4">
          {save.kind === "saved" && (
            <span role="status" className="text-sm font-bold text-navy-600">
              บันทึกแล้ว
            </span>
          )}
          {save.kind === "error" && (
            <span role="alert" className="text-sm font-bold text-danger">
              {save.message}
            </span>
          )}
          <Link href={`/products/${selected.id}`} className={`${buttonSecondary} ${buttonMd}`}>
            ดูหน้าสินค้า
          </Link>
          <button type="submit" disabled={save.kind === "saving"} className={`${buttonPrimary} ${buttonMd}`}>
            {save.kind === "saving" ? "กำลังบันทึก…" : "บันทึกการแก้ไข"}
          </button>
        </div>
      </form>
    </div>
  );
}

function OrdersTab({ orders }: { orders: Order[] }) {
  const sum = orders.reduce((total, order) => total + order.total, 0);
  return (
    <section aria-labelledby="orders-title" className={`${card} flex flex-col gap-3.5 p-6`}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="orders-title" className="m-0 text-lg font-bold text-navy-900">
          คำสั่งซื้อล่าสุด
        </h2>
        <span className="text-sm text-muted">
          {orders.length} รายการ · ยอดรวม {formatBaht(sum)}
        </span>
      </div>
      {orders.length === 0 ? (
        <p className="m-0 py-8 text-center text-[15px] text-muted">ยังไม่มีคำสั่งซื้อ · ลองสั่งซื้อจากหน้าร้าน</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm" data-testid="orders-table">
            <thead>
              <tr className="bg-subtle text-navy-900">
                <th scope="col" className="p-3 text-left">เลขที่</th>
                <th scope="col" className="p-3 text-left">วันที่</th>
                <th scope="col" className="p-3 text-left">ผู้รับ</th>
                <th scope="col" className="p-3 text-right">ชิ้น</th>
                <th scope="col" className="p-3 text-left">ชำระเงิน</th>
                <th scope="col" className="p-3 text-right">ยอด</th>
                <th scope="col" className="p-3 text-left">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.number} data-testid="order-row" data-order-number={order.number}>
                  <td className="border-b border-line p-3 font-bold text-navy-900">{order.number}</td>
                  <td className="border-b border-line p-3">{formatThaiDateTime(order.createdAt)}</td>
                  <td className="border-b border-line p-3">{order.address.recipientName}</td>
                  <td className="border-b border-line p-3 text-right">{order.itemCount}</td>
                  <td className="border-b border-line p-3">{PAYMENT_METHODS[order.paymentMethod].short}</td>
                  <td className="border-b border-line p-3 text-right font-bold text-navy-600">
                    {formatBaht(order.total)}
                  </td>
                  <td className="border-b border-line p-3">
                    <Badge variant="soft">{ORDER_STATUS[order.status]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
