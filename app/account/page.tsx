'use client';

import UserInfo from '../components/UserInfo';
import LogoutButton from '../components/LogoutButton';

export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Account Information</h1>
        <LogoutButton />
      </div>
      <UserInfo />
    </div>
  );
} 