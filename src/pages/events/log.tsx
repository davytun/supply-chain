import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import { 
  FileText, 
  MapPin, 
  Award,
  Save,
  ArrowLeft,
  Package
} from 'lucide-react';
import { EventType, CertificationType, EventFormData } from '@/types';
import toast from 'react-hot-toast';

const LogEventPage: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    batchId: '',
    eventType: EventType.HARVEST,
    location: {
      country: '',
      region: '',
      city: '',
      address: ''
    },
    description: '',
    certifications: [],
    metadata: {}
  });

  const [newCertification, setNewCertification] = useState({
    type: CertificationType.ORGANIC,
    issuedBy: '',
    certificateId: ''
  });

  const [metadataKey, setMetadataKey] = useState('');
  const [metadataValue, setMetadataValue] = useState('');

  const handleInputChange = (field: string, value: string | EventType) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const addCertification = () => {
    if (!newCertification.issuedBy || !newCertification.certificateId) {
      toast.error('Please fill in all certification fields');
      return;
    }

    const certification = {
      ...newCertification,
      issuedDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      isValid: true
    };

    setFormData(prev => ({
      ...prev,
      certifications: [...(prev.certifications || []), certification]
    }));

    setNewCertification({
      type: CertificationType.ORGANIC,
      issuedBy: '',
      certificateId: ''
    });

    toast.success('Certification added');
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications?.filter((_, i) => i !== index) || []
    }));
  };

  const addMetadata = () => {
    if (!metadataKey || !metadataValue) {
      toast.error('Please enter both key and value for metadata');
      return;
    }

    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [metadataKey]: metadataValue
      }
    }));

    setMetadataKey('');
    setMetadataValue('');
    toast.success('Metadata added');
  };

  const removeMetadata = (key: string) => {
    setFormData(prev => {
      const newMetadata = { ...prev.metadata };
      delete newMetadata[key];
      return {
        ...prev,
        metadata: newMetadata
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.batchId || !formData.description || !formData.location.country || !formData.location.city) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/events/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Participant-ID': 'current-user-id',
          'X-Participant-Type': 'farmer'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Event logged successfully!');
        router.push('/events');
      } else {
        toast.error(result.error || 'Failed to log event');
      }
    } catch (error) {
      console.error('Error logging event:', error);
      toast.error('Failed to log event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Log New Event">
      <div className="max-w-4xl mx-auto space-y-6">
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
            <h1 className="text-2xl font-bold text-gray-900">Log New Event</h1>
            <p className="text-gray-600">Record a new supply chain event</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary-600" />
                <h3 className="card-title">Event Information</h3>
              </div>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch ID *
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., COF-ETH-m1n2p3q4r5"
                    value={formData.batchId}
                    onChange={(e) => handleInputChange('batchId', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type *
                  </label>
                  <select
                    className="input"
                    value={formData.eventType}
                    onChange={(e) => handleInputChange('eventType', e.target.value as EventType)}
                    required
                  >
                    {Object.values(EventType).map(type => (
                      <option key={type} value={type}>
                        {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    className="input min-h-[100px]"
                    placeholder="Describe what happened in this event..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                <h3 className="card-title">Location</h3>
              </div>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Ethiopia"
                    value={formData.location.country}
                    onChange={(e) => handleLocationChange('country', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region *
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Sidamo"
                    value={formData.location.region}
                    onChange={(e) => handleLocationChange('region', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Yirgacheffe"
                    value={formData.location.city}
                    onChange={(e) => handleLocationChange('city', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address (Optional)
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Specific address or facility"
                    value={formData.location.address || ''}
                    onChange={(e) => handleLocationChange('address', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-primary-600" />
                <h3 className="card-title">Certifications</h3>
              </div>
              <p className="card-description">Add relevant certifications for this event</p>
            </div>
            <div className="card-content">
              {/* Add New Certification */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <select
                  className="input"
                  value={newCertification.type}
                  onChange={(e) => setNewCertification(prev => ({
                    ...prev,
                    type: e.target.value as CertificationType
                  }))}
                >
                  {Object.values(CertificationType).map(type => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  className="input"
                  placeholder="Issued by"
                  value={newCertification.issuedBy}
                  onChange={(e) => setNewCertification(prev => ({
                    ...prev,
                    issuedBy: e.target.value
                  }))}
                />

                <input
                  type="text"
                  className="input"
                  placeholder="Certificate ID"
                  value={newCertification.certificateId}
                  onChange={(e) => setNewCertification(prev => ({
                    ...prev,
                    certificateId: e.target.value
                  }))}
                />

                <button
                  type="button"
                  onClick={addCertification}
                  className="btn btn-outline"
                >
                  Add
                </button>
              </div>

              {/* Existing Certifications */}
              {formData.certifications && formData.certifications.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Added Certifications:</h4>
                  {formData.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">
                          {cert.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className="text-gray-600 ml-2">
                          by {cert.issuedBy} (ID: {cert.certificateId})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCertification(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Additional Metadata */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-primary-600" />
                <h3 className="card-title">Additional Details</h3>
              </div>
              <p className="card-description">Add custom metadata for this event</p>
            </div>
            <div className="card-content">
              {/* Add New Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <input
                  type="text"
                  className="input"
                  placeholder="Key (e.g., temperature)"
                  value={metadataKey}
                  onChange={(e) => setMetadataKey(e.target.value)}
                />

                <input
                  type="text"
                  className="input"
                  placeholder="Value (e.g., 15°C)"
                  value={metadataValue}
                  onChange={(e) => setMetadataValue(e.target.value)}
                />

                <button
                  type="button"
                  onClick={addMetadata}
                  className="btn btn-outline"
                >
                  Add Detail
                </button>
              </div>

              {/* Existing Metadata */}
              {formData.metadata && Object.keys(formData.metadata).length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Added Details:</h4>
                  {Object.entries(formData.metadata).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{key}:</span>
                        <span className="text-gray-600 ml-2">{String(value)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMetadata(key)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-outline"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="loading-spinner mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSubmitting ? 'Logging...' : 'Log Event'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default LogEventPage;