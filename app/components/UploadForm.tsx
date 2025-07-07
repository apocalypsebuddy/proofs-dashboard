'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { getCurrentUserInfo } from '@/app/utils/auth';

type Customer = {
  id: string;
  name: string;
};

type UploadFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
};

export default function UploadForm({ isOpen, onClose, onSubmit }: UploadFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [printerInfo, setPrinterInfo] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        // Load customers
        const response = await fetch('/api/customers');
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        const customersList = await response.json();
        // console.log('customersList', customersList);
        setCustomers(customersList);

        // Load current user info for printer details
        // This assumes that the user is a printer since only printers can upload proofs
        // TODO: Add validation to check that user in printer group
        const userInfo = await getCurrentUserInfo();
        if (userInfo) {
          setPrinterInfo({
            id: userInfo.userId,
            name: userInfo.attributes.name || userInfo.userId,
          });
        }
      } catch (error) {
        console.error('Error loading form data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load form data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleImageProcess = async (file: File) => {
    setProcessingImage(true);
    setError(null);
    
    // TODO: abstract this into a component
    // ex: processImageApi(formData)
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/process-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to process image');
      }
      
      const data = await response.json();
      console.log('processedImageData', data);
      
      // Auto-populate form fields
      // document.getElementById works for now vs using setState or something
      const resourceIdInput = document.getElementById('resourceId') as HTMLInputElement;
      const batchIdInput = document.getElementById('batchId') as HTMLInputElement;
      const descriptionInput = document.getElementById('description') as HTMLInputElement;
      
      if (resourceIdInput) resourceIdInput.value = data.resourceId;
      if (batchIdInput) batchIdInput.value = data.batchId;
      
      // Auto-select customer if it matches
      const matchingCustomer = customers.find(c => c.id === data.customerId);
      if (matchingCustomer) {
        setSelectedCustomer(matchingCustomer);
      }
      
      // Auto-populate description field
      // This is a bit unnecessary but it's fun
      let resourceType : string = '';
      if (data.resourceId.includes('sfm')) {
        resourceType = 'Self Mailer';
      } else if (data.resourceId.includes('psc')) {
        resourceType = 'Postcard';
      };
      const autoDescription = `${data.customerName} ${resourceType}`;
      if (descriptionInput && descriptionInput.value === '') {
        descriptionInput.value = autoDescription;
      }
      // End unnecessary auto-population
      
    } catch (error) {
      console.error('Error processing image:', error);
      setError(error instanceof Error ? error.message : 'Failed to process image');
    } finally {
      setProcessingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setUploading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Add customer and printer info to formData
      if (selectedCustomer) {
        formData.append('customerId', selectedCustomer.id);
        formData.append('customerName', selectedCustomer.name);
      }
      if (printerInfo) {
        formData.append('printerId', printerInfo.id);
        formData.append('printerName', printerInfo.name);
      }

      // Log form data for debugging
      console.log('Submitting form data:', {
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer?.name,
        printerId: printerInfo?.id,
        printerName: printerInfo?.name,
        description: formData.get('description'),
        frontImage: formData.get('frontImage'),
        backImage: formData.get('backImage'),
        dataImage: formData.get('dataImage'),
      });

      try {
        await onSubmit(formData);
        onClose();
      } catch (submitError) {
        console.error('Error in onSubmit:', submitError);
        if (submitError instanceof Error) {
          console.error('Error details:', {
            message: submitError.message,
            stack: submitError.stack,
            name: submitError.name
          });
        }
        throw submitError;
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      setError(error instanceof Error ? error.message : 'Failed to upload proof');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div></div>;
  }

  // TODO: abstract this into a component
  // return ( <UploadForm /> )
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="mx-auto max-w-lg rounded bg-white p-6 w-full">
          <Dialog.Title className="text-lg font-medium mb-4">Upload New Proof</Dialog.Title>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="backImage" className="block text-sm font-medium text-gray-700">
            Outside/Back Image (Image containing SAMPLE label)
            </label>
            <input
              type="file"
              id="backImage"
              name="backImage"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImageProcess(file);
                }
              }}
              className="mt-1 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
            />
            {processingImage && (
              <div className="mt-2 text-sm text-blue-600">
                Processing image...
              </div>
            )}
          </div>

          <div>
            <label htmlFor="frontImage" className="block text-sm font-medium text-gray-700">
              Inside/Front Image
            </label>
            <input
              type="file"
              id="frontImage"
              name="frontImage"
              accept="image/*"
              className="mt-1 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
            />
          </div>

            {/* <div>
              <label htmlFor="dataImage" className="block text-sm font-medium text-gray-700">
                Data Image
              </label>
              <input
                type="file"
                id="dataImage"
                name="dataImage"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageProcess(file);
                  }
                }}
                className="mt-1 block w-full"
              />
              {processingImage && (
                <div className="mt-2 text-sm text-blue-600">
                  Processing image...
                </div>
              )}
            </div> */}

            <div>
              <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
                Customer
              </label>
              <select
                id="customer"
                name="customer"
                value={selectedCustomer?.id || ''}
                onChange={(e) => {
                  const customer = customers.find(c => c.id === e.target.value);
                  setSelectedCustomer(customer || null);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="batchId" className="block text-sm font-medium text-gray-700">
                Batch ID
              </label>
              <input
                type="text"
                id="batchId"
                name="batchId"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="resourceId" className="block text-sm font-medium text-gray-700">
                Resource ID
              </label>
              <input
                type="text"
                id="resourceId"
                name="resourceId"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
} 