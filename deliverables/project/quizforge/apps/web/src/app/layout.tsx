import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AuthBootstrap } from "@/components/layout/AuthBootstrap";
import { Navbar } from "@/components/layout/Navbar";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuizForge - Production Quiz Platform",
  description: "Secure full-stack quiz platform with admin and leaderboard support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}>
        <AuthBootstrap>
          <Navbar />
          <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
        </AuthBootstrap>
      </body>
    </html>
  );
}
