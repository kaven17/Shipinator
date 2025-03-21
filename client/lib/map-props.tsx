// mapProps.ts
import { 
    IconBrandGithub, 
    IconBrandX, 
    IconExchange, 
    IconHome, 
    IconNewSection, 
    IconTerminal2 
  } from "@tabler/icons-react";
import Image from "next/image";
import { Box, Lock, Search, Settings, Sparkles } from "lucide-react"

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
  
  export const links = [
    {
      title: "Home",
      icon: <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
    },
    {
      title: "Products",
      icon: <IconTerminal2 className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
    },
    {
      title: "Components",
      icon: <IconNewSection className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
    },
    {
      title: "Aceternity UI",
      icon: (
        <Image 
          src="https://assets.aceternity.com/logo-dark.png" 
          width={20} 
          height={20} 
          alt="Aceternity Logo" 
        />
      ),
      href: "#",
    },
    {
      title: "Changelog",
      icon: <IconExchange className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
    },
    {
      title: "Twitter",
      icon: <IconBrandX className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
    },
    {
      title: "GitHub",
      icon: <IconBrandGithub className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
    },
  ];
  export const gridItems: GridItemProps[] = [
    {
      area: "md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]",
      icon: <Box className="h-4 w-4 text-black dark:text-neutral-400" />,
      title: "Do things the right way",
      description: "Running out of copy so I'll write anything."
    },
    {
      area: "md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]",
      icon: <Settings className="h-4 w-4 text-black dark:text-neutral-400" />,
      title: "The best AI code editor ever.",
      description: "Yes, it's true. I'm not even kidding. Ask my mom if you don't believe me."
    },
    {
      area: "md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]",
      icon: <Lock className="h-4 w-4 text-black dark:text-neutral-400" />,
      title: "You should buy Aceternity UI Pro",
      description: "It's the best money you'll ever spend"
    },
    {
      area: "md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]",
      icon: <Sparkles className="h-4 w-4 text-black dark:text-neutral-400" />,
      title: "This card is also built by Cursor",
      description: "I'm not even kidding. Ask my mom if you don't believe me."
    },
    {
      area: "md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]",
      icon: <Search className="h-4 w-4 text-black dark:text-neutral-400" />,
      title: "Coming soon on Aceternity UI",
      description: "I'm writing the code as I record this, no shit."
    }
  ]