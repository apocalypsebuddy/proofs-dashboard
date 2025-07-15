// This was incorporated as a stop-gap before the external service was ready
// It's not used anymore, but I'm keeping it here for reference/to get rid of in a later sprint
// TODO: Remove this file
import { Html5Qrcode } from 'html5-qrcode';

export interface BarcodeResult {
  resourceId: string;
}

export async function scanBarcodeFromFile(file: File): Promise<BarcodeResult> {
  return new Promise((resolve, reject) => {
    // Create a temporary div element for the scanner
    const tempDiv = document.createElement('div');
    tempDiv.id = 'temp-scanner';
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    document.body.appendChild(tempDiv);
    
    // Create Html5Qrcode instance
    const html5QrCode = new Html5Qrcode("temp-scanner");
    
    try {
      console.log('Starting barcode scan for file:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // Scan the file with verbose mode to get more control
      html5QrCode.scanFile(file, true)
        .then((decodedText) => {
          console.log('Found barcode:', decodedText);
          
          // Check if the decoded text looks like a datamatrix barcode (resourceId format)
          // This is an attempt to ignore QR codes
          if (decodedText.includes('sfm_') || decodedText.includes('psc_')) {
            console.log('Found datamatrix barcode:', decodedText);
            resolve({ resourceId: decodedText });
          // } else {
          //   // If it doesn't look like our expected format, it's probably the QR code
          //   console.log('Ignoring QR code, looking for datamatrix...');
          //   reject(new Error('No datamatrix barcode found in image'));
          }
        })
        .catch((error) => {
          console.error('Barcode scanning error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
          
          reject(new Error(`Failed to scan barcode: ${error.message}`));
        })
        .finally(async () => {
          // Clean up
          await html5QrCode.clear();
          // Remove the temporary div
          if (tempDiv.parentNode) {
            tempDiv.parentNode.removeChild(tempDiv);
          }
        });
    } catch (error) {
      // Clean up on error
      if (tempDiv.parentNode) {
        tempDiv.parentNode.removeChild(tempDiv);
      }
      reject(error);
    }
  });
} 