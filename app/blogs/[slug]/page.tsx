import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import { Timestamp } from "firebase/firestore";
import DOMPurify from "isomorphic-dompurify"; // Install this package for sanitization
import { getASingleAuthor } from "@/firebase/authorModel/authorModel.ts";
import { getASingleCategory } from "@/firebase/categoryModel/categoryModel.ts";
import { getASingleBlogBySlug } from "@/firebase/blogModel/blogModel.ts";

interface BlogPageProps {
  params: {
    slug: string;
  };
}

// Generate metadata dynamically
export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const blog = await getASingleBlogBySlug(params.slug);

  return {
    title: blog?.title || "Blog",
    description: blog
      ? `Read more about "${blog.title}"`
      : "Blog details not found.",
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const blog = await getASingleBlogBySlug(params.slug);
  console.log(blog);

  if (!blog) {
    return (
      <section className="text-center py-20">
        <h1 className="text-2xl font-bold">Blog Not Found</h1>
        <p>The blog you are looking for does not exist.</p>
      </section>
    );
  }

  // Fetch the author's details if the authorId exists
  const author = blog.authorId ? await getASingleAuthor(blog.authorId) : null;

  // Fetch the categories details if the authorId exists
  const category = blog.categoryId
    ? await getASingleCategory(blog.categoryId)
    : null;

  // Sanitize the content
  const sanitizedContent = blog.content
    ? DOMPurify.sanitize(blog.content)
    : "No content available.";

  return (
    <section className="max-w-4xl mx-auto px-6 py-10">
      <div className="inline-block mb-4">
        <div className="flex items-center gap-2 bg-[#DBEAFE] hover:bg-[#bed0e7] transition-all duration-300 px-4 py-1 rounded-lg ">
          {category?.photo && (
            <Image
              src={category.photo}
              alt={category.name || "Category"}
              width={30}
              height={30}
              className="rounded-full object-cover"
            />
          )}
          <div>
            <h5 className="text-sm font-bold text-gray-700">
              {category?.name || "Unknown Category"}
            </h5>
          </div>
        </div>
      </div>
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
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 bg-[#DBEAFE] hover:bg-[#bed0e7] transition-all duration-300 px-4 py-1 rounded-lg">
          {author?.photo && (
            <Image
              src={author.photo}
              alt={author.name || "Author"}
              width={30}
              height={30}
              className="rounded-full object-cover"
            />
          )}
          <div>
            <h5 className="text-sm font-bold text-gray-700">
              {author?.name || "Unknown Author"}
            </h5>
          </div>
        </div>
        <h5 className="text-xs text-gray-500">
          {blog.updatedAt instanceof Timestamp
            ? `Updated on: ${blog.updatedAt.toDate().toLocaleDateString()}`
            : blog.createdAt instanceof Timestamp
            ? `Created on: ${blog.createdAt.toDate().toLocaleDateString()}`
            : "Date not available"}
        </h5>
      </div>
      <div className="mt-6">
        <p className="uppercase text-xl">
          <strong>Content:</strong>
        </p>
        <article
          className="text-lg leading-relaxed prose max-w-full text-gray-700 [&_img]:w-full  [&_img]:object-cover [&_img]:rounded-md [&_img]:my-5 [&_img]:mx-auto [&_img]:block mt-3"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </div>
    </section>
  );
}
