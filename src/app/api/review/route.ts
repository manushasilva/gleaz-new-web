import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prismaDB";

const reviewStorePath = path.join(process.cwd(), "data", "reviews.json");

const readReviewStore = async () => {
  try {
    const raw = await fs.readFile(reviewStorePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeReviewStore = async (reviews: unknown[]) => {
  await fs.mkdir(path.dirname(reviewStorePath), { recursive: true });
  await fs.writeFile(reviewStorePath, JSON.stringify(reviews, null, 2), "utf8");
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, productSlug, rating, comment } = body ?? {};
  const hasDatabase = Boolean(process.env.DATABASE_URL);

  if (action === "create") {
    const normalizedRating = Number(rating);
    const normalizedComment = String(comment ?? "").trim();
    const normalizedSlug = String(productSlug ?? "").trim();

    if (!normalizedSlug) {
      return NextResponse.json({ error: "Product slug is required." }, { status: 400 });
    }

    if (!Number.isInteger(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
    }

    if (!normalizedComment) {
      return NextResponse.json({ error: "Please add a short review comment." }, { status: 400 });
    }

    try {
      if (!hasDatabase) {
        const reviews = await readReviewStore();
        const review = {
          id: crypto.randomUUID(),
          productSlug: normalizedSlug,
          rating: normalizedRating,
          comment: normalizedComment,
          isApproved: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await writeReviewStore([...reviews, review]);
        return NextResponse.json({ success: true, review }, { status: 201 });
      }

      const review = await prisma.review.create({
        data: {
          productSlug: normalizedSlug,
          rating: normalizedRating,
          comment: normalizedComment,
          isApproved: false,
        },
      });

      return NextResponse.json({ success: true, review }, { status: 201 });
    } catch (error) {
      console.error("Unable to create review", error);
      return NextResponse.json({ error: "Unable to submit review." }, { status: 500 });
    }
  }

  const normalizedProductSlug = String(productSlug ?? "").trim();

  if (!normalizedProductSlug) {
    return NextResponse.json({ error: "Product slug is required." }, { status: 400 });
  }

  try {
    if (!hasDatabase) {
      const reviews = await readReviewStore();
      const filteredReviews = reviews
        .filter((review) => review && typeof review === "object" && "productSlug" in review && review.productSlug === normalizedProductSlug)
        .sort((a, b) => new Date(String(b.createdAt ?? 0)).getTime() - new Date(String(a.createdAt ?? 0)).getTime());

      return NextResponse.json({ review: filteredReviews }, { status: 200 });
    }

    const reviews = await prisma.review.findMany({
      where: {
        AND: [
          { productSlug: normalizedProductSlug },
          { isApproved: true },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ review: reviews }, { status: 200 });
  } catch (error) {
    console.error("Unable to load reviews", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

