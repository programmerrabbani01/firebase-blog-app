import AllBlogs from "@/components/AllBlogs/AllBlogs.tsx";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Blogs", // Static title for the Blogs page
    description: "Browse all Blogs of blogs", // Static description
  };
}
export default async function Home() {
  return (
    <>
      <AllBlogs />
    </>
  );
}
