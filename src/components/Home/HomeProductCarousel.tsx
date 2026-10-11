"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { StoreProduct } from "@/lib/storeData";

type Props = {
  title: string;
  products: StoreProduct[];
  category?: "women" | "men" | "accessories";
};

const formatPrice = (rawValue: string | number, discountPercentage = 0) => {
  const basePrice = typeof rawValue === "number" ? rawValue : Number(String(rawValue).replace(/[^\d.]/g, ""));
  const numericValue = Number.isFinite(basePrice) ? Math.round(basePrice * (1 - Math.min(Math.max(discountPercentage, 0), 100) / 100)) : 0;
  return `LKR ${new Intl.NumberFormat("en-LK").format(numericValue)}.00`;
};

export default function HomeProductCarousel({ title, products, category }: Props) {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollRail = (direction: -1 | 1) => {
    if (!railRef.current) return;
    railRef.current.scrollBy({ left: direction * railRef.current.clientWidth * 0.8, behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-[1600px] px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
        <div>
          <p className="text-xs font-medium text-[#737373]">Fresh from GLEAZ</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.035em] text-[#111] sm:text-3xl">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          {category && <Link href={`/shop-with-sidebar?category=${category}`} className="hidden text-sm font-semibold text-[#111] underline underline-offset-4 sm:block">Shop all</Link>}
          <div className="flex gap-2">
            <button type="button" onClick={() => scrollRail(-1)} aria-label={`Previous ${title}`} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dedede] text-lg transition hover:border-black hover:bg-black hover:text-white">←</button>
            <button type="button" onClick={() => scrollRail(1)} aria-label={`Next ${title}`} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dedede] text-lg transition hover:border-black hover:bg-black hover:text-white">→</button>
          </div>
        </div>
      </div>

      <div ref={railRef} className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:gap-5 sm:px-0">
        {products.map((product) => {
          const discount = Math.min(Math.max(Number(product.discountPercentage) || 0, 0), 100);
          const colors = Array.isArray(product.colors) ? product.colors.slice(0, 5) : [];
          return (
            <Link key={product.id || product.slug} href={`/products/${product.slug}`} className="group w-[68vw] max-w-[300px] shrink-0 snap-start sm:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-3.75rem)/4)]">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#f1f1ef]">
                <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 68vw, (max-width: 1024px) 33vw, 25vw" className="object-cover transition duration-500 group-hover:scale-[1.035]" />
                {discount > 0 && <span className="absolute left-3 top-3 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#111]">-{discount}%</span>}
                <span className="absolute bottom-3 right-3 translate-y-2 bg-white px-3 py-2 text-xs font-semibold text-[#111] opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">View product →</span>
              </div>
              {colors.length > 0 && <div className="mt-2.5 flex gap-1.5">{colors.map((color, index) => <span key={`${color}-${index}`} aria-hidden="true" className="h-4 w-4 rounded-sm border border-black/10" style={{ backgroundColor: color }} />)}</div>}
              <p className="mt-2 text-sm font-medium leading-5 text-[#111]">{product.name}</p>
              <p className="mt-0.5 text-xs text-[#666]">{product.badge || "Everyday essential"}</p>
              <p className="mt-1 text-sm font-semibold text-[#111]">{formatPrice(product.price, discount)}</p>
            </Link>
          );
        })}
      </div>
      {category && <Link href={`/shop-with-sidebar?category=${category}`} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-[#111] px-5 text-sm font-semibold text-[#111] sm:hidden">Shop all {category} →</Link>}
    </section>
  );
}
