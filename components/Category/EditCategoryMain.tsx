"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  getAllCategoriesRealTime,
  Category,
} from "@/firebase/categoryModel/categoryModel.ts";
import EditACategory from "./EditACategory.tsx";

export default function EditCategoryMain() {
  const [categoryData, setCategoryData] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("id"); // Get the `id` from the URL

  useEffect(() => {
    const unsubscribe = getAllCategoriesRealTime("categories", setCategories);
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (categories.length > 0 && categoryId) {
      // Find the category matching the `id`
      const selectedCategory = categories.find((cat) => cat.id === categoryId);
      setCategoryData(selectedCategory || null);
    }
  }, [categories, categoryId]);

  if (!categoryData) {
    return <div>Loading category data...</div>;
  }

  return (
    <div className="p-6 w-full">
      <EditACategory category={categoryData} setCategories={setCategories} />
    </div>
  );
}
