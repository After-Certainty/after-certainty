import type { Metadata } from "next";
import { BookLanding } from "@/components/books/when-others-look-to-you/sections/BookLanding";
import { assets, bookPageContent, woltyBasePath } from "@/lib/books/when-others-look-to-you/content";
import { buildPageMetadata } from "@/lib/books/when-others-look-to-you/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "The Book",
    description:
      "When Others Look to You — renewal and erosion in leadership. Find where to read the book.",
    path: `${woltyBasePath}/book`,
    image: assets.bookCover,
  });
}

export default function BookRoute() {
  return <BookLanding content={bookPageContent} />;
}
