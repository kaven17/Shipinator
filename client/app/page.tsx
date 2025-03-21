"use client";

import { useState, useEffect } from 'react';
import { useStorageUpload } from "@thirdweb-dev/react";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Package, Truck, FileText, MapPin, Wallet, LogIn } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { FloatingDock } from '@/components/ui/floating-dock';
import { links } from "@/lib/map-props";
import WorldMap from "@/components/ui/world-map";
import { Box, Lock, Search, Settings, Sparkles } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { gridItems } from '@/lib/map-props';
import { auth, signInWithEmailAndPassword } from "@/lib/firebase";
import { connectWallet, getWalletAddress } from "@/lib/web3";

export default function ShipmentDetails() {
  const [formData, setFormData] = useState({
    shipmentId: '',
    source: '',
    destination: '',
    contents: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const { mutateAsync: upload } = useStorageUpload();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isWeb3Connected, setIsWeb3Connected] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showWalletConnectModal, setShowWalletConnectModal] = useState(false);

  // Check auth state on load
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Function to handle login
  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowLoginModal(false);
      toast({
        title: "Login successful",
        description: "You have been successfully logged in",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle logout
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await auth.signOut();
      toast({
        title: "Logout successful",
        description: "You have been successfully logged out",
      });
      setIsLoggedIn(false);
    } catch (error) {
      toast({
        title: "Logout failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle wallet connection
  const handleConnectWallet = async () => {
    setIsLoading(true);
    try {
      await connectWallet();
      const address = await getWalletAddress();
      setWallet(address);
      setIsWeb3Connected(true);
      setShowWalletConnectModal(false);
      toast({
        title: "Wallet connected",
        description: "Your wallet has been successfully connected",
      });
    } catch (error) {
      toast({
        title: "Wallet connection failed",
        description: error instanceof Error ? error.message : "Please make sure MetaMask is installed and unlocked",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!file) {
        toast({
          title: "Error",
          description: "Please select a document to upload",
          variant: "destructive",
        });
        return;
      }

      // Upload file to IPFS
      const uploadUrl = await upload({
        data: [file],
        options: { uploadWithGatewayUrl: true }
      });

      // Create shipment with IPFS URL
      const shipmentData = {
        ...formData,
        documentUrl: uploadUrl[0],
        timestamp: new Date().toISOString(),
      };

      console.log('Shipment created:', shipmentData);
      
      toast({
        title: "Success",
        description: "Shipment created successfully",
      });

      // Reset form
      setFormData({
        shipmentId: '',
        source: '',
        destination: '',
        contents: '',
      });
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('documents') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Error creating shipment:', error);
      toast({
        title: "Error",
        description: "Failed to create shipment. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Login Modal Component
  const LoginModal = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    if (!showLoginModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-2xl w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Sign In</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter your password"
              />
            </div>
            <div className="flex space-x-3 pt-3">
              <Button 
                className="flex-1" 
                variant="default" 
                onClick={() => handleLogin(email, password)}
              >
                Sign In
              </Button>
              <Button 
                className="flex-1" 
                variant="outline" 
                onClick={() => setShowLoginModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Navigation Bar with Wallet and Sign-in */}
      <div className="fixed top-0 left-0 z-50 w-full bg-black text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="font-bold text-xl">DShip</div>
            
            {/* Wallet Connection Button */}
            {!isWeb3Connected ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center space-x-2 border-white/20 hover:bg-white/10"
                onClick={handleConnectWallet}
              >
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </Button>
            ) : (
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-md">
                <Wallet className="h-4 w-4 text-green-400" />
                <span className="text-sm text-white/80 truncate w-24">
                  {wallet?.substring(0, 6)}...{wallet?.substring(wallet?.length - 4)}
                </span>
              </div>
            )}
            
            {/* Login/Logout Button */}
            {!isLoggedIn ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center space-x-2 border-white/20 hover:bg-white/10"
                onClick={() => setShowLoginModal(true)}
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center space-x-2 border-white/20 hover:bg-white/10"
                onClick={handleLogout}
              >
                <LogIn className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            )}
          </div>
          
          {/* Right side menu items if needed */}
          <div className="flex items-center space-x-4">
            {/* You can add additional header items here */}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl shadow-2xl border border-gray-800 flex items-center space-x-4">
            <svg className="animate-spin h-7 w-7 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-100 font-medium text-lg">Loading...</span>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal />

      {/* Hero Section - moved down to accommodate the navbar */}
      <div className="bg-gradient-to-r from-black to-black rounded-lg mb-10 p-10 text-white mt-20">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 md:w-2/3">
            <h1 className="text-4xl font-bold mb-4">Decentralized Shipment Tracking</h1>
            <p className="text-lg opacity-90 mb-6">
              Securely upload and manage your shipment documentation with blockchain technology. 
              All documents are stored on IPFS for maximum security and transparency.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-full mr-3">
                  <FileText className="h-5 w-5" />
                </div>
                <span>Document Verification</span>
              </div>
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-full mr-3">
                  <Truck className="h-5 w-5" />
                </div>
                <span>Real-time Tracking</span>
              </div>
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-full mr-3">
                  <MapPin className="h-5 w-5" />
                </div>
                <span>Global Coverage</span>
              </div>
            </div>
          </div>
          <div className="md:w-1/3 flex justify-center">
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <Package className="h-24 w-24 text-white mx-auto" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-[35rem] w-full">
          <WorldMap
            dots={[
              {
                start: {
                  lat: 64.2008,
                  lng: -149.4937,
                }, // Alaska (Fairbanks)
                end: {
                  lat: 34.0522,
                  lng: -118.2437,
                }, // Los Angeles
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
            ]}
          />
        </div>
      </div>

      <FloatingDock
        mobileClassName="translate-y-20" // only for demo, remove for production
        desktopClassName="fixed bottom-4 z-10 left-1/2 transform -translate-x-1/2 w-1/2 bg-white shadow-md p-4 flex justify-center" 
        items={links}
      />

      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <Package className="mr-2 h-8 w-8" />
        New Shipment Details
      </h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="shipmentId">Shipment ID</Label>
              <Input
                id="shipmentId"
                value={formData.shipmentId}
                onChange={(e) => setFormData({ ...formData, shipmentId: e.target.value })}
                placeholder="Enter shipment ID"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source Location</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="Enter source location"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="Enter destination"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contents">Shipment Contents</Label>
            <Textarea
              id="contents"
              value={formData.contents}
              onChange={(e) => setFormData({ ...formData, contents: e.target.value })}
              placeholder="Describe the contents of the shipment"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documents">Upload Documents</Label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PDF, PNG, JPG (MAX. 10MB)</p>
                  {file && (
                    <p className="text-sm text-green-600 mt-2">
                      Selected: {file.name}
                    </p>
                  )}
                </div>
                <input
                  id="documents"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg"
                />
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Create Shipment
          </Button>
        </form>
      </Card>

      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-10">
        {gridItems.map((item, index) => (
          <li key={index} className={`min-h-[14rem] list-none ${item.area}`}>
            <div className="relative h-full rounded-2xl border p-2 md:rounded-3xl md:p-3">
              <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
              <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border p-6 shadow-md md:p-6">
                <div className="relative flex flex-1 flex-col justify-between gap-3">
                  <div className="w-fit rounded-lg border border-white p-2">{item.icon}</div>
                  <div className="space-y-3">
                    <h3 className="pt-0.5 text-xl font-semibold font-sans">
                      {item.title}
                    </h3>
                    <h2 className="text-sm md:text-base text-white dark:text-white">
                      {item.description}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 