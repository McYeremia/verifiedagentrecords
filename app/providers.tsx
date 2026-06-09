"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit"
import "@mysten/dapp-kit/dist/index.css"

const queryClient = new QueryClient()

const networks = {
  mainnet: {
    url: "https://fullnode.mainnet.sui.io:443",
    network: "mainnet" as const,
  },
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="mainnet">
        <WalletProvider autoConnect>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  )
}
