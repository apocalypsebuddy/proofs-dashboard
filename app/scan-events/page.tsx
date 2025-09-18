"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AutocompleteInput from "../components/AutocompleteInput";

// Types for scan events API response
type ScanEvent = {
  updated_at: string;
  s3_uri: string;
  created_at: string;
  file_size: number;
  status: string;
  timestamp: string;
  file_type: string;
  source: string;
  original_filename: string;
  resource_id: string;
  s3_key: string;
  url: string;
  page_number?: number;
  printer_name?: string;
  account_name?: string;
  batch_id?: string;
  batch_date?: string;
  work_order_number?: string;
};

type ScanEventGroup = {
  resource_id: string;
  scans: ScanEvent[];
  latest_scan: ScanEvent;
  total_scans: number;
};

type ScanEventsResponse = {
  groups: ScanEventGroup[];
  pagination: {
    page: number;
    pageSize: number;
    totalGroups: number;
    totalPages: number;
    hasMore: boolean;
  };
  summary: {
    total_resources: number;
    total_scans: number;
  };
};

// Service layer for scan events API calls
const scanEventsService = {
  async fetchScanEvents(): Promise<ScanEventsResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_SCAN_EVENTS_URL || 'https://94f0nmul0k.execute-api.us-west-2.amazonaws.com/proofs-production';
    const response = await fetch(`${baseUrl}/scan-events`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch scan events');
    }
    
    return await response.json();
  },
};

export default function ScanEventsIndex() {
  const router = useRouter();
  const [scanEvents, setScanEvents] = useState<ScanEventsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [printerNameFilter, setPrinterNameFilter] = useState('');
  const [accountNameFilter, setAccountNameFilter] = useState('');
  const [batchIdFilter, setBatchIdFilter] = useState('');
  const [workOrderFilter, setWorkOrderFilter] = useState('');

  const fetchScanEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await scanEventsService.fetchScanEvents();
      setScanEvents(data);
    } catch (error) {
      console.error("Error fetching scan events:", error);
      setError(error instanceof Error ? error.message : 'Failed to fetch scan events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScanEvents();
  }, []);

  // Extract unique values for autocomplete
  const autocompleteOptions = useMemo(() => {
    if (!scanEvents) return {
      resourceIds: [],
      printerNames: [],
      accountNames: [],
      batchIds: [],
      workOrderNumbers: []
    };

    const resourceIds = new Set<string>();
    const printerNames = new Set<string>();
    const accountNames = new Set<string>();
    const batchIds = new Set<string>();
    const workOrderNumbers = new Set<string>();

    scanEvents.groups.forEach(group => {
      resourceIds.add(group.resource_id);
      
      if (group.latest_scan.printer_name) {
        printerNames.add(group.latest_scan.printer_name);
      }
      if (group.latest_scan.account_name) {
        accountNames.add(group.latest_scan.account_name);
      }
      if (group.latest_scan.batch_id) {
        batchIds.add(group.latest_scan.batch_id);
      }
      if (group.latest_scan.work_order_number) {
        workOrderNumbers.add(group.latest_scan.work_order_number);
      }
    });

    return {
      resourceIds: Array.from(resourceIds).sort(),
      printerNames: Array.from(printerNames).sort(),
      accountNames: Array.from(accountNames).sort(),
      batchIds: Array.from(batchIds).sort(),
      workOrderNumbers: Array.from(workOrderNumbers).sort()
    };
  }, [scanEvents]);

  // Filter scan events based on search terms
  const filteredGroups = scanEvents?.groups.filter(group => {
    const latestScan = group.latest_scan;
    
    const matchesResourceId = group.resource_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrinterName = !printerNameFilter || latestScan.printer_name?.toLowerCase().includes(printerNameFilter.toLowerCase());
    const matchesAccountName = !accountNameFilter || latestScan.account_name?.toLowerCase().includes(accountNameFilter.toLowerCase());
    const matchesBatchId = !batchIdFilter || latestScan.batch_id?.toLowerCase().includes(batchIdFilter.toLowerCase());
    const matchesWorkOrder = !workOrderFilter || latestScan.work_order_number?.toLowerCase().includes(workOrderFilter.toLowerCase());
    
    return matchesResourceId && matchesPrinterName && matchesAccountName && matchesBatchId && matchesWorkOrder;
  }) || [];

  if (loading) {
    return (
      <div className="space-y-6 p-6 px-18">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6 px-18">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading scan events</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={fetchScanEvents}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!scanEvents) {
    return (
      <div className="space-y-6 p-6 px-18">
        <div className="text-center text-gray-500">No scan events data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 px-18">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Scan Events</h1>
          <div className="text-sm text-gray-500">
            {searchTerm ? `${filteredGroups.length} of ${scanEvents.summary.total_resources}` : scanEvents.summary.total_resources} resources, {scanEvents.summary.total_scans} total scans
          </div>
        </div>
        
        {/* Search Filters */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Resource ID Search */}
            <AutocompleteInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by resource ID..."
              options={autocompleteOptions.resourceIds}
              showSearchIcon={true}
            />

            {/* Printer Name Search */}
            <AutocompleteInput
              value={printerNameFilter}
              onChange={setPrinterNameFilter}
              placeholder="Search by printer name..."
              options={autocompleteOptions.printerNames}
            />

            {/* Account Name Search */}
            <AutocompleteInput
              value={accountNameFilter}
              onChange={setAccountNameFilter}
              placeholder="Search by account name..."
              options={autocompleteOptions.accountNames}
            />

            {/* Batch ID Search */}
            <AutocompleteInput
              value={batchIdFilter}
              onChange={setBatchIdFilter}
              placeholder="Search by batch ID..."
              options={autocompleteOptions.batchIds}
            />

            {/* Work Order Search */}
            <AutocompleteInput
              value={workOrderFilter}
              onChange={setWorkOrderFilter}
              placeholder="Search by work order..."
              options={autocompleteOptions.workOrderNumbers}
            />

            {/* Clear All Filters */}
            <div className="flex items-center">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setPrinterNameFilter('');
                  setAccountNameFilter('');
                  setBatchIdFilter('');
                  setWorkOrderFilter('');
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scan Events List */}
      <div className="space-y-4">
        {filteredGroups.length === 0 && searchTerm ? (
          <div className="text-center py-8 text-gray-500">
            No scan events found matching &quot;{searchTerm}&quot;
          </div>
        ) : (
          filteredGroups.map((group) => (
          <div
            key={group.resource_id}
            onClick={() => router.push(`/scan-events/${group.resource_id}`)}
            className="grid grid-cols-2 gap-6 bg-white p-6 shadow rounded hover:shadow-lg transition-shadow cursor-pointer"
          >
            {/* Info Column */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg mb-4 text-gray-500">Info</h3>
              <p className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-medium text-gray-600">Resource ID:</span>
                <span className="text-gray-400">{group.resource_id}</span>
              </p>
              <p className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-medium text-gray-600">Total Scans:</span>
                <span className="text-gray-400">{group.total_scans}</span>
              </p>
              <p className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-medium text-gray-600">Latest Scan:</span>
                <span className="text-gray-400">
                  {new Date(group.latest_scan.updated_at).toLocaleString()}
                </span>
              </p>
              <p className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-medium text-gray-600">Status:</span>
                <span className="text-gray-400 capitalize">{group.latest_scan.status}</span>
              </p>
              
              {/* Optional Fields */}
              {group.latest_scan.printer_name && (
                <p className="grid grid-cols-[100px_1fr] gap-2">
                  <span className="font-medium text-gray-600">Printer:</span>
                  <span className="text-gray-400">{group.latest_scan.printer_name}</span>
                </p>
              )}
              {group.latest_scan.account_name && (
                <p className="grid grid-cols-[100px_1fr] gap-2">
                  <span className="font-medium text-gray-600">Account:</span>
                  <span className="text-gray-400">{group.latest_scan.account_name}</span>
                </p>
              )}
              {group.latest_scan.batch_id && (
                <p className="grid grid-cols-[100px_1fr] gap-2">
                  <span className="font-medium text-gray-600">Batch ID:</span>
                  <span className="text-gray-400">{group.latest_scan.batch_id}</span>
                </p>
              )}
              {group.latest_scan.batch_date && (
                <p className="grid grid-cols-[100px_1fr] gap-2">
                  <span className="font-medium text-gray-600">Batch Date:</span>
                  <span className="text-gray-400">{new Date(group.latest_scan.batch_date).toLocaleDateString()}</span>
                </p>
              )}
              {group.latest_scan.work_order_number && (
                <p className="grid grid-cols-[100px_1fr] gap-2">
                  <span className="font-medium text-gray-600">Work Order:</span>
                  <span className="text-gray-400">{group.latest_scan.work_order_number}</span>
                </p>
              )}
            </div>

            {/* Image Column */}
            <div className="flex items-center justify-center">
              <div className="relative h-[300px] w-[300px]">
                <Image
                  src={group.latest_scan.url}
                  alt={`Scan for ${group.resource_id}`}
                  fill
                  sizes="300px"
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      {/* Pagination Info */}
      {scanEvents.pagination.totalPages > 1 && (
        <div className="text-center text-sm text-gray-500">
          Page {scanEvents.pagination.page} of {scanEvents.pagination.totalPages}
          {scanEvents.pagination.hasMore && " (more pages available)"}
        </div>
      )}
    </div>
  );
}
