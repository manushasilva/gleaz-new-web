"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { normalizeImageSrc } from "@/utils/normalizeImageSrc";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/utils/formatePrice";

const initialForm = {
  customerName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
  country: "",
  notes: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cartDetails, totalPrice, clearCart } = useCart();
  const items = useMemo(() => Object.values(cartDetails ?? {}), [cartDetails]);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const isUserLoggedIn = () => {
    if (typeof window === "undefined") return false;

    try {
      const user = JSON.parse(localStorage.getItem("gleaz-user") || "null");
      return Boolean(user?.email);
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!isUserLoggedIn()) {
      toast.error("Please sign in before checkout.");
      router.push("/signin");
    }
  }, [router]);

  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

  const handleChange = (key: keyof typeof initialForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!isUserLoggedIn()) {
      toast.error("Please sign in before checkout.");
      router.push("/signin");
      return;
    }

    if (!items.length) {
      toast.error("Your cart is empty.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: Number(item.price || 0),
            color: item.color,
            size: item.size,
          })),
          orderTotal: subtotal,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Unable to place your order.");
      }

      toast.success("Order placed successfully. We will contact you soon.");
      setForm(initialForm);
      clearCart();
    } catch (error: any) {
      toast.error(error?.message || "A problem occurred while placing your order.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!items.length) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-500">Checkout</p>
          <h1 className="mt-4 text-4xl font-black text-slate-900">Your cart is empty</h1>
          <p className="mt-3 text-slate-600">Add your favorite pieces to continue with your order.</p>
          <Link href="/shop-with-sidebar?category=women" className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700">
            Continue shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-500">Checkout</p>
        <h1 className="mt-2 text-4xl font-black text-slate-900">Complete your order</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Full name
              <input value={form.customerName} onChange={(e) => handleChange("customerName", e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900" required />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Email
              <input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900" required />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Phone
              <input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900" required />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Country
              <input value={form.country} onChange={(e) => handleChange("country", e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900" required />
            </label>

            <label className="block text-sm font-medium text-slate-700 md:col-span-2">
              Address
              <input value={form.address} onChange={(e) => handleChange("address", e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900" required />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              City
              <input value={form.city} onChange={(e) => handleChange("city", e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900" required />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Postal code
              <input value={form.postalCode} onChange={(e) => handleChange("postalCode", e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900" required />
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Order notes
            <textarea value={form.notes} onChange={(e) => handleChange("notes", e.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900" placeholder="Any extra details for your order" />
          </label>

          <button type="submit" disabled={submitting} className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? "Placing order..." : "Place order"}
          </button>
        </form>

        <aside className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900">Order summary</h2>

          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div key={String(item.id)} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3">
                <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-slate-100">
                  {item.image ? <Image src={normalizeImageSrc(item.image)} alt={item.name} fill className="object-cover" /> : null}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500">Qty: {item.quantity} {item.color ? `• ${item.color}` : ""} {item.size ? `• ${item.size}` : ""}</p>
                </div>
                <div className="text-right font-semibold text-slate-900">{formatPrice(Number(item.price || 0) * Number(item.quantity || 0))}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-slate-600">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="mt-5 flex items-center justify-between text-xl font-black text-slate-900">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
