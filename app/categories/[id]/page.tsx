import BlogByCategory from "@/components/AllCategories/BlogByCategory.tsx";
import React from "react";

export default function page({ params }: { params: { id: string } }) {
  return (
    <>
      <BlogByCategory params={params} />
    </>
  );
}
