// app/proofs/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
// import { API, graphqlOperation } from "aws-amplify";
// import { listProofs } from "../../graphql/queries";

type Proof = {
  id: string;
  date: string;
  batchId: string;
  description: string;
  customerId: string;
  customerName: string;
  printerId: string;
  printerName: string;
  imageUrl: string;
  flagged?: boolean;
};

type TabType = 'All' | 'Flagged';

// Service layer to abstract API calls
const proofsService = {
  // Local API implementation
  async fetchProofs(): Promise<Proof[]> {
    const response = await fetch('/api/proofs');
    const data = await response.json();
    return data.items;
  },

  // AWS Amplify implementation (commented out for future use)
  /*
  async fetchProofs(): Promise<Proof[]> {
    const response: any = await API.graphql(
      graphqlOperation(listProofs, {})
    );
    return response.data.listProofs.items;
  }
  */
};

export default function ProofsIndex() {
  const router = useRouter();
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('All');

  useEffect(() => {
    const fetchProofs = async () => {
      try {
        const data = await proofsService.fetchProofs();
        // Sort by date descending (newest first)
        setProofs(data.sort((a: Proof, b: Proof) => (a.date < b.date ? 1 : -1)));
      } catch (error) {
        console.error("Error fetching proofs:", error);
      }
    };

    fetchProofs();
  }, []);

  const filteredProofs = activeTab === 'All' 
    ? proofs 
    : proofs.filter(proof => proof.flagged);

  return (
    <div className="space-y-6 p-6 px-18">
      {/* Header with Tabs 
      TODO: Turn into buttons
      TODO: Add filter by printer, date range, batch ID, etc.
      */}
      <div className="border-b border-gray-200">
        <h1 className="text-3xl font-bold mb-6">Proofs</h1>
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
              <h3 className="font-semibold text-lg mb-4">Info</h3>
              <p className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-medium text-gray-600">Date:</span>
                <span className="text-gray-400">{new Date(proof.date).toLocaleString()}</span>
              </p>
              <p className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-medium text-gray-600">Batch ID:</span>
                <span className="text-gray-400">{proof.batchId}</span>
              </p>
              <p className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-medium text-gray-600">Description:</span>
                <span className="text-gray-400">{proof.description}</span>
              </p>
              <p className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-medium text-gray-600">Customer:</span>
                <span className="text-gray-400">{proof.customerName} (ID: {proof.customerId})</span>
              </p>
              <p className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-medium text-gray-600">Printer:</span>
                <span className="text-gray-400">{proof.printerName} (ID: {proof.printerId})</span>
              </p>
            </div>

            {/* Image Column */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <Image
                  src={proof.imageUrl}
                  alt="Proof Preview"
                  fill
                  className="object-contain rounded"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
