"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type OrderItem = {
  id: string | number;
  name: string;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
};

type Order = {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  notes?: string;
  items: OrderItem[];
  orderTotal: number;
  createdAt: string;
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUser = JSON.parse(localStorage.getItem("gleaz-user") || "null");
    if (!storedUser || storedUser.role !== "admin") {
      toast.error("Admin access required.");
      router.replace("/signin");
      return;
    }
  }, [router]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unable to load orders.");
      setOrders(data.orders || []);
    } catch (err: any) {
      toast.error(err?.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const ordersByUser = orders.reduce((acc: Record<string, Order[]>, order) => {
    const key = order.email || order.customerName || "unknown";
    acc[key] = acc[key] || [];
    acc[key].push(order);
    return acc;
  }, {});

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#7a7a7a]">Admin</p>
          <h1 className="mt-2 text-4xl font-black uppercase tracking-[-0.08em] text-[#111111]">Orders</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadOrders} className="rounded border border-[#d7d4cf] px-4 py-2 text-sm">{loading ? "Refreshing..." : "Refresh"}</button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div>
          {orders.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-[#d9d7d2] bg-[#f7f6f4] p-10 text-center text-[#4d4d4d]">No orders found.</div>
          ) : (
            <div className="space-y-6">
              {Object.keys(ordersByUser).map((userKey) => (
                <div key={userKey}>
                  <div className="mb-3 text-sm font-semibold text-[#111111]">Customer: {userKey}</div>
                  <div className="space-y-4">
                    {ordersByUser[userKey].map((o) => (
                      <div key={o.id} className="flex items-center justify-between gap-4 rounded-[12px] border border-[#e7e3df] bg-white p-4">
                        <div>
                          <div className="text-lg font-semibold text-[#111111]">{o.customerName}</div>
                          <div className="mt-1 text-sm text-[#6a6a6a]">{o.email} • {new Date(o.createdAt).toLocaleString()}</div>
                          <div className="mt-2 text-base font-bold text-[#111111]">Total: ${o.orderTotal.toFixed(2)}</div>
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => setSelected(o)} className="rounded border border-[#d7d4cf] px-3 py-2 text-sm">View</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="rounded-[12px] border border-[#e7e3df] bg-white p-6">
          {selected ? (
            <div>
              <h2 className="text-xl font-bold">Order: {selected.id}</h2>
              <p className="mt-2"><strong>Customer:</strong> {selected.customerName}</p>
              <p><strong>Email:</strong> {selected.email}</p>
              <p><strong>Phone:</strong> {selected.phone}</p>
              <p><strong>Address:</strong> {selected.address}, {selected.city}, {selected.postalCode}, {selected.country}</p>
              <p className="mt-2"><strong>Notes:</strong> {selected.notes || "None"}</p>

              <div className="mt-4">
                <h3 className="font-semibold">Items</h3>
                <div className="mt-2 space-y-2">
                  {selected.items.map((it) => (
                    <div key={String(it.id)} className="flex items-center justify-between rounded border border-[#f1f1f1] p-2">
                      <div>
                        <div className="font-medium">{it.name}</div>
                        <div className="text-sm text-[#6a6a6a]">Qty: {it.quantity} {it.color ? `• ${it.color}` : ""} {it.size ? `• ${it.size}` : ""}</div>
                      </div>
                      <div className="font-semibold">${(it.price * it.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-sm text-[#6a6a6a]">Select an order to view details.</div>
          )}
        </aside>
      </div>
    </main>
  );
}
