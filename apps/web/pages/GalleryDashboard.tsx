import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { getGalleryDashboardStats, getExhibitionSubmissions } from '../lib/supabase';
import { Calendar, CheckCircle, Clock, FileText, TrendingUp } from 'lucide-react';
import type { Gallery, DashboardStats, ExhibitionSubmission } from '../lib/database.types';

interface DashboardContext {
  gallery: Gallery;
  refreshGallery: () => void;
}

const GalleryDashboard: React.FC = () => {
  const { gallery } = useOutletContext<DashboardContext>();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentExhibitions, setRecentExhibitions] = useState<ExhibitionSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [gallery.id]);

  const loadDashboardData = async () => {
    try {
      const [statsResult, exhibitionsResult] = await Promise.all([
        getGalleryDashboardStats(gallery.id),
        getExhibitionSubmissions(gallery.id),
      ]);

      if (statsResult.data) setStats(statsResult.data);
      if (exhibitionsResult.data) setRecentExhibitions(exhibitionsResult.data.slice(0, 5));
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Draft Exhibitions',
      value: stats?.draft_exhibitions ?? 0,
      icon: FileText,
      color: 'text-gray-600',
    },
    {
      label: 'Pending Review',
      value: stats?.pending_exhibitions ?? 0,
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      label: 'Published',
      value: stats?.published_exhibitions ?? 0,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      label: 'Team Members',
      value: stats?.team_members ?? 0,
      icon: TrendingUp,
      color: 'text-blue-600',
    },
  ];

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending_review: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    published: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back to your gallery dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white p-6 rounded shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-serif font-bold">{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Exhibitions */}
      <div className="bg-white rounded shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-serif text-xl">Recent Exhibitions</h2>
        </div>
        
        {recentExhibitions.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">No exhibitions yet</p>
            <Link
              to="/gallery-dashboard/exhibitions/new"
              className="inline-block bg-black text-white px-6 py-2 uppercase text-sm font-medium hover:bg-gray-800"
            >
              Create Your First Exhibition
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentExhibitions.map((exhibition) => (
              <div key={exhibition.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  {exhibition.image_url && (
                    <img
                      src={exhibition.image_url}
                      alt={exhibition.title}
                      className="w-24 h-24 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium">{exhibition.title}</h3>
                      <span
                        className={`ml-4 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          statusColors[exhibition.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {exhibition.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {new Date(exhibition.start_date).toLocaleDateString()} - {new Date(exhibition.end_date).toLocaleDateString()}
                    </p>
                    {exhibition.description && (
                      <p className="text-sm text-gray-700 line-clamp-2">{exhibition.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded shadow p-6">
        <h2 className="font-serif text-xl mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/gallery-dashboard/exhibitions/new"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded hover:border-black hover:shadow transition-all"
          >
            <Calendar className="w-6 h-6" />
            <div>
              <p className="font-medium">New Exhibition</p>
              <p className="text-sm text-gray-600">Submit a new exhibition</p>
            </div>
          </Link>
          <Link
            to="/gallery-dashboard/settings"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded hover:border-black hover:shadow transition-all"
          >
            <FileText className="w-6 h-6" />
            <div>
              <p className="font-medium">Update Gallery Info</p>
              <p className="text-sm text-gray-600">Edit your gallery details</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GalleryDashboard;
