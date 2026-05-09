import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "./component/template/header/header";
import Footer from "./component/template/footer/footer";
import "./globals.css";
import { AuthProvider } from '../lib/context/AuthContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Drevo — Генеалогічне дерево",
  description: "Система управління сімейними зв'язками",
};

export default function RootLayout({
  children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html
        lang="uk"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <AuthProvider>
          <body className="min-h-full flex flex-col bg-[var(--background)]">
            {/* Огортаємо ВСЕ, що знаходиться в body */}
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </body>
        </AuthProvider>
      </html>
    );
}