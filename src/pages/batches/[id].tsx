import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { ProductBatch } from '@/types';
import { Package, MapPin, QrCode } from 'lucide-react';

const BatchDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [batch, setBatch] = useState<ProductBatch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // For demo purposes, create a mock batch since we don't have a backend
      const mockBatch: ProductBatch = {
        id: id as string,
        productName: 'Sample Product',
        productType: 'coffee',
        quantity: 100,
        unit: 'kg',
        createdAt: new Date().toISOString(),
        originLocation: {
          country: 'Ethiopia',
          region: 'Sidamo',
          city: 'Yirgacheffe'
        },
        currentStatus: 'in_production',
        qrCode: '',
        events: [],
        certifications: [],
        expectedPath: [],
        anomalies: []
      };
      
      setBatch(mockBatch);
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <Layout title="Loading Batch...">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  if (!batch) {
    return (
      <Layout title="Batch Not Found">
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Batch not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The batch you&apos;re looking for doesn&apos;t exist.
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/batches')}
              className="btn btn-primary"
            >
              Back to Batches
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Batch ${batch.id}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{batch.productName}</h1>
                <p className="text-sm text-gray-500">Batch ID: {batch.id}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="badge badge-success">{batch.currentStatus}</span>
                <QrCode className="h-6 w-6 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Batch Details */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Batch Information</h3>
              </div>
              <div className="card-content">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Product Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">{batch.productType}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                    <dd className="mt-1 text-sm text-gray-900">{batch.quantity} {batch.unit}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(batch.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">
                      {batch.currentStatus.replace('_', ' ')}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Origin Location</h3>
              </div>
              <div className="card-content">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {batch.originLocation.city}
                    </p>
                    <p className="text-sm text-gray-500">
                      {batch.originLocation.region}, {batch.originLocation.country}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Package className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Batch Created Successfully!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Your batch has been created and is ready for supply chain tracking.
                  You can now log events and track this batch through its journey.
                </p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <button
                    onClick={() => router.push('/events/log')}
                    className="bg-green-50 px-2 py-1.5 rounded-md text-sm font-medium text-green-800 hover:bg-green-100"
                  >
                    Log Event
                  </button>
                  <button
                    onClick={() => router.push('/batches')}
                    className="ml-3 bg-green-50 px-2 py-1.5 rounded-md text-sm font-medium text-green-800 hover:bg-green-100"
                  >
                    View All Batches
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BatchDetail;