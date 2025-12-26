import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Smartphone } from 'lucide-react';
import { NAV_ITEMS } from '../constants';
import { client } from '../sanity/lib/client';
import { SITE_SETTINGS_QUERY } from '../sanity/lib/queries';

// The Art Flaneur Logo Component
const BrandLogo = () => (
  <div className="flex items-center gap-3">
    {/* Используем Logo.png из папки public */}
    <img 
      src="/Logo.png" 
      alt="Art Flaneur Logo" 
      className="h-16 w-auto"
      onError={(e) => {
        // Fallback to text logo if image not found
        e.currentTarget.style.display = 'none';
        e.currentTarget.nextElementSibling!.classList.remove('hidden');
      }}
    />
    {/* Fallback text logo (показывается если изображение не найдено) */}
    <div className="hidden flex-col leading-none">
      <span className="font-sans font-black text-xl tracking-tighter uppercase">Art</span>
      <span className="font-sans font-black text-xl tracking-tighter uppercase">Flaneur</span>
    </div>
  </div>
);

interface TickerMessage {
  message: string;
  isActive: boolean;
}

const Ticker: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([
    '• Contemporary Art Guide',
    '• Available on iOS & Android',
    '• New Exhibition Reviews Weekly',
  ]);

  useEffect(() => {
    const fetchTickerMessages = async () => {
      try {
        const settings = await client.fetch(SITE_SETTINGS_QUERY);
        if (settings?.tickerMessages) {
          const activeMessages = settings.tickerMessages
            .filter((msg: TickerMessage) => msg.isActive)
            .map((msg: TickerMessage) => `• ${msg.message}`);
          
          if (activeMessages.length > 0) {
            // Дублируем сообщения для бесшовной анимации
            setMessages([...activeMessages, ...activeMessages]);
          }
        }
      } catch (error) {
        console.error('Error fetching ticker messages:', error);
      }
    };

    fetchTickerMessages();
  }, []);

  return (
    <div className="bg-art-blue text-white py-2 overflow-hidden border-b border-white relative z-50">
      <div className="whitespace-nowrap animate-marquee flex gap-8 items-center font-mono text-xs tracking-widest uppercase">
        {messages.map((message, index) => (
          <span key={index}>{message}</span>
        ))}
      </div>
    </div>
  );
};

export const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
    <Ticker />
    <header className="sticky top-0 left-0 right-0 z-40 bg-art-paper border-b-2 border-black">
      <div className="flex items-stretch h-16">
        
        {/* Logo Section - выровнен по центру левого пространства */}
        <Link to="/" className="flex items-center pl-8 md:pl-12 md:border-r-2 border-black pr-8 hover:bg-gray-100 transition-colors">
           <BrandLogo />
        </Link>

        {/* Desktop Nav - растягивается до ширины изображения hero */}
        <nav className="hidden lg:flex items-stretch flex-1">
          {NAV_ITEMS.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className="flex items-center justify-center flex-1 border-r-2 border-black text-xs font-bold uppercase tracking-wider hover:bg-art-yellow hover:text-black transition-colors relative group"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-full h-1 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </Link>
          ))}
        </nav>

        {/* Desktop Right Actions - прижаты к правому краю */}
        <div className="hidden lg:flex items-stretch ml-auto">
            <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="flex items-center justify-center px-6 border-r-2 border-black hover:bg-art-red hover:text-white transition-colors cursor-pointer group w-20"
            >
                <Search className="w-5 h-5" />
            </button>
            <a 
                href="https://apps.apple.com/au/app/art-flaneur-discover-art/id6449169783" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center px-6 border-r-2 border-black bg-black text-white hover:bg-art-blue transition-colors w-24"
            >
                <span className="text-xs font-bold uppercase tracking-wide">
                    iOS
                </span>
            </a>
            <a 
                href="https://play.google.com/store/apps/details?id=com.artflaneur" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center px-6 bg-black text-white hover:bg-art-blue transition-colors w-28"
            >
                <span className="text-xs font-bold uppercase tracking-wide">
                    Android
                </span>
            </a>
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden flex items-center px-4 border-l-2 border-black" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Search Bar - Animated */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out border-t-2 border-black ${
          isSearchOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 py-4">
          <form onSubmit={handleSearch} className="flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exhibitions, artists, galleries..."
                className="w-full px-4 py-3 border-2 border-black font-mono text-sm focus:outline-none focus:border-art-red transition-colors"
                autoFocus
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-black text-white font-bold uppercase text-sm hover:bg-art-red transition-colors border-2 border-black"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="px-4 py-3 border-2 border-black font-bold uppercase text-sm hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-art-paper border-b-2 border-black shadow-2xl p-0 lg:hidden flex flex-col z-50">
           <nav className="flex flex-col">
            {NAV_ITEMS.map((item) => (
                <Link 
                key={item.path} 
                to={item.path}
                className="text-xl font-bold uppercase py-6 px-6 border-b border-gray-300 hover:bg-art-yellow hover:pl-8 transition-all"
                >
                {item.label}
                </Link>
            ))}
           </nav>
           <div className="grid grid-cols-2">
               <a 
                   href="https://apps.apple.com/au/app/art-flaneur-discover-art/id6449169783"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="bg-art-black text-white py-6 flex items-center justify-center gap-2 text-xs font-bold uppercase border-r border-gray-700"
               >
                   App Store
               </a>
               <a 
                   href="https://play.google.com/store/apps/details?id=com.artflaneur"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="bg-art-red text-white py-6 flex items-center justify-center gap-2 text-xs font-bold uppercase"
               >
                   Google Play
               </a>
           </div>
        </div>
      )}
    </header>
    </>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-art-black text-white border-t-4 border-art-blue">
      {/* Top Section */}
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="max-w-md">
                <div className="mb-8 invert filter brightness-0 grayscale opacity-100">
                     <BrandLogo />
                </div>
                <h2 className="font-serif text-3xl md:text-4xl mb-6">
                    Curating the chaos of the contemporary art world.
                </h2>
                <div className="flex gap-4">
                    <a 
                        href="https://www.instagram.com/artflaneur.art/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 border border-white flex items-center justify-center rounded-full hover:bg-art-yellow hover:text-black hover:border-art-yellow transition-colors cursor-pointer"
                    >
                        IG
                    </a>
                    <a 
                        href="https://www.youtube.com/@ArtFlaneur" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 border border-white flex items-center justify-center rounded-full hover:bg-art-red hover:text-white hover:border-art-red transition-colors cursor-pointer"
                    >
                        YT
                    </a>
                    <a 
                        href="https://www.facebook.com/artflaneur.com.au" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 border border-white flex items-center justify-center rounded-full hover:bg-art-blue hover:text-white hover:border-art-blue transition-colors cursor-pointer"
                    >
                        FB
                    </a>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-12 font-mono text-sm">
                 <div>
                    <h4 className="text-gray-500 uppercase tracking-widest mb-4">Platform</h4>
                    <ul className="space-y-2">
                        <li><Link to="/about" className="hover:text-art-yellow">About</Link></li>
                        <li><Link to="/mission" className="hover:text-art-yellow">Mission</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-gray-500 uppercase tracking-widest mb-4">Partners</h4>
                    <ul className="space-y-2">
                        <li><Link to="/partners/galleries" className="hover:text-art-yellow">Galleries</Link></li>
                        <li><Link to="/partners/events" className="hover:text-art-yellow">Events</Link></li>
                        <li className="pt-2 border-t border-gray-800">
                            <Link to="/gallery-login" className="hover:text-art-blue font-bold">
                                Gallery Login →
                            </Link>
                        </li>
                    </ul>
                </div>
                <div className="col-span-2 md:col-span-1">
                    <h4 className="text-gray-500 uppercase tracking-widest mb-4">Contact</h4>
                    <ul className="space-y-2 text-xs">
                        <li className="text-white font-bold">Art Flaneur Global Pty Ltd</li>
                        <li>ABN 27 672 710 520</li>
                        <li>
                            <a href="mailto:info@artflaneur.com.au" className="hover:text-art-yellow">
                                info@artflaneur.com.au
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
          <div className="container mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center text-xs font-mono text-gray-500 uppercase tracking-wider">
              <p>© 2025 Art Flaneur Global Pty Ltd • ABN 27 672 710 520</p>
              <div className="flex gap-6 mt-2 md:mt-0">
                  <Link to="/privacy" className="hover:text-white">Privacy</Link>
                  <Link to="/terms" className="hover:text-white">Terms</Link>
                  <Link to="/cookies" className="hover:text-white">Cookies</Link>
              </div>
          </div>

          <div className="container mx-auto px-4 md:px-6 pb-6">
            <p className="text-[11px] md:text-xs text-gray-500 font-sans normal-case tracking-normal">
              Art Flaneur acknowledges the Traditional Owners of the lands on which we live and work, the people of the Kulin and Eora Nations. We pay respect to Elders past and present. Aboriginal and Torres Strait Islander people should be aware that this website may contain images, voices and names of deceased persons.
            </p>
          </div>
      </div>
    </footer>
  );
};