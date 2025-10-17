import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  MapPin,
  User,
  ExternalLink
} from 'lucide-react';
import { SupplyChainEvent, EventType, ParticipantType } from '@/types';
import { sampleEvents } from '@/data/sample-data';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<SupplyChainEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<SupplyChainEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<EventType | 'all'>('all');
  const [participantFilter, setParticipantFilter] = useState<ParticipantType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchEvents = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEvents(sampleEvents);
      setFilteredEvents(sampleEvents);
      setIsLoading(false);
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    let filtered = events;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply event type filter
    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter(event => event.eventType === eventTypeFilter);
    }

    // Apply participant filter
    if (participantFilter !== 'all') {
      filtered = filtered.filter(event => event.participantType === participantFilter);
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, eventTypeFilter, participantFilter]);

  const getEventTypeColor = (eventType: EventType) => {
    const colors = {
      [EventType.HARVEST]: 'bg-green-100 text-green-800',
      [EventType.PROCESSING]: 'bg-blue-100 text-blue-800',
      [EventType.PACKAGING]: 'bg-yellow-100 text-yellow-800',
      [EventType.SHIPPING]: 'bg-purple-100 text-purple-800',
      [EventType.QUALITY_CHECK]: 'bg-indigo-100 text-indigo-800',
      [EventType.STORAGE]: 'bg-gray-100 text-gray-800',
      [EventType.RETAIL_ARRIVAL]: 'bg-pink-100 text-pink-800',
      [EventType.SALE]: 'bg-emerald-100 text-emerald-800',
      [EventType.CERTIFICATION]: 'bg-orange-100 text-orange-800',
      [EventType.INSPECTION]: 'bg-red-100 text-red-800'
    };
    return colors[eventType] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <Layout title="Supply Chain Events">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Supply Chain Events">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Supply Chain Events</h1>
            <p className="text-gray-600">Track and manage all supply chain activities</p>
          </div>
          <Link href="/events/log" className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Log New Event
          </Link>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Event Type Filter */}
              <select
                className="input"
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value as EventType | 'all')}
              >
                <option value="all">All Event Types</option>
                {Object.values(EventType).map(type => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>

              {/* Participant Filter */}
              <select
                className="input"
                value={participantFilter}
                onChange={(e) => setParticipantFilter(e.target.value as ParticipantType | 'all')}
              >
                <option value="all">All Participants</option>
                {Object.values(ParticipantType).map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>

              {/* Clear Filters */}
              <button
                className="btn btn-outline"
                onClick={() => {
                  setSearchTerm('');
                  setEventTypeFilter('all');
                  setParticipantFilter('all');
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <div key={event.id} className="card hover:shadow-md transition-shadow">
              <div className="card-content">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`badge ${getEventTypeColor(event.eventType)}`}>
                        {event.eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <Link 
                        href={`/track/${event.batchId}`}
                        className="text-sm text-primary-600 hover:text-primary-800 font-mono"
                      >
                        {event.batchId}
                      </Link>
                      {event.isAnomaly && (
                        <span className="badge badge-danger">Anomaly Detected</span>
                      )}
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2">{event.description}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location.city}, {event.location.country}
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        {event.participantType} ({event.participantId})
                      </div>
                    </div>

                    {event.certifications && event.certifications.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {event.certifications.map((cert, index) => (
                            <span key={index} className="badge badge-success text-xs">
                              {cert.type.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    {event.hederaTransactionId && (
                      <button className="btn btn-sm btn-outline">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Verify
                      </button>
                    )}
                    
                    {event.anomalyScore !== undefined && (
                      <div className="text-xs text-gray-500">
                        Score: {(event.anomalyScore * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || eventTypeFilter !== 'all' || participantFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by logging your first supply chain event.'}
            </p>
            <Link href="/events/log" className="btn btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Log First Event
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EventsPage;