"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getAllCategoriesRealTime } from "@/firebase/categoryModel/categoryModel.ts";
import Link from "next/link";

export interface Category {
  id: string;
  name: string;
  photo?: string;
}

export default function AllCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch categories in real-time
  useEffect(() => {
    const unsubscribeCategories = getAllCategoriesRealTime(
      "categories",
      (fetchedCategories: unknown) => {
        if (Array.isArray(fetchedCategories)) {
          setCategories(fetchedCategories as Category[]);
        } else {
          console.error("Invalid category data format:", fetchedCategories);
        }
      }
    );

    // Clean up listener on unmount
    return () => {
      unsubscribeCategories();
    };
  }, []);

  return (
    <section className="px-6 py-10">
      <h1 className="text-3xl font-bold mb-6 uppercase">All Categories</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-[800px]">
        {categories.map((category) => (
          <Link href={`/categories/${category.id}`} key={category.id}>
            <div className="bg-white shadow-md rounded-lg overflow-hidden border px-5 py-2 h-[150px]">
              {category.photo && (
                <Image
                  src={category.photo}
                  alt={`${category.name} Image`}
                  width={60}
                  height={60}
                  className="object-cover mx-auto"
                />
              )}
              <div className="p-4">
                <h2 className="text-xl font-bold text-center">
                  {category.name}
                </h2>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
