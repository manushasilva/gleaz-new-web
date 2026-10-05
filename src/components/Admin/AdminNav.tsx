"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminNav({ productCount }: { productCount: number }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const isOrders = pathname.includes("/admin/orders");
  const isProducts = !isOrders;

  useEffect(() => {
    try {
      const s = localStorage.getItem("gleaz-user");
      const u = s ? JSON.parse(s) : null;
      setUserName(u?.fullName || u?.name || u?.email || null);
    } catch (e) {
      setUserName(null);
    }
  }, []);

  const handleSignOut = () => {
    try {
      localStorage.removeItem("gleaz-user");
    } catch (e) {}
    // notify other components in same tab to update auth state
    try {
      window.dispatchEvent(new Event("gleaz-user-changed"));
    } catch (e) {}
    router.push("/");
  };

  return (
    <div className="flex items-center gap-3">
      <nav className="rounded-md border border-[#e7e3df] bg-white px-3 py-2 shadow-sm">
        <Link
          href="/admin"
          className={`mr-2 inline-block px-3 py-2 text-sm ${isProducts ? "font-semibold text-[#111111]" : "text-[#6a6a6a]"}`}
        >
          Product manager
        </Link>
        <Link
          href="/admin/orders"
          className={`inline-block px-3 py-2 text-sm ${isOrders ? "font-semibold text-[#111111]" : "text-[#6a6a6a]"}`}
        >
          Orders
        </Link>
      </nav>

      <div className="rounded-full border border-[#d9d7d2] bg-[#f7f6f4] px-4 py-2 text-sm text-[#111111]">
        {productCount} products
      </div>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((s) => !s)}
          className="ml-2 flex items-center gap-2 rounded-full border border-[#d9d7d2] bg-white px-3 py-2 text-sm"
        >
          <span>{userName || "Admin"}</span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-44 rounded-xl border border-[#e7e3df] bg-white p-2 shadow-lg">
            <button
              onClick={() => {
                setMenuOpen(false);
                router.push("/account");
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[#111111] hover:bg-[#f7f6f4]"
            >
              My Profile
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                handleSignOut();
              }}
              className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[#111111] hover:bg-[#f7f6f4]"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
