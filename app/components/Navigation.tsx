'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link 
              href="/proofs"
              className={`inline-flex items-center px-4 py-2 border-b-2 ${
                pathname === '/proofs' 
                  ? 'border-blue-500 text-gray-900' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/account"
              className={`inline-flex items-center px-4 py-2 border-b-2 ${
                pathname === '/account' 
                  ? 'border-blue-500 text-gray-900' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Account
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 