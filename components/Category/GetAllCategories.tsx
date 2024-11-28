"use client";

import {
  getAllCategoriesRealTime,
  getDeleteACategory,
} from "@/firebase/categoryModel/categoryModel.ts";
import { createToaster } from "@/utils/tostify.ts";
import { IconX } from "@tabler/icons-react";
import { FieldValue, Timestamp } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { FcViewDetails } from "react-icons/fc";

export interface Category {
  id: string;
  name: string;
  slug: string;
  photo?: string;
  createdAt?: Timestamp | FieldValue | null;
  status?: boolean; // Indicates active/inactive status
  trash?: boolean; // Indicates if the category is in the trash
}

export default function GetAllCategory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  ); // Currently selected category for editing
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const modalRef = useRef<HTMLDivElement>(null);

  // Get all categories
  useEffect(() => {
    const unsubscribe = getAllCategoriesRealTime(
      "categories",
      (fetchedCategories: unknown) => {
        // Type guard to ensure correct typing
        if (Array.isArray(fetchedCategories)) {
          setCategories(fetchedCategories as Category[]);
        } else {
          console.error("Invalid data format:", fetchedCategories);
        }
      }
    );

    return () => {
      unsubscribe(); // Clean up listener on unmount
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

  // Delete a category
  const handleMoveToTrash = async (id: string, imagePath?: string | null) => {
    try {
      await getDeleteACategory("categories", id, imagePath);
      setCategories(categories.filter((category) => category.id !== id)); // Remove from UI

      createToaster(
        `The category and it's image have been successfully deleted.`,
        "success"
      );
    } catch (error) {
      console.error("Error deleting category or image:", error);
      createToaster(
        "Something went wrong! Could not delete the category or image.",
        "error"
      );
    }
  };

  // Function to set the currently selected category
  const editCategory = (category: Category) => {
    setSelectedCategory(category); // Set the selected category
  };

  return (
    <section className="pt-10">
      <table className="w-full table-auto border-collapse text-left shadow-md bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border-b font-bold text-sm text-gray-700">
              Sr.
            </th>
            <th className="px-4 py-2 border-b font-bold text-sm text-gray-700">
              Category Photo
            </th>
            <th className="px-4 py-2 border-b font-bold text-sm text-gray-700">
              Category Name
            </th>
            <th className="px-4 py-2 border-b font-bold text-sm text-gray-700">
              Category Slug
            </th>
            <th className="px-4 py-2 border-b font-bold text-sm text-gray-700">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="align-middle">
          {categories.length > 0 ? (
            categories.map((category, index) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{index + 1}</td>
                <td className="px-4 py-2 border-b">
                  {category.photo ? (
                    <Image
                      src={category.photo}
                      alt={`${category.name} Photo`}
                      width={40}
                      height={40}
                      className=""
                    />
                  ) : (
                    <span className="text-gray-500">No Image</span>
                  )}
                </td>
                <td className="px-4 py-2 border-b">{category.name}</td>
                <td className="px-4 py-2 border-b">{category.slug}</td>
                <td className="px-4 py-2 border-b space-x-4">
                  <Link
                    href=""
                    onClick={() => {
                      setSelectedCategory(category); // Correctly set the selected category
                      setIsModalOpen(true);
                    }}
                    className="inline-block px-4 py-2 rounded-md text-white bg-indigo-500 hover:bg-indigo-400 transition-all duration-300"
                  >
                    <FcViewDetails />
                  </Link>

                  <Link
                    href={`/admin/categories/edit?id=${category.id}`} // Pass the ID for editing
                    className="inline-block bg-blue-500 px-4 py-2 rounded-md text-white hover:bg-blue-400 transition-all duration-300"
                    onClick={() => editCategory(category)} // Set the selected category
                  >
                    <FaEdit />
                  </Link>
                  <Link
                    href=""
                    onClick={() =>
                      handleMoveToTrash(category.id, category.photo)
                    }
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
                No categories found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      {isModalOpen && selectedCategory && (
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
            {selectedCategory.photo && (
              <div className="flex justify-center mb-4">
                <Image
                  src={selectedCategory.photo}
                  alt={`${selectedCategory.name} Photo`}
                  width={200}
                  height={200}
                  className="object-cover rounded-md"
                />
              </div>
            )}
            <h2 className="text-xl font-bold mb-4">{selectedCategory.name}</h2>
            <p className="mb-2">
              <strong>Slug:</strong> {selectedCategory.slug}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
