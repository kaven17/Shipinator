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
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || ""}
    >
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </ThirdwebProvider>
  )
}