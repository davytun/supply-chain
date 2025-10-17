import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import { 
  Package, 
  MapPin, 
  Calendar,
  User,
  Award,
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { ProductBatch, SupplyChainEvent } from '@/types';
import { sampleBatches, sampleEvents, generateSampleEventsForBatch } from '@/data/sample-data';

const TrackingResultsPage: React.FC = () => {
  const router = useRouter();
  const { batchId } = router.query;
  const [batch, setBatch] = useState<ProductBatch | null>(null);
  const [events, setEvents] = useState<SupplyChainEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!batchId || typeof batchId !== 'string') return;

    const fetchBatchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Find batch in sample data
        const foundBatch = sampleBatches.find(b => b.id === batchId);
        
        if (!foundBatch) {
          setError('Batch not found');
          return;
        }

        setBatch(foundBatch);

        // Get events for this batch
        let batchEvents = sampleEvents.filter(e => e.batchId === batchId);
        
        // If no events found, generate sample events
        if (batchEvents.length === 0) {
          batchEvents = generateSampleEventsForBatch(foundBatch);
        }

        setEvents(batchEvents.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ));

      } catch {
        setError('Failed to load batch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatchData();
  }, [batchId]);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'harvest': return <Package className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'quality_check': return <CheckCircle className="h-4 w-4" />;
      case 'packaging': return <Package className="h-4 w-4" />;
      case 'shipping': return <MapPin className="h-4 w-4" />;
      case 'storage': return <Package className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'harvest': return 'bg-green-100 text-green-600';
      case 'processing': return 'bg-blue-100 text-blue-600';
      case 'quality_check': return 'bg-purple-100 text-purple-600';
      case 'packaging': return 'bg-yellow-100 text-yellow-600';
      case 'shipping': return 'bg-indigo-100 text-indigo-600';
      case 'storage': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <Layout title="Tracking Results">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  if (error || !batch) {
    return (
      <Layout title="Tracking Results">
        <div className="max-w-2xl mx-auto text-center py-12">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Batch Not Found</h1>
          <p className="text-gray-600 mb-6">
            The batch ID &quot;{batchId}&quot; could not be found in our system.
          </p>
          <button
            onClick={() => router.push('/track')}
            className="btn btn-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Try Another Search
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Track ${batch.id}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/track')}
            className="btn btn-outline btn-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{batch.productName}</h1>
            <p className="text-gray-600">Batch ID: {batch.id}</p>
          </div>
        </div>

        {/* Batch Overview */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Batch Overview</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Product</label>
                <p className="text-lg font-semibold text-gray-900">{batch.productName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Quantity</label>
                <p className="text-lg font-semibold text-gray-900">{batch.quantity} {batch.unit}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Origin</label>
                <p className="text-lg font-semibold text-gray-900">
                  {batch.originLocation.city}, {batch.originLocation.country}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <span className="badge badge-success">{batch.currentStatus.replace(/_/g, ' ')}</span>
              </div>
            </div>

            {batch.certifications.length > 0 && (
              <div className="mt-6">
                <label className="text-sm font-medium text-gray-500 mb-3 block">Certifications</label>
                <div className="flex flex-wrap gap-2">
                  {batch.certifications.map((cert) => (
                    <div key={cert.certificateId} className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                      <Award className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-800">
                        {cert.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Supply Chain Timeline */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Supply Chain Journey</h3>
            <p className="card-description">
              Complete traceability from origin to current location
            </p>
          </div>
          <div className="card-content">
            <div className="timeline">
              {events.map((event) => (
                <div key={event.id} className="timeline-item">
                  <div className={`timeline-marker ${getEventColor(event.eventType)}`}>
                    {getEventIcon(event.eventType)}
                  </div>
                  <div className="timeline-content">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {event.eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h4>
                        <p className="text-sm text-gray-600">{event.description}</p>
                      </div>
                      {event.hederaTransactionId && (
                        <button className="btn btn-sm btn-outline">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Verify
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location.city}, {event.location.country}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        {event.participantType.replace(/_/g, ' ')} ({event.participantId})
                      </div>
                    </div>

                    {event.certifications && event.certifications.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {event.certifications.map((cert, certIndex) => (
                            <span key={certIndex} className="badge badge-success text-xs">
                              {cert.type.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <h5 className="text-xs font-medium text-gray-700 mb-2">Additional Details</h5>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(event.metadata).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-gray-500">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                              <span className="text-gray-900 ml-1">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Blockchain Verification */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Blockchain Verification</h3>
            <p className="card-description">
              All events are immutably recorded on Hedera Hashgraph
            </p>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Network</label>
                <p className="text-lg font-semibold text-gray-900">Hedera Testnet</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total Events</label>
                <p className="text-lg font-semibold text-gray-900">{events.length}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">First Event</label>
                <p className="text-lg font-semibold text-gray-900">
                  {events.length > 0 ? new Date(events[0].timestamp).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-lg font-semibold text-gray-900">
                  {events.length > 0 ? new Date(events[events.length - 1].timestamp).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">Verified Authentic</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                This product&apos;s supply chain has been verified on the blockchain and meets all ethical sourcing standards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TrackingResultsPage;