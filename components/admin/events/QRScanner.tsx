'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  isProcessing: boolean;
}

export function QRScanner({ onScan, isProcessing }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<any[]>([]);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    // Get available cameras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices);
        }
      })
      .catch((err) => {
        console.error('Error getting cameras:', err);
      });

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      setIsLoading(true);
      hasScannedRef.current = false;

      // First, set scanning to true to make the div visible
      setIsScanning(true);

      // Wait for the DOM to update and the div to be visible
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create scanner instance
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      // Prefer back camera on mobile
      const cameraId = cameras.length > 0 
        ? cameras.find(c => c.label.toLowerCase().includes('back'))?.id || cameras[0].id
        : { facingMode: 'environment' };

      await scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Only process once per scan
          if (!hasScannedRef.current && !isProcessing) {
            console.log('QR Code scanned:', decodedText);
            hasScannedRef.current = true;
            onScan(decodedText);
            
            // Reset after a delay to allow next scan
            setTimeout(() => {
              hasScannedRef.current = false;
            }, 2000);
          }
        },
        (errorMessage) => {
          // Ignore scanning errors (happens continuously while searching)
        }
      );
      
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      setError(err.message || 'Failed to start camera');
      setIsScanning(false);
      setIsLoading(false);
      
      // Clean up scanner instance on error
      if (scannerRef.current) {
        try {
          await scannerRef.current.clear();
        } catch (clearErr) {
          console.error('Error clearing scanner:', clearErr);
        }
        scannerRef.current = null;
      }
    }
  };

  const stopScanning = async () => {
    try {
      if (scannerRef.current && isScanning) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      }
      setIsScanning(false);
      setError(null);
    } catch (err) {
      console.error('Error stopping scanner:', err);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Scanner Container */}
          <div className="relative">
            <div
              id="qr-reader"
              className={`w-full ${isScanning ? 'block' : 'hidden'}`}
              style={{ minHeight: '300px' }}
            />

            {/* Loading state */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-lg z-10">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-3"></div>
                  <p className="text-sm">Initializing camera...</p>
                </div>
              </div>
            )}

            {/* Placeholder when not scanning */}
            {!isScanning && !isLoading && (
              <div className="flex items-center justify-center bg-gray-100 rounded-lg p-12 min-h-[300px]">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Click the button below to start scanning QR codes
                  </p>
                  {cameras.length === 0 && (
                    <p className="text-sm text-gray-500">
                      Make sure your device has a camera
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-900 font-medium">Camera Error</p>
                <p className="text-sm text-red-700">{error}</p>
                <p className="text-xs text-red-600 mt-1">
                  Make sure you've granted camera permissions and you're using HTTPS.
                </p>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            {!isScanning ? (
              <Button
                onClick={startScanning}
                disabled={cameras.length === 0 || isLoading}
                className="flex-1 bg-[#009688] hover:bg-[#00796b]"
              >
                <Camera className="w-4 h-4 mr-2" />
                {isLoading ? 'Starting...' : 'Start Camera Scanner'}
              </Button>
            ) : (
              <Button
                onClick={stopScanning}
                variant="outline"
                className="flex-1"
              >
                <CameraOff className="w-4 h-4 mr-2" />
                Stop Scanner
              </Button>
            )}
          </div>

          {/* Instructions */}
          {isScanning && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-medium mb-2">
                📱 Scanning Active
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Point camera at attendee's QR code</li>
                <li>• Hold steady until it beeps</li>
                <li>• Check-in will happen automatically</li>
                <li>• Ready for next scan after 2 seconds</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
