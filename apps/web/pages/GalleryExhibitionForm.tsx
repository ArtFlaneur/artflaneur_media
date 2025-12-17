import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import {
  createExhibitionSubmission,
  updateExhibitionSubmission,
  getExhibitionSubmissions,
  deleteExhibitionSubmission,
  logGalleryAction,
} from '../lib/supabase';
import { Save, Trash2, Send, ArrowLeft } from 'lucide-react';
import { ImageUpload } from '../components/ImageUpload';
import type { Gallery, ExhibitionSubmission } from '../lib/database.types';

interface DashboardContext {
  gallery: Gallery;
}

const GalleryExhibitionForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { gallery } = useOutletContext<DashboardContext>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    artists: [] as string[],
    curators: [] as string[],
    image_url: '',
    ticketing_access: 'free' as 'free' | 'ticketed',
    ticketing_price: '',
    ticketing_link: '',
    ticketing_cta_label: '',
    venue_override: '',
  });

  useEffect(() => {
    if (isEditing) {
      loadExhibition();
    }
  }, [id]);

  const loadExhibition = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await getExhibitionSubmissions(gallery.id);
      if (error) throw error;
      
      const exhibition = data?.find((ex) => ex.id === id);
      if (!exhibition) {
        setError('Exhibition not found');
        return;
      }

      setFormData({
        title: exhibition.title,
        description: exhibition.description || '',
        start_date: exhibition.start_date,
        end_date: exhibition.end_date,
        artists: exhibition.artists || [],
        curators: exhibition.curators || [],
        image_url: exhibition.image_url || '',
        ticketing_access: exhibition.ticketing_access || 'free',
        ticketing_price: exhibition.ticketing_price || '',
        ticketing_link: exhibition.ticketing_link || '',
        ticketing_cta_label: exhibition.ticketing_cta_label || '',
        venue_override: exhibition.venue_override || '',
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
      return 'Exhibition title is required';
    }
    if (!formData.start_date) {
      return 'Start date is required';
    }
    if (!formData.end_date) {
      return 'End date is required';
    }
    
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (endDate < startDate) {
      return 'End date must be after start date';
    }
    
    if (status === 'pending_review') {
      if (!formData.description?.trim()) {
        return 'Description is required for submission';
      }
      if (formData.description.trim().length < 50) {
        return 'Description must be at least 50 characters for submission';
      }
    }
    
    if (formData.ticketing_link && !formData.ticketing_link.match(/^https?:\/\/.+/)) {
      return 'Please enter a valid ticketing URL (must start with http:// or https://)';
    }
    
    return null;
  };

  const handleSubmit = async (status: 'draft' | 'pending_review') => {
    setLoading(true);
    setError(null);
    
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      if (isEditing && id) {
        const { error } = await updateExhibitionSubmission(id, {
          ...formData,
          status,
          artists: formData.artists.filter(Boolean),
        });
        if (error) throw error;

        await logGalleryAction(
          gallery.id,
          'exhibition_updated',
          `Updated exhibition: ${formData.title}`,
          { exhibition_id: id, status }
        );
      } else {
        const { error } = await createExhibitionSubmission({
          gallery_id: gallery.id,
          ...formData,
          status,
          artists: formData.artists.filter(Boolean),
        });
        if (error) throw error;

        await logGalleryAction(
          gallery.id,
          'exhibition_created',
          `Created exhibition: ${formData.title}`,
          { status }
        );
      }

      navigate('/gallery-dashboard/exhibitions');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this exhibition?')) return;

    setDeleting(true);
    try {
      const { error } = await deleteExhibitionSubmission(id);
      if (error) throw error;

      await logGalleryAction(
        gallery.id,
        'exhibition_deleted',
        `Deleted exhibition: ${formData.title}`,
        { exhibition_id: id }
      );

      navigate('/gallery-dashboard/exhibitions');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const updateField = <K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addArtist = () => {
    setFormData((prev) => ({ ...prev, artists: [...prev.artists, ''] }));
  };

  const updateArtist = (index: number, value: string) => {
    const newArtists = [...formData.artists];
    newArtists[index] = value;
    setFormData((prev) => ({ ...prev, artists: newArtists }));
  };

  const removeArtist = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      artists: prev.artists.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => navigate('/gallery-dashboard/exhibitions')}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Exhibitions
        </button>
        <h1 className="font-serif text-3xl mb-2">
          {isEditing ? 'Edit Exhibition' : 'New Exhibition'}
        </h1>
        <p className="text-gray-600">
          {isEditing
            ? 'Update exhibition details and save as draft or submit for review'
            : 'Create a new exhibition submission for your gallery'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded shadow p-6 space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Exhibition Title *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
            placeholder="e.g., Contemporary Visions 2024"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
            placeholder="Describe the exhibition, its themes, and significance..."
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => updateField('start_date', e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => updateField('end_date', e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Image Upload */}
        <ImageUpload
          value={formData.image_url}
          onChange={(url) => updateField('image_url', url)}
          galleryId={gallery.id}
        />

        {/* Artists */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Featured Artists
          </label>
          <div className="space-y-2">
            {formData.artists.map((artist, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => updateArtist(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                  placeholder="Artist name"
                />
                <button
                  type="button"
                  onClick={() => removeArtist(index)}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 border border-red-300 rounded"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addArtist}
              className="text-sm text-gray-600 hover:text-black"
            >
              + Add Artist
            </button>
          </div>
        </div>

        {/* Curators */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Curators
          </label>
          <div className="space-y-2">
            {formData.curators.map((curator, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={curator}
                  onChange={(e) => {
                    const newCurators = [...formData.curators];
                    newCurators[index] = e.target.value;
                    setFormData((prev) => ({ ...prev, curators: newCurators }));
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                  placeholder="Curator name"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      curators: prev.curators.filter((_, i) => i !== index),
                    }));
                  }}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 border border-red-300 rounded"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, curators: [...prev.curators, ''] }));
              }}
              className="text-sm text-gray-600 hover:text-black"
            >
              + Add Curator
            </button>
          </div>
        </div>

        {/* Ticketing */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-medium text-gray-900">Ticketing Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="ticketing_access"
                  value="free"
                  checked={formData.ticketing_access === 'free'}
                  onChange={(e) => updateField('ticketing_access', e.target.value as 'free' | 'ticketed')}
                  className="w-4 h-4"
                />
                <span>Free Entry</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="ticketing_access"
                  value="ticketed"
                  checked={formData.ticketing_access === 'ticketed'}
                  onChange={(e) => updateField('ticketing_access', e.target.value as 'free' | 'ticketed')}
                  className="w-4 h-4"
                />
                <span>Paid / Ticketed</span>
              </label>
            </div>
          </div>

          {formData.ticketing_access === 'ticketed' && (
            <>
              <div>
                <label htmlFor="ticketing_price" className="block text-sm font-medium text-gray-700 mb-2">
                  Ticket Price
                </label>
                <input
                  id="ticketing_price"
                  type="text"
                  value={formData.ticketing_price}
                  onChange={(e) => updateField('ticketing_price', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                  placeholder="e.g., $10, €15, Free"
                />
              </div>
              
              <div>
                <label htmlFor="ticketing_link" className="block text-sm font-medium text-gray-700 mb-2">
                  Booking URL
                </label>
                <input
                  id="ticketing_link"
                  type="url"
                  value={formData.ticketing_link}
                  onChange={(e) => updateField('ticketing_link', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label htmlFor="ticketing_cta_label" className="block text-sm font-medium text-gray-700 mb-2">
                  CTA Button Label (Optional)
                </label>
                <input
                  id="ticketing_cta_label"
                  type="text"
                  value={formData.ticketing_cta_label}
                  onChange={(e) => updateField('ticketing_cta_label', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                  placeholder="e.g., Buy Tickets, Book Now"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use default "Buy Tickets"
                </p>
              </div>
            </>
          )}
        </div>

        {/* Venue Override */}
        <div>
          <label htmlFor="venue_override" className="block text-sm font-medium text-gray-700 mb-2">
            Venue Override
          </label>
          <input
            id="venue_override"
            type="text"
            value={formData.venue_override}
            onChange={(e) => updateField('venue_override', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
            placeholder="Leave empty to use your gallery address"
          />
          <p className="text-xs text-gray-500 mt-1">
            Only fill this if the exhibition is held at a different location
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div>
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || loading}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 border border-red-300 rounded disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              disabled={loading || !formData.title || !formData.start_date || !formData.end_date}
              className="flex items-center gap-2 px-6 py-2 border border-gray-300 hover:bg-gray-50 font-medium text-sm uppercase disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('pending_review')}
              disabled={loading || !formData.title || !formData.start_date || !formData.end_date}
              className="flex items-center gap-2 px-6 py-2 bg-black text-white hover:bg-gray-800 font-medium text-sm uppercase disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Submit for Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryExhibitionForm;
