"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import { normalizeImageSrc } from "@/utils/normalizeImageSrc";
import Link from "next/link";
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
  const { cartDetails, clearCart } = useCart();
  const items = useMemo(() => Object.values(cartDetails ?? {}), [cartDetails]);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState<{ whatsappSent: boolean } | null>(null);

  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

  const handleChange = (key: keyof typeof initialForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

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

      setOrderComplete({ whatsappSent: Boolean(result?.whatsappSent) });
      if (result?.whatsappSent) {
        toast.success("Order placed and WhatsApp notification sent.");
      } else {
        toast.error("Order placed, but the WhatsApp notification could not be sent.");
      }
      setForm(initialForm);
      clearCart();
    } catch (error: any) {
      toast.error(error?.message || "A problem occurred while placing your order.");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <section className="bg-gray-1 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-xl rounded-3xl border border-gray-3 bg-white px-6 py-10 text-center shadow-1 sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-light-6 text-green-dark">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-8 w-8"><path d="m5 12.5 4.5 4.5L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-green-dark">Order received</p>
          <h1 className="mt-3 text-3xl font-bold text-dark sm:text-4xl">Thank you!</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-body">Your order has been placed. {orderComplete.whatsappSent ? "The order details were automatically sent to 0754081108 on WhatsApp." : "We could not send the WhatsApp notification. Please contact 0754081108 with your order details."}</p>
          <Link href="/shop-with-sidebar?category=women" className="mt-6 inline-flex text-sm font-semibold text-blue hover:text-blue-dark">Continue shopping</Link>
        </div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="bg-gray-1 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-xl rounded-3xl border border-gray-3 bg-white px-6 py-12 text-center shadow-1 sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-light-5 text-blue">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 1.9-1.4L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" />
            </svg>
          </div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-blue">Your next favorite is waiting</p>
          <h1 className="mt-3 text-3xl font-bold text-dark sm:text-4xl">Your cart is empty</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-body">Take a look around and add something you love. Your checkout will be ready when you are.</p>
          <Link href="/shop-with-sidebar?category=women" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-blue px-7 py-3 text-sm font-semibold text-white transition hover:bg-blue-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue">
            Explore the collection
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:mb-10 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue">Almost yours</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-dark sm:text-4xl">Checkout</h1>
            <p className="mt-2 text-sm text-body">Add your delivery details to complete your order.</p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-3 bg-white px-4 py-2 text-xs font-semibold text-dark-2 shadow-1">
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-green"><path d="M10 2.5 4 5v4.3c0 3.8 2.6 6.5 6 8.2 3.4-1.7 6-4.4 6-8.2V5l-6-2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="m7.5 9.8 1.7 1.7 3.5-3.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Your details are handled with care
          </div>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <section className="rounded-2xl border border-gray-3 bg-white p-5 shadow-1 sm:p-7">
              <div className="mb-6 flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-light-5 text-sm font-bold text-blue">1</span>
                <div>
                  <h2 className="text-lg font-bold text-dark">Contact information</h2>
                  <p className="mt-1 text-sm text-body">Where can we send your order updates?</p>
                </div>
              </div>
              <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-dark-2">
                  Full name <span className="text-red">*</span>
                  <input autoComplete="name" value={form.customerName} onChange={(e) => handleChange("customerName", e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-gray-3 bg-white px-4 py-3 text-sm font-normal text-dark outline-none transition placeholder:text-meta-4 focus:border-blue focus:ring-2 focus:ring-blue/10" placeholder="e.g. Alex Morgan" required />
                </label>
                <label className="block text-sm font-semibold text-dark-2">
                  Email address <span className="text-red">*</span>
                  <input type="email" autoComplete="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-gray-3 bg-white px-4 py-3 text-sm font-normal text-dark outline-none transition placeholder:text-meta-4 focus:border-blue focus:ring-2 focus:ring-blue/10" placeholder="you@example.com" required />
                </label>
                <label className="block text-sm font-semibold text-dark-2 sm:col-span-2">
                  Phone number <span className="text-red">*</span>
                  <input type="tel" autoComplete="tel" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-gray-3 bg-white px-4 py-3 text-sm font-normal text-dark outline-none transition placeholder:text-meta-4 focus:border-blue focus:ring-2 focus:ring-blue/10" placeholder="Include your country code if needed" required />
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-3 bg-white p-5 shadow-1 sm:p-7">
              <div className="mb-6 flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-light-5 text-sm font-bold text-blue">2</span>
                <div>
                  <h2 className="text-lg font-bold text-dark">Delivery address</h2>
                  <p className="mt-1 text-sm text-body">Where would you like your items delivered?</p>
                </div>
              </div>
              <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-dark-2 sm:col-span-2">
                  Street address <span className="text-red">*</span>
                  <input autoComplete="street-address" value={form.address} onChange={(e) => handleChange("address", e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-gray-3 bg-white px-4 py-3 text-sm font-normal text-dark outline-none transition placeholder:text-meta-4 focus:border-blue focus:ring-2 focus:ring-blue/10" placeholder="House number and street name" required />
                </label>
                <label className="block text-sm font-semibold text-dark-2">
                  City <span className="text-red">*</span>
                  <input autoComplete="address-level2" value={form.city} onChange={(e) => handleChange("city", e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-gray-3 bg-white px-4 py-3 text-sm font-normal text-dark outline-none transition placeholder:text-meta-4 focus:border-blue focus:ring-2 focus:ring-blue/10" placeholder="Your city" required />
                </label>
                <label className="block text-sm font-semibold text-dark-2">
                  Postal code <span className="text-red">*</span>
                  <input autoComplete="postal-code" value={form.postalCode} onChange={(e) => handleChange("postalCode", e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-gray-3 bg-white px-4 py-3 text-sm font-normal text-dark outline-none transition placeholder:text-meta-4 focus:border-blue focus:ring-2 focus:ring-blue/10" placeholder="Postal or ZIP code" required />
                </label>
                <label className="block text-sm font-semibold text-dark-2 sm:col-span-2">
                  Country <span className="text-red">*</span>
                  <input autoComplete="country-name" value={form.country} onChange={(e) => handleChange("country", e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-gray-3 bg-white px-4 py-3 text-sm font-normal text-dark outline-none transition placeholder:text-meta-4 focus:border-blue focus:ring-2 focus:ring-blue/10" placeholder="Your country" required />
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-3 bg-white p-5 shadow-1 sm:p-7">
              <div className="mb-5 flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-2 text-sm font-bold text-dark-3">3</span>
                <div>
                  <h2 className="text-lg font-bold text-dark">Anything else?</h2>
                  <p className="mt-1 text-sm text-body">Add a note for our team (optional).</p>
                </div>
              </div>
              <label className="block text-sm font-semibold text-dark-2">
                Order notes <span className="font-normal text-meta-4">(optional)</span>
                <textarea value={form.notes} onChange={(e) => handleChange("notes", e.target.value)} rows={3} className="mt-2 w-full resize-y rounded-xl border border-gray-3 bg-white px-4 py-3 text-sm font-normal text-dark outline-none transition placeholder:text-meta-4 focus:border-blue focus:ring-2 focus:ring-blue/10" placeholder="Delivery instructions or other details" />
              </label>
            </section>

            <button type="submit" disabled={submitting} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-blue px-6 py-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(60,80,224,0.2)] transition hover:bg-blue-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? "Placing your order…" : "Place order"}
              {!submitting && <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4"><path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </button>
            <p className="text-center text-xs leading-5 text-body">By placing your order, you confirm that your contact and delivery details are correct.</p>
          </form>

          <aside className="rounded-2xl border border-gray-3 bg-white p-5 shadow-1 sm:p-6 lg:sticky lg:top-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-dark">Your order</h2>
                <p className="mt-1 text-sm text-body">{items.length} {items.length === 1 ? "item" : "items"} in your bag</p>
              </div>
              <Link href="/cart" className="text-sm font-semibold text-blue hover:text-blue-dark">Edit bag</Link>
            </div>

            <div className="mt-5 max-h-[360px] space-y-4 overflow-y-auto border-y border-gray-3 py-5">
              {items.map((item) => (
                <div key={String(item.id)} className="flex gap-3">
                  <div className="relative h-[76px] w-[68px] shrink-0 overflow-hidden rounded-xl bg-gray-2">
                    {item.image ? <Image src={normalizeImageSrc(item.image)} alt={item.name} fill sizes="68px" className="object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-meta-4">GLEAZ</div>}
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-dark px-1 text-[10px] font-bold text-white">{item.quantity}</span>
                  </div>
                  <div className="min-w-0 flex-1 py-1">
                    <p className="line-clamp-2 text-sm font-semibold leading-5 text-dark">{item.name}</p>
                    {(item.color || item.size) && <p className="mt-1 truncate text-xs text-body">{[item.color, item.size].filter(Boolean).join(" · ")}</p>}
                  </div>
                  <p className="shrink-0 py-1 text-right text-sm font-semibold text-dark">{formatPrice(Number(item.price || 0) * Number(item.quantity || 0))}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3 py-5 text-sm">
              <div className="flex items-center justify-between text-dark-3"><span>Subtotal</span><span className="font-medium text-dark">{formatPrice(subtotal)}</span></div>
              <div className="flex items-center justify-between text-dark-3"><span>Delivery</span><span className="font-semibold text-green">Free</span></div>
              <div className="flex items-center justify-between border-t border-gray-3 pt-4 text-base font-bold text-dark"><span>Total</span><span>{formatPrice(subtotal)}</span></div>
            </div>

            <div className="flex gap-3 rounded-xl bg-blue-light-5/60 p-4">
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="mt-0.5 h-5 w-5 shrink-0 text-blue"><path d="M10 2.5 4 5v4.3c0 3.8 2.6 6.5 6 8.2 3.4-1.7 6-4.4 6-8.2V5l-6-2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="m7.5 9.8 1.7 1.7 3.5-3.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <p className="text-xs leading-5 text-dark-2"><span className="font-bold">Free delivery</span><br />Your order ships at no extra cost.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
