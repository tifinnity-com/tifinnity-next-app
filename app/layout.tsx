import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
    variable: '--font-inter'
});

export const metadata: Metadata = {
  title: "Tifinnity | For Students and Mess Owners",
  description: "Tifinnity App for Students and Mess Owners",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>{children}</body>
    </html>
  );
}
