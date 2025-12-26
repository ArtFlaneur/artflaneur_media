import React, { useEffect, useState } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import { syncExhibitionToSanity } from '../lib/sanitySync';
import { CheckCircle, XCircle, Eye, Clock, AlertCircle } from 'lucide-react';
import type { ExhibitionSubmission, Gallery } from '../lib/database.types';

interface ExhibitionWithGallery extends ExhibitionSubmission {
  gallery: Gallery;
}

const AdminModeration: React.FC = () => {
  const [exhibitions, setExhibitions] = useState<ExhibitionWithGallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExhibitions();
  }, [filter]);

  const loadExhibitions = async () => {
    try {
      const supabase = getSupabaseClient();
      let query = supabase
        .from('exhibition_submissions')
        .select(`
          *,
          gallery:galleries(*)
        `)
        .order('created_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('status', 'pending_review');
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setExhibitions((data as any) || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (exhibition: ExhibitionWithGallery) => {
    setProcessing(exhibition.id);
    setError(null);

    try {
      const { sanityExhibitionId } = await syncExhibitionToSanity(exhibition);
      const supabase = getSupabaseClient();
      const timestamp = new Date().toISOString();

      // Update status in Supabase
      const { error: updateError } = await supabase
        .from('exhibition_submissions')
        .update({
          status: 'published',
          approved_at: timestamp,
          published_at: timestamp,
          sanity_exhibition_id: sanityExhibitionId,
        })
        .eq('id', exhibition.id);

      if (updateError) throw updateError;

      // Reload exhibitions
      await loadExhibitions();
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Failed to approve the submission';
      setError(message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (exhibitionId: string, reason: string) => {
    setProcessing(exhibitionId);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('exhibition_submissions')
        .update({
          status: 'rejected',
          rejection_reason: reason,
        })
        .eq('id', exhibitionId);

      if (error) throw error;

      await loadExhibitions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const promptReject = (exhibitionId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason && reason.trim()) {
      handleReject(exhibitionId, reason.trim());
    }
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending_review: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    published: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading submissions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="font-serif text-4xl mb-2">Exhibition Moderation</h1>
        <p className="text-gray-600">Review and approve gallery exhibition submissions</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded font-medium ${
            filter === 'pending'
              ? 'bg-yellow-100 text-yellow-900'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Pending Review ({exhibitions.filter(e => e.status === 'pending_review').length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded font-medium ${
            filter === 'all'
              ? 'bg-blue-100 text-blue-900'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Submissions ({exhibitions.length})
        </button>
      </div>

      {/* Exhibitions List */}
      <div className="space-y-4">
        {exhibitions.length === 0 ? (
          <div className="bg-white rounded shadow p-12 text-center">
            <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No exhibitions to review</p>
          </div>
        ) : (
          exhibitions.map((exhibition) => (
            <div key={exhibition.id} className="bg-white rounded shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-serif text-2xl">{exhibition.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[exhibition.status]
                      }`}
                    >
                      {exhibition.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    Gallery: <span className="font-medium">{exhibition.gallery.name}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Dates: {new Date(exhibition.start_date).toLocaleDateString()} - {new Date(exhibition.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {exhibition.description && (
                <p className="text-gray-700 mb-4">{exhibition.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                {exhibition.artists && exhibition.artists.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Artists:</span>
                    <p className="text-gray-600">{exhibition.artists.join(', ')}</p>
                  </div>
                )}
                {exhibition.curators && exhibition.curators.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Curators:</span>
                    <p className="text-gray-600">{exhibition.curators.join(', ')}</p>
                  </div>
                )}
                {exhibition.ticketing_link && (
                  <div>
                    <span className="font-medium text-gray-700">Ticketing:</span>
                    <p className="text-gray-600">
                      {exhibition.ticketing_access === 'free' ? 'Free Entry' : exhibition.ticketing_price || 'Ticketed'}
                    </p>
                  </div>
                )}
              </div>

              {exhibition.rejection_reason && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm font-medium text-red-900">Rejection Reason:</p>
                  <p className="text-sm text-red-800">{exhibition.rejection_reason}</p>
                </div>
              )}

              {exhibition.status === 'pending_review' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleApprove(exhibition)}
                    disabled={processing === exhibition.id}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {processing === exhibition.id ? 'Publishing...' : 'Approve & Publish'}
                  </button>
                  <button
                    onClick={() => promptReject(exhibition.id)}
                    disabled={processing === exhibition.id}
                    className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminModeration;
