import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, Smartphone } from 'lucide-react';
import { NAV_ITEMS } from '../constants';

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

const Ticker = () => (
    <div className="bg-art-black text-white py-2 overflow-hidden border-b border-white relative z-50">
        <div className="whitespace-nowrap animate-marquee flex gap-8 items-center font-mono text-xs tracking-widest uppercase">
            <span>• Contemporary Art Guide</span>
            <span>• Available on iOS & Android</span>
            <span>• New Exhibition Reviews Weekly</span>
            <span>• Weekend Guide: Berlin</span>
            <span>• Featured Artist: Sarah Sze</span>
            <span>• Contemporary Art Guide</span>
            <span>• Available on iOS & Android</span>
            <span>• New Exhibition Reviews Weekly</span>
            <span>• Weekend Guide: Berlin</span>
            <span>• Featured Artist: Sarah Sze</span>
        </div>
    </div>
);

export const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <>
    <Ticker />
    <header className="sticky top-0 left-0 right-0 z-40 bg-art-paper border-b-2 border-black">
      <div className="container mx-auto px-4 md:px-0 flex items-stretch justify-between h-20">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center pl-4 md:pl-6 md:border-r-2 border-black pr-8 hover:bg-gray-100 transition-colors">
           <BrandLogo />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-stretch flex-1">
          {NAV_ITEMS.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className="flex items-center justify-center px-6 border-r-2 border-black text-sm font-bold uppercase tracking-widest hover:bg-art-yellow hover:text-black transition-colors relative group"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-full h-1 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </Link>
          ))}
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden lg:flex items-stretch">
            <div className="flex items-center px-6 border-r-2 border-black hover:bg-art-red hover:text-white transition-colors cursor-pointer group">
                <Search className="w-5 h-5" />
            </div>
            <div className="flex items-center px-6 bg-black text-white hover:bg-art-blue transition-colors cursor-pointer">
                <button className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Get App
                </button>
            </div>
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden flex items-center px-4 border-l-2 border-black" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
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
               <button className="bg-art-black text-white py-6 flex items-center justify-center gap-2 text-xs font-bold uppercase border-r border-gray-700">
                   App Store
               </button>
               <button className="bg-art-red text-white py-6 flex items-center justify-center gap-2 text-xs font-bold uppercase">
                   Google Play
               </button>
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
                    <div className="w-10 h-10 border border-white flex items-center justify-center rounded-full hover:bg-art-yellow hover:text-black hover:border-art-yellow transition-colors cursor-pointer">IG</div>
                    <div className="w-10 h-10 border border-white flex items-center justify-center rounded-full hover:bg-art-blue hover:text-white hover:border-art-blue transition-colors cursor-pointer">TW</div>
                    <div className="w-10 h-10 border border-white flex items-center justify-center rounded-full hover:bg-art-red hover:text-white hover:border-art-red transition-colors cursor-pointer">FB</div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-12 font-mono text-sm">
                 <div>
                    <h4 className="text-gray-500 uppercase tracking-widest mb-4">Platform</h4>
                    <ul className="space-y-2">
                        <li><Link to="/about" className="hover:text-art-yellow">About</Link></li>
                        <li><Link to="/ambassadors" className="hover:text-art-yellow">Ambassadors</Link></li>
                        <li><Link to="/careers" className="hover:text-art-yellow">Careers</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-gray-500 uppercase tracking-widest mb-4">Partners</h4>
                    <ul className="space-y-2">
                        <li><Link to="/partners/galleries" className="hover:text-art-yellow">Galleries</Link></li>
                        <li><Link to="/partners/events" className="hover:text-art-yellow">Events</Link></li>
                        <li><Link to="/data" className="hover:text-art-yellow">Analytics</Link></li>
                    </ul>
                </div>
                <div className="col-span-2 md:col-span-1">
                    <h4 className="text-gray-500 uppercase tracking-widest mb-4">Download</h4>
                    <div className="flex flex-col gap-2">
                        <button className="border border-white px-4 py-2 hover:bg-white hover:text-black transition-colors text-left uppercase text-xs font-bold">
                            App Store
                        </button>
                        <button className="border border-white px-4 py-2 hover:bg-white hover:text-black transition-colors text-left uppercase text-xs font-bold">
                            Google Play
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
          <div className="container mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center text-xs font-mono text-gray-500 uppercase tracking-wider">
              <p>© 2025 Art Flaneur Media</p>
              <div className="flex gap-6 mt-2 md:mt-0">
                  <Link to="/privacy" className="hover:text-white">Privacy</Link>
                  <Link to="/terms" className="hover:text-white">Terms</Link>
                  <Link to="/cookies" className="hover:text-white">Cookies</Link>
              </div>
          </div>
      </div>
    </footer>
  );
};