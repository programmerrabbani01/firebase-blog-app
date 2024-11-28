"use client";

import { getAllAuthorsRealTime } from "@/firebase/authorModel/authorModel.ts";
import {
  getAllBlogsRealTime,
  getDeleteABlog,
} from "@/firebase/blogModel/blogModel.ts";
import { getAllCategoriesRealTime } from "@/firebase/categoryModel/categoryModel.ts";
import { createToaster } from "@/utils/tostify.ts";
import { IconX } from "@tabler/icons-react";
import { FieldValue, Timestamp } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { FcViewDetails } from "react-icons/fc";
import DOMPurify from "dompurify";

export interface Blog {
  id: string;
  title: string;
  slug: string;
  photo?: string;
  content: string;
  categoryId?: string;
  authorId?: string;
  createdAt?: Timestamp | FieldValue | null;
  status?: boolean; // Indicates active/inactive status
  trash?: boolean; // Indicates if the category is in the trash
}

// Category interface
export interface Category {
  id: string;
  name: string;
}

// Author interface
export interface Author {
  id: string;
  name: string;
}

export default function GetAllBlog() {
  const [blogs, setBlogs] = useState<Blog[]>([]); // List of all blogs
  const [categories, setCategories] = useState<Category[]>([]); // List of all categories
  const [authors, setAuthors] = useState<Author[]>([]); // List of all authors
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null); // Currently selected blog
  const modalRef = useRef<HTMLDivElement>(null);

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

  // Close modal when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  // Delete a blog
  const handleMoveToTrash = async (id: string, imagePath?: string | null) => {
    try {
      await getDeleteABlog("blogs", id, imagePath);
      setBlogs(blogs.filter((blog) => blog.id !== id)); // Remove from UI

      createToaster(
        `The blog and it's image have been successfully deleted.`,
        "success"
      );
    } catch (error) {
      console.error("Error deleting blog or image:", error);
      createToaster(
        "Something went wrong! Could not delete the blog or image.",
        "error"
      );
    }
  };

  // Function to set the currently selected blog
  const editBlog = (blog: Blog) => {
    setSelectedBlog(blog); // Set the selected blog
  };

  // Get category name by ID
  const getCategoryName = (categoryId: string | undefined) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Unknown Category";
  };

  // Get author name by ID
  const getAuthorName = (authorId: string | undefined) => {
    const author = authors.find((auth) => auth.id === authorId);
    return author ? author.name : "Unknown author";
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
    <section className="pt-10 ">
      {/* table */}
      <table className="w-full table-auto border-collapse text-left shadow-md bg-white ">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border-b font-bold text-sm text-gray-700">
              Sr.
            </th>
            <th className="px-4 py-2 border-b font-bold text-sm text-gray-700">
              Blog Photo
            </th>
            <th className="px-4 py-2 border-b font-bold text-sm text-gray-700">
              Blog Title
            </th>
            <th className="px-4 py-2 border-b font-bold text-sm text-gray-700">
              Blog Slug
            </th>
            <th className="px-4 py-2 border-b font-bold text-sm text-gray-700">
              Blog Category
            </th>
            <th className="px-4 py-2 border-b font-bold text-sm text-gray-700">
              Blog Author
            </th>
            <th className="px-4 py-2 border-b font-bold text-sm text-gray-700">
              Blog Content
            </th>
            <th className="px-4 py-2 border-b font-bold text-sm text-gray-700">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="align-middle">
          {blogs.length > 0 ? (
            blogs.map((blog, index) => (
              <tr key={blog.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{index + 1}</td>
                <td className="px-4 py-2 border-b">
                  {blog.photo ? (
                    <Image
                      src={blog.photo}
                      alt={`${blog.title} Photo`}
                      width={40}
                      height={40}
                      className=""
                    />
                  ) : (
                    <span className="text-gray-500">No Image</span>
                  )}
                </td>
                <td className="px-4 py-2 border-b">
                  {cleanAndTruncateContent(blog.title, 3)}
                </td>
                <td className="px-4 py-2 border-b">{blog.slug}</td>
                <td className="px-4 py-2 border-b">
                  {getCategoryName(blog.categoryId)}
                </td>
                <td className="px-4 py-2 border-b">
                  {getAuthorName(blog.authorId)}
                </td>
                <td className="px-4 py-2 border-b">
                  {cleanAndTruncateContent(blog.content, 5)}
                </td>
                <td className="px-4 py-2 border-b space-x-4">
                  <Link
                    href=""
                    onClick={() => {
                      setSelectedBlog(blog);
                      setIsModalOpen(true);
                    }}
                    className="inline-block  px-4 py-2 rounded-md text-white bg-indigo-500 hover:bg-indigo-400  transition-all duration-300"
                  >
                    <FcViewDetails />
                  </Link>
                  <Link
                    href={`/admin/blogs/edit?id=${blog.id}`} // Pass the ID for editing
                    className="inline-block bg-blue-500 px-4 py-2 rounded-md text-white hover:bg-blue-400 transition-all duration-300"
                    onClick={() => editBlog(blog)} // Set the selected blog
                  >
                    <FaEdit />
                  </Link>
                  <Link
                    href=""
                    onClick={() => handleMoveToTrash(blog.id, blog.photo)}
                    className="inline-block bg-red-500 px-4 py-2 rounded-md text-white hover:bg-red-400 transition-all duration-300"
                  >
                    <FaTrash />
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-3 text-center text-gray-500 font-bold text-xl"
              >
                No Blogs found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      {isModalOpen && selectedBlog && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
          <div
            ref={modalRef}
            className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg relative overflow-y-auto max-h-[90vh]"
          >
            {/* Close button */}
            <div
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={() => setIsModalOpen(false)}
            >
              <IconX
                stroke={2}
                className="w-8 h-8 p-2 bg-[#E4E6E9] rounded-full"
              />
            </div>

            {/* Blog details */}
            {selectedBlog.photo && (
              <div className="flex justify-center mb-4">
                <Image
                  src={selectedBlog.photo}
                  alt={`${selectedBlog.title} Photo`}
                  width={400}
                  height={300}
                  className="object-cover rounded-md"
                />
              </div>
            )}
            <h2 className="text-xl font-bold mb-4">{selectedBlog.title}</h2>
            <p className="mb-2">
              <strong>Slug:</strong> {selectedBlog.slug}
            </p>
            <p className="mb-2">
              <strong>Category:</strong>
              {getCategoryName(selectedBlog.categoryId)}
            </p>
            <p className="mb-2">
              <strong>Author:</strong> {getAuthorName(selectedBlog.authorId)}
            </p>
            <div className="overflow-y-auto">
              <p className="mb-2">
                <strong>Content:</strong>
              </p>
              <div
                className="prose max-w-full text-gray-700 [&_img]:w-72 [&_img]:h-72 [&_img]:object-cover [&_img]:rounded-md [&_img]:my-5 [&_img]:mx-auto [&_img]:block"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(selectedBlog.content),
                }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
