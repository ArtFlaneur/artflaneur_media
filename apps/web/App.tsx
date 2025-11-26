import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Header, Footer } from './components/Layout';
import Home from './pages/Home';
import ArticleView from './pages/ArticleView';
import Partners from './pages/Partners';
import MapPage from './pages/MapPage';
import ListingPage from './pages/ListingPage';
import GuideView from './pages/GuideView';
import ArtistView from './pages/ArtistView';
import AmbassadorView from './pages/AmbassadorView';
import CuratorView from './pages/CuratorView';
import GalleryView from './pages/GalleryView';
import About from './pages/About';
import SearchResults from './pages/SearchResults';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsConditions } from './pages/TermsConditions';
import { CookiesPolicy } from './pages/CookiesPolicy';

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
    <Router>
      <ScrollToTop />
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
                <Route path="/exhibitions/:id" element={<ArticleView />} /> {/* Reusing ArticleView for now, could be specific */}
                <Route path="/guides/:id" element={<GuideView />} />
                <Route path="/artists/:id" element={<ArtistView />} />
                <Route path="/ambassadors/:id" element={<AmbassadorView />} />
                <Route path="/curators/:id" element={<CuratorView />} />
                <Route path="/galleries/:id" element={<GalleryView />} />
                
                {/* Static & Utility */}
                <Route path="/partners/galleries" element={<Partners type="gallery" />} />
                <Route path="/partners/events" element={<Partners type="event" />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/about" element={<About />} />
                
                {/* Legal Pages */}
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsConditions />} />
                <Route path="/cookies" element={<CookiesPolicy />} />
                
                <Route path="*" element={<Home />} />
            </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;