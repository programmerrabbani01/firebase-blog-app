"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getAllBlogsRealTime } from "@/firebase/blogModel/blogModel.ts";
import { getAllCategoriesRealTime } from "@/firebase/categoryModel/categoryModel.ts";
import { getAllAuthorsRealTime } from "@/firebase/authorModel/authorModel.ts";
import { FieldValue, Timestamp } from "firebase/firestore";
import Link from "next/link";

export interface Blog {
  id?: string;
  title: string;
  slug: string;
  photo?: string;
  content: string;
  categoryId?: string;
  authorId?: string;
  createdAt?: Timestamp | FieldValue | null;
  updatedAt?: Timestamp | FieldValue | null;
  status?: boolean; // Indicates active/inactive status
  trash?: boolean; // Indicates if the category is in the trash
}

// Category interface
export interface Category {
  id: string;
  name: string;
  photo?: string;
}

// Author interface
export interface Author {
  id: string;
  name: string;
  photo?: string;
}
export default function AllBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]); // List of all blogs
  const [categories, setCategories] = useState<Category[]>([]); // List of all categories
  const [authors, setAuthors] = useState<Author[]>([]); // List of all authors

  // Fetch blogs, categories, and authors in real-time
  useEffect(() => {
    const unsubscribe = getAllBlogsRealTime(
      "blogs",
      (fetchedBlogs: unknown) => {
        // Type guard to ensure correct typing
        if (Array.isArray(fetchedBlogs)) {
          setBlogs(fetchedBlogs as Blog[]);
        } else {
          console.error("Invalid data format:", fetchedBlogs);
        }
      }
    );

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

    // Fetch authors
    const unsubscribeAuthors = getAllAuthorsRealTime(
      "authors",
      (fetchedAuthors: unknown) => {
        if (Array.isArray(fetchedAuthors)) {
          setAuthors(fetchedAuthors as Author[]);
        } else {
          console.error("Invalid author data format:", fetchedAuthors);
        }
      }
    );

    return () => {
      unsubscribe(); // Clean up listener on unmount
      unsubscribeCategories();
      unsubscribeAuthors();
    };
  }, []);

  // Get category name by ID
  const getCategoryName = (categoryId: string | undefined) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category
      ? { name: category.name, photo: category.photo }
      : { name: "Unknown Category", photo: "" };
  };

  // Get author name by ID
  const getAuthorName = (authorId: string | undefined) => {
    const author = authors.find((auth) => auth.id === authorId);
    return author
      ? { name: author.name, photo: author.photo }
      : { name: "Unknown author", photo: "" };
  };

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
      <h1 className="text-3xl font-bold mb-6 uppercase">All Blogs</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {blogs.map((blog) => (
          <Link key={blog.id} href={`/blogs/${blog.slug}`}>
            <div className="bg-white shadow-md rounded-lg overflow-hidden border">
              {/* Blog details */}
              {blog.photo && (
                <div className="flex justify-center relative">
                  <Image
                    src={blog.photo}
                    alt={`${blog.title} Photo`}
                    width={400}
                    height={300}
                    className="w-full h-[200px] object-cover rounded-t-md "
                  />
                  {blog.categoryId && (
                    <div className="absolute top-2 right-4 bg-[#DBEAFE] hover:bg-[#bed0e7] transition-all duration-300 px-4 py-1 rounded-lg flex items-center gap-2">
                      {/* Category Image */}
                      {getCategoryName(blog.categoryId).photo && (
                        <Image
                          src={getCategoryName(blog.categoryId).photo!}
                          alt={`${getCategoryName(blog.categoryId).name} Icon`}
                          width={15}
                          height={15}
                          className="rounded-full object-cover"
                        />
                      )}
                      {/* Category Name */}
                      <p className="font-bold">
                        {getCategoryName(blog.categoryId).name}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="p-2">
                <div className="">
                  <h2 className="text-xl font-bold mb-3">
                    {cleanAndTruncateContent(blog.title, 5)}
                  </h2>
                </div>

                {blog.authorId && (
                  <div className="max-w-fit bg-[#DBEAFE] hover:bg-[#bed0e7] transition-all duration-300 px-4 py-1 rounded-lg flex items-center gap-2">
                    {/* Category Image */}
                    {getAuthorName(blog.authorId).photo && (
                      <Image
                        src={getAuthorName(blog.authorId).photo!}
                        alt={`${getAuthorName(blog.authorId).name} Icon`}
                        width={30}
                        height={30}
                        className="rounded-full object-cover"
                      />
                    )}
                    {/* Category Name */}
                    <p className="font-bold text-gray-500">
                      {getAuthorName(blog.authorId).name}
                    </p>
                  </div>
                )}

                <h5 className="text-xs text-gray-500 font-bold mt-3">
                  {blog.updatedAt instanceof Timestamp
                    ? `Updated on: ${blog.updatedAt
                        .toDate()
                        .toLocaleDateString()}`
                    : blog.createdAt instanceof Timestamp
                    ? `Created on: ${blog.createdAt
                        .toDate()
                        .toLocaleDateString()}`
                    : "Date not available"}
                </h5>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
