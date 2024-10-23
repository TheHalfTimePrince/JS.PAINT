import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "JS.PAINT - React Canvas Drawing App",
  description: "A versatile canvas drawing application built with React, Next.js, and fabric.js. Create digital artwork directly in your browser.",
  icons: {
    icon: "./favicon.png",
    apple: "./favicon.png",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#ffffff",
  openGraph: {
    title: "JS.PAINT - React Canvas Drawing App",
    description: "Create digital artwork with various tools using JS.PAINT, a React-based canvas drawing app.",
    images: [
      {
        url: "./favicon.png",
        width: 1200,
        height: 630,
        alt: "JS.PAINT Preview",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}