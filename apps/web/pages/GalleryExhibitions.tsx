import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { getExhibitionSubmissions } from '../lib/supabase';
import { Plus, Calendar, Clock, CheckCircle, XCircle, Filter } from 'lucide-react';
import type { Gallery, ExhibitionSubmission } from '../lib/database.types';

interface DashboardContext {
  gallery: Gallery;
}

type StatusFilter = 'all' | ExhibitionSubmission['status'];

const GalleryExhibitions: React.FC = () => {
  const { gallery } = useOutletContext<DashboardContext>();
  const [exhibitions, setExhibitions] = useState<ExhibitionSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    loadExhibitions();
  }, [gallery.id]);

  const loadExhibitions = async () => {
    try {
      const { data, error } = await getExhibitionSubmissions(gallery.id);
      if (error) throw error;
      setExhibitions(data || []);
    } catch (err) {
      console.error('Error loading exhibitions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredExhibitions = exhibitions.filter(
    (ex) => filter === 'all' || ex.status === filter
  );

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending_review: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    published: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const statusIcons: Record<string, React.ReactNode> = {
    draft: <Clock className="w-4 h-4" />,
    pending_review: <Clock className="w-4 h-4" />,
    approved: <CheckCircle className="w-4 h-4" />,
    published: <CheckCircle className="w-4 h-4" />,
    rejected: <XCircle className="w-4 h-4" />,
  };

  const statusCounts = exhibitions.reduce((acc, ex) => {
    acc[ex.status] = (acc[ex.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading exhibitions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl mb-2">Exhibitions</h1>
          <p className="text-gray-600">Manage your gallery exhibitions</p>
        </div>
        <Link
          to="/gallery-dashboard/exhibitions/new"
          className="flex items-center gap-2 bg-black text-white px-6 py-3 uppercase text-sm font-medium hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" />
          New Exhibition
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded shadow">
        <div className="flex items-center gap-1 p-2 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-black text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All ({exhibitions.length})
          </button>
          {(['draft', 'pending_review', 'approved', 'published', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors whitespace-nowrap ${
                filter === status
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status.replace('_', ' ')} ({statusCounts[status] || 0})
            </button>
          ))}
        </div>

        {/* Exhibitions List */}
        {filteredExhibitions.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? 'No exhibitions yet' 
                : `No ${filter.replace('_', ' ')} exhibitions`}
            </p>
            <Link
              to="/gallery-dashboard/exhibitions/new"
              className="inline-block bg-black text-white px-6 py-2 uppercase text-sm font-medium hover:bg-gray-800"
            >
              Create Exhibition
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredExhibitions.map((exhibition) => (
              <Link
                key={exhibition.id}
                to={`/gallery-dashboard/exhibitions/${exhibition.id}/edit`}
                className="block p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-lg">{exhibition.title}</h3>
                      <span
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          statusColors[exhibition.status]
                        }`}
                      >
                        {statusIcons[exhibition.status]}
                        {exhibition.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(exhibition.start_date).toLocaleDateString()} - {new Date(exhibition.end_date).toLocaleDateString()}
                      </span>
                      {exhibition.artists && exhibition.artists.length > 0 && (
                        <span>
                          {exhibition.artists.length} artist{exhibition.artists.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {exhibition.description && (
                      <p className="text-sm text-gray-700 line-clamp-2">{exhibition.description}</p>
                    )}

                    {exhibition.rejection_reason && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-800">
                          <strong>Rejection reason:</strong> {exhibition.rejection_reason}
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
    </div>
  );
};

export default GalleryExhibitions;
