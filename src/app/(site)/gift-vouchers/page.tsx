"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";

type Voucher = {
  id: string;
  name: string;
  description: string;
  amount: number;
  image: string;
  createdAt: string;
};

type AmountFilter = "all" | "under-5000" | "5000-and-up";
type SortOption = "featured" | "price-low" | "price-high" | "newest";

const formatAmount = (amount: number) =>
  `LKR ${new Intl.NumberFormat("en-LK").format(amount)}`;

export default function GiftVouchersPage() {
  const { addItem } = useCart();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [amountFilter, setAmountFilter] = useState<AmountFilter>("all");
  const [sort, setSort] = useState<SortOption>("featured");

  useEffect(() => {
    const loadVouchers = async () => {
      try {
        const response = await fetch("/api/admin/vouchers");
        const result = await response.json();
        if (!response.ok) throw new Error(result?.error || "Unable to load gift vouchers.");
        setVouchers(Array.isArray(result.vouchers) ? result.vouchers : []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load gift vouchers.");
      } finally {
        setLoading(false);
      }
    };

    loadVouchers();
  }, []);

  const visibleVouchers = useMemo(() => {
    const filtered = vouchers.filter((voucher) => {
      if (amountFilter === "under-5000") return voucher.amount < 5000;
      if (amountFilter === "5000-and-up") return voucher.amount >= 5000;
      return true;
    });

    if (sort === "price-low") return [...filtered].sort((a, b) => a.amount - b.amount);
    if (sort === "price-high") return [...filtered].sort((a, b) => b.amount - a.amount);
    if (sort === "newest") {
      return [...filtered].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return filtered;
  }, [vouchers, amountFilter, sort]);

  const handleAddToCart = (voucher: Voucher) => {
    addItem({
      id: `gift-voucher-${voucher.id}`,
      name: voucher.name,
      price: voucher.amount,
      quantity: 1,
      image: voucher.image,
      slug: `gift-vouchers/${voucher.id}`,
      itemType: "gift-voucher",
    });
    toast.success(`${voucher.name} added to cart.`);
  };

  return (
    <main className="mx-auto max-w-[1600px] px-4 pb-20 pt-12 sm:px-6 lg:px-8">
      <div className="border-b border-[#e7e3df] pb-8">
        <h1 className="text-3xl font-medium uppercase text-[#111111] sm:text-4xl">
          Gift Vouchers
        </h1>
      </div>

      <div className="flex items-center justify-between gap-4 border-b border-[#e7e3df] py-6">
        <div className="relative">
          <button
            type="button"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((open) => !open)}
            className="flex items-center gap-3 border border-[#e7e3df] px-6 py-4 text-sm text-[#111111]"
          >
            Filters <span aria-hidden="true">{filtersOpen ? "⌃" : "⌄"}</span>
          </button>
          {filtersOpen && (
            <div className="absolute left-0 top-full z-10 mt-2 min-w-56 border border-[#e7e3df] bg-white p-4 shadow-lg">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6a6a6a]">
                Voucher value
              </p>
              {([
                ["all", "All values"],
                ["under-5000", "Under LKR 5,000"],
                ["5000-and-up", "LKR 5,000 and up"],
              ] as const).map(([value, label]) => (
                <label key={value} className="flex cursor-pointer items-center gap-2 py-2 text-sm">
                  <input
                    type="radio"
                    name="voucher-amount"
                    checked={amountFilter === value}
                    onChange={() => setAmountFilter(value)}
                  />
                  {label}
                </label>
              ))}
            </div>
          )}
        </div>

        <label className="flex items-center gap-3 border border-[#e7e3df] px-4 py-3 text-sm text-[#111111]">
          <span className="sr-only">Sort vouchers</span>
          <select
            aria-label="Sort vouchers"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="cursor-pointer bg-transparent outline-none"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </label>
      </div>

      {loading ? (
        <div className="py-24 text-center text-sm text-[#6a6a6a]">Loading gift vouchers...</div>
      ) : error ? (
        <div role="alert" className="py-24 text-center text-sm text-red-700">{error}</div>
      ) : visibleVouchers.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-lg font-medium text-[#111111]">No gift vouchers available yet.</p>
          <p className="mt-2 text-sm text-[#6a6a6a]">Please check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 pt-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleVouchers.map((voucher) => (
            <article key={voucher.id} className="group">
              <Link href={`/gift-vouchers/${voucher.id}`} className="block">
                <div className="aspect-[4/3] overflow-hidden bg-[#f5f4f1]">
                  <img
                    src={voucher.image}
                    alt={voucher.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              </Link>
              <div className="pt-4">
                <Link href={`/gift-vouchers/${voucher.id}`} className="text-base font-medium text-[#111111] hover:underline">
                  {voucher.name}
                </Link>
                {voucher.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-[#6a6a6a]">{voucher.description}</p>
                )}
                <p className="mt-3 text-base font-semibold text-[#111111]">
                  {formatAmount(voucher.amount)}
                </p>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/gift-vouchers/${voucher.id}`}
                    className="inline-flex flex-1 items-center justify-center border border-[#111111] px-3 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#111111]"
                  >
                    View voucher
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(voucher)}
                    className="flex-1 bg-[#111111] px-3 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-white"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
