"use client";

import { ThirdwebProvider } from "@thirdweb-dev/react";
export default function ClientProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThirdwebProvider
      activeChain="sepolia"
      clientId="940026e7cd17bcf8164a76f125464069"
    >
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </ThirdwebProvider>
  )
}