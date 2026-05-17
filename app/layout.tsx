import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NarrativeOS | Powered by IBM Bob — Repository Intelligence",
  description: "The cinematic AI-native operating system for IBM Bob repository intelligence and governance. Transform complex repositories into interactive visual stories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-surface-base text-text-primary selection:bg-accent-cyan/20 selection:text-accent-cyan"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
