const bahtFormatter = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 });

/** 1290 -> "฿1,290" */
export function formatBaht(amount: number): string {
  return `฿${bahtFormatter.format(amount)}`;
}

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Bangkok",
});

/** ISO date -> "2 พ.ย. 69 13:45" (Buddhist year, Bangkok time) */
export function formatThaiDateTime(iso: string): string {
  return dateFormatter.format(new Date(iso));
}
