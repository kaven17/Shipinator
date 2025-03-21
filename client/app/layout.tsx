"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import ClientProvider from "./providers";
import { FloatingDock } from "@/components/ui/floating-dock";
import { links } from "../lib/map-props";
import { useRouter } from "next/navigation";
import React from "react"; // Ensure React is imported

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Handle navigation
  const handleDockNavigation = (path: string) => {
    router.push(path);
  };

  // Ensure enhancedLinks is inside the component
  const enhancedLinks = links.map((link) => ({
    ...link,
    onClick: () => handleDockNavigation(link.path || "/"), // Now path exist
  }));

  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProvider>
          {children}
          <FloatingDock
            mobileClassName="translate-y-20"
            desktopClassName="fixed bottom-4 z-10 left-1/2 transform -translate-x-1/2 w-1/2 bg-white shadow-md p-4 flex justify-center"
            items={enhancedLinks}
          />
        </ClientProvider>
      </body>
    </html>
  );
}