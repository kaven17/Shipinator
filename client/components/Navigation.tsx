"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Ship, Goal as Vial, Package, Inbox } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Shipment Details', href: '/', icon: Ship },
    { name: 'Medicine Tracker', href: '/medicine-tracker', icon: Vial },
    { name: 'Sent Shipments', href: '/sent-shipments', icon: Package },
    { name: 'Receiver Dashboard', href: '/receiver', icon: Inbox },
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Ship className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">BlockShip</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      pathname === item.href
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}