"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  getAllAuthorsRealTime,
  Author,
} from "@/firebase/authorModel/authorModel.ts";
import EditAAuthor from "./EditAAuthor.tsx";

export default function EditAuthorMain() {
  const [authorData, setAuthorData] = useState<Author | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const searchParams = useSearchParams();
  const authorId = searchParams.get("id"); // Get the `id` from the URL

  useEffect(() => {
    const unsubscribe = getAllAuthorsRealTime("authors", setAuthors);
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (authors.length > 0 && authorId) {
      // Find the category matching the `id`
      const selectedCategory = authors.find((cat) => cat.id === authorId);
      setAuthorData(selectedCategory || null);
    }
  }, [authors, authorId]);

  if (!authorData) {
    return <div>Loading category data...</div>;
  }

  return (
    <div className="p-6 w-full">
      <EditAAuthor author={authorData} setAuthors={setAuthors} />
    </div>
  );
}
