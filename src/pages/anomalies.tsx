import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { 
  AlertTriangle, 
  Search, 
  Filter,
  Calendar,
  MapPin,
  Package,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { AnomalyAlert, AnomalyType, AlertSeverity } from '@/types';

const AnomaliesPage: React.FC = () => {
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [filteredAnomalies, setFilteredAnomalies] = useState<AnomalyAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<AnomalyType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'resolved' | 'unresolved'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const [mockAnomalies] = useState<AnomalyAlert[]>([
    {
      id: 'anomaly-001',
      batchId: 'COF-ETH-m1n2p3q4r5',
      eventId: 'COF-ETH-m1n2p3q4r5-shipping',
      type: AnomalyType.LOCATION_JUMP,
      severity: AlertSeverity.HIGH,
      description: 'Impossible transport speed detected: 2,450 km/h between Ethiopia and Germany',
      detectedAt: '2024-01-22T15:30:00Z',
      score: 0.92,
      isResolved: false,
      metadata: {
        previousLocation: 'Addis Ababa, Ethiopia',
        currentLocation: 'Hamburg, Germany',
        timeElapsed: '2 hours',
        calculatedSpeed: '2,450 km/h'
      }
    },
    {
      id: 'anomaly-002',
      batchId: 'COC-BRA-k8l9m0n1o2',
      eventId: 'COC-BRA-k8l9m0n1o2-certification',
      type: AnomalyType.CERTIFICATION_MISMATCH,
      severity: AlertSeverity.MEDIUM,
      description: 'Organic certification expired before event timestamp',
      detectedAt: '2024-02-05T09:15:00Z',
      score: 0.78,
      isResolved: true,
      resolvedAt: '2024-02-05T14:20:00Z',
      resolvedBy: 'admin-001',
      metadata: {
        certificationType: 'Organic',
        expiryDate: '2024-01-30T00:00:00Z',
        eventDate: '2024-02-01T10:00:00Z'
      }
    },
    {
      id: 'anomaly-003',
      batchId: 'COT-VIE-x3y4z5a6b7',
      eventId: 'COT-VIE-x3y4z5a6b7-processing',
      type: AnomalyType.TIME_INCONSISTENCY,
      severity: AlertSeverity.LOW,
      description: 'Processing event logged outside normal business hours',
      detectedAt: '2024-02-10T02:30:00Z',
      score: 0.45,
      isResolved: false,
      metadata: {
        eventTime: '02:30 AM',
        expectedHours: '06:00 - 22:00',
        eventType: 'processing'
      }
    },
    {
      id: 'anomaly-004',
      batchId: 'COF-ETH-m1n2p3q4r5',
      eventId: 'COF-ETH-m1n2p3q4r5-duplicate',
      type: AnomalyType.SUSPICIOUS_PATTERN,
      severity: AlertSeverity.CRITICAL,
      description: 'Duplicate harvest event detected within 1 hour at same location',
      detectedAt: '2024-01-15T08:45:00Z',
      score: 0.95,
      isResolved: false,
      metadata: {
        originalEventTime: '08:00:00Z',
        duplicateEventTime: '08:45:00Z',
        location: 'Yirgacheffe, Ethiopia'
      }
    }
  ]);

  useEffect(() => {
    // Simulate API call
    const fetchAnomalies = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnomalies(mockAnomalies);
      setFilteredAnomalies(mockAnomalies);
      setIsLoading(false);
    };

    fetchAnomalies();
  }, [mockAnomalies]);

  useEffect(() => {
    let filtered = anomalies;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(anomaly =>
        anomaly.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        anomaly.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(anomaly => anomaly.severity === severityFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(anomaly => anomaly.type === typeFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(anomaly => 
        statusFilter === 'resolved' ? anomaly.isResolved : !anomaly.isResolved
      );
    }

    setFilteredAnomalies(filtered);
  }, [anomalies, searchTerm, severityFilter, typeFilter, statusFilter]);

  const getSeverityColor = (severity: AlertSeverity) => {
    const colors = {
      [AlertSeverity.LOW]: 'bg-yellow-100 text-yellow-800',
      [AlertSeverity.MEDIUM]: 'bg-orange-100 text-orange-800',
      [AlertSeverity.HIGH]: 'bg-red-100 text-red-800',
      [AlertSeverity.CRITICAL]: 'bg-red-200 text-red-900'
    };
    return colors[severity];
  };

  const getTypeIcon = (type: AnomalyType) => {
    switch (type) {
      case AnomalyType.LOCATION_JUMP:
        return <MapPin className="h-4 w-4" />;
      case AnomalyType.TIME_INCONSISTENCY:
        return <Clock className="h-4 w-4" />;
      case AnomalyType.CERTIFICATION_MISMATCH:
        return <XCircle className="h-4 w-4" />;
      case AnomalyType.SUSPICIOUS_PATTERN:
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const resolveAnomaly = async (anomalyId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAnomalies(prev => prev.map(anomaly => 
        anomaly.id === anomalyId 
          ? { 
              ...anomaly, 
              isResolved: true, 
              resolvedAt: new Date().toISOString(),
              resolvedBy: 'current-user'
            }
          : anomaly
      ));
    } catch (error) {
      console.error('Failed to resolve anomaly:', error);
    }
  };

  if (isLoading) {
    return (
      <Layout title="Anomaly Detection">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  const stats = {
    total: anomalies.length,
    unresolved: anomalies.filter(a => !a.isResolved).length,
    critical: anomalies.filter(a => a.severity === AlertSeverity.CRITICAL).length,
    resolved: anomalies.filter(a => a.isResolved).length
  };

  return (
    <Layout title="Anomaly Detection">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Anomaly Detection</h1>
          <p className="text-gray-600">Monitor and resolve supply chain anomalies</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Anomalies</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Unresolved</p>
                  <p className="text-2xl font-bold text-red-600">{stats.unresolved}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical</p>
                  <p className="text-2xl font-bold text-red-700">{stats.critical}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search anomalies..."
                  className="input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Severity Filter */}
              <select
                className="input"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as AlertSeverity | 'all')}
              >
                <option value="all">All Severities</option>
                {Object.values(AlertSeverity).map(severity => (
                  <option key={severity} value={severity}>
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                className="input"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as AnomalyType | 'all')}
              >
                <option value="all">All Types</option>
                {Object.values(AnomalyType).map(type => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                className="input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'resolved' | 'unresolved')}
              >
                <option value="all">All Status</option>
                <option value="unresolved">Unresolved</option>
                <option value="resolved">Resolved</option>
              </select>

              {/* Clear Filters */}
              <button
                className="btn btn-outline"
                onClick={() => {
                  setSearchTerm('');
                  setSeverityFilter('all');
                  setTypeFilter('all');
                  setStatusFilter('all');
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Anomalies List */}
        <div className="space-y-4">
          {filteredAnomalies.map((anomaly) => (
            <div key={anomaly.id} className="card">
              <div className="card-content">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 rounded-lg ${getSeverityColor(anomaly.severity)}`}>
                        {getTypeIcon(anomaly.type)}
                      </div>
                      <div>
                        <span className={`badge ${getSeverityColor(anomaly.severity)}`}>
                          {anomaly.severity.toUpperCase()}
                        </span>
                        <span className="badge badge-default ml-2">
                          {anomaly.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                      {anomaly.isResolved && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2">{anomaly.description}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-2" />
                        Batch: {anomaly.batchId}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(anomaly.detectedAt).toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Score: {(anomaly.score * 100).toFixed(1)}%
                      </div>
                    </div>

                    {anomaly.metadata && Object.keys(anomaly.metadata).length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <h5 className="text-xs font-medium text-gray-700 mb-2">Details</h5>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(anomaly.metadata).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-gray-500">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                              <span className="text-gray-900 ml-1">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {anomaly.isResolved && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center text-green-800 text-sm">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Resolved on {new Date(anomaly.resolvedAt!).toLocaleString()}
                          {anomaly.resolvedBy && ` by ${anomaly.resolvedBy}`}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    {!anomaly.isResolved && (
                      <button
                        onClick={() => resolveAnomaly(anomaly.id)}
                        className="btn btn-sm btn-primary"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolve
                      </button>
                    )}
                    
                    <button className="btn btn-sm btn-outline">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAnomalies.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No anomalies found</h3>
            <p className="text-gray-600">
              {searchTerm || severityFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Great! No anomalies detected in your supply chain.'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AnomaliesPage;