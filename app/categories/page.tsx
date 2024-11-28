import AllCategories from "@/components/AllCategories/AllCategories.tsx";
import React from "react";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Categories", // Static title for the Categories page
    description: "Browse all categories of blogs", // Static description
  };
}
export default function CategoriesPage() {
  return (
    <>
      <AllCategories />
    </>
  );
}
