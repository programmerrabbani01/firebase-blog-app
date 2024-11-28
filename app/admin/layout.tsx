import SideBar from "@/components/Sidebar/SideBar.tsx";
import AuthContextProvider from "@/context/AuthContext.tsx";
import React from "react";

type Props = {
  children: React.ReactNode;
};
export default function Layout({ children }: Props) {
  return (
    <>
      <AuthContextProvider>
        <section className="flex">
          <SideBar />
          {children}
        </section>
      </AuthContextProvider>
    </>
  );
}
