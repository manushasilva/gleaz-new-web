"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Voucher = {
  id: string;
  name: string;
  description: string;
  amount: number;
  image: string;
  createdAt: string;
  updatedAt: string;
};

type VoucherForm = Pick<Voucher, "name" | "description" | "amount" | "image">;

const emptyForm: VoucherForm = {
  name: "",
  description: "",
  amount: 0,
  image: "",
};

const formatAmount = (amount: number) =>
  `LKR ${new Intl.NumberFormat("en-LK").format(amount)}`;

export default function AdminVouchersPage() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [form, setForm] = useState<VoucherForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("gleaz-user") || "null");
      if (!storedUser || storedUser.role !== "admin") {
        toast.error("Admin access required.");
        router.replace("/signin");
      }
    } catch {
      toast.error("Admin access required.");
      router.replace("/signin");
    }
  }, [router]);

  const loadVouchers = async () => {
    try {
      const response = await fetch("/api/admin/vouchers", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Unable to load gift vouchers.");
      setVouchers(Array.isArray(result.vouchers) ? result.vouchers : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load gift vouchers.");
    }
  };

  useEffect(() => {
    void loadVouchers();
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "vouchers");

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Unable to upload voucher image.");

      setForm((current) => ({ ...current, image: result.url }));
      toast.success("Voucher image uploaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload voucher image.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/vouchers", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editingId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Unable to save gift voucher.");

      toast.success(result.message || "Gift voucher saved.");
      setForm(emptyForm);
      setEditingId(null);
      await loadVouchers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save gift voucher.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (voucher: Voucher) => {
    setEditingId(voucher.id);
    setForm({
      name: voucher.name,
      description: voucher.description || "",
      amount: voucher.amount,
      image: voucher.image,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (voucher: Voucher) => {
    if (!window.confirm(`Delete "${voucher.name}"?`)) return;

    try {
      const response = await fetch("/api/admin/vouchers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: voucher.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Unable to delete gift voucher.");
      toast.success(result.message || "Gift voucher deleted.");
      await loadVouchers();
      if (editingId === voucher.id) {
        setEditingId(null);
        setForm(emptyForm);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete gift voucher.");
    }
  };

  return (
    <main className="mx-auto max-w-[1500px] px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#7a7a7a]">Admin</p>
          <h1 className="mt-2 text-4xl font-black uppercase tracking-[-0.08em] text-[#111111]">
            Gift vouchers
          </h1>
        </div>
        <div className="rounded-full border border-[#d9d7d2] bg-[#f7f6f4] px-4 py-2 text-sm text-[#111111]">
          {vouchers.length} {vouchers.length === 1 ? "voucher" : "vouchers"}
        </div>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[390px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#e7e3df] bg-white p-6 shadow-sm"
        >
          <h2 className="mb-6 text-xl font-semibold text-[#111111]">
            {editingId ? "Edit voucher" : "Add voucher"}
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="voucher-name" className="mb-2 block text-sm font-medium text-[#111111]">
                Voucher name
              </label>
              <input
                id="voucher-name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="w-full rounded-md border border-[#d7d4cf] px-3 py-2.5 outline-none focus:border-[#111111]"
                placeholder="Gift Voucher"
                required
              />
            </div>

            <div>
              <label htmlFor="voucher-amount" className="mb-2 block text-sm font-medium text-[#111111]">
                Voucher amount (LKR)
              </label>
              <input
                id="voucher-amount"
                type="number"
                min="1"
                step="1"
                value={form.amount || ""}
                onChange={(event) => setForm({ ...form, amount: Number(event.target.value) || 0 })}
                className="w-full rounded-md border border-[#d7d4cf] px-3 py-2.5 outline-none focus:border-[#111111]"
                placeholder="5000"
                required
              />
            </div>

            <div>
              <label htmlFor="voucher-description" className="mb-2 block text-sm font-medium text-[#111111]">
                Description
              </label>
              <textarea
                id="voucher-description"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                className="min-h-24 w-full rounded-md border border-[#d7d4cf] px-3 py-2.5 outline-none focus:border-[#111111]"
                placeholder="A thoughtful gift for someone special."
              />
            </div>

            <div>
              <label htmlFor="voucher-image" className="mb-2 block text-sm font-medium text-[#111111]">
                Voucher image
              </label>
              <input
                id="voucher-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full rounded-md border border-[#d7d4cf] bg-white px-3 py-2.5 text-sm text-[#111111] file:mr-3 file:rounded file:border-0 file:bg-[#111111] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
              />
              {uploading && <p className="mt-2 text-xs text-[#6a6a6a]">Uploading voucher image...</p>}
              {form.image && (
                <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-lg border border-[#e7e3df] bg-[#f7f6f4]">
                  <img src={form.image} alt="Voucher preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, image: "" })}
                    className="absolute right-2 top-2 rounded-full bg-white px-3 py-1 text-sm shadow"
                  >
                    Remove image
                  </button>
                </div>
              )}
              <input
                aria-label="Voucher image URL"
                value={form.image}
                onChange={(event) => setForm({ ...form, image: event.target.value })}
                className="mt-3 w-full rounded-md border border-[#d7d4cf] px-3 py-2.5 text-sm outline-none focus:border-[#111111]"
                placeholder="Or paste an image URL"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 rounded bg-[#111111] px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : editingId ? "Save changes" : "Add voucher"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="rounded border border-[#d7d4cf] px-4 py-3 text-sm font-medium text-[#111111]"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <section aria-label="Existing gift vouchers">
          {vouchers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#d9d7d2] bg-[#f7f6f4] p-10 text-center text-[#4d4d4d]">
              No vouchers have been added yet.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {vouchers.map((voucher) => (
                <article key={voucher.id} className="overflow-hidden rounded-xl border border-[#e7e3df] bg-white">
                  <div className="aspect-[4/3] bg-[#f7f6f4]">
                    <img src={voucher.image} alt={voucher.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h2 className="font-semibold text-[#111111]">{voucher.name}</h2>
                    <p className="mt-1 text-sm font-medium text-[#6a6a6a]">{formatAmount(voucher.amount)}</p>
                    {voucher.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-[#6a6a6a]">{voucher.description}</p>
                    )}
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(voucher)}
                        className="rounded border border-[#d7d4cf] px-3 py-2 text-sm font-medium text-[#111111]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(voucher)}
                        className="rounded border border-red-200 px-3 py-2 text-sm font-medium text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
