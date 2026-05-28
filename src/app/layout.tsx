import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
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
  title: "NV ANSMI Anagrafica",
  description: "Gestione anagrafica volontari con Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="app-bg-layer" />
        <Image
          src="/logo-nvansmi.png"
          alt="NV ANSMI Logo"
          className="app-logo-watermark"
          width={620}
          height={620}
          priority
        />
        {children}
      </body>
    </html>
  );
}
