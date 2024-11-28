"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import EditABlog from "./EditABlog.tsx";
import { getAllBlogsRealTime, Blog } from "@/firebase/blogModel/blogModel.ts";

export default function EditBlogMain() {
  const [blogData, setBlogData] = useState<Blog | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const searchParams = useSearchParams();
  const blogId = searchParams.get("id"); // Get the `id` from the URL

  useEffect(() => {
    const unsubscribe = getAllBlogsRealTime("blogs", setBlogs);
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (blogs.length > 0 && blogId) {
      // Find the Blog matching the `id`
      const selectedBlog = blogs.find((blog) => blog.id === blogId);
      setBlogData(selectedBlog || null);
    }
  }, [blogs, blogId]);

  if (!blogData) {
    return <div>Loading blog data...</div>;
  }

  return (
    <div className="p-6 w-full">
      <EditABlog blog={blogData} setBlogs={setBlogs} />
    </div>
  );
}
