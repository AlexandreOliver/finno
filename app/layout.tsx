import "./globals.css";

import type { Metadata } from "next";
import { geist } from "@/components/ui/font";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Finno",
  description: "Orçamento Fácil",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html id="root" lang="pt-BR" className={cn("antialiased", geist.className)}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
