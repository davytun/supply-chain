import React, { useState, useRef, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import { 
  QrCode, 
  Camera,
  Upload,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const QRScannerPage: React.FC = () => {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkCameraAvailability();
    return () => {
      stopCamera();
    };
  }, []);

  const checkCameraAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setHasCamera(videoDevices.length > 0);
    } catch {
      setHasCamera(false);
    }
  };

  const startCamera = async () => {
    try {
      setError(null);
      setIsScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Start scanning for QR codes
      scanForQRCode();
    } catch {
      setError('Unable to access camera. Please check permissions.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const scanForQRCode = () => {
    // This is a simplified QR code scanner
    // In a real implementation, you would use a library like jsQR or qr-scanner
    const scanInterval = setInterval(() => {
      if (!videoRef.current || !canvasRef.current || !isScanning) {
        clearInterval(scanInterval);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Simulate QR code detection (in real app, use jsQR library)
        // For demo purposes, we'll simulate finding a QR code after 3 seconds
        setTimeout(() => {
          if (isScanning) {
            const mockBatchId = 'COF-ETH-m1n2p3q4r5';
            handleQRCodeDetected(mockBatchId);
            clearInterval(scanInterval);
          }
        }, 3000);
      }
    }, 100);
  };

  const handleQRCodeDetected = (batchId: string) => {
    stopCamera();
    toast.success('QR Code detected!');
    router.push(`/track/${batchId}`);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In a real implementation, you would process the image to extract QR code
    // For demo purposes, we'll simulate QR code detection
    toast.loading('Processing image...');
    
    setTimeout(() => {
      toast.dismiss();
      const mockBatchId = 'COF-ETH-m1n2p3q4r5';
      toast.success('QR Code found in image!');
      router.push(`/track/${mockBatchId}`);
    }, 2000);
  };

  const handleManualEntry = () => {
    router.push('/track');
  };

  return (
    <Layout title="QR Code Scanner">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="btn btn-outline btn-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">QR Code Scanner</h1>
            <p className="text-gray-600">Scan a QR code to track your product</p>
          </div>
        </div>

        {/* Scanner Interface */}
        <div className="card">
          <div className="card-content">
            {!isScanning ? (
              <div className="text-center py-12">
                <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Scan</h3>
                <p className="text-gray-600 mb-6">
                  Position the QR code within the camera frame to scan
                </p>

                {hasCamera ? (
                  <button
                    onClick={startCamera}
                    className="btn btn-primary btn-lg"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Start Camera
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="alert alert-warning">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Camera not available. You can upload an image instead.
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full rounded-lg bg-black"
                    autoPlay
                    playsInline
                    muted
                  />
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                  />
                  
                  {/* Scanning overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-white border-dashed rounded-lg flex items-center justify-center">
                      <div className="text-white text-center">
                        <QrCode className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Position QR code here</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={stopCamera}
                    className="btn btn-outline"
                  >
                    Stop Scanning
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-error mt-4">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Alternative Options */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Alternative Options</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Upload Image */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">Upload Image</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Select an image containing a QR code
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-outline btn-sm"
                >
                  Choose File
                </button>
              </div>

              {/* Manual Entry */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <QrCode className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">Manual Entry</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Enter batch ID manually if QR code is not readable
                </p>
                <button
                  onClick={handleManualEntry}
                  className="btn btn-outline btn-sm"
                >
                  Enter Manually
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Scanning Tips</h3>
          </div>
          <div className="card-content">
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xs font-medium mt-0.5">1</span>
                <p>Ensure good lighting when scanning QR codes</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xs font-medium mt-0.5">2</span>
                <p>Hold your device steady and position the QR code within the frame</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xs font-medium mt-0.5">3</span>
                <p>Make sure the entire QR code is visible and not cut off</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xs font-medium mt-0.5">4</span>
                <p>If scanning fails, try uploading an image or entering the batch ID manually</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QRScannerPage;