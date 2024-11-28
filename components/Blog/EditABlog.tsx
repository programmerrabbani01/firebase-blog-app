"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import photoVideo from "@/public/photoVideo.png";
import Link from "next/link";
import { MoveLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { FieldValue, serverTimestamp } from "firebase/firestore";
import { createToaster } from "@/utils/tostify.ts";
import {
  deleteBlogFileFromStorage,
  uploadBlogFileToStorage,
} from "@/firebase/fileData/blogFileData.ts";
import { updateABlog } from "@/firebase/blogModel/blogModel.ts";
import { getAllCategoriesRealTime } from "@/firebase/categoryModel/categoryModel.ts";
import { getAllAuthorsRealTime } from "@/firebase/authorModel/authorModel.ts";

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
    handlers: {
      image: handleImageUpload, // Custom handler for image uploads
    },
  },
};

// Function to handle image uploads in ReactQuill
async function handleImageUpload() {
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "image/*");
  input.click();

  input.onchange = async () => {
    const file = input.files ? input.files[0] : null;

    if (file) {
      try {
        // Upload the image to Firebase Storage
        const imageUrl = await uploadBlogFileToStorage(file);

        // Insert the uploaded image URL into the editor
        const quill = this.quill;
        const range = quill.getSelection();
        quill.insertEmbed(range.index, "image", imageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
        createToaster("Failed to upload the image. Please try again.", "error");
      }
    }
  };
}

// blog types

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

interface EditBlogProps {
  blog: Blog | null;
  setBlogs: React.Dispatch<React.SetStateAction<Blog[]>>;
}

export default function EditABlog({ blog, setBlogs }: EditBlogProps) {
  const [input, setInput] = useState({
    title: "",
    slug: "",
    content: "",
    categoryId: "",
    authorId: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]); // State for categories
  const [authors, setAuthors] = useState<Author[]>([]); // State for categories

  // Fetch categories, authors and initialize blog data
  useEffect(() => {
    // Fetch all categories
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

    // Fetch all authors
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

    // Initialize blog data
    if (blog) {
      setInput({
        title: blog.title || "",
        slug: blog.slug || "",
        content: blog.content || "",
        categoryId: blog.categoryId || "",
        authorId: blog.authorId || "",
      });
      setFilePreview(blog.photo || null);
    }

    return () => {
      unsubscribeAuthors();
      unsubscribeCategories();
    };
  }, [blog]);

  if (!blog) {
    return <div>Loading blog data...</div>;
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setInput((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpdateBlog = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      let newFileUrl: string | null = null;

      if (file) {
        if (blog?.photo) {
          await deleteBlogFileFromStorage(blog.photo);
        }
        newFileUrl = await uploadBlogFileToStorage(file);
      } else if (!file && filePreview === null && blog?.photo) {
        await deleteBlogFileFromStorage(blog.photo);
        newFileUrl = null;
      } else {
        newFileUrl = blog?.photo ?? null;
      }

      const updatedData: Partial<Blog> = {
        title: input.title.trim() ? input.title : "",
        slug: input.slug.trim() ? input.slug : "",
        content: input.content.trim() ? input.content : "",
        photo: newFileUrl || "",
        categoryId: input.categoryId,
        authorId: input.authorId,
        updatedAt: serverTimestamp(),
      };

      if (blog?.id) {
        await updateABlog("blogs", blog.id, updatedData);
      }

      setBlogs((prevBlogs) => {
        console.log("Previous blogs:", prevBlogs);
        if (!Array.isArray(prevBlogs)) {
          console.error("prevBlogs is not an array:", prevBlogs);
          return prevBlogs;
        }
        return prevBlogs.map((p) =>
          p.id === blog?.id ? { ...p, ...updatedData } : p
        );
      });

      createToaster("The Blog has been successfully updated.", "success");
      router.push("/admin/blogs");
    } catch (error) {
      console.error("Error updating Blog:", error);
      createToaster("Something went wrong while updating the Blog.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    document.getElementById("fileInput")?.click();
  };

  const cancelFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  return (
    <div className="p-6 w-full">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-bold text-blue-400 hover:text-blue-500 transition-all duration-300">
          Edit Blog | Form
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
        onSubmit={handleUpdateBlog}
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
              disabled
            />
          </div>

          <div className="my-3 flex flex-col max-w-96 mx-auto">
            <label className="mb-2 text-lg font-bold text-gray-500">
              Blog Category <span className="text-red-500">*</span>
            </label>
            <select
              name="categoryId"
              value={input.categoryId}
              onChange={handleInputChange}
              className="border border-blue-100 outline-none rounded-lg px-4 py-2 bg-gray-50"
              required
            >
              <option value="" disabled>
                Select a category
              </option>
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
              name="authorId"
              value={input.authorId}
              onChange={handleInputChange}
              className="border border-blue-100 outline-none rounded-lg px-4 py-2 bg-gray-50"
              required
            >
              <option value="" disabled>
                Select An Author
              </option>
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
              {loading ? "Updating..." : "Update"}
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
    </div>
  );
}
