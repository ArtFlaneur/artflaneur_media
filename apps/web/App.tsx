import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header, Footer } from './components/Layout';
import Home from './pages/Home';
import ArticleView from './pages/ArticleView';
import ExhibitionView from './pages/ExhibitionView';
import Partners from './pages/Partners';
import ListingPage from './pages/ListingPage';
import GuideView from './pages/GuideView';
import ArtistView from './pages/ArtistView';
import AmbassadorView from './pages/AmbassadorView';
import CuratorView from './pages/CuratorView';
import GalleryView from './pages/GalleryView';
import About from './pages/About';
import Mission from './pages/Mission';
import SearchResults from './pages/SearchResults';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsConditions } from './pages/TermsConditions';
import { CookiesPolicy } from './pages/CookiesPolicy';
import GalleryLogin from './pages/GalleryLogin';
import GalleryDashboardLayout from './pages/GalleryDashboardLayout';
import GalleryDashboard from './pages/GalleryDashboard';
import GalleryExhibitions from './pages/GalleryExhibitions';
import GalleryExhibitionForm from './pages/GalleryExhibitionForm';
import GallerySettings from './pages/GallerySettings';
import AdminModeration from './pages/AdminModeration';
import SiteSeo from './components/SiteSeo';
import NewsletterPopup from './components/NewsletterPopup';

// ScrollToTop component - прокручивает страницу наверх при смене маршрута
const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <SiteSeo />
      <NewsletterPopup />
      <div className="min-h-screen bg-white text-art-black font-sans selection:bg-art-blue selection:text-white flex flex-col">
        <Header />
        <main className="flex-grow">
            <Routes>
                <Route path="/" element={<Home />} />
                
                {/* Search */}
                <Route path="/search" element={<SearchResults />} />
                
                {/* Listings */}
                <Route path="/reviews" element={<ListingPage title="Reviews" type="reviews" />} />
                <Route path="/exhibitions" element={<ListingPage title="Exhibitions" type="exhibitions" />} />
                <Route path="/artists" element={<ListingPage title="Artists" type="artists" />} />
                <Route path="/guides" element={<ListingPage title="City Guides" type="guides" />} />
                <Route path="/ambassadors" element={<ListingPage title="Ambassadors" type="ambassadors" />} />
                <Route path="/galleries" element={<ListingPage title="Galleries and Museums" type="galleries" />} />
                
                {/* Details */}
                <Route path="/reviews/:id" element={<ArticleView />} />
                <Route path="/exhibitions/:id" element={<ExhibitionView />} />
                <Route path="/guides/:id" element={<GuideView />} />
                <Route path="/artists/:id" element={<ArtistView />} />
                <Route path="/ambassadors/:id" element={<AmbassadorView />} />
                <Route path="/curators/:id" element={<CuratorView />} />
                <Route path="/galleries/:id" element={<GalleryView />} />
                
                {/* Static & Utility */}
                <Route path="/partners/galleries" element={<Partners type="gallery" />} />
                <Route path="/partners/events" element={<Partners type="event" />} />
                <Route path="/about" element={<About />} />
                <Route path="/mission" element={<Mission />} />
                
                {/* Legal Pages */}
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsConditions />} />
                <Route path="/cookies" element={<CookiesPolicy />} />
                
                {/* Gallery Dashboard */}
                <Route path="/gallery-login" element={<GalleryLogin />} />
                <Route path="/gallery-dashboard" element={<GalleryDashboardLayout />}>
                  <Route index element={<GalleryDashboard />} />
                  <Route path="exhibitions" element={<GalleryExhibitions />} />
                  <Route path="exhibitions/new" element={<GalleryExhibitionForm />} />
                  <Route path="exhibitions/:id/edit" element={<GalleryExhibitionForm />} />
                  <Route path="settings" element={<GallerySettings />} />
                </Route>
                
                {/* Admin Panel */}
                <Route path="/admin/moderation" element={<AdminModeration />} />
                
                <Route path="*" element={<Home />} />
            </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;