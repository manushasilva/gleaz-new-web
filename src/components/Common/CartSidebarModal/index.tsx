"use client";
import { CloseLine } from "@/assets/icons";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import EmptyCart from "./EmptyCart";
import SingleItem from "./SingleItem";
import { formatPrice } from "@/utils/formatePrice";
import { useRouter } from "next/navigation";

const CartSidebarModal = () => {
  const {
    cartCount,
    shouldDisplayCart,
    handleCartClick,
    cartDetails,
    totalPrice,
  } = useCart();

  useEffect(() => {
    // closing modal while clicking outside
    function handleClickOutside(event: any) {
      if (!event.target.closest(".modal-content")) {
        handleCartClick();
      }
    }

    if (shouldDisplayCart) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [shouldDisplayCart, handleCartClick]);

  const router = useRouter();

  const [userLoggedIn, setUserLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("gleaz-user") || "null");
      setUserLoggedIn(Boolean(user?.email));
    } catch {
      setUserLoggedIn(false);
    }
  }, []);

  const handleCheckout = () => {
    if (!userLoggedIn) {
      toast.error("Please sign in before checkout.");
      handleCartClick();
      router.push("/signin");
      return;
    }

    router.push("/checkout");
    handleCartClick();
  };

  return (
    <>
      <div
        className={`fixed top-0 left-0 z-9999 overflow-y-auto no-scrollbar w-full h-screen bg-dark/70 ease-linear duration-300 ${shouldDisplayCart ? "block" : "hidden"
          }`}
      ></div>

      {/* <div className="flex items-center justify-end"> */}
      <div
        className={`${shouldDisplayCart ? "translate-x-0" : "translate-x-full"
          } fixed z-999999 w-full h-screen max-w-[470px] ease-linear duration-300 shadow-1 bg-white px-4 sm:px-7.5 lg:px-10 top-0 right-0 modal-content flex flex-col`}
      >
        <div className="sticky top-0 bg-white flex items-center justify-between pb-7 pt-4 sm:pt-7.5 lg:pt-10 border-b border-gray-3 mb-7.5">
          <h2 className="text-lg font-medium text-dark sm:text-2xl">
            Cart View
          </h2>
          <button
            onClick={() => handleCartClick()}
            aria-label="button for close modal"
            className="flex items-center justify-center duration-150 ease-in text-dark-5 hover:text-dark"
          >
            <CloseLine />
          </button>
        </div>

        <div className="h-[66vh] overflow-y-auto no-scrollbar">
          <div className="flex flex-col gap-6">
            {/* <!-- cart item --> */}
            {cartCount ? (
              <>
                {Object.values(cartDetails ?? {}).map((item, key) => (
                  <SingleItem key={key} item={item} />
                ))}
              </>
            ) : (
              <EmptyCart />
            )}
          </div>
        </div>

        <div className="border-t border-gray-3 bg-white pt-5 pb-4 sm:pb-7.5 lg:pb-11 sticky bottom-0 mt-auto">
          <div className="flex items-center justify-between gap-5 mb-6">
            <p className="text-base font-normal text-dark-3 ">Subtotal:</p>

            <p className="text-xl font-medium text-dark">
              {totalPrice && formatPrice(totalPrice)}
            </p>
          </div>

          {!userLoggedIn ? (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-center">
              <p className="text-base font-semibold text-dark">Create account / Sign in to continue</p>
              <div className="mt-4 flex items-center gap-3">
                <Link
                  onClick={() => handleCartClick()}
                  href="/signup"
                  className="flex-1 rounded-lg bg-dark px-4 py-3 text-sm font-medium text-white"
                >
                  Create account
                </Link>
                <Link
                  onClick={() => handleCartClick()}
                  href="/signin"
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-dark"
                >
                  Sign in
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                onClick={() => handleCartClick()}
                href="/cart"
                className="flex justify-center w-full px-6 py-3 text-base font-medium text-white duration-200 ease-out rounded-lg bg-blue hover:bg-blue-dark"
              >
                View Cart
              </Link>

              <button
                onClick={() => handleCheckout()}
                className="flex justify-center w-full px-6 py-3 text-base font-medium text-white duration-200 ease-out rounded-lg bg-dark hover:bg-opacity-95"
              >
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebarModal;
