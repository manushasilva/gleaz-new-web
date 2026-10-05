"use client";

import { useEffect, useState } from "react";
import AdminNav from "@/components/Admin/AdminNav";
import MainHeader from "./MainHeader";
import { HeaderSetting } from "@prisma/client";

export default function HeaderSwitcher({ headerData }: { headerData?: HeaderSetting | null }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("gleaz-user");
      const u = s ? JSON.parse(s) : null;
      setIsAdmin(u?.role === "admin");
    } catch (e) {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    const sync = () => {
      try {
        const s = localStorage.getItem("gleaz-user");
        const u = s ? JSON.parse(s) : null;
        setIsAdmin(u?.role === "admin");
      } catch (e) {
        setIsAdmin(false);
      }
    };

    // storage event for other tabs
    window.addEventListener("storage", sync);
    // custom event for same-tab changes (dispatched by AdminNav on sign out)
    window.addEventListener("gleaz-user-changed", sync as EventListener);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("gleaz-user-changed", sync as EventListener);
    };
  }, []);

  if (isAdmin) {
    return (
      <header className="fixed left-0 top-0 z-50 w-full bg-white text-[#111111] shadow-sm">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <AdminNav productCount={0} />
        </div>
      </header>
    );
  }

  return <MainHeader headerData={headerData} />;
}
