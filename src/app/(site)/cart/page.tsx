"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/utils/formatePrice";

export default function CartPage() {
  const router = useRouter();
  const { cartDetails, totalPrice, incrementItem, decrementItem, removeItem } = useCart();
  const items = Object.values(cartDetails ?? {});

  const isUserLoggedIn = () => {
    if (typeof window === "undefined") return false;

    try {
      const user = JSON.parse(localStorage.getItem("gleaz-user") || "null");
      return Boolean(user?.email);
    } catch {
      return false;
    }
  };

  const handleProceedToCheckout = () => {
    if (!isUserLoggedIn()) {
      toast.error("Please sign in before checkout.");
      router.push("/signin");
      return;
    }

    router.push("/checkout");
  };

  const userLoggedIn = isUserLoggedIn();

  if (!items.length) {
    return (
      <main className="mx-auto max-w-4xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[#e7e3df] bg-white p-10 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a7a7a]">Cart</p>
          <h1 className="mt-4 text-4xl font-black uppercase tracking-[-0.06em] text-[#111111]">Your cart is empty</h1>
          <p className="mt-3 text-[#4d4d4d]">Add your favorite pieces to continue shopping.</p>
          <Link
            href="/shop-with-sidebar?category=women"
            className="mt-6 inline-flex rounded bg-[#111111] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white"
          >
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a7a7a]">Cart</p>
        <h1 className="mt-2 text-4xl font-black uppercase tracking-[-0.06em] text-[#111111]">Shopping cart</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          {items.map((item) => (
            <div key={String(item.id)} className="flex gap-4 rounded-[18px] border border-[#e7e3df] bg-white p-4 shadow-sm">
              <div className="h-28 w-28 shrink-0 overflow-hidden rounded-[12px] border border-[#f0ede9] bg-[#f7f6f4]">
                <img src={item.image || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80"} alt={item.name} className="h-full w-full object-cover" />
              </div>

              <div className="flex flex-1 items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-[#111111]">{item.name}</h2>
                  <p className="mt-1 text-sm text-[#666]">{item.color || "Default color"}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={() => decrementItem(item.id)}
                      className="h-9 w-9 rounded border border-[#d9d7d2] text-lg text-[#111111]"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-[#111111]">{item.quantity}</span>
                    <button
                      onClick={() => incrementItem(item.id)}
                      className="h-9 w-9 rounded border border-[#d9d7d2] text-lg text-[#111111]"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold text-[#111111]">
                    {formatPrice(Number(item.price || 0) * Number(item.quantity || 0))}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="mt-3 text-sm font-medium text-[#111111] underline underline-offset-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="rounded-[20px] border border-[#e7e3df] bg-[#f7f6f4] p-6 shadow-sm">
          <h2 className="text-2xl font-black uppercase tracking-[-0.06em] text-[#111111]">Summary</h2>

          <div className="mt-6 space-y-4 text-[#111111]">
            <div className="flex items-center justify-between">
              <span className="text-sm uppercase tracking-[0.12em] text-[#666]">Subtotal</span>
              <span className="text-xl font-bold">{formatPrice(totalPrice || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm uppercase tracking-[0.12em] text-[#666]">Shipping</span>
              <span className="text-base font-medium">Free</span>
            </div>
          </div>

          {!userLoggedIn ? (
            <div className="mt-8 rounded-[16px] border border-[#e7e3df] bg-white p-4 text-center shadow-sm">
              <p className="text-base font-bold text-[#111111]">Create account / Sign in to continue</p>
              <div className="mt-4 flex gap-3">
                <Link href="/signup" className="flex-1 rounded bg-[#111111] px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white">
                  Create account
                </Link>
                <Link href="/signin" className="flex-1 rounded border border-[#d9d7d2] bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#111111]">
                  Sign in
                </Link>
              </div>
            </div>
          ) : (
            <button
              onClick={handleProceedToCheckout}
              className="mt-8 w-full rounded bg-[#111111] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white"
            >
              Proceed to checkout
            </button>
          )}

          <Link
            href="/shop-with-sidebar?category=women"
            className="mt-3 inline-flex w-full justify-center rounded border border-[#d9d7d2] bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#111111]"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </main>
  );
}
