"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
  flagged?: boolean;
};

export default function ProofDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [proof, setProof] = useState<Proof | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<{ front: string; back: string } | null>(null);

  useEffect(() => {
    const fetchProof = async () => {
      try {
        const response = await fetch(`/api/proofs/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch proof');
        }
        const data = await response.json();
        setProof(data);

        // Extract keys from URLs
        const frontKey = data.printFrontUrl.split('/').pop();
        const backKey = data.printBackUrl.split('/').pop();

        // Fetch signed URLs
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

        setSignedUrls({
          front: frontData.url,
          back: backData.url
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProof();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !proof || !signedUrls) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 mb-4">{error || 'Proof not found'}</div>
        <button
          onClick={() => router.push('/proofs')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Proofs
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Proof Details</h1>
        <button
          onClick={() => router.push('/proofs')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Back to Proofs
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="relative h-[400px]">
            <Image
              src={signedUrls.front}
              alt="Proof Image Front"
              fill
              className="object-contain"
            />
          </div>
          <div className="relative h-[400px]">
            <Image
              src={signedUrls.back}
              alt="Proof Image Back"
              fill
              className="object-contain"
            />
          </div>
        </div>
        
        {/* Details Section */}
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p>{proof.description}</p>
              
              <label className="text-sm font-medium text-gray-500">Date</label>
              <p>{new Date(proof.date).toLocaleString()}</p>
              
              <label className="text-sm font-medium text-gray-500">Batch ID</label>
              <p>{proof.batchId}</p>

              <label className="text-sm font-medium text-gray-500">Resource ID</label>
              <p>{proof.resourceId}</p>

              <label className="text-sm font-medium text-gray-500">Printer Name</label>
              <p>{proof.printerName}</p>
             
              <label className="text-sm font-medium text-gray-500">Printer ID</label>
              <p>{proof.printerId}</p>
             
              <label className="text-sm font-medium text-gray-500">Customer Name</label>
              <p>{proof.customerName}</p>
          
              <label className="text-sm font-medium text-gray-500">Customer ID</label>
              <p>{proof.customerId}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 