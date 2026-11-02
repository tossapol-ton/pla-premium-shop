// Shared Tailwind class recipes for the PLA Shop look (PhillipLife storefront).

/** The ONE call-to-action per view: orange pill with navy text. */
export const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-pill bg-orange-500 px-6 font-bold text-navy-600 no-underline transition-colors duration-150 ease-standard hover:bg-orange-400 hover:text-navy-600 disabled:cursor-not-allowed disabled:bg-line disabled:text-muted";

/** Secondary actions ("ซื้อ" on cards, "ดูตะกร้า"): soft navy pill. */
export const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-pill bg-brand-soft px-5 font-bold text-navy-600 no-underline transition-colors duration-150 ease-standard hover:bg-navy-100 hover:text-navy-600 disabled:cursor-not-allowed disabled:bg-page disabled:text-muted";

/** Low-emphasis outline pill. */
export const buttonOutline =
  "inline-flex items-center justify-center gap-2 rounded-pill border border-line-strong bg-white px-5 font-bold text-navy-600 no-underline transition-colors duration-150 ease-standard hover:border-navy-600 hover:text-navy-600";

/** Text link with chevron, e.g. "ดูรายละเอียด ›". */
export const textLink =
  "inline-flex min-h-11 items-center gap-1 font-bold text-navy-600 no-underline hover:underline";

export const buttonMd = "min-h-11 text-sm";
export const buttonLg = "min-h-12 text-base";

export const card = "rounded-card border border-line bg-white";
export const section = "rounded-section border border-line bg-white";

export const fieldLabel = "text-sm font-bold text-body";

export const fieldInput =
  "min-h-[46px] w-full rounded-btn border border-line-strong bg-white px-3.5 text-[15px] text-body placeholder:text-gray-500 aria-[invalid=true]:border-danger";

/** Filter pills and option chips: selected = 2px navy edge on brand-soft. Use with `border`. */
export function pill(selected: boolean): string {
  return selected
    ? "border-navy-600 bg-brand-soft text-navy-600 shadow-[inset_0_0_0_1px_var(--color-navy-600)]"
    : "border-line-strong bg-white text-navy-600 hover:border-navy-600";
}
