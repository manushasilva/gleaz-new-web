"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { StoreProduct } from "@/lib/storeData";

type Category = {
  name: string;
  slug: StoreProduct["category"];
  image: string;
  description: string;
};

type Props = {
  categories: Category[];
  products: StoreProduct[];
};

const formatPrice = (rawValue: string | number) => {
  const numericValue = typeof rawValue === "number" ? rawValue : Number(String(rawValue).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numericValue)) return "LKR 0";
  return `LKR ${new Intl.NumberFormat("en-LK").format(numericValue)}`;
};

const effectivePrice = (product: StoreProduct) => {
  const price = Number(String(product.price).replace(/[^\d.]/g, "")) || 0;
  const discount = Math.min(Math.max(Number(product.discountPercentage) || 0, 0), 100);
  return Math.round(price * (1 - discount / 100));
};

export default function ShopByCategory({ categories, products }: Props) {
  const [activeCategory, setActiveCategory] = useState<Category["slug"] | null>(null);
  const [saleOnly, setSaleOnly] = useState(false);

  const activeCategoryData = categories.find((category) => category.slug === activeCategory);
  const categoryProducts = useMemo(() => {
    if (!activeCategory) return [];
    return products
      .filter((product) => product.category === activeCategory)
      .filter((product) => !saleOnly || Number(product.discountPercentage) > 0)
      .slice(0, 4);
  }, [activeCategory, products, saleOnly]);

  return (
    <section className="mx-auto max-w-[1600px] px-4 pb-8 pt-16 sm:px-6 lg:px-8 lg:pt-20">
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a7a7a]">Find your next favorite</p>
        <h2 className="mt-2 text-[2.4rem] font-light uppercase tracking-[-0.06em] text-[#111111]">Shop by category</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[#686662]">Choose a collection to preview styles, compare starting prices, and find available sizes before you shop.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const categoryProducts = products.filter((product) => product.category === category.slug);
          const categoryProduct = categoryProducts[0];
          const image = categoryProduct?.image || category.image;
          const itemCount = categoryProducts.length;
          const saleCount = categoryProducts.filter((product) => Number(product.discountPercentage) > 0).length;
          const lowestPrice = itemCount ? Math.min(...categoryProducts.map(effectivePrice)) : null;
          const sizeCount = new Set(categoryProducts.flatMap((product) => product.sizes || [])).size;
          const colorCount = new Set(categoryProducts.flatMap((product) => product.colors || [])).size;
          const isSelected = activeCategory === category.slug;

          return (
            <button
              key={category.slug}
              type="button"
              onClick={() => {
                setActiveCategory((current) => current === category.slug ? null : category.slug);
                setSaleOnly(false);
              }}
              aria-pressed={isSelected}
              className={`group relative isolate flex min-h-[310px] w-full items-end overflow-hidden rounded-[12px] bg-[#e8e3dd] p-6 text-left text-white ring-offset-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] sm:min-h-[360px] ${isSelected ? "ring-2 ring-[#111111]" : ""}`}
            >
              {saleCount > 0 && (
                <span className="absolute right-5 top-5 z-20 rounded-full bg-white px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#111111] shadow-sm sm:text-xs">
                  Sale · {saleCount} {saleCount === 1 ? "style" : "styles"}
                </span>
              )}
              <Image
                src={image}
                alt={categoryProduct?.name || `${category.name} collection`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <span aria-hidden="true" className="absolute inset-0 z-10 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <span className="relative z-20 flex w-full items-end justify-between gap-4">
                <span>
                  <span className="block text-3xl font-semibold uppercase tracking-[-0.04em]">{category.name}</span>
                  <span className="mt-2 block text-sm text-white/85">{category.description}</span>
                  <span className="mt-3 block text-xs uppercase tracking-[0.12em] text-white/75">
                    {itemCount ? `${itemCount} ${itemCount === 1 ? "style" : "styles"}` : "Explore the collection"}
                  </span>
                  <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/90">
                    {lowestPrice !== null && <span>From {formatPrice(lowestPrice)}</span>}
                    {sizeCount > 0 && <span>{sizeCount} sizes</span>}
                    {colorCount > 1 && <span>{colorCount} colors</span>}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2 rounded-full border border-white/70 px-4 py-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.1em] transition group-hover:bg-white group-hover:text-[#111111] sm:text-xs">
                  {isSelected ? "Selected" : "Quick browse"}
                  <span aria-hidden="true" className="text-base">→</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {activeCategoryData && (
        <div className="mt-7 rounded-2xl border border-[#e5e1dc] bg-white p-4 sm:p-6" aria-live="polite">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#7a7a7a]">Quick browse</p>
              <h3 className="mt-1 text-2xl font-medium uppercase tracking-[-0.04em] text-[#111111]">{activeCategoryData.name} styles</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSaleOnly(false)}
                aria-pressed={!saleOnly}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${!saleOnly ? "border-[#111111] bg-[#111111] text-white" : "border-[#d9d7d2] bg-white text-[#111111] hover:border-[#111111]"}`}
              >
                All styles
              </button>
              <button
                type="button"
                onClick={() => setSaleOnly(true)}
                aria-pressed={saleOnly}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${saleOnly ? "border-[#111111] bg-[#111111] text-white" : "border-[#d9d7d2] bg-white text-[#111111] hover:border-[#111111]"}`}
              >
                On sale
              </button>
              <Link
                href={`/shop-with-sidebar?category=${activeCategoryData.slug}`}
                className="ml-1 inline-flex items-center gap-2 px-2 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#111111] underline underline-offset-4"
              >
                Shop all <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {categoryProducts.length > 0 ? (
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {categoryProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`} className="group min-w-0">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#f0eeeb]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                    {Number(product.discountPercentage) > 0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-[#d94444] px-2.5 py-1 text-[0.62rem] font-bold text-white sm:left-3 sm:top-3 sm:text-xs">
                        Save {Math.min(Number(product.discountPercentage), 100)}%
                      </span>
                    )}
                    <span className="absolute bottom-2 right-2 rounded-full bg-white/95 px-3 py-1.5 text-[0.62rem] font-semibold text-[#111111] opacity-100 transition sm:bottom-3 sm:right-3 sm:text-xs sm:opacity-0 sm:group-hover:opacity-100">
                      View item →
                    </span>
                  </div>
                  <h4 className="mt-3 truncate text-sm font-medium text-[#111111]">{product.name}</h4>
                  <p className="mt-1 text-sm font-semibold text-[#111111]">{formatPrice(effectivePrice(product))}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#ded9d2] bg-[#faf9f7] px-5 py-8 text-center">
              <p className="text-sm font-medium text-[#111111]">{saleOnly ? "No sale styles in this collection right now." : "No styles have been added to this collection yet."}</p>
              {saleOnly && <button type="button" onClick={() => setSaleOnly(false)} className="mt-3 text-sm font-semibold text-[#79522d] underline underline-offset-4">Show all styles</button>}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
