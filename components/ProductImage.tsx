import Image from "next/image";

type ProductImageProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const markSize = { sm: 28, md: 44, lg: 80 } as const;

/** Placeholder until real product photos exist. */
export function ProductImage({ size = "md", className = "" }: ProductImageProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2.5 bg-placeholder ${className}`}
      role="img"
      aria-label="รูปสินค้า (ตัวอย่าง)"
    >
      <Image src="/brand-mark.png" alt="" width={markSize[size]} height={markSize[size]} className="opacity-35" />
      {size !== "sm" && <span className="text-xs text-muted">[รูปสินค้า]</span>}
    </div>
  );
}
