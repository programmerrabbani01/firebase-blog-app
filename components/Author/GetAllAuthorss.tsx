"use client";

import {
  getAllAuthorsRealTime,
  getDeleteAAuthor,
} from "@/firebase/authorModel/authorModel.ts";
import { createToaster } from "@/utils/tostify.ts";
import { IconX } from "@tabler/icons-react";
import { FieldValue, serverTimestamp } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { FcViewDetails } from "react-icons/fc";

// author types
export interface Author {
  id?: string;
  name: string;
  email: string;
  photo?: string | null;
  createdAt?: typeof serverTimestamp | FieldValue | null;
  updatedAt?: typeof serverTimestamp | FieldValue | null;
  status?: boolean;
  trash?: boolean;
}

export default function GetAllAuthor() {
  const [authors, setAuthors] = useState<Author[]>([]); // List of all Authors
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null); // Currently selected category for editing
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const modalRef = useRef<HTMLDivElement>(null);

  // Get all Authors
  useEffect(() => {
    const unsubscribe = getAllAuthorsRealTime(
      "authors",
      (fetchedAuthors: unknown) => {
        // Type guard to ensure correct typing
        if (Array.isArray(fetchedAuthors)) {
          setAuthors(fetchedAuthors as Author[]);
        } else {
          console.error("Invalid data format:", fetchedAuthors);
        }
      }
    );

    return () => {
      unsubscribe(); // Clean up listener on unmount
    };
  }, []);

  // Delete a author
  const handleMoveToTrash = async (id: string, imagePath?: string | null) => {
    try {
      await getDeleteAAuthor("authors", id, imagePath);
      setAuthors(authors.filter((author) => author.id !== id)); // Remove from UI

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

  // Function to set the currently selected author
  const editAuthor = (author: Author) => {
    setSelectedAuthor(author); // Set the selected author
  };

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

  return (
    <section className="pt-10">
      <table className="w-full table-auto border-collapse text-left shadow-md bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border-b font-bold text-sm text-gray-700">
              Sr.
            </th>
            <th className="px-4 py-2 border-b font-bold text-sm text-gray-700">
              Author Photo
            </th>
            <th className="px-4 py-2 border-b font-bold text-sm text-gray-700">
              Author Name
            </th>
            <th className="px-4 py-2 border-b font-bold text-sm text-gray-700">
              Author Email
            </th>
            <th className="px-4 py-2 border-b font-bold text-sm text-gray-700">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="align-middle">
          {authors.length > 0 ? (
            authors.map((author, index) => (
              <tr key={author.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{index + 1}</td>
                <td className="px-4 py-2 border-b">
                  {author.photo ? (
                    <Image
                      src={author.photo}
                      alt={`${author.name} Photo`}
                      width={40}
                      height={40}
                      className=""
                    />
                  ) : (
                    <span className="text-gray-500">No Image</span>
                  )}
                </td>
                <td className="px-4 py-2 border-b">{author.name}</td>
                <td className="px-4 py-2 border-b">{author.email}</td>
                <td className="px-4 py-2 border-b space-x-4">
                  <Link
                    href=""
                    onClick={() => {
                      setSelectedAuthor(author); // Correctly set the selected category
                      setIsModalOpen(true);
                    }}
                    className="inline-block px-4 py-2 rounded-md text-white bg-indigo-500 hover:bg-indigo-400 transition-all duration-300"
                  >
                    <FcViewDetails />
                  </Link>
                  <Link
                    href={`/admin/authors/edit?id=${author.id}`} // Pass the ID for editing
                    className="inline-block bg-blue-500 px-4 py-2 rounded-md text-white hover:bg-blue-400 transition-all duration-300"
                    onClick={() => editAuthor(author)} // Set the selected category
                  >
                    <FaEdit />
                  </Link>
                  <Link
                    href=""
                    onClick={() => {
                      if (author.id) {
                        handleMoveToTrash(author.id, author.photo); // Ensure id is valid
                      } else {
                        createToaster("Author ID is missing.", "error");
                      }
                    }}
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
                No Authors found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      {isModalOpen && selectedAuthor && (
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
            {selectedAuthor.photo && (
              <div className="flex justify-center mb-4">
                <Image
                  src={selectedAuthor.photo}
                  alt={`${selectedAuthor.name} Photo`}
                  width={200}
                  height={200}
                  className="object-cover rounded-md"
                />
              </div>
            )}
            <h2 className="text-xl font-bold mb-4">{selectedAuthor.name}</h2>
            <p className="mb-2">
              <strong>Slug:</strong> {selectedAuthor.email}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
