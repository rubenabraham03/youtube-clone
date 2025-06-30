import type { Metadata } from "next";
import "./globals.css";
import { Inter } from 'next/font/google'
import Navbar from "./navbar/navbar";

const inter = Inter({ subsets: ["latin"] }); // <-- Define the font


export const metadata: Metadata = {
  title: "Youtube",
  description: "Youtube Clone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar/>
        {children}
      </body>
    </html>
  );
}
