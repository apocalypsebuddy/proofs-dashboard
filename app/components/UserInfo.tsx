'use client';

import { useEffect, useState } from 'react';
import { getCurrentUserInfo } from '../utils/auth';
import { UserAttributeKey } from 'aws-amplify/auth';

type UserAttributes = Partial<Record<UserAttributeKey, string>>;

export default function UserInfo() {
  const [userInfo, setUserInfo] = useState<{
    user: unknown;
    userId: string;
    groups: string[];
    attributes: UserAttributes;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserInfo() {
      try {
        const info = await getCurrentUserInfo();
        setUserInfo(info);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user info');
      } finally {
        setLoading(false);
      }
    }

    loadUserInfo();
  }, []);

  if (loading) return <div>Loading user info...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!userInfo) return <div>No user info available</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">User Information</h2>
      <div className="space-y-2">
        <p><strong>User ID:</strong> {userInfo.userId}</p>
        <p><strong>Groups:</strong></p>
        <ul className="list-disc list-inside">
          {userInfo.groups.map((group, index) => (
            <li key={index}>{group}</li>
          ))}
        </ul>
        <p><strong>All Attributes:</strong></p>
        <pre className="bg-gray-100 p-2 rounded">
          {/* {JSON.stringify(userInfo, null, 2)} */}
          {JSON.stringify(userInfo.user, null, 2)}
          {JSON.stringify(userInfo.attributes, null, 2)}
        </pre>
      </div>
    </div>
  );
} 