"use client";

import { useAuth } from "@/context/AuthContext.tsx";
import google from "@/public/google.png";
import Image from "next/image";
import Link from "next/link";
import { ClipLoader } from "react-spinners";
export default function LoginButton() {
  const { user, loading, error, handleGoogleLogin, handleLogOut } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <ClipLoader color="#BC35BE" size={30} />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <div className="flex items-center gap-2 rounded-xl bg-blue-100 px-4 py-2">
            <Image
              src={user?.photoURL || google}
              alt="User Photo"
              width={40}
              height={40}
              className="rounded-full object-cover overflow-hidden"
            />
            <div className="">
              <h1 className="text-xl font-bold">{user?.displayName}</h1>
              <h1 className="text-xs font-medium text-gray-400">
                {user?.email}
              </h1>
            </div>
          </div>
        </Link>
        <button
          onClick={() => {
            handleLogOut();
          }}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => {
          handleGoogleLogin();
        }}
        className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <Image src={google} alt="google" className="w-7" />
        Login With Google
      </button>
    </>
  );
}
