import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import { getGalleryByUser, signOut } from '../lib/supabase';
import { 
  LayoutDashboard, 
  Calendar, 
  Settings, 
  LogOut, 
  Building2,
  FileText 
} from 'lucide-react';
import type { Gallery } from '../lib/database.types';

const GalleryDashboardLayout: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/gallery-login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadGallery();
    }
  }, [user]);

  const loadGallery = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await getGalleryByUser(user.id);
      if (error) throw error;
      setGallery(data);
    } catch (err) {
      console.error('Error loading gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/gallery-login');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-art-paper flex items-center justify-center">
        <p className="font-mono text-sm uppercase tracking-[0.3em]">Loading...</p>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="min-h-screen bg-art-paper flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white shadow-xl rounded-sm p-8 text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="font-serif text-2xl mb-2">No Gallery Found</h2>
          <p className="text-gray-600 mb-6">
            Your account is not linked to any gallery. Please contact support.
          </p>
          <button
            onClick={handleSignOut}
            className="bg-black text-white px-6 py-2 uppercase text-sm font-medium hover:bg-gray-800"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const navigation = [
    { name: 'Dashboard', href: '/gallery-dashboard', icon: LayoutDashboard },
    { name: 'Exhibitions', href: '/gallery-dashboard/exhibitions', icon: Calendar },
    { name: 'Gallery Info', href: '/gallery-dashboard/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/gallery-dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-art-paper">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6" />
              <div>
                <h1 className="font-serif text-lg font-medium">{gallery.name}</h1>
                <p className="text-xs text-gray-500">Gallery Dashboard</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
          <div className="p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                    active
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-8">
          <Outlet context={{ gallery, refreshGallery: loadGallery }} />
        </main>
      </div>
    </div>
  );
};

export default GalleryDashboardLayout;
