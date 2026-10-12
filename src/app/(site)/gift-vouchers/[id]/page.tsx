"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";

type Voucher = {
  id: string;
  name: string;
  description: string;
  amount: number;
  image: string;
};

const formatAmount = (amount: number) =>
  `LKR ${new Intl.NumberFormat("en-LK").format(amount)}`;

export default function GiftVoucherDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem, clearCart } = useCart();
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadVoucher = async () => {
      try {
        const response = await fetch(`/api/vouchers/${encodeURIComponent(params.id)}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result?.error || "Unable to load gift voucher.");
        setVoucher(result.voucher);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load gift voucher.");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) void loadVoucher();
  }, [params.id]);

  const addVoucherToCart = () => {
    if (!voucher) return;
    addItem({
      id: `gift-voucher-${voucher.id}`,
      name: voucher.name,
      price: voucher.amount,
      quantity,
      image: voucher.image,
      slug: `gift-vouchers/${voucher.id}`,
      itemType: "gift-voucher",
    });
  };

  const handleAddToCart = () => {
    if (!voucher) return;
    addVoucherToCart();
    toast.success(`${voucher.name} added to cart.`);
  };

  const handleBuyNow = () => {
    if (!voucher) return;
    clearCart();
    addVoucherToCart();
    router.push("/checkout");
  };

  if (loading) {
    return <main className="mx-auto max-w-6xl px-4 py-24 text-center">Loading gift voucher...</main>;
  }

  if (error || !voucher) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-24 text-center">
        <p role="alert" className="text-[#6a6a6a]">{error || "Gift voucher not found."}</p>
        <Link href="/gift-vouchers" className="mt-5 inline-flex underline underline-offset-4">
          Back to gift vouchers
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-[#6a6a6a]">
        <Link href="/">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/gift-vouchers">Gift Vouchers</Link>
        <span className="mx-2">/</span>
        <span aria-current="page" className="text-[#111111]">{voucher.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="overflow-hidden rounded-xl bg-[#f5f4f1]">
          <img src={voucher.image} alt={voucher.name} className="aspect-[4/3] h-full w-full object-cover" />
        </div>

        <section className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#777]">Gift Vouchers</p>
          <h1 className="mt-3 text-3xl font-semibold text-[#111111] sm:text-4xl">{voucher.name}</h1>
          <p className="mt-5 text-3xl font-bold text-[#111111]">{formatAmount(voucher.amount)}</p>
          {voucher.description && (
            <p className="mt-5 whitespace-pre-line text-base leading-7 text-[#5f5f5f]">
              {voucher.description}
            </p>
          )}
          <p className="mt-5 text-sm leading-6 text-[#6a6a6a]">
            A thoughtful gift to let someone special choose their favorite GLEAZ styles.
          </p>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex h-12 items-center border border-[#d9d7d2]">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                className="h-full w-11 text-xl"
              >
                −
              </button>
              <span aria-live="polite" className="w-10 text-center font-semibold">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((current) => current + 1)}
                className="h-full w-11 text-xl"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 bg-[#111111] px-5 py-4 text-sm font-semibold uppercase tracking-[0.1em] text-white"
            >
              Add to cart
            </button>
          </div>
          <button
            type="button"
            onClick={handleBuyNow}
            className="mt-3 w-full border border-[#111111] px-5 py-4 text-sm font-semibold uppercase tracking-[0.1em] text-[#111111] transition hover:bg-[#f5f4f1]"
          >
            Buy now
          </button>
        </section>
      </div>
    </main>
  );
}
