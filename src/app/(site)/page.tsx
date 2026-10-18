import Home from "@/components/Home";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "GLEAZ | Modern Fashion & Clothing Sri Lanka | gleaz.lk",
  description:
    "Shop contemporary apparel and modern fashion at GLEAZ. Discover elevated everyday style online at gleaz.lk.",
  keywords: [
    "GLEAZ",
    "gleaz.lk",
    "GLEAZ clothing",
    "fashion Sri Lanka",
    "online shopping Sri Lanka",
  ],
  openGraph: {
    title: "GLEAZ | Modern Fashion & Apparel",
    description: "Elevated everyday fashion at gleaz.lk",
    url: "https://gleaz.lk",
    siteName: "GLEAZ",
    locale: "en_LK",
    type: "website",
  },
};

export default async function HomePage() {
  return <Home />;
}
