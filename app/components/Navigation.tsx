'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCurrentUserInfo } from '@/app/utils/auth';
import { useEffect, useState } from 'react';
import { UserAttributeKey } from 'aws-amplify/auth';

export default function Navigation() {
  const pathname = usePathname();
  const [userAttributes, setUserAttributes] = useState<Partial<Record<UserAttributeKey, string>>>({});

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userInfo = await getCurrentUserInfo();
      setUserAttributes(userInfo?.attributes || {});
    };  
    fetchUserInfo();
  }, []);

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
          {userAttributes.name && (
            <div className="flex items-center text-gray-600">
              <span className="text-sm font-medium">{userAttributes.name}</span>
              <span className="text-sm font-small">({userAttributes.email})</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 