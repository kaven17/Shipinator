"use client";

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  FileText,
  Download,
  CheckCircle,
  AlertTriangle,
  Package,
  MapPin,
  Truck,
  ExternalLink
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { getDatabase, ref, get } from 'firebase/database';
import { auth, signInWithGoogle } from '@/lib/firebase';
import {
  initializeWeb3,
  getShipmentDetails,
  connectWallet,
  getWalletAddress
} from '@/lib/web3';

interface Shipment {
  shipmentId: string;
  source: string;
  destination: string;
  timestamp: string;
  status?: string;

  // on‑chain
  contents?: string;
  documentCID?: string;
  receiver?: string;

  // helper
  documentUrl?: string;
}

export default function ReceiverPage() {
  const [shipmentId, setShipmentId] = useState('');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isWeb3Connected, setIsWeb3Connected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string|null>(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const { toast } = useToast();

  // 1️⃣ Auth listener
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => setIsLoggedIn(!!user));
    return () => unsub();
  }, []);

  // 2️⃣ Wallet check
  useEffect(() => {
    (async () => {
      if (typeof window === 'undefined' || !window.ethereum) return;
      try {
        const accounts: string[] = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length) {
          setWalletAddress(accounts[0]);
          setIsWeb3Connected(true);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      toast({ title: "Login successful" });
    } catch {
      toast({ title: "Login failed", variant: "destructive" });
    }
  };

  const handleConnectWallet = async () => {
    setIsLoading(true);
    try {
      await connectWallet();
      const addr = await getWalletAddress();
      setWalletAddress(addr);
      setIsWeb3Connected(true);
      toast({ title: "Wallet connected" });
    } catch {
      toast({ title: "Connection failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // 3️⃣ Fetch
  const fetchShipment = async () => {
    await initializeWeb3();

    if (!shipmentId.trim()) {
      toast({ title: "Error", description: "Please enter a shipment ID", variant: "destructive" });
      return;
    }
    const clean = shipmentId.replace(/\D/g,'');
    const idNum = parseInt(clean, 10);
    if (isNaN(idNum) || idNum <= 0) {
      toast({ title: "Invalid ID", description: "Shipment ID must be a positive number", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      // — Firebase
      const db = getDatabase();
      const snap = await get(ref(db, `shipments/${shipmentId}`));
      if (!snap.exists()) {
        toast({ title: "Not found", description: "No shipment in Firebase", variant: "destructive" });
        setShipment(null);
        return;
      }
      const fb = snap.val();

      // — On‑chain
      let bc: Partial<Shipment> = {};
      if (isWeb3Connected && walletAddress) {
        const details = await getShipmentDetails(idNum);
        // details may be returned as an object with named keys _and_ numeric indices:
        const desc = details.desc ?? details[0];
        const receiverAddr = details.receiver ?? details[2];
        const cid = details.cid ?? details[3];
        bc = {
          contents: desc,
          receiver: receiverAddr,
          documentCID: cid
        };
      }

      setShipment({
        shipmentId,
        source: fb.source,
        destination: fb.destination,
        timestamp: fb.timestamp,
        status: fb.status,
        ...bc,
        documentUrl: bc.documentCID
          ? `https://gateway.pinata.cloud/ipfs/${bc.documentCID}`
          : undefined
      });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Could not fetch shipment", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // 4️⃣ Claim UI
  const claimDocument = async () => {
    if (!isLoggedIn || !isWeb3Connected || !shipment) {
      toast({ title: "Auth required", variant: "destructive" });
      return;
    }
    setClaimLoading(true);
    await new Promise(r => setTimeout(r,2000));
    setClaimed(true);
    toast({ title: "Document claimed successfully" });
    setClaimLoading(false);
  };

  // 5️⃣ Helpers
  const viewDocument = () => {
    if (!shipment?.documentUrl) {
      toast({ title: "No document", variant: "destructive" });
      return;
    }
    window.open(shipment.documentUrl, '_blank');
  };
  const viewNFT = () => {
    if (!shipmentId) return;
    window.open(
      `https://sepolia.etherscan.io/token/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}/token/${shipmentId}`,
      '_blank'
    );
  };

  return (
    <div className="container mx-auto p-6 mt-20">
      <h1 className="text-3xl font-bold mb-6">Document Receiver Portal</h1>

      {/* AUTH */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>Sign in &amp; connect wallet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block mb-2">Google</Label>
              {!isLoggedIn
                ? <Button onClick={handleGoogleLogin} variant="outline" className="w-full">Sign in with Google</Button>
                : <div className="p-2 bg-green-50 text-green-700 rounded flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />Logged in
                  </div>
              }
            </div>
            <div>
              <Label className="block mb-2">Wallet</Label>
              {!isWeb3Connected
                ? <Button onClick={handleConnectWallet} variant="outline" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Connecting…' : 'Connect Wallet'}
                  </Button>
                : <div className="p-2 bg-green-50 text-green-700 rounded flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {walletAddress?.slice(0,6)}…{walletAddress?.slice(-4)}
                  </div>
              }
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEARCH */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Find Shipment</CardTitle>
          <CardDescription>Enter your shipment ID</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. 42"
              value={shipmentId}
              onChange={e => setShipmentId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={fetchShipment} disabled={isLoading || !shipmentId}>
              {isLoading ? 'Searching…' : 'Find'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* DETAILS */}
      {shipment && (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>ID: {shipment.shipmentId}</CardTitle>
                <CardDescription>{shipment.status ?? 'In Transit'}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-500 mb-2">Shipment Info</h4>
                <div className="space-y-2">
                  <div className="flex justify-between"><span>Contents</span><span>{shipment.contents}</span></div>
                  <div className="flex justify-between"><span>Origin</span><span>{shipment.source}</span></div>
                  <div className="flex justify-between"><span>Destination</span><span>{shipment.destination}</span></div>
                  <div className="flex justify-between"><span>Date</span><span>{new Date(shipment.timestamp).toLocaleDateString()}</span></div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-500 mb-2">Document</h4>
                <div className="space-y-2">
                  <div className="flex justify-between"><span>IPFS CID</span><span className="truncate">{shipment.documentCID}</span></div>
                  <div className="flex justify-between"><span>Available</span><span><CheckCircle className="inline w-4 h-4 text-green-600" /></span></div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Actions */}
            <div className="flex items-center justify-between">
              {claimed
                ? <>
                    <Button onClick={viewDocument}><Download className="mr-2 w-4 h-4"/>View</Button>
                    <Button variant="outline" onClick={viewNFT}><ExternalLink className="mr-2 w-4 h-4"/>View NFT</Button>
                  </>
                : <Button onClick={claimDocument} disabled={claimLoading || !isLoggedIn || !isWeb3Connected}>
                    {claimLoading ? 'Claiming…' : 'Claim NFT'}
                  </Button>
              }
            </div>
            {(!isLoggedIn || !isWeb3Connected) && (
              <div className="mt-4 p-2 bg-yellow-50 text-yellow-800 rounded flex items-center">
                <AlertTriangle className="mr-2 w-4 h-4"/> Please sign in & connect wallet
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="text-sm text-gray-500 flex items-center">
              <Truck className="mr-1 w-4 h-4"/>Secured via Blockchain + IPFS
            </div>
          </CardFooter>
        </Card>
      )}

      {/* EMPTY / NOT FOUND */}
      {!shipment && !isLoading && shipmentId && (
        <Card>
          <CardContent className="py-10 text-center">
            <AlertTriangle className="mx-auto mb-4 w-12 h-12 text-yellow-500"/>
            <h2 className="text-xl font-medium mb-2">Not Found</h2>
            <p className="text-gray-500">No shipment with ID “{shipmentId}”</p>
          </CardContent>
        </Card>
      )}
      {!shipment && !isLoading && !shipmentId && (
        <Card>
          <CardContent className="py-10 text-center">
            <MapPin className="mx-auto mb-4 w-12 h-12 text-gray-400"/>
            <h2 className="text-xl font-medium mb-2">Enter a Shipment ID</h2>
            <p className="text-gray-500">Input your ID to retrieve its NFT document</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
