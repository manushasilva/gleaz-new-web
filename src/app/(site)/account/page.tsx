"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type UserProfile = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  role?: string;
};

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("gleaz-user");
    if (!storedUser) {
      router.replace("/signin");
      return;
    }

    try {
      const parsed = JSON.parse(storedUser) as UserProfile;
      setUser(parsed);
      setForm({
        username: parsed.username || "",
        fullName: parsed.fullName || "",
        email: parsed.email || "",
        phone: parsed.phone || "",
        address: parsed.address || "",
      });
    } catch {
      localStorage.removeItem("gleaz-user");
      router.replace("/signin");
    }
  }, [router]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          username: form.username,
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          address: form.address,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Unable to update profile.");

      const nextUser = result.user as UserProfile;
      setUser(nextUser);
      localStorage.setItem("gleaz-user", JSON.stringify(nextUser));
      try {
        window.dispatchEvent(new Event("gleaz-user-changed"));
      } catch (e) {}
      toast.success(result?.message || "Profile updated successfully.");
    } catch (error: any) {
      toast.error(error?.message || "Unable to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="mx-auto max-w-6xl px-4 py-28 text-center text-slate-600">Loading account...</div>;
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Account</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.08em] text-slate-900">My account</h1>
      </div>

      <form onSubmit={handleSave} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="grid gap-6 md:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Username
            <input
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              required
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Full name
            <input
              value={form.fullName}
              onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              required
            />
          </label>

          <label className="block text-sm font-medium text-slate-700 md:col-span-2">
            Email address
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              required
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Phone number
            <input
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              required
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Role
            <input
              value={user.role || "user"}
              disabled
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700 md:col-span-2">
            Address
            <textarea
              value={form.address}
              onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              className="mt-2 min-h-[120px] w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
              required
            />
          </label>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl border border-[#0f172a] bg-[#0f172a] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
          >
            Back to shop
          </button>
        </div>
      </form>
    </section>
  );
}
