import React from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="w-screen h-screen grid place-content-center space-y-4">
        <h1 className="text-2xl font-bold text-center">Finno</h1>
        {children}
      </div>
    </>
  );
}
