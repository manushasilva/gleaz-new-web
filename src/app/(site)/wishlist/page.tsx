"use client";

import Link from "next/link";
import { useAppSelector } from "@/redux/store";
import { removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";

export default function WishlistPage() {
  const dispatch = useDispatch<AppDispatch>();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);

  return (
    <main className="mx-auto max-w-[1200px] px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a7a7a]">Your saved items</p>
          <h1 className="mt-2 text-4xl font-black uppercase tracking-[-0.08em] text-[#111111]">Wishlist</h1>
        </div>

        <div className="text-sm text-[#4d4d4d]">{wishlistItems.length} item{wishlistItems.length === 1 ? "" : "s"}</div>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="rounded-[18px] border border-dashed border-[#d8d3ce] bg-[#f7f6f4] p-10 text-center text-[#4d4d4d]">
          <p className="text-lg font-medium text-[#111111]">Your wishlist is empty.</p>
          <Link href="/shop-with-sidebar?category=women" className="mt-4 inline-flex rounded-full bg-[#111111] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {wishlistItems.map((item) => (
            <div key={item.id} className="rounded-[18px] border border-[#e7e2dc] bg-white p-3 shadow-sm">
              <Link href={`/products/${item.slug}`} className="block">
                <div className="overflow-hidden rounded-[12px] bg-[#f3f1ee]">
                  <img src={item.image} alt={item.title} className="h-[320px] w-full object-cover" />
                </div>
              </Link>

              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <Link href={`/products/${item.slug}`} className="text-lg font-medium text-[#111111] hover:text-[#666]">
                    {item.title}
                  </Link>
                  <div className="mt-2 text-base font-bold text-[#111111]">LKR {new Intl.NumberFormat("en-LK").format(item.price)}</div>
                </div>

                <button
                  type="button"
                  onClick={() => dispatch(removeItemFromWishlist(item.id))}
                  className="rounded-full border border-[#d9d4ce] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#111111]"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
