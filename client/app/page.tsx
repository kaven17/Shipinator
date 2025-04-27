"use client";

import { useState, useEffect, useCallback, lazy, Suspense, useMemo, memo } from "react";
import { useStorageUpload } from "@thirdweb-dev/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Package, Truck, FileText, MapPin, Wallet } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { auth, firebaseConfig } from "@/lib/firebase";
import { connectWallet, getWalletAddress, createShipment } from "@/lib/web3";
import { worldMapDots } from "../lib/map-props";
import { ref, set } from "firebase/database";
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Lazy load the WorldMap component with a more descriptive loading state
const WorldMap = lazy(() => import("@/components/ui/world-map"));

// Define type for form data
type FormData = {
  shipmentId: string;
  source: string;
  destination: string;
  contents: string;
  receiver: string;
  expiryDays: string;
};

// Initialize Firebase once outside component
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Memoized components to reduce re-renders
const Navbar = memo(({ isWeb3Connected, wallet, handleConnectWallet }: {
  isWeb3Connected: boolean;
  wallet: string | null;
  handleConnectWallet: () => Promise<void>;
}) => (
  <div className="fixed top-0 left-0 z-50 w-full bg-black text-white p-4">
    <div className="container mx-auto flex items-center justify-between">
      <div className="font-bold text-xl">BLOCKSHIP</div>
      
      {!isWeb3Connected ? (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2 text-black border-white hover:border-neutral-600"
          onClick={handleConnectWallet}
        >
          <Wallet className="h-4 w-4" />
          <span>Connect Wallet</span>
        </Button>
      ) : (
        <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-md">
          <Wallet className="h-4 w-4 text-green-400" />
          <span className="text-sm text-white truncate w-24">
            {wallet?.substring(0, 6)}...{wallet?.substring(wallet?.length - 4)}
          </span>
        </div>
      )}
    </div>
  </div>
));

Navbar.displayName = "Navbar";

// Loading overlay component
const LoadingOverlay = memo(({ isLoading }: { isLoading: boolean }) => (
  isLoading ? (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-xl shadow-2xl border border-gray-800 flex items-center space-x-4">
        <svg
          className="animate-spin h-7 w-7 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span className="text-gray-100 font-medium text-lg">
          Loading...
        </span>
      </div>
    </div>
  ) : null
));

LoadingOverlay.displayName = "LoadingOverlay";

// HeroSection component
const HeroSection = memo(({ showMap }: { showMap: boolean }) => (
  <div className="bg-gradient-to-r from-black to-black rounded-lg mb-10 p-10 text-white mt-20">
    <div className="flex flex-col md:flex-row items-center justify-between">
      <div className="mb-6 md:mb-0 md:w-2/3">
        <h1 className="text-4xl font-bold mb-4">Blockchain Based Contract and Bio Stability Tracking</h1>
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
    
    <div className="flex items-center justify-center h-2xl w-full">
      {showMap && (
        <Suspense fallback={<div className="h-64 w-full flex items-center justify-center text-white text-center">Loading map...</div>}>
          <WorldMap dots={worldMapDots} />
        </Suspense>
      )}
    </div>
  </div>
));

HeroSection.displayName = "HeroSection";

// FormField component for reusability
interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  min?: string;
  max?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  helpText?: string;
}

const FormField = memo(({ id, label, type, min, max, value, onChange, placeholder, helpText }: FormFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      type={type || 'text'}
      min={min}
      max={max}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
    />
    {helpText && (
      <p className="text-sm text-muted-foreground">{helpText}</p>
    )}
  </div>
));

FormField.displayName = "FormField";

// FileUpload component
const FileUpload = memo(({ file, onChange }: {
  file: File | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
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
          accept=".pdf,.png,.jpg"
          className="hidden"
          onChange={onChange}
        />
      </label>
    </div>
  </div>
));

FileUpload.displayName = "FileUpload";

export default function ShipmentDetails() {
  // Initial state
  const initialFormData = useMemo(() => ({
    shipmentId: "",
    source: "",
    destination: "",
    contents: "",
    receiver: "",
    expiryDays: "1",
  }), []);

  // State management
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isWeb3Connected, setIsWeb3Connected] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  // Hooks
  const { mutateAsync: upload } = useStorageUpload();
  const { toast } = useToast();

  // Form field definitions - moved to useMemo to prevent re-creation
  const formFields = useMemo(() => [
    { id: 'shipmentId', label: 'Shipment ID', type: 'text', placeholder: 'Enter shipment ID' },
    { id: 'receiver', label: 'Receiver Address', type: 'text', placeholder: 'Enter receiver wallet address' },
    { 
      id: 'expiryDays', 
      label: 'Shipping Days(Assumption)', 
      type: 'number', 
      min: '1', 
      max: '365', 
      placeholder: 'Number of days for shipping',
      helpText: 'Enter the number of days (1-365)'
    },
    { id: 'source', label: 'Source Location', type: 'text', placeholder: 'Enter source location' },
    { id: 'destination', label: 'Destination', type: 'text', placeholder: 'Enter destination' }
  ], []);

  // Check auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Delayed map display for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMap(true);
    }, 1000); // Increased delay to prioritize form loading
    return () => clearTimeout(timer);
  }, []);

  // Form handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  }, []);

  // File handler with validation
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      const maxSizeInBytes = 10 * 1024 * 1024;

      if (selectedFile.size > maxSizeInBytes) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
    }
  }, [toast]);

  // Wallet connection handler
  const handleConnectWallet = useCallback(async () => {
    setIsLoading(true);
    try {
      await connectWallet();
      const address = await getWalletAddress();
      setWallet(address);
      setIsWeb3Connected(true);
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been successfully connected",
      });
    } catch (error) {
      toast({
        title: "Wallet Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Form validation
  const validateForm = useCallback(() => {
    // Check for wallet connection
    if (!isWeb3Connected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return false;
    }
  
    // Validate shipment ID
    const shipmentIdParsed = parseInt(formData.shipmentId);
    if (isNaN(shipmentIdParsed) || shipmentIdParsed <= 0) {
      toast({
        title: "Invalid Shipment ID",
        description: "Shipment ID must be a valid positive number",
        variant: "destructive",
      });
      return false;
    }

    // Check for required file
    if (!file) {
      toast({
        title: "Missing Document",
        description: "Please upload a document file",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  }, [isWeb3Connected, formData.shipmentId, file, toast]);

  // Form submission handler - optimized with separate validation
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Input sanitization helper
    const sanitizeInput = (input: string, maxLength: number) =>
      input.trim().slice(0, maxLength);
  
    // Create a safe description string
    const safeDescription = `Shipment from ${sanitizeInput(
      formData.source,
      50
    )} to ${sanitizeInput(formData.destination, 50)}: ${sanitizeInput(
      formData.contents,
      400
    )}`;
  
    const shipmentIdParsed = parseInt(formData.shipmentId);
  
    try {
      setIsLoading(true);
  
      // Upload file to IPFS - using Promise.all for concurrent operations
      const [uploadUrls] = await Promise.all([
        upload({
          data: [file],
          options: { uploadWithGatewayUrl: true },
        })
      ]);
      
      const documentUrl = uploadUrls[0];
      const documentCID = documentUrl.replace(/^.*\/ipfs\//, "");
  
      // Create shipment on blockchain
      const tx = await createShipment(
        shipmentIdParsed,
        safeDescription,
        formData.receiver,
        documentCID
      );
  
      // Save to Firebase
      const shipmentRef = ref(database, `shipments/${formData.shipmentId}`);
      await set(shipmentRef, {
        ...formData,
        description: safeDescription,
        documentUrl,
        documentCID,
        txHash: tx.transactionHash,
        owner: wallet,
        timestamp: new Date().toISOString(),
      });
  
      // Show success message
      toast({
        title: "Success",
        description: "Shipment created successfully!",
      });
  
      // Reset form
      setFormData(initialFormData);
      setFile(null);
    } catch (error) {
      console.error("Shipment Creation Error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Transaction failed unexpectedly";
  
      toast({
        title: "Shipment Creation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, file, wallet, validateForm, upload, toast, initialFormData]);

  return (
    <div className="max-w-7xl mx-auto my-10">
      <Navbar 
        isWeb3Connected={isWeb3Connected} 
        wallet={wallet} 
        handleConnectWallet={handleConnectWallet} 
      />
      <LoadingOverlay isLoading={isLoading} />
      <HeroSection showMap={showMap} />
      
      {/* Main form section */}
      <div>
        <h1 className="text-3xl font-bold mb-8 flex items-center text-white">
          <Package className="mr-2 h-8 w-8" />
          New Shipment Details
        </h1>
    
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
              {formFields.map(field => (
                <FormField
                  key={field.id}
                  id={field.id}
                  label={field.label}
                  type={field.type}
                  min={field.min}
                  max={field.max}
                  value={formData[field.id as keyof FormData]}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                  helpText={field.helpText}
                />
              ))}
            </div>
    
            <div className="space-y-2">
              <Label htmlFor="contents">Shipment Contents</Label>
              <Textarea
                id="contents"
                value={formData.contents}
                onChange={handleInputChange}
                placeholder="Describe the contents of the shipment"
                required
              />
            </div>
    
            <FileUpload file={file} onChange={handleFileChange} />
    
            <Button 
              type="submit" 
              className="w-full"
              disabled={!isWeb3Connected || isLoading}
            >
              {isLoading ? "Processing..." : isWeb3Connected ? "Create Shipment" : "Connect Wallet First"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}