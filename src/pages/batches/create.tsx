import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import { 
  Package, 
  MapPin, 
  Award,
  Save,
  ArrowLeft
} from 'lucide-react';
import { ProductType, CertificationType, BatchFormData } from '@/types';
import toast from 'react-hot-toast';

const CreateBatchPage: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<BatchFormData>({
    productName: '',
    productType: ProductType.COFFEE,
    quantity: 0,
    unit: 'kg',
    originLocation: {
      country: '',
      region: '',
      city: '',
      address: '',
      coordinates: { latitude: 0, longitude: 0 }
    },
    certifications: []
  });

  const [newCertification, setNewCertification] = useState({
    type: CertificationType.ORGANIC,
    issuedBy: '',
    certificateId: ''
  });

  const handleInputChange = (field: string, value: string | number | ProductType) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      originLocation: {
        ...prev.originLocation,
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
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      isValid: true
    };

    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, certification]
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
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productName || !formData.originLocation.country || !formData.originLocation.city) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/batches/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Batch created successfully!');
        router.push(`/batches/${result.data.id}`);
      } else {
        toast.error(result.error || 'Failed to create batch');
      }
    } catch (error) {
      console.error('Error creating batch:', error);
      toast.error('Failed to create batch');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Create New Batch">
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
            <h1 className="text-2xl font-bold text-gray-900">Create New Batch</h1>
            <p className="text-gray-600">Add a new product batch to the supply chain</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Information */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-primary-600" />
                <h3 className="card-title">Product Information</h3>
              </div>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Single Origin Ethiopian Coffee"
                    value={formData.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Type *
                  </label>
                  <select
                    className="input"
                    value={formData.productType}
                    onChange={(e) => handleInputChange('productType', e.target.value as ProductType)}
                    required
                  >
                    {Object.values(ProductType).map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    className="input"
                    placeholder="500"
                    value={formData.quantity || ''}
                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit *
                  </label>
                  <select
                    className="input"
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    required
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="lbs">Pounds (lbs)</option>
                    <option value="tons">Tons</option>
                    <option value="pieces">Pieces</option>
                    <option value="liters">Liters</option>
                    <option value="gallons">Gallons</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Origin Location */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                <h3 className="card-title">Origin Location</h3>
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
                    value={formData.originLocation.country}
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
                    value={formData.originLocation.region}
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
                    value={formData.originLocation.city}
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
                    placeholder="Specific farm or facility address"
                    value={formData.originLocation.address || ''}
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
              <p className="card-description">Add relevant certifications for this batch</p>
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
                  placeholder="Issued by (e.g., USDA)"
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
                  Add Certification
                </button>
              </div>

              {/* Existing Certifications */}
              {formData.certifications.length > 0 && (
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
              {isSubmitting ? 'Creating...' : 'Create Batch'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateBatchPage;