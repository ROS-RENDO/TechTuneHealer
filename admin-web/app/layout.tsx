import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "TechTune Healer — Admin",
  description: "Admin control panel for TechTune Healer platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#F8FAFC] text-slate-900 selection:bg-blue-100 selection:text-blue-700">{children}</body>
    </html>
  );
}
