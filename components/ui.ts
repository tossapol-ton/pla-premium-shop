// Shared Tailwind class recipes for the PhillipLife look.

export const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-btn bg-navy-600 px-5 font-bold text-white no-underline transition-colors duration-150 ease-standard hover:bg-navy-500 hover:text-white disabled:cursor-not-allowed disabled:bg-line-strong disabled:text-muted";

export const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-btn border border-line-strong bg-white px-5 font-bold text-navy-600 no-underline transition-colors duration-150 ease-standard hover:border-navy-600 hover:text-navy-500";

export const buttonMd = "min-h-11 text-sm";
export const buttonLg = "min-h-12 text-[15px]";

export const card = "rounded-card border border-line bg-white";

export const fieldLabel = "text-sm font-bold text-navy-900";

export const fieldInput =
  "min-h-[46px] w-full rounded-btn border border-line-strong bg-white px-3.5 text-[15px] text-body placeholder:text-gray-500 aria-[invalid=true]:border-danger";

export function pill(selected: boolean): string {
  return selected
    ? "border-navy-600 bg-navy-600 text-white"
    : "border-line-strong bg-white text-navy-600 hover:border-navy-600";
}
