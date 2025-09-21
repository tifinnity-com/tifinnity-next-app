import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tifinnity | For Students and Mess Owners",
  description: "Tifinnity App for Students and Mess Owners",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Toaster position="top-center" />
      <body className={`${inter.className}`}>{children}</body>
    </html>
  );
}
