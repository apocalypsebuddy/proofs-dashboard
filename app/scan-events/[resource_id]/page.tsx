"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import ImageViewer from '@/app/components/ImageViewer';

type ScanEventItem = {
  updated_at: string;
  s3_uri: string;
  created_at: string;
  file_size: number;
  status: string;
  file_type: string;
  source: string;
  original_filename: string;
  resource_id: string;
  s3_key: string;
  timestamp: string;
  url: string;
  page_number?: number;
  printer_name?: string;
  account_name?: string;
  batch_id?: string;
  batch_date?: string;
  work_order_number?: string;
};

type ScanEventDetailResponse = {
  resource_id: string;
  items: ScanEventItem[];
  count: number;
  hasMore: boolean;
};

// Service layer for scan event detail API calls
const scanEventDetailService = {
  async fetchScanEventDetail(resourceId: string): Promise<ScanEventDetailResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_SCAN_EVENTS_URL || 'https://94f0nmul0k.execute-api.us-west-2.amazonaws.com/proofs-production';
    const response = await fetch(`${baseUrl}/scan-events/${resourceId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch scan event details');
    }
    
    return await response.json();
  },
};

export default function ScanEventDetail({ params }: { params: Promise<{ resource_id: string }> }) {
  const router = useRouter();
  const [scanEventDetail, setScanEventDetail] = useState<ScanEventDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { resource_id } = use(params);

  useEffect(() => {
    const fetchScanEventDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await scanEventDetailService.fetchScanEventDetail(resource_id);
        setScanEventDetail(data);
      } catch (err) {
        console.error("Error fetching scan event detail:", err);
        setError(err instanceof Error ? err.message : 'Failed to fetch scan event details');
      } finally {
        setLoading(false);
      }
    };

    fetchScanEventDetail();
  }, [resource_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !scanEventDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 mb-4">{error || 'Scan event not found'}</div>
        <button
          onClick={() => router.push('/scan-events')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Scan Events
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Scan Event Details</h1>
        <button
          onClick={() => router.push('/scan-events')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Back to Scan Events
        </button>
      </div>

      {/* Resource Info */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Resource Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Resource ID</label>
            <p className="text-lg">{scanEventDetail.resource_id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Total Scans</label>
            <p className="text-lg">{scanEventDetail.count}</p>
          </div>
          
          {/* Optional Fields - show from first item since they're the same per resource_id */}
          {scanEventDetail.items.length > 0 && scanEventDetail.items[0].printer_name && (
            <div>
              <label className="text-sm font-medium text-gray-500">Printer Name</label>
              <p className="text-lg">{scanEventDetail.items[0].printer_name}</p>
            </div>
          )}
          {scanEventDetail.items.length > 0 && scanEventDetail.items[0].account_name && (
            <div>
              <label className="text-sm font-medium text-gray-500">Account Name</label>
              <p className="text-lg">{scanEventDetail.items[0].account_name}</p>
            </div>
          )}
          {scanEventDetail.items.length > 0 && scanEventDetail.items[0].batch_id && (
            <div>
              <label className="text-sm font-medium text-gray-500">Batch ID</label>
              <p className="text-lg">{scanEventDetail.items[0].batch_id}</p>
            </div>
          )}
          {scanEventDetail.items.length > 0 && scanEventDetail.items[0].batch_date && (
            <div>
              <label className="text-sm font-medium text-gray-500">Batch Date</label>
              <p className="text-lg">{new Date(scanEventDetail.items[0].batch_date).toLocaleDateString()}</p>
            </div>
          )}
          {scanEventDetail.items.length > 0 && scanEventDetail.items[0].work_order_number && (
            <div>
              <label className="text-sm font-medium text-gray-500">Work Order Number</label>
              <p className="text-lg">{scanEventDetail.items[0].work_order_number}</p>
            </div>
          )}
        </div>
      </div>

      {/* Scan Items */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Scan History</h2>
        {scanEventDetail.items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No scan events found for this resource
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {scanEventDetail.items.map((item, index) => (
              <div key={`${item.timestamp}-${index}`} className="bg-white p-6 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Scan #{index + 1}</h3>
                    <div className="relative h-[300px]">
                      <ImageViewer
                        src={item.url}
                        alt={`Scan ${index + 1} for ${scanEventDetail.resource_id}`}
                        className="h-full"
                      />
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Timestamp</label>
                      <p>{new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <p className="capitalize">{item.status}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">File Size</label>
                      <p>{(item.file_size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">File Type</label>
                      <p>{item.file_type}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Source</label>
                      <p className="capitalize">{item.source.replace('_', ' ')}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Original Filename</label>
                      <p className="text-sm break-all">{item.original_filename}</p>
                    </div>

                    {item.page_number && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Page Number</label>
                        <p>{item.page_number}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
