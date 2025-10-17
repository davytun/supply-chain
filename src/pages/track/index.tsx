import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import { 
  Search, 
  QrCode, 
  Package,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const TrackProductPage: React.FC = () => {
  const router = useRouter();
  const [trackingInput, setTrackingInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingInput.trim()) {
      toast.error('Please enter a batch ID or QR code');
      return;
    }

    setIsSearching(true);

    try {
      // Simulate API call to validate batch ID
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to tracking results
      router.push(`/track/${trackingInput.trim()}`);
    } catch {
      toast.error('Failed to track product');
    } finally {
      setIsSearching(false);
    }
  };

  const handleQRScan = () => {
    router.push('/scanner');
  };

  const sampleBatchIds = [
    'COF-ETH-m1n2p3q4r5',
    'COC-BRA-k8l9m0n1o2',
    'COT-VIE-x3y4z5a6b7'
  ];

  return (
    <Layout title="Track Product">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <Package className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Product</h1>
          <p className="text-lg text-gray-600">
            Enter a batch ID or scan a QR code to view the complete supply chain history
          </p>
        </div>

        {/* Tracking Form */}
        <div className="card">
          <div className="card-content">
            <form onSubmit={handleTrack} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch ID or QR Code Data
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    className="input pl-10 text-lg"
                    placeholder="e.g., COF-ETH-m1n2p3q4r5"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    disabled={isSearching}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg flex-1"
                  disabled={isSearching || !trackingInput.trim()}
                >
                  {isSearching ? (
                    <div className="loading-spinner mr-2"></div>
                  ) : (
                    <Search className="h-5 w-5 mr-2" />
                  )}
                  {isSearching ? 'Searching...' : 'Track Product'}
                </button>

                <button
                  type="button"
                  onClick={handleQRScan}
                  className="btn btn-outline btn-lg"
                  disabled={isSearching}
                >
                  <QrCode className="h-5 w-5 mr-2" />
                  Scan QR Code
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sample Batch IDs */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Try Sample Batch IDs</h3>
            <p className="card-description">
              Click on any of these sample batch IDs to see how tracking works
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              {sampleBatchIds.map((batchId) => (
                <button
                  key={batchId}
                  onClick={() => setTrackingInput(batchId)}
                  className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <span className="font-mono text-sm text-gray-900">{batchId}</span>
                    <p className="text-xs text-gray-500 mt-1">
                      {batchId.startsWith('COF') ? 'Ethiopian Coffee Batch' :
                       batchId.startsWith('COC') ? 'Brazilian Cocoa Batch' :
                       'Vietnamese Coffee Batch'}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TrackProductPage;