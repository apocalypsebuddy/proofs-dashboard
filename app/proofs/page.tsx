"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import UploadForm from "../components/UploadForm";
import { fetchAuthSession } from 'aws-amplify/auth';
import { getCurrentUserInfo } from '@/app/utils/auth';

// TODO: Move to a separate file
type Proof = {
  id: string;
  date: string;
  batchId: string;
  resourceId: string;
  description: string;
  customerId: string;
  customerName: string;
  printerId: string;
  printerName: string;
  printFrontUrl: string;
  printBackUrl: string;
  signedFrontUrl: string;
  signedBackUrl: string;
  flagged?: boolean;
};

type TabType = 'All' | 'Flagged';

// Service layer to abstract API calls
// This layer adds presigned URLs to the proofs instead of a direct fetch
// TODO: Move to a separate file
const proofsService = {
  async fetchProofs(): Promise<Proof[]> {
    const { tokens } = await fetchAuthSession();
    const response = await fetch('/api/proofs', {
      headers: {
        'Authorization': `Bearer ${tokens?.accessToken?.toString()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch proofs');
    }
    
    const data = await response.json();
    
    // Fetch signed URLs for each proof
    const proofsWithSignedUrls = await Promise.all(
      data.map(async (proof: Proof) => {
        const frontKey = proof.printFrontUrl.split('/').pop();
        const backKey = proof.printBackUrl.split('/').pop();

        const [frontResponse, backResponse] = await Promise.all([
          fetch(`/api/signed-url?key=${frontKey}`),
          fetch(`/api/signed-url?key=${backKey}`)
        ]);

        if (!frontResponse.ok || !backResponse.ok) {
          throw new Error('Failed to fetch signed URLs');
        }

        const [frontData, backData] = await Promise.all([
          frontResponse.json(),
          backResponse.json()
        ]);

        return {
          ...proof,
          signedFrontUrl: frontData.url,
          signedBackUrl: backData.url
        };
      })
    );

    return proofsWithSignedUrls;
  },
};


export default function ProofsIndex() {
  const router = useRouter();
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [userGroups, setUserGroups] = useState<string[]>([]);

  const fetchUserInfo = async () => {
    try {
      const userInfo = await getCurrentUserInfo();
      setUserGroups(userInfo?.groups || []);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const fetchProofs = async () => {
    try {
      const data = await proofsService.fetchProofs();
      setProofs(data);
    } catch (error) {
      console.error("Error fetching proofs:", error);
    }
  };

  useEffect(() => {
    fetchUserInfo();
    fetchProofs();
  }, []);

  const filteredProofs = activeTab === 'All' 
    ? proofs 
    : proofs.filter(proof => proof.flagged);

  // TODO: Move this to proofsService
  const handleUpload = async (formData: FormData) => {
    try {
      const response = await fetch('/api/proofs', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // TODO: Error handling here is mostly for debugging, should handle errors so they fail gracefully
        const errorData = await response.json();
        console.error('Upload failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.error || 'Failed to upload proof');
      }

      // Refresh the proofs list after upload
      const data = await proofsService.fetchProofs();
      setProofs(data);
    } catch (error) {
      console.error('Error uploading proof:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-6 p-6 px-18">
      {/* Header with Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Proofs</h1>
          {/* Only show upload button if user is not in customer group */}
          {!userGroups.includes('customer') && (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Upload Proof
            </button>
          )}
        </div>
        {/* TABS FOR WHEN WE ARE ABLE TO FLAG PROOFS */}
        <div className="flex space-x-4 mb-4">
          {(['All', 'Flagged'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium rounded-t-lg ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <UploadForm
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSubmit={handleUpload}
      />

      {/* Proofs List */}
      <div className="space-y-4">
        {filteredProofs.map((proof) => (
          <div
            key={proof.id}
            onClick={() => router.push(`/proofs/${proof.id}`)}
            className="grid grid-cols-2 gap-6 bg-white p-6 shadow rounded cursor-pointer hover:shadow-lg transition-shadow"
          >
            {/* Info Column */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg mb-4 text-gray-500">Info</h3>
              <p className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-medium text-gray-600">Description:</span>
                <span className="text-gray-400">{proof.description}</span>
              </p>
              <p className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-medium text-gray-600">Date:</span>
                <span className="text-gray-400">{new Date(proof.date).toLocaleString()}</span>
              </p>
              <p className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-medium text-gray-600">Resource ID:</span>
                <span className="text-gray-400">{proof.resourceId}</span>
              </p>
              <p className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-medium text-gray-600">Batch ID:</span>
                <span className="text-gray-400">{proof.batchId}</span>
              </p>
              <p className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-medium text-gray-600">Printer:</span>
                <span className="text-gray-400">{proof.printerName} (ID: {proof.printerId})</span>
              </p>
              <p className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-medium text-gray-600">Customer:</span>
                <span className="text-gray-400">{proof.customerName} (ID: {proof.customerId})</span>
              </p>
            </div>

            {/* Image Column */}
            <div className="flex items-center justify-center space-x-4">
              <div className="relative h-[200px] w-[200px]">
                <Image
                  src={proof.signedFrontUrl}
                  alt="Proof Image Front"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative h-[200px] w-[200px]">
                <Image
                  src={proof.signedBackUrl}
                  alt="Proof Image Back"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
