import { Lusitana, Source_Code_Pro, Inter, Geist } from "next/font/google";

export const lusitana = Lusitana({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const SourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  weight: ["500", "400"],
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const geist = Geist({
  subsets: ["latin"],
});
