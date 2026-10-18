"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { useAppSelector } from "@/redux/store";
import SizeChartModal from "@/components/Common/SizeChartModal";
import { getProductVariantItemCode, type ProductColorVariant } from "@/types/product";

type StoreProduct = {
  id: string;
  name: string;
  category: "women" | "men" | "accessories";
  price: string;
  discountPercentage?: number | string; // <--- Added this property
  image: string;
  images?: string[];
  badge: string;
  tone: string;
  slug: string;
  description?: string;
  sizes?: string[];
  colors?: string[];
  colorVariants?: ProductColorVariant[];
  quantity?: number;
};

const fallbackDetails = [
  { label: "Fabric", value: "Premium cotton blend" },
  { label: "Fit", value: "Regular fit" },
  { label: "Delivery", value: "2-4 working days" },
];

const findSizeVariant = (variant: ProductColorVariant | undefined, size: string) =>
  variant?.sizeVariants?.find((item) => item.size.toLowerCase() === size.toLowerCase());

const standardSizeOrder = ["XS", "S", "M", "L", "XL", "XXL"];
const sortSizes = (sizes: string[]) =>
  [...sizes].sort((a, b) => {
    const aIndex = standardSizeOrder.indexOf(a.toUpperCase());
    const bIndex = standardSizeOrder.indexOf(b.toUpperCase());
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

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
  const { addItem, clearCart, cartDetails } = useCart();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [selectedItemCode, setSelectedItemCode] = useState<string>("");
  const [selectedGalleryImage, setSelectedGalleryImage] = useState("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [deliveryEstimate, setDeliveryEstimate] = useState("");
  const [reviews, setReviews] = useState<Array<{ id: string; rating: number; comment: string | null; createdAt?: string | Date; }>>([]);
  const [reviewSummary, setReviewSummary] = useState({ average: 0, count: 0 });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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
  const colorVariants = useMemo(() => {
    if (!product) return [];
    if (product.colorVariants?.length) return product.colorVariants;
    const images = product.images?.length ? product.images : product.image ? [product.image] : [];
    return (product.colors?.length ? product.colors : product.tone ? [product.tone] : []).map((color) => ({
      itemCode: color,
      name: color,
      color,
      price: product.price,
      images,
    }));
  }, [product]);
  const availableSizes = useMemo(() => {
    if (!product?.sizes?.length) return [];
    return sortSizes(product.sizes.filter((size) => colorVariants.some((variant) => {
      if (!variant.sizeVariants) return product.quantity === undefined || product.quantity > 0;
      return Number(findSizeVariant(variant, size)?.quantity || 0) > 0;
    })));
  }, [product?.sizes, product?.quantity, colorVariants]);
  const availableColorVariants = selectedSize
    ? colorVariants.filter((variant) => {
      if (!variant.sizeVariants) return product?.quantity === undefined || product.quantity > 0;
      return Number(findSizeVariant(variant, selectedSize)?.quantity || 0) > 0;
    })
    : colorVariants;
  const activeColorVariant =
    availableColorVariants.find((variant) => getProductVariantItemCode(variant) === selectedItemCode) ||
    availableColorVariants[0] ||
    colorVariants.find((variant) => getProductVariantItemCode(variant) === selectedItemCode) ||
    colorVariants[0];
  const selectedSizeVariant = findSizeVariant(activeColorVariant, selectedSize);
  const availableQuantity = activeColorVariant?.sizeVariants?.length
    ? Number(selectedSizeVariant?.quantity || 0)
    : product?.quantity;

  useEffect(() => {
    if (!product?.slug) {
      setReviews([]);
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
        const reviewList = Array.isArray(result.review) ? result.review : [];
        const ratings = reviewList
          .map((review: { rating?: unknown }) => Number(review.rating))
          .filter((rating: number) => Number.isFinite(rating) && rating >= 1 && rating <= 5);

        setReviews(reviewList);
        setReviewSummary({
          average: ratings.length ? ratings.reduce((total: number, rating: number) => total + rating, 0) / ratings.length : 0,
          count: ratings.length,
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          setReviews([]);
          setReviewSummary({ average: 0, count: 0 });
        }
      }
    };

    loadReviews();
    return () => controller.abort();
  }, [product?.slug]);

  useEffect(() => {
    if (colorVariants.length) {
      const initialSize = availableSizes[0] || product?.sizes?.[0] || "";
      const initialColor = colorVariants.find((variant) =>
        !variant.sizeVariants ||
        Number(findSizeVariant(variant, initialSize)?.quantity || 0) > 0
      );
      setSelectedItemCode(getProductVariantItemCode(initialColor || colorVariants[0]));
    }
    if (product?.sizes?.length) {
      setSelectedSize(availableSizes[0] || product.sizes[0]);
    } else {
      setSelectedSize("");
    }
  }, [product?.id, product?.sizes, colorVariants, availableSizes]);

  useEffect(() => {
    setSelectedGalleryImage(activeColorVariant?.images?.[0] || product?.images?.[0] || product?.image || "");
  }, [product?.id, selectedItemCode, activeColorVariant?.images, product?.images, product?.image]);

  const parsePrice = (value: string) => {
    const numericValue = value.replace(/[^\d.]/g, "");
    return Number(numericValue) || 0;
  };

  const formatLkrPrice = (value: string | number) => {
    const numericValue = typeof value === "number" ? value : Number(String(value).replace(/[^\d.]/g, ""));
    if (!Number.isFinite(numericValue)) return "LKR 0";
    return `LKR ${new Intl.NumberFormat("en-LK").format(numericValue)}`;
  };

  const gallery = Array.from(new Set(
    (activeColorVariant?.images?.length
      ? activeColorVariant.images
      : product?.images?.length ? product.images : product?.image ? [product.image] : []
    ).filter(Boolean)
  ));
  const isInWishlist = Boolean(product && wishlistItems.some((item) => item.id === product.id));

  const handleWishlistToggle = () => {
    if (!product) return;

    const basePrice = parsePrice(selectedSizeVariant?.price || activeColorVariant?.price || product.price);
    const discountedPrice = Number(product.discountPercentage) > 0
      ? Math.round(basePrice * (1 - Number(product.discountPercentage) / 100))
      : basePrice;

    addItemToWishlist({
      id: product.id,
      title: product.name,
      slug: product.slug,
      image: activeColorVariant?.images[0] || product.image,
      price: discountedPrice,
      quantity,
      color: activeColorVariant ? getProductVariantItemCode(activeColorVariant) : selectedItemCode,
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
    const size = availableSizes[0] || product?.sizes?.[0] || "";
    const color = colorVariants.find((variant) =>
      !variant.sizeVariants ||
      Number(findSizeVariant(variant, size)?.quantity || 0) > 0
    );
    setSelectedSize(size);
    setSelectedItemCode(color ? getProductVariantItemCode(color) : colorVariants[0] ? getProductVariantItemCode(colorVariants[0]) : "");
    setQuantity(1);
  };

  const selectedCartItemId = product
    ? `${product.id}-${activeColorVariant ? getProductVariantItemCode(activeColorVariant) : selectedItemCode || "default"}-${selectedSize || "default"}`
    : "";
  const quantityAlreadyInCart = Number(cartDetails?.[selectedCartItemId]?.quantity || 0);
  const remainingQuantity = availableQuantity === undefined
    ? undefined
    : Math.max(availableQuantity - quantityAlreadyInCart, 0);

  useEffect(() => {
    if (remainingQuantity !== undefined) {
      setQuantity((current) => Math.max(1, Math.min(current, Math.max(remainingQuantity, 1))));
    }
  }, [remainingQuantity]);

  const handleSizeSelection = (size: string) => {
    setSelectedSize(size);
    const nextAvailableColors = colorVariants.filter((variant) =>
      !variant.sizeVariants ||
      Number(findSizeVariant(variant, size)?.quantity || 0) > 0
    );
    if (!nextAvailableColors.some((variant) => getProductVariantItemCode(variant) === selectedItemCode)) {
      setSelectedItemCode(nextAvailableColors[0] ? getProductVariantItemCode(nextAvailableColors[0]) : "");
    }
    setQuantity(1);
  };

  const addProductToCart = () => {
    if (!product) return;

    const availableColors = availableColorVariants;
    const hasSizeSelection = !product.sizes || product.sizes.length === 0 || Boolean(selectedSize);
    const hasColorSelection = availableColors.length === 0 || Boolean(activeColorVariant);
    const basePrice = parsePrice(selectedSizeVariant?.price || activeColorVariant?.price || product.price);
    const discountedPrice = Number(product.discountPercentage) > 0
      ? Math.round(basePrice * (1 - Number(product.discountPercentage) / 100))
      : basePrice;

    if (!hasSizeSelection) {
      toast.error("Please select a size before adding this product.");
      return false;
    }

    if (!hasColorSelection) {
      toast.error("Please select an item code before adding this product.");
      return false;
    }

    if (availableQuantity !== undefined && quantity + quantityAlreadyInCart > availableQuantity) {
      toast.error("There is not enough stock for that quantity.");
      return false;
    }

    const cartItem = {
      id: selectedCartItemId,
      productId: product.id,
      name: product.name,
      price: discountedPrice,
      quantity,
      ...(availableQuantity !== undefined ? { availableQuantity } : {}),
      image: activeColorVariant?.images[0] || product.image,
      itemCode: activeColorVariant ? getProductVariantItemCode(activeColorVariant) : selectedItemCode,
      variantColor: activeColorVariant?.color,
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
    if (!product) return;

    const availableColors = availableColorVariants;
    const hasSizeSelection = !product.sizes || product.sizes.length === 0 || Boolean(selectedSize);
    const hasColorSelection = availableColors.length === 0 || Boolean(activeColorVariant);
    const basePrice = parsePrice(selectedSizeVariant?.price || activeColorVariant?.price || product.price);
    const discountedPrice = Number(product.discountPercentage) > 0
      ? Math.round(basePrice * (1 - Number(product.discountPercentage) / 100))
      : basePrice;

    if (!hasSizeSelection) {
      toast.error("Please select a size before buying this product.");
      return;
    }

    if (!hasColorSelection) {
      toast.error("Please select an item code before buying this product.");
      return;
    }

    if (availableQuantity !== undefined && quantity > availableQuantity) {
      toast.error("There is not enough stock for that quantity.");
      return;
    }

    clearCart();
    addItem({
      id: selectedCartItemId,
      productId: product.id,
      name: product.name,
      price: discountedPrice,
      quantity,
      ...(availableQuantity !== undefined ? { availableQuantity } : {}),
      image: activeColorVariant?.images[0] || product.image,
      itemCode: activeColorVariant ? getProductVariantItemCode(activeColorVariant) : selectedItemCode,
      variantColor: activeColorVariant?.color,
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

  const basePrice = parsePrice(selectedSizeVariant?.price || activeColorVariant?.price || product.price);
  const discountRate = Math.min(Math.max(Number(product.discountPercentage) || 0, 0), 100) / 100;
  const currentUnitPrice = Math.round(basePrice * (1 - discountRate));
  const totalSavings = Math.max(basePrice - currentUnitPrice, 0) * quantity;
  const shippingThreshold = 4500;
  const cartLineTotal = currentUnitPrice * quantity;
  const shippingProgress = Math.min((cartLineTotal / shippingThreshold) * 100, 100);
  const amountUntilFreeShipping = Math.max(shippingThreshold - cartLineTotal, 0);
  const reviewDistribution = Array.from({ length: 5 }, (_, index) => {
    const star = 5 - index;
    const count = reviews.filter((review) => Number(review.rating) === star).length;
    return {
      star,
      count,
      percent: reviewSummary.count ? (count / reviewSummary.count) * 100 : 0,
    };
  });

  const handleReviewSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!product || !reviewForm.comment.trim()) {
      toast.error("Please add a short review before submitting.");
      return;
    }

    setIsSubmittingReview(true);

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          productSlug: product.slug,
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Unable to submit review.");
      }

      const nextReviews = Array.isArray(result.review) ? result.review : [result.review].filter(Boolean);
      const nextRatings = nextReviews
        .map((review: { rating?: unknown }) => Number(review.rating))
        .filter((rating: number) => Number.isFinite(rating) && rating >= 1 && rating <= 5);

      setReviews(nextReviews);
      setReviewSummary({
        average: nextRatings.length ? nextRatings.reduce((total: number, rating: number) => total + rating, 0) / nextRatings.length : 0,
        count: nextRatings.length,
      });
      setReviewForm({ rating: 5, comment: "" });
      toast.success("Thanks! Your review has been submitted and is awaiting approval.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

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
                  onClick={() => setSelectedGalleryImage(image)}
                  aria-pressed={selectedGalleryImage === image}
                  className={`overflow-hidden rounded-md border bg-[#f5f3f0] p-1 ${selectedGalleryImage === image ? "border-[#111111]" : "border-[#ded9d2]"}`}
                  aria-label={`View product thumbnail ${index + 1}`}
                >
                  <img src={image} alt={`${product.name} thumbnail ${index + 1}`} className="h-24 w-full object-cover" />
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-[12px] border border-[#e2dfda] bg-[#f4f0eb] p-3">
              <img
                src={selectedGalleryImage || gallery[0] || product.image}
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
              {availableQuantity === 0 ? "Out of stock" : product.badge || "In stock"}
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
                  {formatLkrPrice(currentUnitPrice)}
                </span>
                <span className="text-[1.2rem] text-[#7a7a7a] line-through">
                  {formatLkrPrice(basePrice)}
                </span>
              </>
            ) : (
              <span className="text-[2rem] font-bold text-[#111111]">{formatLkrPrice(basePrice)}</span>
            )}
          </div>

          {discountRate > 0 && (
            <p className="mt-2 text-sm font-medium text-[#1e8057]">
              You save {formatLkrPrice(totalSavings)}{quantity > 1 ? ` on ${quantity} items` : ""}
            </p>
          )}

          <div className="mt-5 rounded-xl border border-[#e5e1dc] bg-[#faf9f7] p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-[#111111]">
                {amountUntilFreeShipping === 0 ? "Free shipping unlocked" : "You're close to free shipping"}
              </span>
              <span className="shrink-0 text-xs font-medium text-[#686662]">
                {amountUntilFreeShipping === 0 ? "✓ Unlocked" : `${formatLkrPrice(amountUntilFreeShipping)} to go`}
              </span>
            </div>
            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-[#e7e3dd]"
              role="progressbar"
              aria-label="Progress toward free shipping"
              aria-valuemin={0}
              aria-valuemax={shippingThreshold}
              aria-valuenow={Math.min(cartLineTotal, shippingThreshold)}
            >
              <div
                className="h-full rounded-full bg-[#1c8d60] transition-[width] duration-300"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
            <p className="mt-2 text-xs leading-5 text-[#686662]">
              {amountUntilFreeShipping === 0
                ? "This item qualifies for free shipping."
                : `Add ${formatLkrPrice(amountUntilFreeShipping)} to your order to qualify.`}
            </p>
          </div>

          <p className="mt-6 text-[1.05rem] leading-8 text-[#4d4d4d]">
            {product.description || "Crafted for a premium everyday look with refined comfort and modern styling."}
          </p>

          <div className="mt-8 grid gap-3 rounded-[12px] border border-[#e5e1dc] bg-[#f7f5f2] p-4 sm:grid-cols-3">
            <div>
              <div className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#7a7a7a]">Buy</div>
              <div className="mt-1 text-base font-semibold text-[#111111]">{availableQuantity === 0 ? "Out of stock" : product.badge || "Available"}</div>
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
                {sortSizes(product.sizes).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeSelection(size)}
                    disabled={!availableSizes.includes(size)}
                    aria-pressed={selectedSize === size}
                    aria-label={`${size}${availableSizes.includes(size) ? "" : " - out of stock"}`}
                    className={`min-w-[52px] rounded-md border px-4 py-2 text-sm font-medium transition ${
                      selectedSize === size
                        ? "border-[#111111] bg-[#111111] text-white"
                        : availableSizes.includes(size)
                          ? "border-[#d7d4cf] bg-white text-[#111111]"
                          : "cursor-not-allowed border-[#e5e1dc] bg-[#f4f3f1] text-[#aaa] line-through"
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
              Select item code{activeColorVariant ? `: ${getProductVariantItemCode(activeColorVariant)}` : ""}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {availableColorVariants.map((variant, idx) => (
                <button
                  key={`${getProductVariantItemCode(variant)}-${idx}`}
                  type="button"
                  aria-label={`Choose item code ${getProductVariantItemCode(variant)}`}
                  title={getProductVariantItemCode(variant)}
                  onClick={() => {
                    setSelectedItemCode(getProductVariantItemCode(variant));
                    setSelectedGalleryImage(variant.images?.[0] || product.image);
                    setQuantity(1);
                  }}
                  aria-pressed={selectedItemCode === getProductVariantItemCode(variant)}
                  className={`h-[76px] w-[76px] overflow-hidden border bg-white p-1 transition ${
                    selectedItemCode === getProductVariantItemCode(variant)
                      ? "border-[#111111] ring-1 ring-[#111111]"
                      : "border-[#d7d4d0] hover:border-[#111111]"
                  }`}
                >
                  {variant.images?.[0] || product.image ? (
                    <img
                      src={variant.images?.[0] || product.image}
                      alt={`${getProductVariantItemCode(variant)} main image`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span aria-hidden="true" className="block h-full w-full" style={{ backgroundColor: variant.color }} />
                  )}
                </button>
              ))}
            </div>
            {activeColorVariant?.sizeVariants?.length ? (
              <p className="mt-2 text-xs text-[#6a6a6a]" aria-live="polite">
                {availableQuantity ? `${availableQuantity} available in this size and item variant` : "Out of stock in this size and item variant"}
              </p>
            ) : null}
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
                disabled={quantity <= 1}
                className="h-12 w-12 text-xl text-[#111111]"
              >
                -
              </button>
              <span className="w-12 text-center text-base font-semibold text-[#111111]">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.min(current + 1, remainingQuantity ?? current + 1))}
                disabled={remainingQuantity !== undefined && quantity >= remainingQuantity}
                className="h-12 w-12 text-xl text-[#111111]"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={availableQuantity === 0 || (remainingQuantity !== undefined && remainingQuantity < 1)}
              className="flex-1 rounded bg-[#111111] px-6 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {availableQuantity === 0 ? "Out of stock" : "Add to cart"}
            </button>
          </div>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={availableQuantity === 0 || quantity > (availableQuantity ?? quantity)}
            className="mt-3 w-full rounded bg-[#f1f1ef] px-6 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#111111] disabled:cursor-not-allowed disabled:opacity-50"
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

      <section className="mt-12 rounded-[22px] border border-[#e5e1dc] bg-[#f8f6f3] p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6a6a6a]">Customer love</div>
            <h2 className="mt-2 text-2xl font-medium text-[#111111]">What shoppers are saying</h2>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#e1ddd6] bg-white px-3 py-2 text-sm text-[#111111] shadow-sm">
            <span className="text-base text-amber-500">★</span>
            <span className="font-semibold">{reviewSummary.count ? reviewSummary.average.toFixed(1) : "0.0"}</span>
            <span className="text-[#6b6966]">({reviewSummary.count} review{reviewSummary.count === 1 ? "" : "s"})</span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[18px] border border-[#e3dfd9] bg-white p-4 shadow-sm">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-semibold text-[#111111]">{reviewSummary.count ? reviewSummary.average.toFixed(1) : "0.0"}</span>
              <span className="pb-1 text-xs text-[#6b6966]">/ 5.0</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-lg text-amber-500" aria-label="Average rating">
              {Array.from({ length: 5 }, (_, index) => (
                <span key={index}>{index < Math.round(reviewSummary.average || 0) ? "★" : "☆"}</span>
              ))}
            </div>
            <div className="mt-5 space-y-2.5">
              {reviewDistribution.map((item) => (
                <div key={item.star} className="grid grid-cols-[28px_1fr_26px] items-center gap-2 text-xs text-[#353432]">
                  <span>{item.star}★</span>
                  <div className="h-2 overflow-hidden rounded-full bg-[#efeae4]">
                    <div className="h-full rounded-full bg-[#111111]" style={{ width: `${item.percent}%` }} />
                  </div>
                  <span className="text-right text-[#6b6966]">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[18px] border border-[#e3dfd9] bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#111111]">Recent reviews</h3>
              <span className="rounded-full bg-[#f3f0ed] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[#6b6966]">
                {reviews.length}
              </span>
            </div>

            <div className="space-y-3">
              {reviews.length > 0 ? (
                reviews.slice(0, 3).map((review) => (
                  <article key={review.id} className="rounded-[14px] border border-[#eee9e3] bg-[#faf9f7] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111111] text-xs font-semibold text-white">
                          {String(review.comment ?? "C").trim().charAt(0).toUpperCase() || "C"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#111111]">Verified customer</p>
                          <p className="text-[11px] text-[#6b6966]">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Recently"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-sm text-amber-500" aria-label={`${review.rating} star review`}>
                        {Array.from({ length: 5 }, (_, index) => (
                          <span key={`${review.id}-${index}`}>{index < Number(review.rating) ? "★" : "☆"}</span>
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#4d4d4d]">“{review.comment || "Great product and great fit."}”</p>
                  </article>
                ))
              ) : (
                <div className="rounded-[14px] border border-dashed border-[#d9d4cf] bg-[#f5f3f0] p-4 text-sm text-[#6b6966]">
                  No customer reviews yet. Be the first to share your feedback.
                </div>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleReviewSubmit} className="mt-6 rounded-[18px] border border-[#e3dfd9] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6a6a6a]">Share your experience</div>
              <h3 className="mt-1 text-xl font-medium text-[#111111]">Write a customer review</h3>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-[#ede8e3] bg-[#faf7f5] px-2 py-1.5">
              {Array.from({ length: 5 }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setReviewForm((current) => ({ ...current, rating: index + 1 }))}
                  className={`text-xl transition ${index < reviewForm.rating ? "text-amber-500" : "text-[#d9d2ca]"}`}
                  aria-label={`Set rating to ${index + 1}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="customer-review" className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-[#111111]">
              Your review
            </label>
            <textarea
              id="customer-review"
              value={reviewForm.comment}
              onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))}
              rows={4}
              placeholder="Tell other shoppers what you loved about this product..."
              className="w-full rounded-[14px] border border-[#ddd7d1] bg-[#f9f7f5] px-3 py-2.5 text-sm text-[#111111] outline-none transition focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10"
            />
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#6b6966]">
              Reviews are checked before approval.
            </p>
            <button
              type="submit"
              disabled={isSubmittingReview || !reviewForm.comment.trim()}
              className="inline-flex items-center justify-center rounded bg-[#111111] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#262626] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmittingReview ? "Submitting..." : "Submit review"}
            </button>
          </div>
        </form>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-[#e5e1dc] bg-white/95 p-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-[#111111]">{product.name}</div>
          <div className="text-sm text-[#5e5c59]">
            {formatLkrPrice(currentUnitPrice)}
            {selectedSize ? ` · ${selectedSize}` : ""}
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={availableQuantity === 0 || (remainingQuantity !== undefined && remainingQuantity < 1)}
          className="rounded bg-[#111111] px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add to cart
        </button>
      </div>

      <SizeChartModal isOpen={showSizeChart} onClose={() => setShowSizeChart(false)} />
    </main>
  );
}
