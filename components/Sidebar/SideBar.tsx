"use client";

import {
  ChartBarStacked,
  LayoutDashboard,
  NotebookTabs,
  UserRoundCog,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideBar() {
  const pathname = usePathname();

  const link = [
    {
      name: "Dashboard",
      link: "/admin",
      icon: <LayoutDashboard />,
    },
    {
      name: "Blogs",
      link: "/admin/blogs",
      icon: <NotebookTabs />,
    },
    {
      name: "Categories",
      link: "/admin/categories",
      icon: <ChartBarStacked />,
    },
    {
      name: "Authors",
      link: "/admin/authors",
      icon: <UserRoundCog />,
    },
  ];

  return (
    <>
      <section className="w-52 border-r min-h-screen bg-blue-100">
        <ul className="w-full flex-col">
          {link.map((item, index) => {
            const isActive = pathname === item.link;

            return (
              <Link key={index} href={item.link}>
                <li
                  className={`flex items-center gap-3 px-5 py-6 border-b border-blue-300 transition-all duration-300 font-bold ${
                    isActive
                      ? "bg-blue-400 text-white"
                      : "hover:bg-blue-400 hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </li>
              </Link>
            );
          })}
        </ul>
      </section>
    </>
  );
}
