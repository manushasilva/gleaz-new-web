"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type OrderItem = {
  id: string | number;
  name: string;
  quantity: number;
  price: number;
  itemCode?: string;
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
  status?: "pending" | "confirmed" | "cancelled";
};

type OrderStatus = NonNullable<Order["status"]>;

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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
      if (res.status === 403) {
        toast.error("Please sign in again to access orders.");
        localStorage.removeItem("gleaz-user");
        router.replace("/signin");
        return;
      }
      if (!res.ok) throw new Error(data?.error || "Unable to load orders.");
      setOrders(data.orders || []);
    } catch (err: any) {
      toast.error(err?.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const changeOrderStatus = async (status: OrderStatus) => {
    if (!selected || updatingStatus) return;

    try {
      setUpdatingStatus(true);
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: selected.id, status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Unable to update order status.");

      setOrders((current) =>
        current.map((order) => (order.id === result.order.id ? result.order : order))
      );
      setSelected(result.order);
      if (result.notificationSent) {
        toast.success(`Order ${status} and customer notified.`);
      } else {
        toast.error(`Order ${status}, but customer was not notified: ${result.notificationError}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update order status.");
    } finally {
      setUpdatingStatus(false);
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
                          <span className="mt-2 inline-block rounded-full bg-[#f3f1ee] px-3 py-1 text-xs font-semibold capitalize text-[#5a5148]">{o.status || "pending"}</span>
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
              <p className="mt-2"><strong>Status:</strong> <span className="capitalize">{selected.status || "pending"}</span></p>
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
                        <div className="text-sm text-[#6a6a6a]">Qty: {it.quantity} {it.itemCode || it.color ? `• Item code: ${it.itemCode || it.color}` : ""} {it.size ? `• Size: ${it.size}` : ""}</div>
                      </div>
                      <div className="font-semibold">${(it.price * it.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
              {selected.status !== "cancelled" && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {(selected.status || "pending") === "pending" && (
                    <button
                      onClick={() => changeOrderStatus("confirmed")}
                      disabled={updatingStatus}
                      className="rounded bg-[#111111] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {updatingStatus ? "Updating..." : "Confirm order"}
                    </button>
                  )}
                  <button
                    onClick={() => changeOrderStatus("cancelled")}
                    disabled={updatingStatus}
                    className="rounded border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"
                  >
                    {updatingStatus ? "Updating..." : "Cancel order"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-sm text-[#6a6a6a]">Select an order to view details.</div>
          )}
        </aside>
      </div>
    </main>
  );
}
