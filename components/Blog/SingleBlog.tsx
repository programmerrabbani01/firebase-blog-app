"use client"; // Ensure this component runs on the client-side

import React, { useEffect, useState } from "react";
import { Metadata } from "next";
import { getASingleBlog } from "@/firebase/blogModel/blogModel";
import Image from "next/image";
import { Timestamp } from "firebase/firestore";

// Lazy load DOMPurify to ensure it works only on the client-side
let DOMPurify: any = null;
if (typeof window !== "undefined") {
  DOMPurify = require("dompurify");
}

interface BlogPageProps {
  params: {
    id: string;
  };
}

// Generate metadata dynamically
export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const blog = await getASingleBlog(params.id);

  return {
    title: blog?.title || "Blog",
    description: blog
      ? `Read more about "${blog.title}"`
      : "Blog details not found.",
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const blog = await getASingleBlog(params.id);

  if (!blog) {
    return (
      <section className="text-center py-20">
        <h1 className="text-2xl font-bold">Blog Not Found</h1>
        <p>The blog you are looking for does not exist.</p>
      </section>
    );
  }

  const sanitizedContent =
    typeof window !== "undefined" && DOMPurify
      ? DOMPurify.sanitize(blog.content || "")
      : "";

  return (
    <section className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-6">{blog.title}</h1>
      {blog.photo && (
        <Image
          src={blog.photo}
          alt={blog.title}
          width={800}
          height={400}
          className="rounded-lg object-cover w-full h-[400px] mb-6"
        />
      )}
      <h5 className="text-xs text-gray-500 font-bold mt-3">
        {blog.updatedAt instanceof Timestamp
          ? `Updated on: ${blog.updatedAt.toDate().toLocaleDateString()}`
          : blog.createdAt instanceof Timestamp
          ? `Created on: ${blog.createdAt.toDate().toLocaleDateString()}`
          : "Date not available"}
      </h5>

      {blog.content ? (
        <div
          className="prose max-w-full text-gray-700 [&_img]:w-72 [&_img]:h-72 [&_img]:object-cover [&_img]:rounded-md [&_img]:my-5 [&_img]:mx-auto [&_img]:block"
          dangerouslySetInnerHTML={{
            __html: sanitizedContent,
          }}
        />
      ) : (
        <p>No content available for this blog.</p>
      )}
    </section>
  );
}
