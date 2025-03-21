"use client";

import { ThirdwebProvider } from "@thirdweb-dev/react";
import Navigation from '@/components/Navigation'

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThirdwebProvider
      activeChain="sepolia"
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || ""}
    >
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </ThirdwebProvider>
  )
}