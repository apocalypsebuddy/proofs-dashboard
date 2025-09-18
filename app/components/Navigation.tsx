'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { getCurrentUserInfo } from '@/app/utils/auth';
import { useEffect, useState } from 'react';
import { UserAttributeKey } from 'aws-amplify/auth';

export default function Navigation() {
  const pathname = usePathname();
  const [userAttributes, setUserAttributes] = useState<Partial<Record<UserAttributeKey, string>>>({});
  const fetchUserInfo = async () => {
    const userInfo = await getCurrentUserInfo();
    setUserAttributes(userInfo?.attributes || {});
  };  
  
  useEffect(() => {
    fetchUserInfo();
  }, []);

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Lob Logo */}
            <Link href="/scan-events" className="flex items-center mr-8">
              <Image 
                src="https://s3-us-west-2.amazonaws.com/public.lob.com/dashboard/navbar/lob-logo.svg" 
                alt="Lob" 
                width={120}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
            
            {/* Navigation Links */}
            <div className="flex">
              {/* Proofs are the legacy page, don't need to show it but also don't want to go about deleting all the relevant code */}
              {/* <Link 
                href="/proofs"
                className={`inline-flex items-center px-4 py-2 border-b-2 ${
                  pathname === '/proofs' 
                    ? 'border-blue-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Proofs
              </Link> */}
              <Link 
                href="/scan-events"
                className={`inline-flex items-center px-4 py-2 border-b-2 ${
                  pathname === '/scan-events' 
                    ? 'border-blue-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Scan Events
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
          {userAttributes.name && (
            <div className="flex items-center text-gray-600">
              <span className="text-sm font-medium">{userAttributes.name}&nbsp;</span>
              <span className="text-sm font-small">({userAttributes.email})</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 