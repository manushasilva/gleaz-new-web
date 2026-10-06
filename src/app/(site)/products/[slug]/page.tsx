"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { useAppSelector } from "@/redux/store";
import SizeChartModal from "@/components/Common/SizeChartModal";

type StoreProduct = {
  id: string;
  name: string;
  category: "women" | "men" | "accessories";
  price: string;
  discountPercentage?: number | string; // <--- Added this property
  image: string;
  badge: string;
  tone: string;
  slug: string;
  description?: string;
  sizes?: string[];
  colors?: string[];
};

const fallbackDetails = [
  { label: "Fabric", value: "Premium cotton blend" },
  { label: "Fit", value: "Regular fit" },
  { label: "Delivery", value: "2-4 working days" },
];

const shoppingBenefits = [
  { title: "Free Shipping", detail: "On orders over LKR 4,500" },
  { title: "Easy Returns", detail: "14-day hassle-free return policy" },
  { title: "Secure Checkout", detail: "Protected payments and privacy" },
  { title: "Fit Guarantee", detail: "Size chart and fit support" },
];

const getBusinessDayRange = () => {
  const addBusinessDays = (start: Date, days: number) => {
    const date = new Date(start);
    let addedDays = 0;

    while (addedDays < days) {
      date.setDate(date.getDate() + 1);
      if (date.getDay() !== 0 && date.getDay() !== 6) addedDays += 1;
    }

    return date;
  };

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-LK", { day: "numeric", month: "short" }).format(date);

  const today = new Date();
  return `${formatDate(addBusinessDays(today, 2))} – ${formatDate(addBusinessDays(today, 4))}`;
};

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams<{ slug?: string | string[] }>();
  const { addItem, clearCart } = useCart();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>("#e0b63d");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [deliveryEstimate, setDeliveryEstimate] = useState("");
  const [reviewSummary, setReviewSummary] = useState({ average: 0, count: 0 });

  const safeSlug = useMemo(() => {
    const slugValue = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
    return decodeURIComponent(slugValue || "");
  }, [params?.slug]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch("/api/admin/products");
        const result = await response.json();
        if (!response.ok) throw new Error(result?.error || "Unable to load products.");
        setProducts(Array.isArray(result.products) ? result.products : []);
      } catch (error) {
        console.error("Unable to load product detail", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    setDeliveryEstimate(getBusinessDayRange());
  }, []);

  const product = useMemo(
    () => products.find((item) => item.slug === safeSlug) ?? null,
    [products, safeSlug],
  );

  useEffect(() => {
    if (!product?.slug) {
      setReviewSummary({ average: 0, count: 0 });
      return;
    }

    const controller = new AbortController();
    const loadReviews = async () => {
      try {
        const response = await fetch("/api/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productSlug: product.slug }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unable to load reviews.");
        const result = await response.json();
        const reviews = Array.isArray(result.review) ? result.review : [];
        const ratings = reviews
          .map((review: { rating?: unknown }) => Number(review.rating))
          .filter((rating: number) => Number.isFinite(rating) && rating >= 1 && rating <= 5);

        setReviewSummary({
          average: ratings.length ? ratings.reduce((total: number, rating: number) => total + rating, 0) / ratings.length : 0,
          count: ratings.length,
        });
      } catch (error) {
        if (!controller.signal.aborted) setReviewSummary({ average: 0, count: 0 });
      }
    };

    loadReviews();
    return () => controller.abort();
  }, [product?.slug]);

  useEffect(() => {
    const availableColors = product?.colors && product.colors.length ? product.colors : product?.tone ? [product.tone] : [];
    if (availableColors.length) {
      setSelectedColor(availableColors[0]);
    }
    if (product?.sizes?.length) {
      setSelectedSize(product.sizes[0]);
    } else {
      setSelectedSize("");
    }
  }, [product?.tone, product?.sizes, product?.colors]);

  const parsePrice = (value: string) => {
    const numericValue = value.replace(/[^\d.]/g, "");
    return Number(numericValue) || 0;
  };

  const formatLkrPrice = (value: string | number) => {
    const numericValue = typeof value === "number" ? value : Number(String(value).replace(/[^\d.]/g, ""));
    if (!Number.isFinite(numericValue)) return "LKR 0";
    return `LKR ${new Intl.NumberFormat("en-LK").format(numericValue)}`;
  };

  const isUserLoggedIn = () => {
    if (typeof window === "undefined") return false;

    try {
      const user = JSON.parse(localStorage.getItem("gleaz-user") || "null");
      return Boolean(user?.email);
    } catch {
      return false;
    }
  };

  const gallery = product ? [product.image, product.image, product.image, product.image] : [];
  const isInWishlist = Boolean(product && wishlistItems.some((item) => item.id === product.id));

  const handleWishlistToggle = () => {
    if (!product) return;

    const basePrice = parsePrice(product.price);
    const discountedPrice = Number(product.discountPercentage) > 0
      ? Math.round(basePrice * (1 - Number(product.discountPercentage) / 100))
      : basePrice;

    addItemToWishlist({
      id: product.id,
      title: product.name,
      slug: product.slug,
      image: product.image,
      price: discountedPrice,
      quantity,
      color: selectedColor,
    });
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product?.name, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Product link copied.");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error("Unable to share this product.");
      }
    }
  };

  const handleClearSelections = () => {
    const availableColors = product?.colors?.length ? product.colors : product?.tone ? [product.tone] : [];
    setSelectedSize(product?.sizes?.[0] || "");
    setSelectedColor(availableColors[0] || "");
    setQuantity(1);
  };

  const addProductToCart = () => {
    if (!product) return;

    const availableColors = product.colors && product.colors.length ? product.colors : product.tone ? [product.tone] : [];
    const hasSizeSelection = !product.sizes || product.sizes.length === 0 || Boolean(selectedSize);
    const hasColorSelection = availableColors.length === 0 || Boolean(selectedColor);
    const basePrice = parsePrice(product.price);
    const discountedPrice = Number(product.discountPercentage) > 0
      ? Math.round(basePrice * (1 - Number(product.discountPercentage) / 100))
      : basePrice;

    if (!hasSizeSelection) {
      toast.error("Please select a size before adding this product.");
      return false;
    }

    if (!hasColorSelection) {
      toast.error("Please select a valid color before adding this product.");
      return false;
    }

    const cartItem = {
      id: product.sizes && product.sizes.length ? `${product.id}-${selectedSize}` : product.id,
      name: product.name,
      price: discountedPrice,
      quantity,
      image: product.image,
      color: selectedColor,
      size: selectedSize,
      slug: product.slug,
    };

    addItem(cartItem);
    return true;
  };

  const handleAddToCart = () => {
    const added = addProductToCart();
    if (added) {
      toast.success("Product added to cart.");
    }
  };

  const handleBuyNow = () => {
    if (!isUserLoggedIn()) {
      toast.error("Please sign in to buy this product.");
      router.push("/signin");
      return;
    }

    if (!product) return;

    const availableColors = product.colors && product.colors.length ? product.colors : product.tone ? [product.tone] : [];
    const hasSizeSelection = !product.sizes || product.sizes.length === 0 || Boolean(selectedSize);
    const hasColorSelection = availableColors.length === 0 || Boolean(selectedColor);
    const basePrice = parsePrice(product.price);
    const discountedPrice = Number(product.discountPercentage) > 0
      ? Math.round(basePrice * (1 - Number(product.discountPercentage) / 100))
      : basePrice;

    if (!hasSizeSelection) {
      toast.error("Please select a size before buying this product.");
      return;
    }

    if (!hasColorSelection) {
      toast.error("Please select a valid color before buying this product.");
      return;
    }

    clearCart();
    addItem({
      id: product.sizes && product.sizes.length ? `${product.id}-${selectedSize}` : product.id,
      name: product.name,
      price: discountedPrice,
      quantity,
      image: product.image,
      color: selectedColor,
      size: selectedSize,
      slug: product.slug,
    });

    toast.success("Proceeding to checkout.");
    router.push("/checkout");
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-[1500px] px-4 pb-16 pt-28 text-center text-[#111111] sm:px-6 lg:px-8">
        Loading product...
      </main>
    );
  }

  if (!product) {
    return (
      <main className="mx-auto max-w-[1500px] px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="rounded-[16px] border border-dashed border-[#d9d7d2] bg-[#f7f6f4] p-10 text-center text-[#4d4d4d]">
          Product not found.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1500px] px-4 pb-28 pt-28 sm:px-6 lg:pb-16 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-[120px_1fr]">
            <div className="flex flex-col gap-3">
              {gallery.map((image, index) => (
                <button
                  key={`${product.name}-${index}`}
                  type="button"
                  className="overflow-hidden rounded-md border border-[#ded9d2] bg-[#f5f3f0] p-1"
                  aria-label={`View product thumbnail ${index + 1}`}
                >
                  <img src={image} alt={`${product.name} thumbnail ${index + 1}`} className="h-24 w-full object-cover" />
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-[12px] border border-[#e2dfda] bg-[#f4f0eb] p-3">
              <img
                src={product.image}
                alt={product.name}
                className="h-[620px] w-full object-cover"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-[12px] border border-[#e5e1dc] bg-[#f7f5f2] p-4 text-sm text-[#111111]">
            <span className="inline-flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-[#1c8d60]" />
              Quality checked
            </span>
            <span>Easy returns</span>
            <span>Free shipping over LKR 4,500</span>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded border border-[#cdebd8] bg-[#edf9f2] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#1e8d5c]">
              {product.badge || "In stock"}
            </div>
            {Number(product.discountPercentage) > 0 && (
              <div className="inline-flex rounded border border-[#f4d0d0] bg-[#fff1f1] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#a12727]">
                -{Math.min(Number(product.discountPercentage), 100)}% OFF
              </div>
            )}
          </div>

          <h1 className="mt-6 text-[2.2rem] font-medium leading-tight text-[#111111]">
            {product.name}
          </h1>

          {reviewSummary.count > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm" aria-label={`${reviewSummary.average.toFixed(1)} out of 5 from ${reviewSummary.count} reviews`}>
              <span className="tracking-[0.12em] text-amber-500" aria-hidden="true">{"★".repeat(Math.round(reviewSummary.average))}{"☆".repeat(5 - Math.round(reviewSummary.average))}</span>
              <span className="font-semibold text-[#111111]">{reviewSummary.average.toFixed(1)}</span>
              <span className="text-[#6b6966]">({reviewSummary.count} {reviewSummary.count === 1 ? "review" : "reviews"})</span>
            </div>
          )}

          <div className="mt-5 flex items-center gap-3">
            {Number(product.discountPercentage) > 0 ? (
              <>
                <span className="text-[2rem] font-bold text-[#111111]">
                  {formatLkrPrice(
                    parsePrice(product.price) * (1 - Number(product.discountPercentage) / 100)
                  )}
                </span>
                <span className="text-[1.2rem] text-[#7a7a7a] line-through">
                  {formatLkrPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-[2rem] font-bold text-[#111111]">{formatLkrPrice(product.price)}</span>
            )}
          </div>

          <p className="mt-6 text-[1.05rem] leading-8 text-[#4d4d4d]">
            {product.description || "Crafted for a premium everyday look with refined comfort and modern styling."}
          </p>

          <div className="mt-8 grid gap-3 rounded-[12px] border border-[#e5e1dc] bg-[#f7f5f2] p-4 sm:grid-cols-3">
            <div>
              <div className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#7a7a7a]">Buy</div>
              <div className="mt-1 text-base font-semibold text-[#111111]">{product.badge || "Available"}</div>
            </div>
            <div>
              <div className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#7a7a7a]">Selling</div>
              <div className="mt-1 text-base font-semibold text-[#111111]">{deliveryEstimate || "2-4 working days"}</div>
            </div>
            <div>
              <div className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#7a7a7a]">Offer</div>
              <div className="mt-1 text-base font-semibold text-[#111111]">
                {Number(product.discountPercentage) > 0 ? `${Math.min(Number(product.discountPercentage), 100)}% off` : "Everyday price"}
              </div>
            </div>
          </div>

          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-sm font-medium uppercase tracking-[0.12em] text-[#111111]">
                  Size
                </div>
                <button
                  type="button"
                  onClick={() => setShowSizeChart(true)}
                  className="text-xs font-medium uppercase tracking-[0.12em] text-[#111111] underline-offset-4 hover:underline"
                >
                  Size chart
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[52px] rounded-md border px-4 py-2 text-sm font-medium transition ${
                      selectedSize === size
                        ? "border-[#111111] bg-[#111111] text-white"
                        : "border-[#d7d4cf] bg-white text-[#111111]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <div className="mb-3 text-sm font-medium uppercase tracking-[0.12em] text-[#111111]">
              Color
            </div>
            <div className="flex items-center gap-3">
              {(product.colors && product.colors.length ? product.colors : product.tone ? [product.tone] : []).map((color, idx) => (
                <button
                  key={`${color}-${idx}`}
                  type="button"
                  aria-label={`Choose ${color}`}
                  onClick={() => setSelectedColor(color)}
                  className={`h-12 w-12 rounded-md border p-1 transition ${selectedColor === color ? "border-[#111111] ring-2 ring-[#111111]/20" : "border-[#d7d4d0]"}`}
                  style={{ background: color }}
                />
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3 text-sm text-[#4d4d4d]">
            <button
              type="button"
              onClick={handleClearSelections}
              className="inline-flex rounded-md border border-[#d9d4cf] bg-white px-3 py-2 hover:border-[#111111]"
            >
              × Reset selections
            </button>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex items-center overflow-hidden rounded-md border border-[#d9d5cf] bg-white">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                className="h-12 w-12 text-xl text-[#111111]"
              >
                -
              </button>
              <span className="w-12 text-center text-base font-semibold text-[#111111]">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((current) => current + 1)}
                className="h-12 w-12 text-xl text-[#111111]"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 rounded bg-[#111111] px-6 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-white"
            >
              Add to cart
            </button>
          </div>

          <button
            type="button"
            onClick={handleBuyNow}
            className="mt-3 w-full rounded bg-[#f1f1ef] px-6 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#111111]"
          >
            Buy now
          </button>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {shoppingBenefits.map((benefit) => (
              <div key={benefit.title} className="rounded-[12px] border border-[#e5e1dc] bg-[#f8f6f3] p-3">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#111111] text-xs font-bold text-white">
                  ✓
                </div>
                <div className="text-sm font-semibold text-[#111111]">{benefit.title}</div>
                <div className="mt-1 text-xs leading-5 text-[#5e5c59]">{benefit.detail}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-3 rounded-[12px] border border-[#e5e1dc] bg-[#faf9f7] p-4">
            {fallbackDetails.map((detail) => (
              <div key={detail.label} className="flex items-center justify-between gap-4 border-b border-[#ece7e1] pb-2 last:border-b-0 last:pb-0">
                <span className="text-sm font-medium uppercase tracking-[0.08em] text-[#7a7a7a]">{detail.label}</span>
                <span className="text-sm text-[#111111]">{detail.label === "Delivery" && deliveryEstimate ? deliveryEstimate : detail.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-5 border-t border-[#e5e1dc] pt-6 text-sm uppercase tracking-[0.1em] text-[#111111]">
            <button
              type="button"
              onClick={handleWishlistToggle}
              className="inline-flex items-center gap-2 text-left"
            >
              {isInWishlist ? "Saved to Wishlist" : "Wishlist"}
            </button>
            <button type="button" onClick={handleShare} className="inline-flex items-center gap-2">Share product</button>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-[#e5e1dc] bg-white/95 p-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-[#111111]">{product.name}</div>
          <div className="text-sm text-[#5e5c59]">
            {formatLkrPrice(parsePrice(product.price) * (1 - Number(product.discountPercentage || 0) / 100))}
            {selectedSize ? ` · ${selectedSize}` : ""}
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          className="rounded bg-[#111111] px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-white"
        >
          Add to cart
        </button>
      </div>

      <SizeChartModal isOpen={showSizeChart} onClose={() => setShowSizeChart(false)} />
    </main>
  );
}
