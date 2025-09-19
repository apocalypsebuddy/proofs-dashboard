'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';

// Hardcoded printer and account mappings
const PRINTERS = [
  { id: 'pel_hughes', name: 'Pel Hughes' },
  { id: 'shutterfly', name: 'Shutterfly' },
  { id: 'darwill', name: 'Darwill' },
  { id: 'wolverine', name: 'Wolverine' },
];

const ACCOUNTS = [
  { id: '138d5014f22d28be2700', name: 'Verizon' },
  { id: '8a0e618e3d7916032cd1', name: 'Capital One' },
  // { id: 'acc_003', name: 'Gamma Enterprises' },
  // { id: 'acc_004', name: 'Delta Solutions' },
  // { id: 'acc_005', name: 'Epsilon Group' },
];

type ScanEventsUploadFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
};

export default function ScanEventsUploadForm({ isOpen, onClose, onUploadComplete }: ScanEventsUploadFormProps) {
  const [formData, setFormData] = useState({
    resourceId: '',
    printerId: '',
    printerName: '',
    accountId: '',
    accountName: '',
    batchId: '',
    batchDate: '',
    workOrderNumber: '',
  });
  const [page1Image, setPage1Image] = useState<File | null>(null);
  const [page2Image, setPage2Image] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ page1: boolean; page2: boolean }>({
    page1: false,
    page2: false,
  });
  const [printerSuggestions, setPrinterSuggestions] = useState<{ id: string; name: string }[]>([]);
  const [accountSuggestions, setAccountSuggestions] = useState<{ id: string; name: string }[]>([]);
  const [showPrinterSuggestions, setShowPrinterSuggestions] = useState(false);
  const [showAccountSuggestions, setShowAccountSuggestions] = useState(false);
  const [highlightedPrinterIndex, setHighlightedPrinterIndex] = useState(-1);
  const [highlightedAccountIndex, setHighlightedAccountIndex] = useState(-1);
  const [compressingImage, setCompressingImage] = useState<{ page1: boolean; page2: boolean }>({
    page1: false,
    page2: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePrinterNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      printerName: value,
    }));

    // Filter suggestions based on input
    const filtered = PRINTERS.filter(printer =>
      printer.name.toLowerCase().includes(value.toLowerCase())
    );
    setPrinterSuggestions(filtered);
    setShowPrinterSuggestions(value.length > 0 && filtered.length > 0);
    setHighlightedPrinterIndex(-1); // Reset highlighted index

    // Clear ID if no exact match
    if (!PRINTERS.find(p => p.name === value)) {
      setFormData(prev => ({
        ...prev,
        printerId: '',
      }));
    }
  };

  const handleAccountNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      accountName: value,
    }));

    // Filter suggestions based on input
    const filtered = ACCOUNTS.filter(account =>
      account.name.toLowerCase().includes(value.toLowerCase())
    );
    setAccountSuggestions(filtered);
    setShowAccountSuggestions(value.length > 0 && filtered.length > 0);
    setHighlightedAccountIndex(-1); // Reset highlighted index

    // Clear ID if no exact match
    if (!ACCOUNTS.find(a => a.name === value)) {
      setFormData(prev => ({
        ...prev,
        accountId: '',
      }));
    }
  };

  const handlePrinterSuggestionClick = (printer: { id: string; name: string }) => {
    setFormData(prev => ({
      ...prev,
      printerName: printer.name,
      printerId: printer.id,
    }));
    setShowPrinterSuggestions(false);
    setHighlightedPrinterIndex(-1);
  };

  const handleAccountSuggestionClick = (account: { id: string; name: string }) => {
    setFormData(prev => ({
      ...prev,
      accountName: account.name,
      accountId: account.id,
    }));
    setShowAccountSuggestions(false);
    setHighlightedAccountIndex(-1);
  };

  const handlePrinterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showPrinterSuggestions || printerSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedPrinterIndex(prev => 
          prev < printerSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedPrinterIndex(prev => 
          prev > 0 ? prev - 1 : printerSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedPrinterIndex >= 0 && printerSuggestions[highlightedPrinterIndex]) {
          handlePrinterSuggestionClick(printerSuggestions[highlightedPrinterIndex]);
        }
        break;
      case 'Escape':
        setShowPrinterSuggestions(false);
        setHighlightedPrinterIndex(-1);
        break;
    }
  };

  const handleAccountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showAccountSuggestions || accountSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedAccountIndex(prev => 
          prev < accountSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedAccountIndex(prev => 
          prev > 0 ? prev - 1 : accountSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedAccountIndex >= 0 && accountSuggestions[highlightedAccountIndex]) {
          handleAccountSuggestionClick(accountSuggestions[highlightedAccountIndex]);
        }
        break;
      case 'Escape':
        setShowAccountSuggestions(false);
        setHighlightedAccountIndex(-1);
        break;
    }
  };

  const clearFormState = () => {
    setFormData({
      resourceId: '',
      printerId: '',
      printerName: '',
      accountId: '',
      accountName: '',
      batchId: '',
      batchDate: '',
      workOrderNumber: '',
    });
    setPage1Image(null);
    setPage2Image(null);
    setPrinterSuggestions([]);
    setAccountSuggestions([]);
    setShowPrinterSuggestions(false);
    setShowAccountSuggestions(false);
    setHighlightedPrinterIndex(-1);
    setHighlightedAccountIndex(-1);
    setCompressingImage({ page1: false, page2: false });
    setError(null);
  };

  const compressImage = (file: File, maxSizeMB: number = 3.5): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        const maxDimension = 2048; // Max width or height
        
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Try different quality levels to get under the size limit
        const tryCompress = (quality: number): void => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const sizeMB = blob.size / (1024 * 1024);
                if (sizeMB <= maxSizeMB || quality <= 0.1) {
                  // Create a new file with the compressed blob
                  const compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                } else {
                  // Try with lower quality
                  tryCompress(quality - 0.1);
                }
              } else {
                resolve(file); // Fallback to original file
              }
            },
            'image/jpeg',
            quality
          );
        };
        
        // Start with 0.8 quality
        tryCompress(0.8);
      };
      
      img.onerror = () => {
        resolve(file); // Fallback to original file if compression fails
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, page: 'page1' | 'page2') => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is too large and needs compression
      const fileSizeMB = file.size / (1024 * 1024);
      
      if (fileSizeMB > 4) {
        console.log(`Original file size: ${fileSizeMB.toFixed(2)}MB - compressing...`);
        setCompressingImage(prev => ({ ...prev, [page]: true }));
        
        try {
          const compressedFile = await compressImage(file);
          const compressedSizeMB = compressedFile.size / (1024 * 1024);
          console.log(`Compressed file size: ${compressedSizeMB.toFixed(2)}MB`);
          
          if (page === 'page1') {
            setPage1Image(compressedFile);
          } else {
            setPage2Image(compressedFile);
          }
        } catch (error) {
          console.error('Error compressing image:', error);
          // Fallback to original file
          if (page === 'page1') {
            setPage1Image(file);
          } else {
            setPage2Image(file);
          }
        } finally {
          setCompressingImage(prev => ({ ...prev, [page]: false }));
        }
      } else {
        // File is already small enough
        if (page === 'page1') {
          setPage1Image(file);
        } else {
          setPage2Image(file);
        }
      }
    }
  };

  const uploadImageToScanEvents = async (image: File, pageNumber: number) => {
    const uploadFormData = new FormData();
    uploadFormData.append('resource_id', formData.resourceId);
    uploadFormData.append('file', image);
    
    // Add optional fields if they exist
    if (formData.printerId) uploadFormData.append('printer_id', formData.printerId);
    if (formData.printerName) uploadFormData.append('printer_name', formData.printerName);
    if (formData.accountId) uploadFormData.append('account_id', formData.accountId);
    if (formData.accountName) uploadFormData.append('account_name', formData.accountName);
    if (formData.batchId) uploadFormData.append('batch_id', formData.batchId);
    if (formData.batchDate) uploadFormData.append('batch_date', formData.batchDate);
    if (formData.workOrderNumber) uploadFormData.append('work_order_number', formData.workOrderNumber);

    const response = await fetch('/api/scan-events', {
      method: 'POST',
      body: uploadFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to upload page ${pageNumber}: ${response.status} ${errorText}`);
    }

    return await response.json();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setUploading(true);

    try {
      // Validate required fields
      if (!formData.resourceId) {
        throw new Error('Resource ID is required');
      }
      if (!page1Image && !page2Image) {
        throw new Error('At least one image is required');
      }

      const uploadPromises: Promise<unknown>[] = [];

      // Upload page 1 image if provided
      if (page1Image) {
        setUploadProgress(prev => ({ ...prev, page1: true }));
        uploadPromises.push(
          uploadImageToScanEvents(page1Image, 1)
            .finally(() => setUploadProgress(prev => ({ ...prev, page1: false })))
        );
      }

      // Upload page 2 image if provided
      if (page2Image) {
        setUploadProgress(prev => ({ ...prev, page2: true }));
        uploadPromises.push(
          uploadImageToScanEvents(page2Image, 2)
            .finally(() => setUploadProgress(prev => ({ ...prev, page2: false })))
        );
      }

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

      // Reset form
      clearFormState();
      
      onUploadComplete();
      onClose();
    } catch (error) {
      console.error('Error uploading images:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setUploading(false);
      setUploadProgress({ page1: false, page2: false });
    }
  };

  const isUploading = uploading || uploadProgress.page1 || uploadProgress.page2;

  return (
    <Dialog open={isOpen} onClose={() => {
      clearFormState();
      onClose();
    }} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="mx-auto max-w-2xl rounded bg-white p-6 w-full max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-lg font-medium mb-4">Upload Scan Event</Dialog.Title>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Required Fields */}
            <div>
              <label htmlFor="resourceId" className="block text-sm font-medium text-gray-700">
                Resource ID *
              </label>
              <input
                type="text"
                id="resourceId"
                name="resourceId"
                value={formData.resourceId}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            {/* Image Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="page1Image" className="block text-sm font-medium text-gray-700">
                  Front *
                </label>
                <input
                  type="file"
                  id="page1Image"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'page1')}
                  className="mt-1 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
                />
                {page1Image && (
                  <p className="mt-1 text-sm text-gray-600">
                    Selected: {page1Image.name} ({(page1Image.size / (1024 * 1024)).toFixed(2)}MB)
                  </p>
                )}
                {compressingImage.page1 && (
                  <p className="mt-1 text-sm text-orange-600">Compressing image...</p>
                )}
                {uploadProgress.page1 && (
                  <p className="mt-1 text-sm text-blue-600">Uploading page 1...</p>
                )}
              </div>

              <div>
                <label htmlFor="page2Image" className="block text-sm font-medium text-gray-700">
                  Back
                </label>
                <input
                  type="file"
                  id="page2Image"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'page2')}
                  className="mt-1 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
                />
                {page2Image && (
                  <p className="mt-1 text-sm text-gray-600">
                    Selected: {page2Image.name} ({(page2Image.size / (1024 * 1024)).toFixed(2)}MB)
                  </p>
                )}
                {compressingImage.page2 && (
                  <p className="mt-1 text-sm text-orange-600">Compressing image...</p>
                )}
                {uploadProgress.page2 && (
                  <p className="mt-1 text-sm text-blue-600">Uploading page 2...</p>
                )}
              </div>
            </div>

            {/* Optional Fields */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Optional Fields</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Batch ID */}
                <div>
                  <label htmlFor="batchId" className="block text-sm font-medium text-gray-700">
                    Batch ID
                  </label>
                  <input
                    type="text"
                    id="batchId"
                    name="batchId"
                    value={formData.batchId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Batch Date */}
                <div>
                  <label htmlFor="batchDate" className="block text-sm font-medium text-gray-700">
                    Batch Date
                  </label>
                  <input
                    type="date"
                    id="batchDate"
                    name="batchDate"
                    value={formData.batchDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Printer Name with Autocomplete */}
                <div className="relative">
                  <label htmlFor="printerName" className="block text-sm font-medium text-gray-700">
                    Printer Name
                  </label>
                  <input
                    type="text"
                    id="printerName"
                    name="printerName"
                    value={formData.printerName}
                    onChange={handlePrinterNameChange}
                    onKeyDown={handlePrinterKeyDown}
                    onFocus={() => {
                      if (formData.printerName.length > 0) {
                        setShowPrinterSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      // Delay hiding suggestions to allow clicking on them
                      setTimeout(() => setShowPrinterSuggestions(false), 200);
                    }}
                    placeholder="Type printer name..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  
                  {/* Printer Suggestions Dropdown */}
                  {showPrinterSuggestions && printerSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {printerSuggestions.map((printer, index) => (
                        <div
                          key={printer.id}
                          onClick={() => handlePrinterSuggestionClick(printer)}
                          className={`px-3 py-2 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 ${
                            index === highlightedPrinterIndex
                              ? 'bg-blue-100 text-blue-900'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <div className="font-medium">{printer.name}</div>
                          <div className="text-gray-500 text-xs">ID: {printer.id}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Show selected printer ID */}
                  {formData.printerId && (
                    <p className="mt-1 text-sm text-gray-600">
                      ID: {formData.printerId}
                    </p>
                  )}
                </div>

                {/* Printer ID */}
                <div>
                  <label htmlFor="printerId" className="block text-sm font-medium text-gray-700">
                    Printer ID
                  </label>
                  <input
                    type="text"
                    id="printerId"
                    name="printerId"
                    value={formData.printerId}
                    onChange={handleInputChange}
                    placeholder="Auto-filled when selecting from suggestions"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Account Name with Autocomplete */}
                <div className="relative">
                  <label htmlFor="accountName" className="block text-sm font-medium text-gray-700">
                    Account Name
                  </label>
                  <input
                    type="text"
                    id="accountName"
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleAccountNameChange}
                    onKeyDown={handleAccountKeyDown}
                    onFocus={() => {
                      if (formData.accountName.length > 0) {
                        setShowAccountSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      // Delay hiding suggestions to allow clicking on them
                      setTimeout(() => setShowAccountSuggestions(false), 200);
                    }}
                    placeholder="Type account name..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  
                  {/* Account Suggestions Dropdown */}
                  {showAccountSuggestions && accountSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {accountSuggestions.map((account, index) => (
                        <div
                          key={account.id}
                          onClick={() => handleAccountSuggestionClick(account)}
                          className={`px-3 py-2 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 ${
                            index === highlightedAccountIndex
                              ? 'bg-blue-100 text-blue-900'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <div className="font-medium">{account.name}</div>
                          <div className="text-gray-500 text-xs">ID: {account.id}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Show selected account ID */}
                  {formData.accountId && (
                    <p className="mt-1 text-sm text-gray-600">
                      ID: {formData.accountId}
                    </p>
                  )}
                </div>

                {/* Account ID */}
                <div>
                  <label htmlFor="accountId" className="block text-sm font-medium text-gray-700">
                    Account ID
                  </label>
                  <input
                    type="text"
                    id="accountId"
                    name="accountId"
                    value={formData.accountId}
                    onChange={handleInputChange}
                    placeholder="Auto-filled when selecting from suggestions"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Work Order Number */}
                <div>
                  <label htmlFor="workOrderNumber" className="block text-sm font-medium text-gray-700">
                    Work Order Number
                  </label>
                  <input
                    type="text"
                    id="workOrderNumber"
                    name="workOrderNumber"
                    value={formData.workOrderNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  clearFormState();
                  onClose();
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload Images'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}
