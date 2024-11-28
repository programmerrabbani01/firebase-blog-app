"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import photoVideo from "@/public/photoVideo.png";
import { MoveLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { createToaster } from "@/utils/tostify.ts";
import { createACategory } from "@/firebase/categoryModel/categoryModel.ts";
import { FieldValue, serverTimestamp } from "firebase/firestore";
import { uploadCategoryFileToStorage } from "@/firebase/fileData/categoryFileData.ts";

// category types

export interface Category {
  id?: string;
  name: string;
  slug: string;
  photo?: string | null;
  createdAt?: typeof serverTimestamp | FieldValue | null;
  updatedAt?: typeof serverTimestamp | FieldValue | null;
  status?: boolean;
  trash?: boolean;
}

export default function CategoryForm() {
  const [input, setInput] = useState({
    name: "",
    slug: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  //  change inputs values
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInput((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  //  create a new category
  const handleFormCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      let fileLink: string | null = null;

      if (file) {
        // Upload the file and get the download URL
        fileLink = await uploadCategoryFileToStorage(file);
      }

      const newCategory: Category = {
        id: "",
        name: input.name,
        slug: input.slug,
        status: true,
        trash: false,
        createdAt: serverTimestamp(),
        updatedAt: null,
        photo: fileLink,
      };

      await createACategory("categories", newCategory);

      // Show success message
      createToaster("Category successfully created!", "success");

      // Reset the form after successful submission
      setInput({ name: "", slug: "" });
      setFile(null);
      setFilePreview(null);

      // Redirect to the categories page
      router.push("/admin/categories");
    } catch (error) {
      console.error("Error creating category:", error);
      createToaster("Failed to create category. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  //  change file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  // button click for file selection
  const handleButtonClick = () => {
    document.getElementById("fileInput")?.click();
  };

  // cancel file selection
  const cancelFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-bold text-blue-400 hover:text-blue-500 transition-all duration-300">
          Category | Form
        </h1>
        <Link
          href="/admin/categories"
          className="bg-blue-100 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-500 hover:text-white transition-all duration-300 flex items-center gap-2 uppercase"
        >
          <MoveLeft />
          Back To Categories
        </Link>
      </div>
      <form onSubmit={handleFormCreate} className="bg-blue-100 p-7 rounded-lg">
        <div className="my-3 flex flex-col max-w-96 mx-auto">
          <label className="mb-2 text-lg font-bold text-gray-500">
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            className="border border-blue-100 outline-none rounded-lg px-4 py-2 bg-gray-50"
            type="text"
            placeholder="Enter Category Name"
            name="name"
            onChange={handleInputChange}
            value={input.name}
            required
          />
        </div>
        <div className="my-3 flex flex-col max-w-96 mx-auto">
          <label className="mb-2 text-lg font-bold text-gray-500">
            Category Slug <span className="text-red-500">*</span>
          </label>
          <input
            className="border border-blue-100 outline-none rounded-lg px-4 py-2 bg-gray-50"
            type="text"
            placeholder="Enter Category Slug"
            name="slug"
            onChange={handleInputChange}
            value={input.slug}
            required
          />
        </div>
        {filePreview && (
          <div className="my-3 flex flex-col max-w-96 mx-auto">
            <Image
              src={filePreview}
              alt="Preview"
              width={80}
              height={80}
              className="object-cover rounded-lg"
            />
            <button
              onClick={cancelFile}
              className="mt-2 text-red-500 hover:text-red-700 text-left"
              type="button"
            >
              Cancel file
            </button>
          </div>
        )}
        <div className="my-3 flex flex-col max-w-96 mx-auto">
          <label className="mb-2 text-lg font-bold text-gray-500">
            Category Image <span className="text-red-500">*</span>
          </label>
          <div>
            <button
              type="button"
              className="flex items-center space-x-2 text-gray-600"
              onClick={handleButtonClick}
            >
              <Image src={photoVideo} alt="photoVideo" width={24} height={24} />
              <span>Photo/Video</span>
            </button>
            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>
        </div>
        <div className="my-3 flex flex-col max-w-96 mx-auto">
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-500 text-white px-4 py-2 rounded-lg text-lg font-bold hover:bg-blue-700 transition-all duration-300 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </>
  );
}
