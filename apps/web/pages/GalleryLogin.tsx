import React, { useState } from 'react';
import { signIn, signUp, createGalleryForUser, submitGalleryClaimRequest } from '../lib/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
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
  const [selectedGalleryId, setSelectedGalleryId] = useState<string>('');

  const claimGalleryId = searchParams.get('claimGalleryId')?.trim() || '';
  const claimGalleryName = searchParams.get('claimGalleryName')?.trim() || '';
  const claimGalleryCity = searchParams.get('claimGalleryCity')?.trim() || '';
  const claimGalleryCountry = searchParams.get('claimGalleryCountry')?.trim() || '';
  const isClaimFlow = Boolean(claimGalleryId);

  const [claimApplicantName, setClaimApplicantName] = useState('');
  const [claimApplicantPhone, setClaimApplicantPhone] = useState('');
  const [claimMessage, setClaimMessage] = useState('');
  const [claimSubmitted, setClaimSubmitted] = useState(false);

  React.useEffect(() => {
    const requestedMode = searchParams.get('mode')?.toLowerCase();
    if (requestedMode === 'signup' || requestedMode === 'register') {
      setMode('signup');
      setStep('gallery-select');
    }
  }, [searchParams]);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimGalleryId) {
      setError('Missing gallery identifier. Please use the Claim link from a gallery page.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: claimError } = await submitGalleryClaimRequest({
        galleryExternalId: claimGalleryId,
        galleryName: claimGalleryName,
        galleryCity: claimGalleryCity,
        galleryCountry: claimGalleryCountry,
        applicantEmail: email,
        applicantName: claimApplicantName,
        applicantPhone: claimApplicantPhone,
        message: claimMessage,
      });

      if (claimError) throw claimError;

      setClaimSubmitted(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit your claim request.');
    } finally {
      setLoading(false);
    }
  };

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

        // EXISTING gallery → claim request (manual approval)
        if (gallerySource === 'existing') {
          const { error: claimError } = await submitGalleryClaimRequest({
            galleryExternalId: selectedGalleryId,
            galleryName: galleryDetails.name.trim(),
            galleryCity: galleryDetails.city?.trim() || undefined,
            galleryCountry: galleryDetails.country?.trim() || undefined,
            applicantEmail: email,
            applicantName: undefined,
            applicantPhone: undefined,
            message: `Registered via signup form. Password provided.`,
          });
          if (claimError) throw claimError;

          setError('✅ Your claim request has been submitted. We will review it and contact you by email.');
          setGallerySource(null);
          setGalleryDetails(initialGalleryState);
          setSelectedGalleryId('');
          setEmail('');
          setPassword('');
          setStep('auth');
          setMode('login');
          return;
        }

        // NEW gallery → create user + gallery immediately
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

        setError('Gallery created! Check your email to confirm your account, then you can log in.');
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
    setSelectedGalleryId(gallery.id ?? '');
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

  if (isClaimFlow) {
    const claimLocation = [claimGalleryCity, claimGalleryCountry].filter(Boolean).join(', ');

    return (
      <div className="min-h-screen bg-art-paper flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="border-2 border-black bg-white">
            <div className="border-b-2 border-black bg-white p-6">
              <h1 className="font-black uppercase text-2xl tracking-wider mb-2">Claim Your Gallery</h1>
              <p className="font-mono text-xs uppercase tracking-wide text-gray-600">
                Submit request · Manual review process
              </p>
            </div>

            <div className="border-b-2 border-black bg-gray-50 p-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">Gallery</p>
              <p className="font-black text-xl uppercase">{claimGalleryName || 'Selected gallery'}</p>
              {claimLocation ? <p className="font-mono text-sm text-gray-600 mt-1">{claimLocation}</p> : null}
              <p className="font-mono text-[10px] text-gray-400 mt-2">ID: {claimGalleryId}</p>
            </div>

            <div className="p-6">
              {error && (
                <div
                  className={`mb-6 border-2 p-4 ${
                    error.includes('✅')
                      ? 'bg-green-50 border-green-600'
                      : 'bg-red-50 border-red-600'
                  }`}
                >
                  <p className="font-mono text-xs uppercase tracking-wide">{error}</p>
                </div>
              )}

              {!claimSubmitted ? (
                <form onSubmit={handleClaimSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="claim_name" className="block font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                      Your name
                    </label>
                    <input
                      id="claim_name"
                      type="text"
                      value={claimApplicantName}
                      onChange={(e) => setClaimApplicantName(e.target.value)}
                      className="w-full border-2 border-black px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                      placeholder="Full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="claim_email" className="block font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                      Email *
                    </label>
                    <input
                      id="claim_email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full border-2 border-black px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="claim_phone" className="block font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                      Phone
                    </label>
                    <input
                      id="claim_phone"
                      type="tel"
                      value={claimApplicantPhone}
                      onChange={(e) => setClaimApplicantPhone(e.target.value)}
                      className="w-full border-2 border-black px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                      placeholder="+1 555 000 000"
                    />
                  </div>

                  <div>
                    <label htmlFor="claim_message" className="block font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                      Message
                    </label>
                    <textarea
                      id="claim_message"
                      value={claimMessage}
                      onChange={(e) => setClaimMessage(e.target.value)}
                      className="w-full border-2 border-black px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 min-h-[120px]"
                      placeholder="Tell us your role / link to the gallery website / anything helpful"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-4 font-mono text-xs uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Submitting…' : 'Submit claim request'}
                  </button>

                  <button
                    type="button"
                    className="w-full border-2 border-black py-4 font-mono text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors"
                    onClick={() => navigate('/gallery-login')}
                  >
                    Back to login
                  </button>
                </form>
              ) : (
                <div>
                  <div className="border-2 border-green-600 bg-green-50 p-6 mb-6">
                    <p className="font-mono text-xs uppercase tracking-wide text-green-900">
                      Request submitted successfully
                    </p>
                    <p className="font-mono text-sm text-gray-700 mt-2">
                      We'll review it and get back to you by email.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="w-full border-2 border-black py-4 font-mono text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors"
                    onClick={() => navigate('/')}
                  >
                    Return to site
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-art-paper flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="border-2 border-black bg-white">
          <div className="border-b-2 border-black bg-white p-6">
            <h1 className="font-black uppercase text-2xl tracking-wider mb-2">
              Gallery Dashboard
            </h1>
            <p className="font-mono text-xs uppercase tracking-wide text-gray-600">
              {mode === 'login'
                ? 'Sign in to manage your gallery'
                : step === 'gallery-select'
                  ? 'Step 1 of 2 · Tell us about your gallery'
                  : 'Step 2 of 2 · Create your gallery account'}
            </p>
          </div>

          <div className="p-6">
            {error && (
              <div className={`mb-6 border-2 p-4 ${
                error.includes('Check your email') || error.includes('created') || error.includes('linked') || error.includes('✅')
                  ? 'bg-green-50 border-green-600' 
                  : 'bg-red-50 border-red-600'
              }`}>
                <p className="font-mono text-xs uppercase tracking-wide">{error}</p>
              </div>
            )}

            {step === 'auth' ? (
              <>
                {mode === 'signup' && gallerySource && (
                  <div className="mb-6 border-2 border-black bg-gray-50 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                          {gallerySource === 'existing' ? 'Existing gallery' : 'New gallery'}
                        </p>
                        <p className="font-black text-lg uppercase">{galleryDetails.name || 'Unnamed gallery'}</p>
                        {selectedGalleryLocation && (
                          <p className="font-mono text-sm text-gray-600 mt-1">{selectedGalleryLocation}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        className="font-mono text-xs uppercase tracking-wide underline hover:no-underline"
                        onClick={() => setStep('gallery-select')}
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full border-2 border-black px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                      placeholder="gallery@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full border-2 border-black px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black py-4 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                </form>
              </>
            ) : (
              /* Step 1: Gallery Selection */
              <div className="space-y-6">
                {/* Mode Toggle */}
                <div className="flex border-2 border-black">
                  <button
                    onClick={() => setGalleryMode('search')}
                    className={`flex-1 py-4 font-mono text-xs uppercase tracking-widest transition-colors ${
                      galleryMode === 'search'
                        ? 'bg-black text-white'
                        : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    <Search className="w-4 h-4 inline mr-2" />
                    Find My Gallery
                  </button>
                  <button
                    onClick={() => setGalleryMode('create')}
                    className={`flex-1 py-4 font-mono text-xs uppercase tracking-widest transition-colors border-l-2 border-black ${
                      galleryMode === 'create'
                        ? 'bg-black text-white'
                        : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Create New Gallery
                  </button>
                </div>

                {galleryMode === 'search' ? (
                  /* Search Existing Gallery */
                  <div className="space-y-4">
                    <div className="flex gap-0">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearchGallery()}
                        placeholder="Search by gallery name, city, or email..."
                        className="flex-1 border-2 border-black border-r-0 px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                      />
                      <button
                        onClick={handleSearchGallery}
                        disabled={searching || !searchQuery.trim()}
                        className="px-6 py-3 bg-black text-white border-2 border-black font-mono text-xs uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50"
                      >
                        {searching ? 'Searching...' : 'Search'}
                      </button>
                    </div>

                    {searchResults.length > 0 && (
                      <div className="border-2 border-black divide-y-2 divide-black max-h-96 overflow-y-auto">
                        {searchResults.map((gallery) => (
                          <div key={gallery.id} className="p-4 hover:bg-gray-50 flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-black uppercase text-base">{gallery.galleryname}</h3>
                              {(gallery.city || gallery.country) && (
                                <p className="font-mono text-xs text-gray-600 flex items-center gap-1 mt-1">
                                  <MapPin className="w-3 h-3" />
                                  {[gallery.city, gallery.country].filter(Boolean).join(', ')}
                                </p>
                              )}
                              {gallery.fulladdress && (
                                <p className="font-mono text-[10px] text-gray-500 mt-1">{gallery.fulladdress}</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleExistingGallerySelection(gallery)}
                              disabled={loading}
                              className="ml-4 px-4 py-2 bg-black text-white font-mono text-[10px] uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 border-2 border-black"
                            >
                              Select
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Create New Gallery */
                  <form onSubmit={handlePrepareNewGallery} className="space-y-5">
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                        Gallery Name *
                      </label>
                      <input
                        type="text"
                        value={galleryDetails.name}
                        onChange={(e) => updateGalleryField('name', e.target.value)}
                        required
                        className="w-full border-2 border-black px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                        placeholder="Your Gallery Name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          value={galleryDetails.city}
                          onChange={(e) => updateGalleryField('city', e.target.value)}
                          required
                          className="w-full border-2 border-black px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                          Country *
                        </label>
                        <input
                          type="text"
                          value={galleryDetails.country}
                          onChange={(e) => updateGalleryField('country', e.target.value)}
                          required
                          className="w-full border-2 border-black px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                          placeholder="Country"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                        Full Address *
                      </label>
                      <textarea
                        value={galleryDetails.address}
                        onChange={(e) => updateGalleryField('address', e.target.value)}
                        required
                        rows={2}
                        className="w-full border-2 border-black px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                        placeholder="Street address, postal code"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                        Opening Hours
                      </label>
                      <input
                        type="text"
                        value={galleryDetails.openingHours}
                        onChange={(e) => updateGalleryField('openingHours', e.target.value)}
                        className="w-full border-2 border-black px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                        placeholder="e.g., Tue-Sat 10:00-18:00"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                        Gallery Image URL
                      </label>
                      <input
                        type="url"
                        value={galleryDetails.imageUrl}
                        onChange={(e) => updateGalleryField('imageUrl', e.target.value)}
                        className="w-full border-2 border-black px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                        placeholder="https://..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-black text-white py-4 font-mono text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save Gallery Details
                    </button>
                  </form>
                )}
              </div>
            )}

            <div className="mt-6 pt-6 border-t-2 border-black text-center">
              <button
                onClick={() => handleModeToggle(mode === 'login' ? 'signup' : 'login')}
                className="font-mono text-xs uppercase tracking-wide hover:underline"
              >
                {mode === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="font-mono text-xs uppercase tracking-wide hover:underline">
            ← Back to Art Flaneur
          </a>
        </div>
      </div>
    </div>
  );
};

export default GalleryLogin;
