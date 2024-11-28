import AuthContextProvider from "@/context/AuthContext.tsx";
import logo from "@/public/logo.png";
import Image from "next/image";
import Link from "next/link";
import LoginButton from "./LoginButton.tsx";
import { BotMessageSquare, HousePlug, LayoutList } from "lucide-react";

// type Props = {};

export default function Header() {
  return (
    <>
      <nav className="px-8 py-2 border-b flex items-center justify-between">
        {/* logo */}
        <Link href="/">
          <Image
            src={logo}
            alt="logo"
            className="w-32 overflow-hidden object-cover"
          />
        </Link>
        {/* menu */}
        <ul className="flex gap-7 items-center">
          <li>
            <Link
              href="/"
              className="flex items-center gap-2 uppercase text-xs font-bold text-gray-500"
            >
              <HousePlug /> Home
            </Link>
          </li>
          <li>
            <Link
              href="/categories"
              className="flex items-center gap-2 uppercase text-xs font-bold text-gray-500"
            >
              <LayoutList /> Categories
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="flex items-center gap-2 uppercase text-xs font-bold text-gray-500"
            >
              <BotMessageSquare /> Contact Us
            </Link>
          </li>
        </ul>
        {/* login button */}
        <AuthContextProvider>
          <LoginButton />
        </AuthContextProvider>
      </nav>
    </>
  );
}
