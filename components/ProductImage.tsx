import Image from "next/image";

type ProductImageProps = {
  /** Illustration path, e.g. "/products/umbrella.svg". Falls back to the brand mark. */
  src?: string | null;
  /** Empty when a surrounding link/heading already names the product. */
  alt?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** No placeholder background (the image sits on a ground the caller provides). */
  bare?: boolean;
};

const markSize = { sm: 28, md: 44, lg: 80 } as const;
// brand-mark.png is 125 x 120
const markHeight = (width: number) => Math.round((width * 120) / 125);

// Product illustrations are 400 x 300 SVGs (served unoptimized by next/image).
const ILLUSTRATION_WIDTH = 400;
const ILLUSTRATION_HEIGHT = 300;

export function ProductImage({ src, alt = "", size = "md", className = "", bare = false }: ProductImageProps) {
  const ground = bare ? "" : "bg-placeholder";
  if (src) {
    return (
      <div className={`flex items-center justify-center ${ground} ${className}`}>
        <Image
          src={src}
          alt={alt}
          width={ILLUSTRATION_WIDTH}
          height={ILLUSTRATION_HEIGHT}
          className="h-[90%] w-[90%] object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2.5 ${ground} ${className}`}
      role="img"
      aria-label={alt || "ยังไม่มีรูปสินค้า"}
    >
      <Image
        src="/brand-mark.png"
        alt=""
        width={markSize[size]}
        height={markHeight(markSize[size])}
        className="opacity-35"
      />
      {size !== "sm" && <span className="text-xs text-muted">[รูปสินค้า]</span>}
    </div>
  );
}
