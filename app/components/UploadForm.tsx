import { useState } from 'react';
import { Dialog } from '@headlessui/react';

type UploadFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
};

export default function UploadForm({ isOpen, onClose, onSubmit }: UploadFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error uploading proof:', error);
      alert('Failed to upload proof. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // TODO: Abstract into components (use UI library?)
  // TODO: Add a loading state
  // TODO: Update Dialog deprecated methods

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="mx-auto max-w-lg rounded bg-white p-6 w-full">
          <Dialog.Title className="text-lg font-medium mb-4">Upload New Proof</Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Front Image
                <input
                  type="file"
                  name="frontImage"
                  accept="image/*"
                  required
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Back Image
                <input
                  type="file"
                  name="backImage"
                  accept="image/*"
                  required
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Customer Name
                <input
                  type="text"
                  name="customerName"
                  required
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Customer ID
                <input
                  type="text"
                  name="customerId"
                  required
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Description
                <input
                  type="text"
                  name="description"
                  required
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
                />
              </label>    
              <label className="block text-sm font-medium text-gray-700">
                Resource ID
                <input
                  type="text"
                  name="resourceId"
                  required
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
                />
              </label> 
              <label className="block text-sm font-medium text-gray-700">
                Batch ID
                <input
                  type="text"
                  name="batchId"
                  required
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Printer Name
                <input
                  type="text"
                  name="printerName"
                  required
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Printer ID
                <input
                  type="text"
                  name="printerId"
                  required
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
                />
              </label>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
} 