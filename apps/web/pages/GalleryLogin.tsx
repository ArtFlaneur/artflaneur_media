import React, { useState } from 'react';
import { signIn, signUp, createGalleryForUser } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MapPin } from 'lucide-react';
import { searchGalleries, GraphqlGallery } from '../lib/graphql';

type Step = 'auth' | 'gallery-select';
type GalleryMode = 'search' | 'create';

interface NewGalleryForm {
  name: string;
  address: string;
  city: string;
  country: string;
  openingHours: string;
  imageUrl: string;
}

type GallerySource = 'existing' | 'new' | null;

const GalleryLogin: React.FC = () => {
  const [step, setStep] = useState<Step>('auth');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Step 1: Gallery selection (signup only)
  const [galleryMode, setGalleryMode] = useState<GalleryMode>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GraphqlGallery[]>([]);
  const [searching, setSearching] = useState(false);
  const initialGalleryState: NewGalleryForm = {
    name: '',
    address: '',
    city: '',
    country: '',
    openingHours: '',
    imageUrl: '',
  };
  const [galleryDetails, setGalleryDetails] = useState<NewGalleryForm>(initialGalleryState);
  const [gallerySource, setGallerySource] = useState<GallerySource>(null);

  const updateGalleryField = (field: keyof NewGalleryForm, value: string) => {
    setGalleryDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleModeToggle = (nextMode: 'login' | 'signup') => {
    setMode(nextMode);
    setStep(nextMode === 'signup' ? 'gallery-select' : 'auth');
    if (nextMode === 'login') {
      setGallerySource(null);
    }
    setError(null);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        if (!gallerySource) {
          setStep('gallery-select');
          throw new Error('Please provide your gallery details first.');
        }

        if (!galleryDetails.name.trim()) {
          setStep('gallery-select');
          throw new Error('Gallery name is required.');
        }

        const { data: authData, error: signUpError } = await signUp(email, password);
        if (signUpError) throw signUpError;

        const createdUserId = authData?.user?.id;
        if (!createdUserId) {
          throw new Error('Unable to create your account. Please try again.');
        }

        const locationParts = [galleryDetails.address, galleryDetails.city, galleryDetails.country]
          .map((part) => part?.trim())
          .filter(Boolean);

        const descriptionBits = [] as string[];
        if (galleryDetails.openingHours.trim()) {
          descriptionBits.push(`Hours: ${galleryDetails.openingHours.trim()}`);
        }
        if (galleryDetails.imageUrl.trim()) {
          descriptionBits.push(`Image reference: ${galleryDetails.imageUrl.trim()}`);
        }

        const { error: galleryError } = await createGalleryForUser(createdUserId, {
          name: galleryDetails.name.trim(),
          email,
          address: locationParts.join(', ') || undefined,
          description: descriptionBits.length ? descriptionBits.join('\n') : undefined,
        });
        if (galleryError) throw galleryError;

        setError('Gallery linked! Check your email to confirm your account, then you can log in.');
        setGallerySource(null);
        setGalleryDetails(initialGalleryState);
        setEmail('');
        setPassword('');
        setStep('auth');
        setMode('login');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate('/gallery-dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchGallery = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setError(null);
    try {
      const results = await searchGalleries(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        setError('No galleries found. Try a different search or create a new gallery.');
      }
    } catch (err: any) {
      setError('Failed to search galleries: ' + err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleExistingGallerySelection = (gallery: GraphqlGallery) => {
    setGalleryDetails({
      name: gallery.galleryname ?? '',
      address: gallery.fulladdress ?? '',
      city: gallery.city ?? '',
      country: gallery.country ?? '',
      openingHours: '',
      imageUrl: gallery.gallery_img_url ?? ''
    });
    setGallerySource('existing');
    setStep('auth');
    setMode('signup');
    setError(null);
  };

  const handlePrepareNewGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !galleryDetails.name.trim() ||
      !galleryDetails.city.trim() ||
      !galleryDetails.country.trim() ||
      !galleryDetails.address.trim()
    ) {
      setError('Please fill in all required fields to describe your gallery.');
      return;
    }

    setGallerySource('new');
    setStep('auth');
    setMode('signup');
    setError(null);
  };

  const selectedGalleryLocation = gallerySource
    ? [galleryDetails.city, galleryDetails.country].filter(Boolean).join(', ')
    : '';

  return (
    <div className="min-h-screen bg-art-paper flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white shadow-xl rounded-sm p-8">
          <h1 className="font-serif text-3xl text-center mb-2">
            Gallery Dashboard
          </h1>
          <p className="text-center text-gray-600 text-sm mb-8">
            {mode === 'login'
              ? 'Sign in to manage your gallery'
              : step === 'gallery-select'
                ? 'Step 1 of 2 · Tell us about your gallery'
                : 'Step 2 of 2 · Create your gallery account'}
          </p>

          {error && (
            <div className={`mb-4 p-3 rounded ${
              error.includes('Check your email') || error.includes('created') || error.includes('linked')
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {step === 'auth' ? (
            <>
              {mode === 'signup' && gallerySource && (
                <div className="mb-6 flex items-start justify-between rounded border border-gray-200 bg-gray-50 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      {gallerySource === 'existing' ? 'Existing gallery' : 'New gallery'}
                    </p>
                    <p className="text-lg font-medium">{galleryDetails.name || 'Unnamed gallery'}</p>
                    {selectedGalleryLocation && (
                      <p className="text-sm text-gray-600">{selectedGalleryLocation}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="text-sm font-medium text-black underline"
                    onClick={() => setStep('gallery-select')}
                  >
                    Change
                  </button>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded border border-gray-300 px-4 py-2 focus:border-black focus:outline-none"
                    placeholder="gallery@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full rounded border border-gray-300 px-4 py-2 focus:border-black focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black py-3 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>
            </>
          ) : (
            /* Step 1: Gallery Selection */
            <div className="space-y-6">
              {/* Mode Toggle */}
              <div className="flex gap-2 border-b border-gray-200">
                <button
                  onClick={() => setGalleryMode('search')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    galleryMode === 'search'
                      ? 'border-b-2 border-black text-black'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  <Search className="w-4 h-4 inline mr-2" />
                  Find My Gallery
                </button>
                <button
                  onClick={() => setGalleryMode('create')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    galleryMode === 'create'
                      ? 'border-b-2 border-black text-black'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Create New Gallery
                </button>
              </div>

              {galleryMode === 'search' ? (
                /* Search Existing Gallery */
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchGallery()}
                      placeholder="Search by gallery name, city, or email..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                    />
                    <button
                      onClick={handleSearchGallery}
                      disabled={searching || !searchQuery.trim()}
                      className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                    >
                      {searching ? 'Searching...' : 'Search'}
                    </button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="border border-gray-200 rounded divide-y max-h-96 overflow-y-auto">
                      {searchResults.map((gallery) => (
                        <div key={gallery.id} className="p-4 hover:bg-gray-50 flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-lg">{gallery.galleryname}</h3>
                            {(gallery.city || gallery.country) && (
                              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                <MapPin className="w-4 h-4" />
                                {[gallery.city, gallery.country].filter(Boolean).join(', ')}
                              </p>
                            )}
                            {gallery.fulladdress && (
                              <p className="text-xs text-gray-500 mt-1">{gallery.fulladdress}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleExistingGallerySelection(gallery)}
                            disabled={loading}
                            className="ml-4 px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            Use this gallery
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Create New Gallery */
                <form onSubmit={handlePrepareNewGallery} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gallery Name *
                    </label>
                    <input
                      type="text"
                      value={galleryDetails.name}
                      onChange={(e) => updateGalleryField('name', e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                      placeholder="Your Gallery Name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={galleryDetails.city}
                        onChange={(e) => updateGalleryField('city', e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <input
                        type="text"
                        value={galleryDetails.country}
                        onChange={(e) => updateGalleryField('country', e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                        placeholder="Country"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Address *
                    </label>
                    <textarea
                      value={galleryDetails.address}
                      onChange={(e) => updateGalleryField('address', e.target.value)}
                      required
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                      placeholder="Street address, postal code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opening Hours
                    </label>
                    <input
                      type="text"
                      value={galleryDetails.openingHours}
                      onChange={(e) => updateGalleryField('openingHours', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                      placeholder="e.g., Tue-Sat 10:00-18:00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gallery Image URL
                    </label>
                    <input
                      type="url"
                      value={galleryDetails.imageUrl}
                      onChange={(e) => updateGalleryField('imageUrl', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                      placeholder="https://..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-3 font-medium uppercase text-sm tracking-wide hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Gallery Details
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => handleModeToggle(mode === 'login' ? 'signup' : 'login')}
              className="text-sm text-gray-600 hover:text-black"
            >
              {mode === 'login'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-600 hover:text-black">
            ← Back to Art Flaneur
          </a>
        </div>
      </div>
    </div>
  );
};

export default GalleryLogin;
