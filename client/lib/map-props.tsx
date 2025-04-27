// lib/map-props.tsx
import { Box, Lock, Search, Settings, Sparkles } from "lucide-react";
import { User, Home, Package, Truck, Activity, FileText } from 'lucide-react';

export interface GridItemProps {
  area: string
  icon: React.ReactNode
  title: string
  description: React.ReactNode
}

export interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
}

// Define the dots separately
export const worldMapDots: MapProps["dots"] = [
  {
    start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
    end: { lat: 34.0522, lng: -118.2437 }, // Los Angeles
  },
  {
    start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
    end: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
  },
  {
    start: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
    end: { lat: 38.7223, lng: -9.1393 }, // Lisbon
  },
  {
    start: { lat: 51.5074, lng: -0.1278 }, // London
    end: { lat: 28.6139, lng: 77.209 }, // New Delhi
  },
  {
    start: { lat: 28.6139, lng: 77.209 }, // New Delhi
    end: { lat: 43.1332, lng: 131.9113 }, // Vladivostok
  },
  {
    start: { lat: 28.6139, lng: 77.209 }, // New Delhi
    end: { lat: -1.2921, lng: 36.8219 }, // Nairobi
  },
];

export interface LinkProps {
  title: string;
  icon: React.ReactNode;
  href: string;
  path: string;
}

export const links: LinkProps[] = [
  {
    title: "Home",
    icon: <Home className="h-full w-full text-white dark:text-white" />,
    href: "/",
    path: "/",
  },
  {
    title: "Medicine",
    icon: <Package className="h-full w-full text-white dark:text-white" />,
    href: "/medicine",
    path: "/medicine",
  },
  {
    title: "Dashboard",
    icon: <Activity className="h-full w-full text-white dark:text-white" />,
    href: "/dashboard",
    path: "/dashboard",
  },
  {
    title: "Receiver",
    icon: <User className="h-full w-full text-white dark:text-white" />,
    href: "/receiver",
    path: "/receiver",
  },
  {
    title: "Bio-Stability",
    icon: <FileText className="h-full w-full text-white dark:text-white" />,
    href: "/shelf-life",
    path: "/shelf-life",
  },
];

export const gridItems: GridItemProps[] = [
  {
    area: "md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]",
    icon: <Box className="h-4 w-4 text-white dark:text-white" />,
    title: "Step 1: Authentication",
    description: "User logs in with Google and connects their wallet, updating the UI with login status and wallet address."
  },
  {
    area: "md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]",
    icon: <Settings className="h-4 w-4 text-white dark:text-white" />,
    title: "Step 2: Shipment Search",
    description: "User enters a shipment ID and the system retrieves shipment details from Firebase."
  },
  {
    area: "md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]",
    icon: <Lock className="h-4 w-4 text-white dark:text-white" />,
    title: "Step 3: Display Info",
    description: "Shipment details, IPFS hash, and NFT token ID (if minted) are shown, along with document availability."
  },
  {
    area: "md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]",
    icon: <Sparkles className="h-4 w-4 text-white dark:text-white" />,
    title: "Step 4: Claim NFT",
    description: "User clicks create shipment triggering a blockchain transfer and updating Firebase."
  },
  {
    area: "md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]",
    icon: <Search className="h-4 w-4 text-white dark:text-white" />,
    title: "Step 5: Access & Verify Bio-Stability",
    description: "User accesses the document on IPFS, and the system analyzes the medicine's bio-stability using blockchain-verified data."
  }
];