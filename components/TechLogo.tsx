import Image from "next/image";
import { SIMPLE_LOGOS, type SimpleLogoId } from "@/components/tech-logos";

export type TechLogoId = SimpleLogoId | "playwright" | "plashop";

/**
 * Official technology logo (decorative: always shown next to its name).
 * Simple Icons logos render inline in the brand colour; Playwright uses the
 * logo shipped in playwright-core (Apache-2.0); "PLA Shop" uses the PhillipLife mark.
 */
export function TechLogo({ id, size = 28 }: { id: TechLogoId; size?: number }) {
  if (id === "playwright") {
    return <Image src="/logos/playwright.svg" alt="" width={size} height={size} />;
  }
  if (id === "plashop") {
    // brand-mark.png is 125 x 120
    return <Image src="/brand-mark.png" alt="" width={size} height={Math.round((size * 120) / 125)} />;
  }
  const logo = SIMPLE_LOGOS[id];
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill={logo.hex}>
      <path d={logo.path} />
    </svg>
  );
}
