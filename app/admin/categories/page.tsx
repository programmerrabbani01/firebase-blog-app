import GetAllCategory from "@/components/Category/GetAllCategories.tsx";
import { SmilePlus } from "lucide-react";
import Link from "next/link";
import React from "react";
// https://wa.link/busdm2    mywhatsapp link
export default function Authors() {
  return (
    <>
      <div className="p-6 w-full">
        <div className="flex items-center justify-between ">
          <h1 className="text-3xl font-bold uppercase">All Categories</h1>
          <Link href="/admin/categories/form">
            <button className="bg-blue-500 px-4 py-2 text-white font-bold flex items-center gap-2 rounded-lg uppercase">
              <SmilePlus />
              Add
            </button>
          </Link>
        </div>
        {/* Category List */}
        <GetAllCategory />
      </div>
    </>
  );
}
