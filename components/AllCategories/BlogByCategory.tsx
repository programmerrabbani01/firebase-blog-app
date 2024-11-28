"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Blog, getBlogsByCategory } from "@/firebase/blogModel/blogModel.ts";
import Link from "next/link";
import { getAllCategoriesRealTime } from "@/firebase/categoryModel/categoryModel.ts";

// Category interface
export interface Category {
  id: string;
  name: string;
  photo?: string;
}

export default function BlogByCategory({ params }: { params: { id: string } }) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const router = useRouter();
  const categoryId = params.id;
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!categoryId) {
      router.push("/categories");
      return;
    }

    const fetchBlogs = async () => {
      const filteredBlogs = await getBlogsByCategory(categoryId);
      console.log("Fetched blogs: ", filteredBlogs);
      setBlogs(filteredBlogs);
    };

    fetchBlogs();
  }, [categoryId, router]);

  // Fetch categories real-time
  useEffect(() => {
    // Fetch categories
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

    return () => {
      unsubscribeCategories();
    };
  }, []);

  // Get category name by ID
  const getCategoryDetails = (categoryId: string | undefined) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category
      ? { name: category.name, photo: category.photo }
      : { name: "Unknown Category", photo: "" };
  };

  const categoryDetails = getCategoryDetails(categoryId);

  const blogsToDisplay = blogs.slice(0, 8); // Limit to 8 blogs

  // Clean and truncate content
  const cleanAndTruncateContent = (htmlContent: string, wordLimit: number) => {
    const tempElement = document.createElement("div");
    tempElement.innerHTML = htmlContent; // Parse HTML content

    // Remove all styles and tags, and get plain text
    const plainText = tempElement.textContent || tempElement.innerText || "";
    const words = plainText.split(" ").slice(0, wordLimit); // Get first n words
    return words.join(" ") + (words.length === wordLimit ? "..." : ""); // Append ellipsis if truncated
  };

  return (
    <section className="px-6 py-10">
      {/* Category Header */}
      <div className="inline-block">
        <div className="mb-6 flex gap-1 items-center bg-[#DBEAFE] hover:bg-[#bed0e7] transition-all duration-300 px-2 py-1 rounded-lg">
          <h1 className="text-lg font-bold uppercase mb-0 text-gray-500">
            Categories /
          </h1>

          <div className="flex items-center gap-2">
            {categoryDetails.photo && (
              <Image
                src={categoryDetails.photo}
                alt={`${categoryDetails.name} Icon`}
                width={25}
                height={25}
                className="rounded-full object-cover"
              />
            )}
            <h1 className="text-lg font-bold uppercase text-gray-500">
              {categoryDetails.name}
            </h1>
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-6 uppercase">Blogs by Category</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {blogsToDisplay.map((blogDisplay) => {
          console.log("Blog object:", blogDisplay); // Log the entire object
          return (
            <div
              key={blogDisplay.id || blogDisplay.slug}
              className="bg-white shadow-md rounded-lg overflow-hidden border h-[300px] flex flex-col"
            >
              {blogDisplay.photo && (
                <Image
                  src={blogDisplay.photo}
                  alt={blogDisplay.title}
                  width={400}
                  height={300}
                  className="w-full h-[200px] object-cover"
                />
              )}
              <div className="p-2">
                <h2 className="text-xl font-bold">
                  <Link href={`/blogs/${blogDisplay.slug}`}>
                    {cleanAndTruncateContent(blogDisplay.title, 5)}
                  </Link>
                </h2>
                <p className="text-gray-500 mt-2">
                  {blogDisplay.content
                    ? cleanAndTruncateContent(blogDisplay.content, 10)
                    : "No content available"}
                  ...
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
