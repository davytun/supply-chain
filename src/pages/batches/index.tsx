import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { ProductBatch } from '@/types';
import { Package, Plus, Search, Filter } from 'lucide-react';

const BatchesPage: React.FC = () => {
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/batches');
      if (response.ok) {
        const data = await response.json();
        setBatches(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBatches = batches.filter(batch =>
    batch.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout title="Batches">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Product Batches">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Batches</h1>
            <p className="text-sm text-gray-500">
              Manage and track your product batches through the supply chain
            </p>
          </div>
          <Link href="/batches/create" className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Batch
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="card">
          <div className="card-content">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search batches by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>
              <button className="btn btn-secondary">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Batches List */}
        {filteredBatches.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No batches found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first batch.'}
            </p>
            <div className="mt-6">
              <Link href="/batches/create" className="btn btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create Batch
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBatches.map((batch) => (
              <Link key={batch.id} href={`/batches/${batch.id}`}>
                <div className="card hover:shadow-md transition-shadow cursor-pointer">
                  <div className="card-content">
                    <div className="flex items-center justify-between mb-4">
                      <Package className="h-8 w-8 text-blue-500" />
                      <span className={`badge ${
                        batch.currentStatus === 'completed' ? 'badge-success' :
                        batch.currentStatus === 'in_transit' ? 'badge-warning' :
                        'badge-default'
                      }`}>
                        {batch.currentStatus.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {batch.productName}
                    </h3>
                    
                    <p className="text-sm text-gray-500 mb-2">
                      ID: {batch.id}
                    </p>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Quantity: {batch.quantity} {batch.unit}</p>
                      <p>Type: {batch.productType}</p>
                      <p>Origin: {batch.originLocation.city}, {batch.originLocation.country}</p>
                      <p>Created: {new Date(batch.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    {batch.events && batch.events.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          {batch.events.length} event{batch.events.length !== 1 ? 's' : ''} logged
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BatchesPage;