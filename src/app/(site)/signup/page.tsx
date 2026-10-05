"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Unable to create account right now.");
      }

      toast.success(result?.message || "Account created successfully.");
      router.push("/signin");
    } catch (error: any) {
      toast.error(error?.message || "Unable to create account right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.06)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="p-8 sm:p-10 lg:p-12">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-500">Join us</p>
            <h1 className="mt-2 text-4xl font-black text-slate-900">Create account</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block text-sm font-medium text-slate-700">
              Full name
              <input
                value={form.fullName}
                onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="Enter your full name"
                required
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Email address
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Contact number
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                  placeholder="+94 77 123 4567"
                  required
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Address
              <textarea
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                className="mt-2 min-h-[110px] w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="Street address, city, state, postal code"
                required
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="Create a password"
                required
              />
            </label>

            <div className="text-sm text-slate-600">
              By creating an account, you agree to our <Link href="/terms-conditions" className="font-semibold text-slate-900 underline underline-offset-4">terms</Link> and <Link href="/privacy-policy" className="font-semibold text-slate-900 underline underline-offset-4">privacy policy</Link>.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl border border-[#0f172a] bg-[#0f172a] px-6 py-4 text-base font-semibold uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-600">
            Already have an account? <Link href="/signin" className="font-semibold text-slate-900 underline underline-offset-4">Sign in</Link>
          </div>
        </div>

        <div className="bg-[linear-gradient(135deg,#fef2f2,#fff7ed)] p-8 sm:p-10 lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-500">Why join GLEAZ</p>
          <h2 className="mt-4 text-3xl font-black text-slate-900">Style that follows you</h2>

          <div className="mt-8 space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-lg font-bold text-slate-900">Exclusive drops</p>
              <p className="mt-2 text-sm text-slate-600">Shop new capsule arrivals before everyone else.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-lg font-bold text-slate-900">Saved favorites</p>
              <p className="mt-2 text-sm text-slate-600">Keep your wishlist and revisit your best looks anytime.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-lg font-bold text-slate-900">Fast support</p>
              <p className="mt-2 text-sm text-slate-600">Get help with sizing, orders, and style recommendations.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
