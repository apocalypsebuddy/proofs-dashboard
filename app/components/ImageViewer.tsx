'use client';

import { useState } from 'react';
import Image from 'next/image';
import { fetchAuthSession } from 'aws-amplify/auth';

interface ImageViewerProps {
  src: string;
  alt: string;
  className?: string;
}

// This is essentially a wrapper around the Image component that adds a modal for downloading the image
export default function ImageViewer({ src, alt, className = '' }: ImageViewerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent modal from closing
    
    try {
      setIsDownloading(true);
      const { tokens } = await fetchAuthSession();

      // Get the image through our API endpoint
      const response = await fetch(`/api/download?url=${encodeURIComponent(src)}`, {
        headers: {
          'Authorization': `Bearer ${tokens?.accessToken?.toString()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download image');
      }

      // Get the blob and filename from the response
      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition?.split('filename="')[1]?.split('"')[0] 
        || alt.toLowerCase().replace(/\s+/g, '-') + '.png';

      // Create and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div 
        className={`relative cursor-pointer ${className}`}
        onClick={() => setIsModalOpen(true)}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
        />
      </div>

      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="relative w-full h-full flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative w-full h-full max-w-[90vw] max-h-[90vh]">
              {isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              )}
              <Image
                src={src}
                alt={alt}
                fill
                sizes="90vw"
                className="object-contain"
                priority
                onLoadingComplete={() => setIsImageLoading(false)}
              />
            </div>
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={handleDownload}
                disabled={isDownloading || isImageLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                {isDownloading ? 'Downloading...' : 'Download'}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 