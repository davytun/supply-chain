import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Globe,
  Award,
  Activity,
  Clock
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardStats {
  totalBatches: number;
  activeBatches: number;
  completedBatches: number;
  totalEvents: number;
  anomaliesDetected: number;
  participantsCount: number;
  countriesCount: number;
  certificationsCount: number;
}

interface RecentActivity {
  id: string;
  type: 'batch_created' | 'event_logged' | 'anomaly_detected' | 'batch_completed';
  title: string;
  description: string;
  timestamp: string;
  batchId?: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBatches: 0,
    activeBatches: 0,
    completedBatches: 0,
    totalEvents: 0,
    anomaliesDetected: 0,
    participantsCount: 0,
    countriesCount: 0,
    certificationsCount: 0
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  const eventsOverTime = [
    { name: 'Jan', events: 65 },
    { name: 'Feb', events: 78 },
    { name: 'Mar', events: 92 },
    { name: 'Apr', events: 85 },
    { name: 'May', events: 98 },
    { name: 'Jun', events: 112 }
  ];

  const batchesByStatus = [
    { name: 'In Production', value: 35, color: '#0ea5e9' },
    { name: 'In Transit', value: 28, color: '#eab308' },
    { name: 'Completed', value: 45, color: '#22c55e' },
    { name: 'On Hold', value: 8, color: '#ef4444' }
  ];

  const productTypes = [
    { name: 'Coffee', value: 40, color: '#8b5cf6' },
    { name: 'Cocoa', value: 25, color: '#f59e0b' },
    { name: 'Cotton', value: 20, color: '#06b6d4' },
    { name: 'Electronics', value: 15, color: '#ec4899' }
  ];

  useEffect(() => {
    // Simulate API call to fetch dashboard data
    const fetchDashboardData = async () => {
      setIsLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock stats data
      setStats({
        totalBatches: 156,
        activeBatches: 89,
        completedBatches: 67,
        totalEvents: 834,
        anomaliesDetected: 12,
        participantsCount: 34,
        countriesCount: 12,
        certificationsCount: 89
      });

      // Mock recent activity
      setRecentActivity([
        {
          id: '1',
          type: 'batch_created',
          title: 'New Coffee Batch Created',
          description: 'COF-ARB-m1n2p3q4r5 from Ethiopia',
          timestamp: '2 minutes ago',
          batchId: 'COF-ARB-m1n2p3q4r5'
        },
        {
          id: '2',
          type: 'anomaly_detected',
          title: 'Location Jump Detected',
          description: 'Suspicious transport speed for batch COT-ORG-k8l9m0n1o2',
          timestamp: '15 minutes ago',
          batchId: 'COT-ORG-k8l9m0n1o2'
        },
        {
          id: '3',
          type: 'event_logged',
          title: 'Quality Check Completed',
          description: 'Organic certification verified for batch COC-FTR-x3y4z5a6b7',
          timestamp: '32 minutes ago',
          batchId: 'COC-FTR-x3y4z5a6b7'
        },
        {
          id: '4',
          type: 'batch_completed',
          title: 'Batch Delivered',
          description: 'ELE-SMT-f1g2h3i4j5 successfully delivered to retailer',
          timestamp: '1 hour ago',
          batchId: 'ELE-SMT-f1g2h3i4j5'
        }
      ]);

      setIsLoading(false);
    };

    fetchDashboardData();
  }, []);

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
    change?: { value: number; label: string };
  }> = ({ title, value, icon: Icon, color, change }) => (
    <div className="card">
      <div className="card-content">
        <div className="flex items-center">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
            {change && (
              <p className={`text-xs ${change.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change.value >= 0 ? '+' : ''}{change.value}% {change.label}
              </p>
            )}
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );

  const ActivityIcon: React.FC<{ type: RecentActivity['type'] }> = ({ type }) => {
    switch (type) {
      case 'batch_created':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'event_logged':
        return <Activity className="h-4 w-4 text-green-500" />;
      case 'anomaly_detected':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'batch_completed':
        return <Award className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Batches"
            value={stats.totalBatches}
            icon={Package}
            color="bg-blue-500"
            change={{ value: 8, label: 'from last month' }}
          />
          <StatCard
            title="Active Batches"
            value={stats.activeBatches}
            icon={TrendingUp}
            color="bg-green-500"
            change={{ value: 12, label: 'from last week' }}
          />
          <StatCard
            title="Anomalies"
            value={stats.anomaliesDetected}
            icon={AlertTriangle}
            color="bg-red-500"
            change={{ value: -3, label: 'from last week' }}
          />
          <StatCard
            title="Participants"
            value={stats.participantsCount}
            icon={Users}
            color="bg-purple-500"
            change={{ value: 5, label: 'from last month' }}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Events Over Time Chart */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Supply Chain Events</h3>
              <p className="card-description">
                Number of events logged over time
              </p>
            </div>
            <div className="card-content">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={eventsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="events" 
                    stroke="#0ea5e9" 
                    strokeWidth={2}
                    dot={{ fill: '#0ea5e9' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Batches by Status */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Batch Status Distribution</h3>
              <p className="card-description">
                Current status of all product batches
              </p>
            </div>
            <div className="card-content">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={batchesByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {batchesByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <div className="card lg:col-span-2">
            <div className="card-header">
              <h3 className="card-title">Recent Activity</h3>
              <p className="card-description">
                Latest events and updates in your supply chain
              </p>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="mt-1">
                      <ActivityIcon type={activity.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activity.timestamp}
                      </p>
                    </div>
                    {activity.batchId && (
                      <div className="flex-shrink-0">
                        <span className="badge badge-default">{activity.batchId}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Types */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Product Types</h3>
              <p className="card-description">
                Distribution by product category
              </p>
            </div>
            <div className="card-content">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={productTypes}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {productTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {productTypes.map((type, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: type.color }}
                      ></div>
                      <span className="text-gray-600">{type.name}</span>
                    </div>
                    <span className="text-gray-900 font-medium">{type.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <Globe className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Countries</p>
                  <p className="text-xl font-bold text-gray-900">{stats.countriesCount}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Certifications</p>
                  <p className="text-xl font-bold text-gray-900">{stats.certificationsCount}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalEvents}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-xl font-bold text-gray-900">{stats.completedBatches}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;