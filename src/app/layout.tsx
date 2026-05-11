import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Esports Lab — Equipment Checkout",
  description: "Check out keyboards and mice for the esports lab",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-950 text-gray-100">
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
          <nav className="max-w-6xl mx-auto flex items-center gap-6">
            <Link href="/" className="text-lg font-bold text-cyan-400 hover:text-cyan-300">
              🎮 Esports Lab
            </Link>
            <Link href="/" className="text-sm text-gray-300 hover:text-white">Dashboard</Link>
            <Link href="/checkout" className="text-sm text-gray-300 hover:text-white">Check Out</Link>
            <Link href="/history" className="text-sm text-gray-300 hover:text-white">History</Link>
            <Link href="/admin" className="text-sm text-gray-300 hover:text-white ml-auto">Admin</Link>
          </nav>
        </header>
        <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
