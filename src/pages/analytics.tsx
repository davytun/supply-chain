import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { 
  TrendingUp, 
  Globe,
  Package,
  AlertTriangle,
  Download
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isLoading, setIsLoading] = useState(true);

  // Mock analytics data
  const eventsOverTime = [
    { date: '2024-01-01', events: 45, anomalies: 2 },
    { date: '2024-01-02', events: 52, anomalies: 1 },
    { date: '2024-01-03', events: 38, anomalies: 3 },
    { date: '2024-01-04', events: 61, anomalies: 0 },
    { date: '2024-01-05', events: 49, anomalies: 1 },
    { date: '2024-01-06', events: 55, anomalies: 2 },
    { date: '2024-01-07', events: 43, anomalies: 1 }
  ];

  const batchesByCountry = [
    { country: 'Ethiopia', batches: 45, value: 45 },
    { country: 'Brazil', batches: 38, value: 38 },
    { country: 'Colombia', batches: 32, value: 32 },
    { country: 'Vietnam', batches: 28, value: 28 },
    { country: 'Guatemala', batches: 22, value: 22 },
    { country: 'Others', batches: 35, value: 35 }
  ];

  const productTypeDistribution = [
    { name: 'Coffee', value: 40, color: '#0ea5e9' },
    { name: 'Cocoa', value: 25, color: '#f59e0b' },
    { name: 'Cotton', value: 20, color: '#22c55e' },
    { name: 'Electronics', value: 10, color: '#ef4444' },
    { name: 'Others', value: 5, color: '#8b5cf6' }
  ];

  const certificationTrends = [
    { month: 'Jan', organic: 85, fairTrade: 72, rainforest: 45 },
    { month: 'Feb', organic: 88, fairTrade: 75, rainforest: 48 },
    { month: 'Mar', organic: 92, fairTrade: 78, rainforest: 52 },
    { month: 'Apr', organic: 89, fairTrade: 81, rainforest: 55 },
    { month: 'May', organic: 94, fairTrade: 84, rainforest: 58 },
    { month: 'Jun', organic: 97, fairTrade: 87, rainforest: 61 }
  ];

  const anomalyTypes = [
    { type: 'Location Jump', count: 12, percentage: 35 },
    { type: 'Time Inconsistency', count: 8, percentage: 24 },
    { type: 'Certification Mismatch', count: 7, percentage: 21 },
    { type: 'Suspicious Pattern', count: 5, percentage: 15 },
    { type: 'Quality Deviation', count: 2, percentage: 5 }
  ];

  useEffect(() => {
    // Simulate data loading
    const loadAnalytics = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsLoading(false);
    };

    loadAnalytics();
  }, [timeRange]);

  const exportData = (format: 'csv' | 'pdf'): void => {
    // Simulate export functionality
    console.log(`Exporting analytics data as ${format.toUpperCase()}`);
  };

  if (isLoading) {
    return (
      <Layout title="Analytics & Reports">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Analytics & Reports">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-gray-600">Comprehensive insights into your supply chain performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              className="input"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d' | '1y')}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={() => exportData('csv')}
              className="btn btn-outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={() => exportData('pdf')}
              className="btn btn-primary"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Batches</p>
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                  <p className="text-xs text-green-600">+12% from last month</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Efficiency Score</p>
                  <p className="text-2xl font-bold text-gray-900">94.2%</p>
                  <p className="text-xs text-green-600">+2.1% from last month</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <Globe className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Countries</p>
                  <p className="text-2xl font-bold text-gray-900">23</p>
                  <p className="text-xs text-blue-600">+3 new this month</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Anomaly Rate</p>
                  <p className="text-2xl font-bold text-gray-900">2.8%</p>
                  <p className="text-xs text-red-600">-0.5% from last month</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Events Over Time */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Events & Anomalies Over Time</h3>
              <p className="card-description">Daily supply chain activity and anomaly detection</p>
            </div>
            <div className="card-content">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={eventsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                  <YAxis />
                  <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                  <Area 
                    type="monotone" 
                    dataKey="events" 
                    stackId="1"
                    stroke="#0ea5e9" 
                    fill="#0ea5e9"
                    fillOpacity={0.6}
                    name="Events"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="anomalies" 
                    stackId="2"
                    stroke="#ef4444" 
                    fill="#ef4444"
                    fillOpacity={0.8}
                    name="Anomalies"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Batches by Country */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Batches by Origin Country</h3>
              <p className="card-description">Geographic distribution of product batches</p>
            </div>
            <div className="card-content">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={batchesByCountry}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="batches" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Type Distribution */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Product Type Distribution</h3>
              <p className="card-description">Breakdown by product categories</p>
            </div>
            <div className="card-content">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productTypeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {productTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Certification Trends */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Certification Trends</h3>
              <p className="card-description">Monthly certification adoption rates</p>
            </div>
            <div className="card-content">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={certificationTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="organic" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    name="Organic"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="fairTrade" 
                    stroke="#0ea5e9" 
                    strokeWidth={2}
                    name="Fair Trade"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rainforest" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Rainforest Alliance"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Anomaly Analysis */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Anomaly Analysis</h3>
            <p className="card-description">Breakdown of detected anomalies by type</p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {anomalyTypes.map((anomaly, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <h4 className="font-medium text-gray-900">{anomaly.type}</h4>
                      <p className="text-sm text-gray-600">{anomaly.count} occurrences</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${anomaly.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{anomaly.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Supply Chain Health</h3>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Traceability</span>
                  <span className="text-sm font-medium text-green-600">98.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Certification Rate</span>
                  <span className="text-sm font-medium text-blue-600">87.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Transit Time</span>
                  <span className="text-sm font-medium text-gray-900">14.3 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Quality Score</span>
                  <span className="text-sm font-medium text-green-600">9.2/10</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Blockchain Metrics</h3>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Transactions</span>
                  <span className="text-sm font-medium text-gray-900">12,847</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Network Uptime</span>
                  <span className="text-sm font-medium text-green-600">99.9%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Confirmation</span>
                  <span className="text-sm font-medium text-gray-900">3.2s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Gas Efficiency</span>
                  <span className="text-sm font-medium text-blue-600">94.1%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Sustainability Impact</h3>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Carbon Footprint</span>
                  <span className="text-sm font-medium text-green-600">-12.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Fair Trade Products</span>
                  <span className="text-sm font-medium text-blue-600">78.3%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ethical Sourcing</span>
                  <span className="text-sm font-medium text-green-600">91.7%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Waste Reduction</span>
                  <span className="text-sm font-medium text-green-600">-8.9%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;