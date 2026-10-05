"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const formatProductBadge = (badge?: string) => {
  const cleanBadge = (badge || "In stock").trim();

  if (!cleanBadge) return "IN STOCK";
  if (cleanBadge.startsWith("-")) return `${cleanBadge} OFF`;
  return cleanBadge.toUpperCase();
};

type Product = {
  id: string;
  name: string;
  category: "women" | "men" | "accessories";
  price: string;
  image: string;
  badge: string;
  tone: string;
  slug: string;
  colors?: string[];
  sizes?: string[];
};

const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
const defaultColorPalette = ["#ff3b30", "#f5f5f5", "#111111", "#ffcf5a", "#7cc5d4"];

const parsePrice = (value: string) => {
  const numericValue = Number(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const toggleValue = (value: string, list: string[]) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

export default function ShopWithSidebarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") || "").trim().toLowerCase();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(6993);
  const [selectedPrice, setSelectedPrice] = useState(6993);
  const [loading, setLoading] = useState(true);

  const categoryParam = searchParams.get("category");
  const selectedCategory =
    categoryParam === "men"
      ? "men"
      : categoryParam === "accessories"
        ? "accessories"
        : "women";

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch("/api/admin/products");
        const result = await response.json();
        const nextProducts = Array.isArray(result?.products) ? result.products : [];
        setProducts(nextProducts);

        const highest = nextProducts.reduce((max: number, product: Product) => {
          return Math.max(max, parsePrice(product.price));
        }, 0);

        setMaxPrice(highest > 0 ? highest : 6993);
        setSelectedPrice(highest > 0 ? highest : 6993);
      } catch (error) {
        console.error("Failed to load products for the shop page", error);
        setProducts([]);
        setMaxPrice(6993);
        setSelectedPrice(6993);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const availableColors = useMemo(() => {
    const colors = new Set<string>();

    products.forEach((product) => {
      if (categoryParam && product.category !== selectedCategory) return;
      (product.colors || []).forEach((color) => {
        if (color) colors.add(color);
      });
    });

    return Array.from(colors).length ? Array.from(colors) : defaultColorPalette;
  }, [products, categoryParam, selectedCategory]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (categoryParam && product.category !== selectedCategory) return false;

      if (query) {
        const haystack = `${product.name} ${product.category} ${product.slug || ""} ${product.badge || ""}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      if (selectedColors.length > 0) {
        const matchesColor = (product.colors || []).some((color) => selectedColors.includes(color));
        if (!matchesColor) return false;
      }
      if (selectedSizes.length > 0) {
        const matchesSize = (product.sizes || []).some((size) => selectedSizes.includes(size));
        if (!matchesSize) return false;
      }
      return parsePrice(product.price) <= selectedPrice;
    });
  }, [products, categoryParam, selectedCategory, selectedColors, selectedSizes, selectedPrice, query]);

  const updateCategory = (category: "women" | "men" | "accessories") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", category);
    router.push(`/shop-with-sidebar?${params.toString()}`);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedPrice(maxPrice);
  };

  return (
    <main className="mx-auto max-w-[1600px] px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <div className="mb-6 text-sm text-[#7a7a7a]">
        Home / {selectedCategory === "women" ? "Dresses" : selectedCategory === "men" ? "Men" : "Accessories"}
      </div>

      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <div className="text-4xl font-black uppercase tracking-[-0.08em] text-[#111111]">
            {selectedCategory === "women" ? "Dresses" : selectedCategory === "men" ? "Men" : "Accessories"}
          </div>
          {query && (
            <div className="mt-2 text-sm text-[#4e4e4e]">Search results for: <span className="font-semibold text-[#111111]">{query}</span></div>
          )}
        </div>

        <div className="text-sm text-[#4e4e4e]">Showing {filteredProducts.length} products</div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 text-sm font-medium text-[#111111]">
        <button
          type="button"
          onClick={() => router.push("/shop-with-sidebar?category=women")}
          className={`rounded-full border px-4 py-2 ${selectedCategory === "women" ? "border-[#111111] bg-[#111111] text-white" : "border-[#d9d7d2] bg-white text-[#111111]"}`}
        >
          Women
        </button>
        <button
          type="button"
          onClick={() => router.push("/shop-with-sidebar?category=men")}
          className={`rounded-full border px-4 py-2 ${selectedCategory === "men" ? "border-[#111111] bg-[#111111] text-white" : "border-[#d9d7d2] bg-white text-[#111111]"}`}
        >
          Men
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-8 border-r border-[#dfdfdf] pr-6">
          <div>
            <div className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-[#111111]">
              Collection
            </div>
            <ul className="space-y-2 text-sm text-[#3a3a3a]">
              {[
                { label: "Women", value: "women" },
                { label: "Men", value: "men" },
                { label: "Accessories", value: "accessories" },
              ].map((item) => (
                <li key={item.value}>
                  <button
                    type="button"
                    onClick={() => updateCategory(item.value as "women" | "men" | "accessories")}
                    className={`block w-full py-1 text-left ${selectedCategory === item.value ? "font-semibold text-[#111111]" : "text-inherit"}`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-[#111111]">
              Color
            </div>
            <div className="flex flex-wrap gap-3">
              {availableColors.map((color) => {
                const isSelected = selectedColors.includes(color);
                return (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Filter by ${color}`}
                    onClick={() => setSelectedColors((current) => toggleValue(color, current))}
                    className={`h-6 w-6 rounded-full border transition ${isSelected ? "ring-2 ring-[#111111] ring-offset-2" : "border-[#d9d7d2]"}`}
                    style={{ backgroundColor: color }}
                  />
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-[#111111]">
              Style size
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#4d4d4d]">
              {sizeOptions.map((size) => {
                const checked = selectedSizes.includes(size);
                return (
                  <label key={size} className="flex cursor-pointer items-center gap-2 border border-[#e2dfdb] bg-white px-2 py-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => setSelectedSizes((current) => toggleValue(size, current))}
                      className="h-3.5 w-3.5 accent-[#111111]"
                    />
                    <span>{size}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-[#111111]">
              Price
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-[#4e4e4e]">
                <span>Rs 0</span>
                <span>Rs {new Intl.NumberFormat("en-LK").format(selectedPrice)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={maxPrice}
                value={selectedPrice}
                onChange={(event) => setSelectedPrice(Number(event.target.value))}
                className="w-full accent-[#111111]"
              />
            </div>
          </div>
        </aside>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="col-span-full rounded-[16px] border border-dashed border-[#d9d7d2] bg-[#f7f6f4] p-10 text-center text-[#4d4d4d]">
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full rounded-[16px] border border-dashed border-[#d9d7d2] bg-[#f7f6f4] p-10 text-center text-[#4d4d4d]">
              No products available in this category yet.
            </div>
          ) : (
            filteredProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`} className="group block">
                <article>
                  <div className="relative h-[440px] overflow-hidden rounded-[12px] bg-[#f1efe9]" style={{ backgroundColor: product.tone }}>
                    <div className="absolute left-3 top-3 inline-flex items-center justify-center rounded-full bg-[#1d9f69] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm">
                      {formatProductBadge(product.badge)}
                    </div>

                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>

                  <div className="mt-4 text-left">
                    <div className="text-[18px] font-medium text-[#111111]">{product.name}</div>
                    <div className="mt-1 text-[14px] text-[#6d6d6d]">
                      {selectedCategory === "women" ? "Serene Pink" : selectedCategory === "men" ? "Classic fit" : "Premium accessory"}
                    </div>
                    <div className="mt-2 text-[18px] font-bold text-[#111111]">{product.price}</div>
                  </div>
                </article>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
