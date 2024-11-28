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
  deleteAuthorFileFromStorage,
  uploadAuthorFileToStorage,
} from "@/firebase/fileData/authorFileData.ts";
import { updateAAuthor } from "@/firebase/authorModel/authorModel.ts";

// category types

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

interface EditAuthorProps {
  author: Author | null;
  setAuthors: React.Dispatch<React.SetStateAction<Author[]>>;
}

export default function EditAAuthor({ author, setAuthors }: EditAuthorProps) {
  const [input, setInput] = useState({ name: "", email: "" });
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log("Author data:", author); // Debugging
    if (author) {
      setInput({ name: author.name || "", email: author.email || "" });
      setFilePreview(author.photo || null);
    }
  }, [author]);

  if (!author) {
    return <div>Loading author data...</div>;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  const handleUpdateAuthor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      let newFileUrl: string | null = null;

      if (file) {
        if (author?.photo) {
          await deleteAuthorFileFromStorage(author.photo);
        }
        newFileUrl = await uploadAuthorFileToStorage(file);
      } else if (!file && filePreview === null && author?.photo) {
        await deleteAuthorFileFromStorage(author.photo);
        newFileUrl = null;
      } else {
        newFileUrl = author?.photo ?? null;
      }

      const updatedData: Partial<Author> = {
        name: input.name.trim() ? input.name : "",
        email: input.email.trim() ? input.email : "",
        photo: newFileUrl || "",
        updatedAt: serverTimestamp(),
      };

      if (author?.id) {
        await updateAAuthor("authors", author.id, updatedData);
      }

      setAuthors((prevAuthors) => {
        console.log("Previous Authors:", prevAuthors);
        if (!Array.isArray(prevAuthors)) {
          console.error("prevAuthors is not an array:", prevAuthors);
          return prevAuthors;
        }
        return prevAuthors.map((p) =>
          p.id === author?.id ? { ...p, ...updatedData } : p
        );
      });

      createToaster("The author has been successfully updated.", "success");
      router.push("/admin/authors");
    } catch (error) {
      console.error("Error updating author:", error);
      createToaster("Something went wrong while updating the author.", "error");
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
          Edit Author | Form
        </h1>
        <Link
          href="/admin/authors"
          className="bg-blue-100 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-500 hover:text-white transition-all duration-300 flex items-center gap-2 uppercase"
        >
          <MoveLeft />
          Back To Authors
        </Link>
      </div>
      <form
        onSubmit={handleUpdateAuthor}
        className="bg-blue-100 p-7 rounded-lg"
      >
        <div className="my-3 flex flex-col max-w-96 mx-auto">
          <label className="mb-2 text-lg font-bold text-gray-500">
            Author Name <span className="text-red-500">*</span>
          </label>
          <input
            className="border border-blue-100 outline-none rounded-lg px-4 py-2 bg-gray-50"
            type="text"
            placeholder="Enter Author Name"
            name="name"
            onChange={handleInputChange}
            value={input.name}
            required
          />
        </div>
        <div className="my-3 flex flex-col max-w-96 mx-auto">
          <label className="mb-2 text-lg font-bold text-gray-500">
            Author email <span className="text-red-500">*</span>
          </label>
          <input
            className="border border-blue-100 outline-none rounded-lg px-4 py-2 bg-gray-50"
            type="text"
            placeholder="Enter Author email"
            name="email"
            onChange={handleInputChange}
            value={input.email}
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
            Author Image <span className="text-red-500">*</span>
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
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
}
