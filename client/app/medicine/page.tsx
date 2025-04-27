"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Goal as Vial, ThermometerSun, Clock, Copy, Download, Loader2, ChevronsUpDown, Check, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { format, differenceInDays } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

type Medicine = {
  name: string;
  shelfLife: number;
  maxTemp: number;
  description: string;
};

type WeatherData = {
  temp: number;
  location: string;
};

export default function MedicineTracker() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    medicineName: '',
    travelDays: '',
    temperature: '',
    destination: ''
  });
  const [manufactureDate, setManufactureDate] = useState<Date | undefined>();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMeds, setIsFetchingMeds] = useState(false);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [result, setResult] = useState<{
    canShip: boolean;
    message: string;
  } | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  // Mock API function - replace with actual API call
  const fetchMedicines = async () => {
    setIsFetchingMeds(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data - replace with actual API response
      const mockData: Medicine[] = [
        { name: "Insulin", shelfLife: 30, maxTemp: 8, description: "Diabetes medication" },
        { name: "Amoxicillin", shelfLife: 90, maxTemp: 25, description: "Antibiotic" },
        { name: "Vaccine", shelfLife: 180, maxTemp: 5, description: "Immunization" },
        { name: "Aspirin", shelfLife: 730, maxTemp: 30, description: "Pain reliever" }
      ];
      
      setMedicines(mockData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch medicines data",
        variant: "destructive"
      });
    } finally {
      setIsFetchingMeds(false);
    }
  };

  // Real weather API integration
  const fetchWeather = async (location: string) => {
    if (!location) return;
    
    setIsFetchingWeather(true);
    try {
      // Using OpenWeatherMap API - replace with your API key
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${process.env.NEXT_PUBLIC_WEATHER_API_KEY || 'YOUR_API_KEY'}`
      );
      
      if (!response.ok) throw new Error('Weather data not available');
      
      const data = await response.json();
      setWeather({
        temp: data.main.temp,
        location: data.name
      });
      setFormData(prev => ({ ...prev, temperature: data.main.temp.toString() }));
    } catch (error) {
      toast({
        title: "Weather Error",
        description: "Could not fetch temperature data",
        variant: "destructive"
      });
    } finally {
      setIsFetchingWeather(false);
    }
  };

  const checkShipment = async () => {
    setIsLoading(true);
    
    try {
      const medicine = medicines.find(m => m.name === formData.medicineName);
      
      if (!medicine) {
        setResult({
          canShip: false,
          message: "Medicine not found in database"
        });
        return;
      }

      const travelDays = parseInt(formData.travelDays) || 0;
      const temperature = parseFloat(formData.temperature) || 0;

      let canShip = true;
      let message = '';

      // Temperature check
      if (temperature > medicine.maxTemp) {
        canShip = false;
        message = `Temperature too high (max ${medicine.maxTemp}°C)`;
      }

      // Shelf life check
      let remainingShelfLife = medicine.shelfLife;
      if (manufactureDate) {
        remainingShelfLife = Math.max(0, medicine.shelfLife - differenceInDays(new Date(), manufactureDate));
      }

      if (travelDays > remainingShelfLife) {
        canShip = false;
        message = message 
          ? `${message} and travel time exceeds remaining shelf life (${remainingShelfLife} days)`
          : `Travel time exceeds remaining shelf life (${remainingShelfLife} days)`;
      } else if (!message) {
        message = `Safe to ship. ${remainingShelfLife} days remaining shelf life exceeds ${travelDays} days travel time.`;
      }

      setResult({
        canShip,
        message
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check shipment viability",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <Vial className="mr-2 h-8 w-8" />
        Medicine Shelf Life Tracker
      </h1>

      <Card className="p-6">
        <form onSubmit={(e) => { e.preventDefault(); checkShipment(); }} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="medicineName">Medicine Name</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    disabled={isFetchingMeds}
                  >
                    {formData.medicineName || "Select medicine..."}
                    {isFetchingMeds ? (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search medicine..." />
                    <CommandEmpty>No medicine found.</CommandEmpty>
                    <CommandGroup>
                      {medicines.map((medicine) => (
                        <CommandItem
                          key={medicine.name}
                          value={medicine.name}
                          onSelect={() => {
                            setFormData({...formData, medicineName: medicine.name})
                            setOpen(false)
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              formData.medicineName === medicine.name ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          {medicine.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="travelDays" className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Travel Days
                </Label>
                <Input
                  id="travelDays"
                  type="number"
                  min="1"
                  value={formData.travelDays}
                  onChange={(e) => setFormData({ ...formData, travelDays: e.target.value })}
                  placeholder="Enter travel duration"
                  required
                />
              </div>

              <div>
                <Label htmlFor="temperature" className="flex items-center">
                  <ThermometerSun className="h-4 w-4 mr-1" />
                  Temperature (°C)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                    placeholder="Enter temperature"
                    required
                  />
                  {formData.destination && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => fetchWeather(formData.destination)}
                      disabled={isFetchingWeather}
                    >
                      {isFetchingWeather ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ThermometerSun className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                {formData.medicineName && medicines.find(m => m.name === formData.medicineName) && (
                  <div className="mt-2">
                    <Progress 
                      value={Math.min(100, (parseFloat(formData.temperature || '0') / medicines.find(m => m.name === formData.medicineName)!.maxTemp * 100) || 0)}
                      className={`h-2 ${
                        parseFloat(formData.temperature || '0') > medicines.find(m => m.name === formData.medicineName)!.maxTemp 
                          ? 'bg-red-500' 
                          : 'bg-green-500'
                      }`}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0°C</span>
                      <span>Max: {medicines.find(m => m.name === formData.medicineName)!.maxTemp}°C</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="destination" className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Destination
                </Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="Enter destination city"
                />
              </div>

              <div>
                <Label>Manufacture Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {manufactureDate ? format(manufactureDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={manufactureDate}
                      onSelect={setManufactureDate}
                      initialFocus
                      fromDate={new Date(2020, 0, 1)}
                      toDate={new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {formData.medicineName && medicines.find(m => m.name === formData.medicineName) && (
            <Alert className="bg-blue-50">
              <AlertTitle className="text-blue-800">Storage Information</AlertTitle>
              <AlertDescription className="text-blue-700">
                <p><strong>{formData.medicineName}</strong>: {
                  medicines.find(m => m.name === formData.medicineName)!.description
                }</p>
                <p className="mt-1">Should be stored at or below {
                  medicines.find(m => m.name === formData.medicineName)!.maxTemp
                }°C.</p>
                <p className="mt-1">Typical shelf life: {
                  medicines.find(m => m.name === formData.medicineName)!.shelfLife
                } days from manufacture.</p>
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoading ? "Checking..." : "Check Shipment Viability"}
          </Button>
        </form>

        {weather && (
          <Alert className="mt-4 bg-gray-50">
            <AlertTitle className="text-gray-800">Weather at Destination</AlertTitle>
            <AlertDescription className="text-gray-700">
              Current temperature in {weather.location}: {weather.temp.toFixed(1)}°C
            </AlertDescription>
          </Alert>
        )}

        {result && (
          <>
            <Alert className={`mt-6 ${result.canShip ? 'bg-green-50' : 'bg-red-50'}`}>
              <AlertTitle className={result.canShip ? 'text-green-800' : 'text-red-800'}>
                {result.canShip ? 'Shipment Approved' : 'Shipment Not Recommended'}
              </AlertTitle>
              <AlertDescription className={result.canShip ? 'text-green-700' : 'text-red-700'}>
                {result.message}
              </AlertDescription>
            </Alert>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <ThermometerSun className="h-6 w-6" />
                <div>
                  <p className="text-sm text-muted-foreground">Temperature</p>
                  <p className={`font-medium ${
                    parseFloat(formData.temperature) > medicines.find(m => m.name === formData.medicineName)!.maxTemp 
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}>
                    {formData.temperature}°C / {medicines.find(m => m.name === formData.medicineName)!.maxTemp}°C max
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-6 w-6" />
                <div>
                  <p className="text-sm text-muted-foreground">Shelf Life</p>
                  <p className={`font-medium ${
                    parseInt(formData.travelDays) > medicines.find(m => m.name === formData.medicineName)!.shelfLife 
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}>
                    {formData.travelDays} days / {medicines.find(m => m.name === formData.medicineName)!.shelfLife} days max
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify({
                    medicine: formData.medicineName,
                    result: result.message,
                    temperature: formData.temperature,
                    travelDays: formData.travelDays,
                    weather: weather
                  }, null, 2));
                  toast({ description: "Results copied to clipboard" });
                }}
              >
                <Copy className="mr-2 h-4 w-4" /> Copy Results
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  const data = {
                    medicine: medicines.find(m => m.name === formData.medicineName),
                    result,
                    temperature: formData.temperature,
                    travelDays: formData.travelDays,
                    manufactureDate: manufactureDate?.toISOString(),
                    weather
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `medicine-shipment-${formData.medicineName}-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                }}
              >
                <Download className="mr-2 h-4 w-4" /> Save as JSON
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}