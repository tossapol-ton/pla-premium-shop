import Link from "next/link";
import { BuyButton } from "@/components/BuyButton";
import { ChevronRightIcon } from "@/components/icons";
import { ProductImage } from "@/components/ProductImage";
import { section, textLink } from "@/components/ui";
import { formatBaht } from "@/lib/format";
import { categoryHref, HOME_SHOWCASE, type Product } from "@/lib/shop";

function DetailsLink({ product, onDark = false }: { product: Product; onDark?: boolean }) {
  return (
    <Link
      href={`/products/${product.id}`}
      aria-label={`ดูรายละเอียด ${product.name}`}
      className={`${textLink} ${onDark ? "text-sky hover:text-white" : ""}`}
    >
      ดูรายละเอียด
      <ChevronRightIcon size={16} />
    </Link>
  );
}

/** Large centred tile on white with orange/navy discs (PLA circle motif). */
function HeroTile({ product }: { product: Product }) {
  return (
    <section
      aria-labelledby={`hero-${product.id}`}
      className={`${section} relative flex flex-col items-center gap-3 overflow-hidden px-6 pt-16 pb-6 text-center`}
    >
      <div aria-hidden="true" className="absolute -top-44 -right-28 h-96 w-96 rounded-pill bg-orange-500 opacity-30" />
      <div aria-hidden="true" className="absolute -bottom-36 -left-24 h-72 w-72 rounded-pill bg-navy-600 opacity-30" />
      {product.tag && <span className="relative text-sm font-bold text-accent-text">{product.tag}</span>}
      <h1 id={`hero-${product.id}`} className="relative m-0 text-4xl leading-tight font-bold text-navy-600 sm:text-[44px]">
        {product.name}
      </h1>
      <p className="relative m-0 max-w-xl text-lg leading-relaxed text-muted">{product.description}</p>
      <p className="relative m-0 text-base">{formatBaht(product.price)}</p>
      <div className="relative mt-1 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <BuyButton product={product} variant="primary" className="px-7" />
        <DetailsLink product={product} />
      </div>
      <ProductImage src={product.imageUrl} alt="" className="relative mt-2 h-[300px] w-full max-w-[560px] sm:h-[420px]" bare />
    </section>
  );
}

/** Dark showcase tile; the illustration sits in a light circle so navy art stays visible. */
function DarkTile({ product }: { product: Product }) {
  return (
    <section
      aria-labelledby={`hero-${product.id}`}
      className="relative flex flex-col items-center gap-3 overflow-hidden rounded-section bg-brand-deep px-6 pt-16 pb-12 text-center text-footer-ink"
    >
      <div aria-hidden="true" className="absolute -top-52 -left-32 h-80 w-80 rounded-pill bg-orange-500 opacity-90" />
      {product.tag && <span className="relative text-sm font-bold text-orange-500">{product.tag}</span>}
      <h2 id={`hero-${product.id}`} className="relative m-0 text-4xl leading-tight font-bold text-white sm:text-[44px]">
        {product.name}
      </h2>
      <p className="relative m-0 max-w-xl text-lg leading-relaxed">{product.description}</p>
      <p className="relative m-0 text-base">{formatBaht(product.price)}</p>
      <div className="relative mt-1 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <BuyButton product={product} variant="primary" className="px-7" />
        <DetailsLink product={product} onDark />
      </div>
      <div className="relative mt-4 flex aspect-square w-full max-w-[400px] items-center justify-center rounded-pill border-2 border-sky bg-brand-soft">
        <ProductImage src={product.imageUrl} alt="" className="h-[82%] w-[82%]" bare />
      </div>
    </section>
  );
}

function DuoTile({ product }: { product: Product }) {
  return (
    <section
      aria-labelledby={`duo-${product.id}`}
      className={`${section} flex flex-col items-center gap-2.5 px-6 pt-12 pb-6 text-center`}
    >
      {product.tag && <span className="text-sm font-bold text-accent-text">{product.tag}</span>}
      <h2 id={`duo-${product.id}`} className="m-0 text-[28px] leading-9 font-bold text-navy-600">
        {product.name}
      </h2>
      <p className="m-0 max-w-md text-base text-muted">{product.description}</p>
      <p className="m-0 text-base">{formatBaht(product.price)}</p>
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <BuyButton product={product} />
        <DetailsLink product={product} />
      </div>
      <ProductImage src={product.imageUrl} alt="" className="mt-2 h-[260px] w-full max-w-[380px] sm:h-[300px]" bare />
    </section>
  );
}

export function Showcase({ products, categories }: { products: Product[]; categories: string[] }) {
  const byId = new Map(products.map((p) => [p.id, p]));
  const hero = byId.get(HOME_SHOWCASE.hero);
  const dark = byId.get(HOME_SHOWCASE.dark);
  const duo = HOME_SHOWCASE.duo.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));

  return (
    <>
      {hero && <HeroTile product={hero} />}
      {dark && <DarkTile product={dark} />}
      {duo.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] gap-6">
          {duo.map((product) => (
            <DuoTile key={product.id} product={product} />
          ))}
        </div>
      )}
      <section aria-labelledby="by-category" className={`${section} flex flex-col gap-6 px-6 py-8`}>
        <h2 id="by-category" className="m-0 text-center text-[28px] leading-9 font-bold text-navy-600">
          เลือกตามหมวด
        </h2>
        <ul className="m-0 flex list-none flex-wrap justify-center gap-x-8 gap-y-6 p-0">
          {categories.map((category) => {
            const first = products.find((p) => p.category === category);
            return (
              <li key={category}>
                <Link href={categoryHref(category)} className="flex w-28 flex-col items-center gap-2.5 text-body no-underline hover:text-navy-600">
                  <span className="flex h-24 w-24 items-center justify-center rounded-pill bg-brand-soft">
                    <ProductImage src={first?.imageUrl} alt="" size="sm" className="h-[72px] w-[72px]" bare />
                  </span>
                  <span className="text-center text-sm font-bold">{category}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
