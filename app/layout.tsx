import "./globals.css";

import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";

import { geist } from "@/components/ui/font";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    template: "%s | Finno",
    default: "Finno",
  },
  description: "Orçamento Fácil",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      id="root"
      lang="pt-BR"
      className={cn("antialiased", geist.className)}
      suppressHydrationWarning
    >
      <body className="min-h-screen">
        <ThemeProvider
          attribute={"class"}
          enableSystem={false}
          themes={["light", "dark"]}
          forcedTheme="dark"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
