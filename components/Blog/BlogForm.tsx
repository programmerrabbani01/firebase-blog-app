"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import photoVideo from "@/public/photoVideo.png";
import { MoveLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { createToaster } from "@/utils/tostify.ts";
import { FieldValue, serverTimestamp } from "firebase/firestore";
import { uploadBlogFileToStorage } from "@/firebase/fileData/blogFileData.ts";
import { createABlog } from "@/firebase/blogModel/blogModel.ts";
import {
  Category,
  getAllCategoriesRealTime,
} from "@/firebase/categoryModel/categoryModel.ts";
import {
  getAllAuthorsRealTime,
  Author,
} from "@/firebase/authorModel/authorModel.ts";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

// Dynamically import ReactQuill
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Rich text editor modules
const modules = {
  toolbar: {
    container: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ size: ["extra-small", "small", "medium", "large"] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image", "video"],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
  },
};

// category types

export interface Blog {
  id?: string;
  title: string;
  slug: string;
  content: string;
  photo?: string | null;
  categoryId?: string;
  authorId?: string;
  createdAt?: typeof serverTimestamp | FieldValue | null;
  updatedAt?: typeof serverTimestamp | FieldValue | null;
  status?: boolean;
  trash?: boolean;
}

export default function BlogForm() {
  const [input, setInput] = useState({
    title: "",
    slug: "",
    content: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);

  //  change inputs values
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInput((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle category selection
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  // Handle author selection
  const handleAuthorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAuthor(e.target.value);
  };

  //  create a new blog
  const handleFormCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!selectedCategory || !selectedAuthor) {
      createToaster("Please select both a category and an author.", "error");
      setLoading(false);
      return;
    }

    try {
      let fileLink: string | null = null;

      if (file) {
        // Upload the file and get the download URL
        fileLink = await uploadBlogFileToStorage(file);
      }

      const newBlog: Blog = {
        id: "",
        title: input.title,
        slug: input.slug,
        content: input.content,
        status: true,
        trash: false,
        createdAt: serverTimestamp(),
        updatedAt: null,
        photo: fileLink,
        categoryId: selectedCategory,
        authorId: selectedAuthor,
      };

      await createABlog("blogs", newBlog);

      // Show success message
      createToaster("Blog successfully created!", "success");

      // Reset the form after successful submission
      setInput({ title: "", slug: "", content: "" });
      setFile(null);
      setFilePreview(null);
      setSelectedCategory(null);
      setSelectedAuthor(null);

      // Redirect to the blogs page
      router.push("/admin/blogs");
    } catch (error) {
      console.error("Error creating blog:", error);
      createToaster("Failed to create blog. Please try again.", "error");
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

  // Fetch categories and authors
  useEffect(() => {
    const unsubscribeCategories = getAllCategoriesRealTime(
      "categories",
      (fetchedCategories: unknown) => {
        if (Array.isArray(fetchedCategories)) {
          setCategories(fetchedCategories as Category[]);
        } else {
          console.error(
            "Invalid data format for categories:",
            fetchedCategories
          );
        }
      }
    );

    const unsubscribeAuthors = getAllAuthorsRealTime(
      "authors",
      (fetchedAuthors: unknown) => {
        if (Array.isArray(fetchedAuthors)) {
          setAuthors(fetchedAuthors as Author[]);
        } else {
          console.error("Invalid data format for authors:", fetchedAuthors);
        }
      }
    );

    return () => {
      unsubscribeCategories();
      unsubscribeAuthors();
    };
  }, []);

  return (
    <>
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-bold text-blue-400 hover:text-blue-500 transition-all duration-300">
          Blog | Form
        </h1>
        <Link
          href="/admin/blogs"
          className="bg-blue-100 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-500 hover:text-white transition-all duration-300 flex items-center gap-2 uppercase"
        >
          <MoveLeft />
          Back To Blogs
        </Link>
      </div>
      <form
        onSubmit={handleFormCreate}
        className="bg-blue-100 p-7 rounded-lg grid grid-cols-2"
      >
        <div className="leftSide">
          <div className="my-3 flex flex-col max-w-96 mx-auto">
            <label className="mb-2 text-lg font-bold text-gray-500">
              Blog Title <span className="text-red-500">*</span>
            </label>
            <input
              className="border border-blue-100 outline-none rounded-lg px-4 py-2 bg-gray-50"
              type="text"
              placeholder="Enter Blog Title"
              name="title"
              onChange={handleInputChange}
              value={input.title}
              required
            />
          </div>
          <div className="my-3 flex flex-col max-w-96 mx-auto">
            <label className="mb-2 text-lg font-bold text-gray-500">
              Blog Slug <span className="text-red-500">*</span>
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
          <div className="my-3 flex flex-col max-w-96 mx-auto">
            <label className="mb-2 text-lg font-bold text-gray-500">
              Blog Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              className="border border-blue-100 outline-none rounded-lg px-4 py-2 bg-gray-50"
              value={selectedCategory || ""}
              onChange={handleCategoryChange}
              required
            >
              <option value="">Select a Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="my-3 flex flex-col max-w-96 mx-auto">
            <label className="mb-2 text-lg font-bold text-gray-500">
              Blog Author <span className="text-red-500">*</span>
            </label>
            <select
              name="author"
              className="border border-blue-100 outline-none rounded-lg px-4 py-2 bg-gray-50"
              value={selectedAuthor || ""}
              onChange={handleAuthorChange}
              required
            >
              <option value="">Select an Author</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
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
              Blog Image <span className="text-red-500">*</span>
            </label>
            <div>
              <button
                type="button"
                className="flex items-center space-x-2 text-gray-600"
                onClick={handleButtonClick}
              >
                <Image
                  src={photoVideo}
                  alt="photoVideo"
                  width={24}
                  height={24}
                />
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
        </div>
        <div className="rightSlide">
          <div className="my-3 flex flex-col">
            <label className="mb-2 text-lg font-bold text-gray-500">
              Blog Content <span className="text-red-500">*</span>
            </label>
            <ReactQuill
              className="h-[300px] "
              value={input.content}
              onChange={(content) => setInput((prev) => ({ ...prev, content }))}
              modules={modules}
              placeholder="Enter your content here..."
            />
          </div>
        </div>
      </form>
    </>
  );
}
