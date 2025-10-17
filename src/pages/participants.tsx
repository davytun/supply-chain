import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { 
  Users, 
  Search, 
  Filter,
  MapPin,
  Calendar,
  Package,
  Activity
} from 'lucide-react';
import { ParticipantType } from '@/types';

interface Participant {
  id: string;
  name: string;
  type: ParticipantType;
  organization: string;
  location: {
    country: string;
    region: string;
    city: string;
  };
  isActive: boolean;
  joinedAt: string;
  batchesCount: number;
  eventsCount: number;
}

const ParticipantsPage: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ParticipantType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/participants');
        const result = await response.json();
        if (result.success) {
          setParticipants(result.data);
          setFilteredParticipants(result.data);
        }
      } catch (error) {
        console.error('Error fetching participants:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipants();
  }, []);

  useEffect(() => {
    let filtered = participants;

    if (searchTerm) {
      filtered = filtered.filter(participant =>
        participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.location.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(participant => participant.type === typeFilter);
    }

    setFilteredParticipants(filtered);
  }, [participants, searchTerm, typeFilter]);

  const getTypeColor = (type: ParticipantType) => {
    const colors = {
      [ParticipantType.FARMER]: 'bg-green-100 text-green-800',
      [ParticipantType.PROCESSOR]: 'bg-blue-100 text-blue-800',
      [ParticipantType.DISTRIBUTOR]: 'bg-purple-100 text-purple-800',
      [ParticipantType.RETAILER]: 'bg-orange-100 text-orange-800',
      [ParticipantType.CERTIFIER]: 'bg-yellow-100 text-yellow-800',
      [ParticipantType.INSPECTOR]: 'bg-red-100 text-red-800',
      [ParticipantType.CONSUMER]: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <Layout title="Participants">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Participants">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supply Chain Participants</h1>
          <p className="text-gray-600">Manage and view all participants in your supply chain network</p>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search participants..."
                  className="input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="input"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as ParticipantType | 'all')}
              >
                <option value="all">All Types</option>
                {Object.values(ParticipantType).map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>

              <button
                className="btn btn-outline"
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParticipants.map((participant) => (
            <div key={participant.id} className="card">
              <div className="card-content">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{participant.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{participant.organization}</p>
                    <span className={`badge ${getTypeColor(participant.type)}`}>
                      {participant.type.charAt(0).toUpperCase() + participant.type.slice(1)}
                    </span>
                  </div>
                  <Users className="h-8 w-8 text-gray-400" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {participant.location.city}, {participant.location.country}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Joined {new Date(participant.joinedAt).toLocaleDateString()}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="h-4 w-4 mr-2" />
                    {participant.batchesCount} batches
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Activity className="h-4 w-4 mr-2" />
                    {participant.eventsCount} events
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    participant.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {participant.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button className="btn btn-sm btn-outline">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredParticipants.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No participants found</h3>
            <p className="text-gray-600">
              {searchTerm || typeFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'No participants have been registered yet.'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ParticipantsPage;