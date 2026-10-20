"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { menuData } from "./menuData";
import MobileMenu from "./MobileMenu";
import DesktopMenu from "./DesktopMenu";
import {
  SearchIcon,
  UserIcon,
  HeartIcon,
  CartIcon,
  MenuIcon,
  CloseIcon,
} from "./icons";
import { HeaderSetting } from "@prisma/client";
import { useAppSelector } from "@/redux/store";
import { useRouter } from "next/navigation";

type IProps = {
  headerData?: HeaderSetting | null;
};

const MainHeader = ({ headerData }: IProps) => {
  const router = useRouter();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [searchText, setSearchText] = useState("");
  const { handleCartClick, cartCount, totalPrice } = useCart();
  const wishlistCount = useAppSelector((state) => state.wishlistReducer).items
    ?.length;

  const getStoredUser = () => {
    if (typeof window === "undefined") return null;

    try {
      const storedUser = localStorage.getItem("gleaz-user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const syncUser = () => {
      const currentUser = getStoredUser();
      setUserName(currentUser?.fullName || currentUser?.name || currentUser?.email || "");
    };

    syncUser();
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const handleOpenCartModal = () => {
    handleCartClick();
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuery = searchText.trim();

    if (!trimmedQuery) {
      router.push("/shop-with-sidebar?category=women");
      return;
    }

    router.push(`/shop-with-sidebar?q=${encodeURIComponent(trimmedQuery)}`);
  };

  // Sticky menu
  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);
    return () => {
      window.removeEventListener("scroll", handleStickyMenu);
    };
  }, []);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setNavigationOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <header className="fixed left-0 top-0 z-50 w-full bg-white text-[#111111] shadow-sm">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:gap-4 lg:px-8">
          <Link
            href="/"
            aria-label="GLEAZ home"
            className="font-display text-[1.7rem] font-extrabold uppercase tracking-[-0.08em] text-[#111111] sm:text-[2.1rem] lg:text-[2.3rem]"
          >
            GLEAZ
          </Link>

          <div className="hidden flex-1 items-center justify-center xl:flex">
            <DesktopMenu menuData={menuData} stickyMenu={stickyMenu} />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d9d7d2] bg-white text-[#111111] shadow-sm transition hover:border-[#111111] sm:h-10 sm:w-10"
              aria-label="Open search"
            >
              <SearchIcon />
            </button>

            <div className="relative">
              <button
                className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium ${userName ? "border-[#d9d7d2] bg-[#f7f6f4] text-[#111111]" : "border-transparent bg-transparent text-[#111111]"}`}
                aria-label="Account"
                onClick={() => setAccountMenuOpen((prev) => !prev)}
              >
                <UserIcon />
                {userName ? <span className="max-w-[120px] truncate">{userName}</span> : null}
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 top-full mt-3 w-56 rounded-xl border border-[#e7e3df] bg-white p-2 shadow-lg">
                  {userName ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          router.push("/account");
                        }}
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[#111111] hover:bg-[#f7f6f4]"
                      >
                        My Account
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setAccountMenuOpen(false);
                          try {
                            const response = await fetch("/api/auth/signout", { method: "POST" });
                            if (!response.ok) throw new Error("Unable to revoke the sign-in session.");
                          } catch (error) {
                            console.error("Unable to revoke the sign-in session:", error);
                          } finally {
                            try {
                              localStorage.removeItem("gleaz-user");
                              window.dispatchEvent(new Event("gleaz-user-changed"));
                            } catch (error) {
                              console.error("Unable to clear the saved user:", error);
                            }
                            setUserName("");
                            router.push("/");
                          }
                        }}
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[#111111] hover:bg-[#f7f6f4]"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          router.push("/signin");
                        }}
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[#111111] hover:bg-[#f7f6f4]"
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          router.push("/signup");
                        }}
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[#111111] hover:bg-[#f7f6f4]"
                      >
                        Sign Up
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <Link href="/wishlist" className="relative text-[#111111]" aria-label="Wishlist">
              <HeartIcon />
              <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#111111] text-[9px] text-white">
                {wishlistCount || 0}
              </span>
            </Link>
            <button className="relative text-[#111111]" aria-label="Cart" onClick={handleOpenCartModal}>
              <CartIcon />
              <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#111111] text-[9px] text-white">{cartCount || 0}</span>
            </button>
            <button className="transition xl:hidden focus:outline-none" onClick={() => setNavigationOpen(!navigationOpen)} aria-label={navigationOpen ? "Close menu" : "Open menu"}>
              {navigationOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      {searchModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/65 px-4 pt-[10vh] backdrop-blur-[2px]"
          onClick={() => setSearchModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search GLEAZ"
            className="w-full max-w-[520px] overflow-hidden rounded-lg bg-white shadow-[0_24px_70px_rgba(0,0,0,0.25)]"
            onClick={(event) => event.stopPropagation()}
          >
            <form onSubmit={handleSearchSubmit} className="flex min-h-[54px] items-center gap-3 border-b border-[#e5e5e5] px-5">
              <input
                autoFocus
                type="text"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search articles, pages, or products"
                className="h-[52px] min-w-0 flex-1 bg-transparent text-sm font-normal text-[#111111] placeholder:text-[#929292] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center text-[#555555] transition hover:text-black"
                aria-label="Close search"
              >
                <CloseIcon />
              </button>
            </form>

            <div className="grid grid-cols-2 gap-4 p-5">
                <button
                  type="button"
                  onClick={() => {
                    setSearchText("");
                    setSearchModalOpen(false);
                    router.push("/shop-with-sidebar?category=women");
                  }}
                  className="min-h-28 rounded-md border border-[#e2dfdb] bg-[#f7f6f4] px-4 py-4 text-left transition hover:border-[#111111]"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#77736f]">Collection</div>
                  <div className="mt-2 text-xl font-bold uppercase tracking-[-0.05em] text-[#111111]">Women</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSearchText("");
                    setSearchModalOpen(false);
                    router.push("/shop-with-sidebar?category=men");
                  }}
                  className="min-h-28 rounded-md border border-[#e2dfdb] bg-[#f7f6f4] px-4 py-4 text-left transition hover:border-[#111111]"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#77736f]">Collection</div>
                  <div className="mt-2 text-xl font-bold uppercase tracking-[-0.05em] text-[#111111]">Men</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <MobileMenu
        isOpen={navigationOpen}
        onClose={() => setNavigationOpen(false)}
        menuData={menuData}
      />
    </>
  );
};

export default MainHeader;
