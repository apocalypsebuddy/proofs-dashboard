"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { getCurrentUserInfo } from '@/app/utils/auth';
import { fetchAuthSession } from 'aws-amplify/auth';
import ImageViewer from '@/app/components/ImageViewer';

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
  printFrontUrl?: string | null;
  printBackUrl?: string | null;
  dataImageS3Key?: string | null;
  signedFrontUrl?: string;
  signedBackUrl?: string;
  signedDataImageUrl?: string;
  flagged?: boolean;
};

export default function ProofDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [proof, setProof] = useState<Proof | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<{ front?: string; back?: string; dataImage?: string } | null>(null);
  const [userGroups, setUserGroups] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const { id } = use(params);

  const fetchUserInfo = async () => {
      const userInfo = await getCurrentUserInfo();
      setUserGroups(userInfo?.groups || []);
  };

  useEffect(() => {
    const fetchProof = async () => {
      try {
        const response = await fetch(`/api/proofs/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch proof');
        }
        const data = await response.json();
        setProof(data);

        const signedUrls: { front?: string; back?: string; dataImage?: string } = {};

        // Handle legacy front/back URLs if they exist
        if (data.printFrontUrl) {
          const frontKey = data.printFrontUrl.split('/').pop();
          if (frontKey) {
            try {
              const frontResponse = await fetch(`/api/signed-url?key=${frontKey}`);
              if (frontResponse.ok) {
                const frontData = await frontResponse.json();
                signedUrls.front = frontData.url;
              }
            } catch (error) {
              console.error('Failed to get signed URL for front image:', error);
            }
          }
        }

        if (data.printBackUrl) {
          const backKey = data.printBackUrl.split('/').pop();
          if (backKey) {
            try {
              const backResponse = await fetch(`/api/signed-url?key=${backKey}`);
              if (backResponse.ok) {
                const backData = await backResponse.json();
                signedUrls.back = backData.url;
              }
            } catch (error) {
              console.error('Failed to get signed URL for back image:', error);
            }
          }
        }

        // Handle new dataImageS3Key if it exists
        if (data.dataImageS3Key) {
          try {
            const dataImageResponse = await fetch(`/api/signed-url?key=${data.dataImageS3Key}`);
            if (dataImageResponse.ok) {
              const dataImageData = await dataImageResponse.json();
              signedUrls.dataImage = dataImageData.url;
            }
          } catch (error) {
            console.error('Failed to get signed URL for data image:', error);
          }
        }

        setSignedUrls(signedUrls);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
    fetchProof();
  }, [id]);

  const handleDelete = async () => {
    // TODO: I'm not big on using the window object, but I don't want to build a modal right now
    if (!window.confirm('Are you sure you want to delete this proof?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const { tokens } = await fetchAuthSession();
      if (!tokens?.accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch(`/api/proofs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken.toString()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete proof');
      }

      router.push('/proofs');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete proof');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !proof) {
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

  // TODO: Abstract into components
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

      {/* if dataImageS3Key exists, show that image, otherwise show front image and back image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image Section */}
        <div className="space-y-4">
          {proof.dataImageS3Key && signedUrls?.dataImage ? (
            <div className="relative h-[400px]">
              <ImageViewer
                src={signedUrls.dataImage}
                alt="Proof Image"
                className="h-full"
              />
            </div>
          ) : (
            <>
              {signedUrls?.front && (
                <div className="relative h-[400px]">
                  <ImageViewer
                    src={signedUrls.front}
                    alt="Proof Image Front"
                    className="h-full"
                  />
                </div>
              )}
              {signedUrls?.back && (
                <div className="relative h-[400px]">
                  <ImageViewer
                    src={signedUrls.back}
                    alt="Proof Image Back"
                    className="h-full"
                  />
                </div>
              )}
              {!signedUrls?.front && !signedUrls?.back && !signedUrls?.dataImage && (
                <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Details Section */}
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p>{proof.description}</p>
              
              <label className="text-sm font-medium text-gray-500">Date</label>
              <p>{new Date(proof.date).toLocaleString()}</p>
              
              <label className="text-sm font-medium text-gray-500">Resource ID</label>
              <p>{proof.resourceId}</p>

              <label className="text-sm font-medium text-gray-500">Batch ID</label>
              <p>{proof.batchId}</p>

              {/* only show printer info if user is superadmin */}
              {userGroups.includes('superadmin') && (
                <>
                  <label className="text-sm font-medium text-gray-500">Printer Name</label>
                  <p>{proof.printerName} <span className="text-gray-500 text-xs">(ID: {proof.printerId})</span></p>
                </>
              )}
             
              {/* only show customer info if user is superadmin or printer */}
              {/* {(userGroups.includes('superadmin') || userGroups.includes('printer')) && (
                <>
                  <label className="text-sm font-medium text-gray-500">Customer Name</label>
                  <p>{proof.customerName} <span className="text-gray-500 text-xs">(ID: {proof.customerId})</span></p>
                </>
              )} */}

              {/* <label className="text-sm font-medium text-gray-500">Flagged</label>
              <p>{proof.flagged ? 'Yes' : 'No'}</p> */}

              {/* Only show the URLs and printer info if the user is a superadmin */}
              {userGroups.includes('superadmin') && (
              <>
                <label className="text-md font-medium text-gray-500">Admin:</label> <br /><br />

                <label className="text-sm font-medium text-gray-500">Printer Name</label>
                <p>{proof.printerName} <span className="text-gray-500 text-xs">(ID: {proof.printerId})</span></p>

                <label className="text-sm font-medium text-gray-500">Print Front URL</label>
                <p className="text-xs">{proof.printFrontUrl || 'Not available'}</p>

                <label className="text-sm font-medium text-gray-500">Print Back URL</label>
                <p className="text-xs">{proof.printBackUrl || 'Not available'}</p>

                <label className="text-sm font-medium text-gray-500">Data Image S3 Key</label>
                <p className="text-xs">{proof.dataImageS3Key || 'Not available'}</p>
              </>
              )}
            </div>
          </div>
          {!userGroups.includes('customer') && (
            <div className="flex justify-end">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Proof'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 