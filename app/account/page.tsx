'use client';

import UserInfo from '../components/UserInfo';

export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Account Information</h1>
      <UserInfo />
    </div>
  );
} 