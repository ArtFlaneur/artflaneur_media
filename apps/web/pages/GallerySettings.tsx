import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { updateGallery, logGalleryAction } from '../lib/supabase';
import { Save, Building2, Mail, Phone, MapPin, Users } from 'lucide-react';
import type { Gallery } from '../lib/database.types';

interface DashboardContext {
  gallery: Gallery;
  refreshGallery: () => void;
}

const GallerySettings: React.FC = () => {
  const { gallery, refreshGallery } = useOutletContext<DashboardContext>();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: gallery.name,
    email: gallery.email || '',
    phone: gallery.phone || '',
    address: gallery.address || '',
    description: gallery.description || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await updateGallery(gallery.id, formData);
      if (error) throw error;

      await logGalleryAction(
        gallery.id,
        'settings_updated',
        'Updated gallery information',
        { fields: Object.keys(formData) }
      );

      setSuccess(true);
      refreshGallery();
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update gallery information');
    } finally {
      setLoading(false);
    }
  };

  const updateField = <K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify({
    name: gallery.name,
    email: gallery.email || '',
    phone: gallery.phone || '',
    address: gallery.address || '',
    description: gallery.description || '',
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl mb-2">Gallery Settings</h1>
        <p className="text-gray-600">Manage your gallery information and team</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-800">Gallery information updated successfully</p>
        </div>
      )}

      {/* Gallery Information */}
      <div className="bg-white rounded shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-serif text-xl flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Gallery Information
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Gallery Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Gallery Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
              placeholder="Your Gallery Name"
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
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
              placeholder="Tell us about your gallery..."
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                placeholder="gallery@example.com"
              />
            </div>
            <div>
              <label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4" />
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4" />
              Address
            </label>
            <textarea
              id="address"
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
              placeholder="Street address, city, postal code, country"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading || !hasChanges}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 font-medium text-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Team Management */}
      <div className="bg-white rounded shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-serif text-xl flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Management
          </h2>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Add team members to collaborate on managing your gallery exhibitions. 
            Team members will have access to create and edit exhibitions.
          </p>
          
          <div className="p-8 border-2 border-dashed border-gray-300 rounded text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">Team management coming soon</p>
            <p className="text-sm text-gray-400">
              This feature will allow you to invite team members and manage their permissions.
            </p>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-serif text-xl">Account Information</h2>
        </div>
        
        <div className="p-6 space-y-3 text-sm">
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Account Status</span>
            <span className={`font-medium ${gallery.is_active ? 'text-green-600' : 'text-red-600'}`}>
              {gallery.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Member Since</span>
            <span className="font-medium">
              {new Date(gallery.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Last Updated</span>
            <span className="font-medium">
              {new Date(gallery.updated_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GallerySettings;
