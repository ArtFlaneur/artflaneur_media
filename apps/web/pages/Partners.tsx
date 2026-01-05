import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { GALLERY_PRICING, EVENT_PRICING } from '../constants';
import { Check, ChevronDown, ChevronUp, MapPin, BarChart3, Target, Ticket, MapIcon, TrendingUp, X } from 'lucide-react';
import { NewsletterSection } from '../components/Shared';
import { useSeo } from '../lib/useSeo';

// Mock Data
const VISITOR_DATA = [
  { name: 'Mon', visitors: 120 },
  { name: 'Tue', visitors: 150 },
  { name: 'Wed', visitors: 200 },
  { name: 'Thu', visitors: 180 },
  { name: 'Fri', visitors: 350 },
  { name: 'Sat', visitors: 600 },
  { name: 'Sun', visitors: 550 },
];

const ENGAGEMENT_DATA = [
    { name: 'Week 1', saves: 40, shares: 10 },
    { name: 'Week 2', saves: 80, shares: 25 },
    { name: 'Week 3', saves: 150, shares: 45 },
    { name: 'Week 4', saves: 210, shares: 80 },
];

interface PartnerPageProps {
  type: 'gallery' | 'event';
}

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
        <div className="border-b-2 border-black py-4">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full flex justify-between items-center text-left font-bold text-lg hover:text-art-red transition-colors"
            >
                {question}
                {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {isOpen && <p className="mt-4 text-gray-600 font-mono text-sm leading-relaxed max-w-2xl">{answer}</p>}
        </div>
    );
};

const Partners: React.FC<PartnerPageProps> = ({ type }) => {
  const isGallery = type === 'gallery';
  const pricing = isGallery ? GALLERY_PRICING : EVENT_PRICING;
  const [selectedTier, setSelectedTier] = React.useState<number | null>(null);
  
  const title = isGallery 
    ? "Transform Your Gallery Into a Discovery Destination" 
    : "Fill Your Events. Prove Your Impact. Get Paid.";
  
  const subtitle = isGallery 
    ? "Real visitor intelligence. Zero inventory headaches. Guaranteed discovery." 
    : "Ticketing + navigation + analytics. One platform. No fees hidden.";
  
  const heroDescription = isGallery
    ? "Join 9,000+ cultural institutions and 13,000+ indexed galleries reaching over 2,300 engaged art enthusiasts actively discovering new spaces."
    : "Your exhibition deserves a digital route that turns visitors into attendees and attendees into data. Ballarat International Foto Biennale used Art Flaneur to guide 1250+ visitors across 100 locations and 120 events.";

  // SEO Configuration
  const seoTitle = isGallery
    ? "Gallery Partner Program | Art Flaneur - Visitor Analytics & Discovery Platform"
    : "Event Partnership | Art Flaneur - Festival Ticketing, Routes & Analytics";

  const seoDescription = isGallery
    ? "Join 9,000+ galleries using Art Flaneur for real-time visitor analytics, heatmaps, and guaranteed discovery. Free to $1,499/month. Get featured in curated Guides, track visitor journeys, and prove exhibition ROI. Perfect for emerging galleries to major institutions in Australia and worldwide."
    : "Complete event management for art festivals and cultural events. Interactive Routes for multi-venue navigation, ticketing system, real-time analytics, and post-event reports. Used by Ballarat International Foto Biennale. $89-$2,499/event with enterprise options.";

  const canonicalUrl = isGallery
    ? "https://artflaneur.art/partners/galleries"
    : "https://artflaneur.art/partners/events";

  // Structured Data for SEO and AI
  const structuredData = isGallery ? {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Gallery Discovery and Analytics Platform",
    "provider": {
      "@type": "Organization",
      "name": "Art Flaneur Global Pty Ltd",
      "url": "https://artflaneur.art",
      "description": "Mobile-first platform for discovering galleries, exhibitions, and cultural events"
    },
    "areaServed": "Worldwide",
    "offers": pricing.map((tier, idx) => ({
      "@type": "Offer",
      "name": tier.name,
      "price": tier.price.replace(/[^0-9]/g, '') || "0",
      "priceCurrency": "USD",
      "description": tier.features.join(', '),
      "availability": "https://schema.org/InStock"
    })),
    "audience": {
      "@type": "Audience",
      "audienceType": "Art galleries, commercial galleries, artist-run spaces, museums, cultural institutions"
    },
    "description": "Real-time visitor analytics, heatmaps, journey tracking, curated Guide features, and guaranteed discovery for galleries. Track WHO visits, HOW LONG they stay, WHICH exhibitions drive traffic. Perfect for grant applications and board reports.",
    "featureList": [
      "Real-time visitor analytics and heatmaps",
      "Visitor journey tracking between spaces",
      "Curated Guide features (1-unlimited per month)",
      "Exhibition impact reports",
      "Return visitor tracking",
      "Priority map placement",
      "Mobile app and website listing",
      "Downloadable reports for grants and board meetings"
    ]
  } : {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Event Management and Ticketing Platform for Cultural Events",
    "provider": {
      "@type": "Organization",
      "name": "Art Flaneur Global Pty Ltd",
      "url": "https://artflaneur.art"
    },
    "areaServed": "Worldwide",
    "offers": pricing.map((tier) => ({
      "@type": "Offer",
      "name": tier.name,
      "price": tier.price.replace(/[^0-9]/g, '') || "0",
      "priceCurrency": "USD",
      "description": tier.features.join(', '),
      "availability": "https://schema.org/InStock"
    })),
    "audience": {
      "@type": "Audience",
      "audienceType": "Art festivals, biennales, triennales, art weeks, cultural events, multi-venue exhibitions"
    },
    "description": "Complete event management: RSVP tracking, paid ticketing, interactive Routes for multi-venue navigation, geo-fencing push notifications, real-time analytics, and comprehensive post-event reports. Used by major festivals like Ballarat International Foto Biennale.",
    "featureList": [
      "RSVP system and paid ticketing",
      "Interactive Route maps (15-50+ locations)",
      "Geo-fencing push notifications",
      "QR code ticket generation",
      "Real-time analytics dashboard",
      "Professional video and photography packages",
      "Ambassador review features",
      "Multi-language support",
      "White-label app options",
      "Post-event comprehensive reports"
    ]
  };

  useSeo({
    title: seoTitle,
    description: seoDescription,
    canonicalUrl: canonicalUrl,
    ogType: "website",
    jsonLd: structuredData
  });

  return (
    <div className="">
      {/* Hero Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh] border-b-2 border-black">
         {/* Left: Content */}
         <div className="bg-art-black text-white p-6 md:p-12 lg:p-24 flex flex-col justify-center border-b-2 lg:border-b-0 lg:border-r-2 border-black">
            <span className="text-art-yellow font-mono font-bold uppercase tracking-widest mb-4 md:mb-6 block text-xs md:text-sm">Partner Program</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black uppercase mb-6 md:mb-8 leading-tight lg:leading-[0.9]">{title}</h1>
            <p className="text-base md:text-xl text-gray-300 font-mono mb-4 md:mb-6 max-w-md">{subtitle}</p>
            <p className="text-sm text-gray-400 mb-12 max-w-lg leading-relaxed">{heroDescription}</p>
            <div className="flex flex-col sm:flex-row gap-4">
                <a href="#pricing" className="bg-white text-black px-8 py-4 font-bold uppercase tracking-wide hover:bg-art-blue hover:text-white transition-colors border-2 border-white text-center">
                    {isGallery ? 'See Pricing & Features' : 'Explore Packages'}
                </a>
                <a 
                  href={isGallery ? 'https://youtu.be/H_ZjbVncKhU' : '#case-study'} 
                  target={isGallery ? '_blank' : undefined}
                  rel={isGallery ? 'noopener noreferrer' : undefined}
                  className="border-2 border-white text-white px-8 py-4 font-bold uppercase tracking-wide hover:bg-white hover:text-black transition-colors text-center"
                >
                    {isGallery ? 'Watch 2-Min Demo' : 'See Case Study'}
                </a>
            </div>
         </div>
         
         {/* Right: Analytics Visual */}
         <div className="bg-art-paper p-4 md:p-8 lg:p-16 flex items-center justify-center relative overflow-hidden">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
            
            <div className="bg-white p-4 md:p-6 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg z-10">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 border-b-2 border-black pb-3 md:pb-4 gap-2">
                    <div>
                        <h3 className="text-[10px] md:text-xs font-bold uppercase text-gray-500 tracking-wider font-mono">Visitor Growth</h3>
                        <div className="text-2xl md:text-3xl font-black text-black">+142% <span className="text-[10px] md:text-xs text-art-green font-mono font-normal">vs last month</span></div>
                    </div>
                    <div className="text-[9px] md:text-[10px] uppercase font-bold border border-black px-2 py-1 self-start sm:self-auto">Last 7 Days</div>
                </div>
                <div className="h-64 font-mono text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                        {isGallery ? (
                            <LineChart data={ENGAGEMENT_DATA}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#000'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#000'}} />
                                <Tooltip contentStyle={{border: '2px solid black', borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)'}} />
                                <Line type="monotone" dataKey="saves" stroke="#1a1a1a" strokeWidth={3} dot={{r: 4, fill: 'white', strokeWidth: 2}} />
                                <Line type="monotone" dataKey="shares" stroke="#D93025" strokeWidth={3} dot={{r: 4, fill: 'white', strokeWidth: 2}} />
                            </LineChart>
                        ) : (
                            <BarChart data={VISITOR_DATA}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#000'}} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{border: '2px solid black', borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)'}} />
                                <Bar dataKey="visitors" fill="#1a1a1a" radius={[0, 0, 0, 0]} />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>
         </div>
      </div>

      {/* Value Proposition Section */}
      <section className="py-24 bg-white border-b-2 border-black">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <div className="w-12 md:w-16 h-2 bg-art-blue mx-auto mb-4 md:mb-6"></div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase mb-3 md:mb-4">What You Get</h2>
            <p className="font-mono text-gray-600">
              {isGallery 
                ? "Stop being invisible. Get the tools to understand and grow your audience." 
                : "Complete event management from ticketing to analytics in one platform."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {isGallery ? (
              <>
                {/* Gallery Value Props */}
                <div className="border-2 border-black p-8 bg-art-paper hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                  <div className="w-12 h-12 bg-art-blue border-2 border-black flex items-center justify-center mb-6">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-black uppercase mb-4">Visibility</h3>
                  <p className="text-sm leading-relaxed mb-6 text-gray-700">
                    Your gallery appears on the Art Flaneur app map, weekend guide recommendations, and push notification campaigns reaching active art seekers every week. No competing with thousands of generic listings—we only index 13,000+ verified cultural institutions.
                  </p>
                  <ul className="space-y-2 font-mono text-xs">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-art-blue shrink-0 mt-0.5" />
                      <span><strong>Basic:</strong> Featured on app map</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-art-blue shrink-0 mt-0.5" />
                      <span><strong>Premium:</strong> Priority placement + weekend guide</span>
                    </li>
                  </ul>
                </div>

                <div className="border-2 border-black p-8 bg-art-paper hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                  <div className="w-12 h-12 bg-art-yellow border-2 border-black flex items-center justify-center mb-6">
                    <MapIcon className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-2xl font-black uppercase mb-4">Routes & Guides</h3>
                  <p className="text-sm leading-relaxed mb-6 text-gray-700">
                    Get featured in curated Guides created by artists, curators, and cultural influencers. Your gallery appears in thematic collections like "Best Contemporary Photography" or "Hidden Gems in [City]". Routes guide event attendees through multi-venue experiences.
                  </p>
                  <ul className="space-y-2 font-mono text-xs">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-art-yellow shrink-0 mt-0.5" />
                      <span><strong>Visibility Pro:</strong> 1 Guide feature/month</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-art-yellow shrink-0 mt-0.5" />
                      <span><strong>Premium:</strong> 3 Guide features/month</span>
                    </li>
                  </ul>
                </div>

                <div className="border-2 border-black p-8 bg-art-paper hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                  <div className="w-12 h-12 bg-art-red border-2 border-black flex items-center justify-center mb-6">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-black uppercase mb-4">Intelligence</h3>
                  <p className="text-sm leading-relaxed mb-6 text-gray-700">
                    Real-time analytics show you WHO is visiting (age, origin, interests), HOW LONG they spend in each room, WHICH exhibitions drive the most traffic, and WHERE they go next. Use this data for grants, board reports, and marketing proof.
                  </p>
                  <ul className="space-y-2 font-mono text-xs">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-art-red shrink-0 mt-0.5" />
                      <span><strong>Basic:</strong> Monthly analytics report</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-art-red shrink-0 mt-0.5" />
                      <span><strong>Premium:</strong> Real-time heatmaps + journey paths</span>
                    </li>
                  </ul>
                </div>

                <div className="border-2 border-black p-8 bg-art-paper hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                  <div className="w-12 h-12 bg-art-yellow border-2 border-black flex items-center justify-center mb-6">
                    <Target className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-2xl font-black uppercase mb-4">Growth</h3>
                  <p className="text-sm leading-relaxed mb-6 text-gray-700">
                    See exactly how many visitors came because of Art Flaneur. Track which events increased foot traffic. Measure exhibition impact by comparing visitor numbers with/without openings. Turn data into actionable decisions.
                  </p>
                  <ul className="space-y-2 font-mono text-xs">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-art-yellow shrink-0 mt-0.5" />
                      <span><strong>Basic:</strong> Monthly performance comparison</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-art-yellow shrink-0 mt-0.5" />
                      <span><strong>Premium:</strong> Full attribution + audience insights</span>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                {/* Event Value Props */}
                <div className="border-2 border-black p-8 bg-art-paper hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                  <div className="w-12 h-12 bg-art-blue border-2 border-black flex items-center justify-center mb-6">
                    <Ticket className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-black uppercase mb-4">Ticketing</h3>
                  <p className="text-sm leading-relaxed mb-6 text-gray-700">
                    Free exhibition opening? Paid workshop? Multi-venue festival? Art Flaneur handles RSVP for capacity planning (no payment processing) and paid ticketing for revenue events. All in one app. No separate platforms.
                  </p>
                  <ul className="space-y-2 font-mono text-xs">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-art-blue shrink-0 mt-0.5" />
                      <span><strong>RSVP:</strong> Track attendance without payment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-art-blue shrink-0 mt-0.5" />
                      <span><strong>Route:</strong> Full ticketing + QR codes</span>
                    </li>
                  </ul>
                </div>

                <div className="border-2 border-black p-8 bg-art-paper hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                  <div className="w-12 h-12 bg-art-red border-2 border-black flex items-center justify-center mb-6">
                    <MapIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-black uppercase mb-4">Navigation</h3>
                  <p className="text-sm leading-relaxed mb-6 text-gray-700">
                    Your event isn't just a listing—it's a journey. Visitors see interactive maps, turn-by-turn directions, artist bios, and location-specific content. They save events, get push notifications, and can buy tickets in-app.
                  </p>
                  <ul className="space-y-2 font-mono text-xs">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-art-red shrink-0 mt-0.5" />
                      <span><strong>RSVP:</strong> Basic map + event info</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-art-red shrink-0 mt-0.5" />
                      <span><strong>Route:</strong> Interactive map + geo-fencing</span>
                    </li>
                  </ul>
                </div>

                <div className="border-2 border-black p-8 bg-art-paper hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                  <div className="w-12 h-12 bg-art-yellow border-2 border-black flex items-center justify-center mb-6">
                    <TrendingUp className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-2xl font-black uppercase mb-4">Analytics</h3>
                  <p className="text-sm leading-relaxed mb-6 text-gray-700">
                    After your event, get a full report: total visitors, origins, peak times, popular venues, visitor dwell time, and return rate. Use this to justify sponsorship ROI, board funding, and next year's budget.
                  </p>
                  <ul className="space-y-2 font-mono text-xs">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-art-yellow shrink-0 mt-0.5" />
                      <span><strong>RSVP:</strong> Basic event metrics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-art-yellow shrink-0 mt-0.5" />
                      <span><strong>Festival:</strong> Real-time heatmap + journeys</span>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 md:py-24 container mx-auto px-4 md:px-6">
         <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
             <div className="w-12 md:w-16 h-2 bg-art-red mx-auto mb-4 md:mb-6"></div>
             <h2 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase mb-3 md:mb-4">Membership Tiers</h2>
             <p className="font-mono text-gray-600">Transparent pricing. No hidden fees.</p>
         </div>

         <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start`}>
             {pricing.map((tier, idx) => (
                 <div 
                   key={idx} 
                   onClick={() => setSelectedTier(idx)}
                   className={`p-8 border-2 border-black relative cursor-pointer transition-all ${
                     selectedTier === idx 
                       ? 'ring-4 ring-art-blue ring-offset-2' 
                       : ''
                   } ${
                     tier.highlight 
                       ? 'bg-black text-white shadow-[16px_16px_0px_0px_rgba(255,215,0,1)]' 
                       : 'bg-white text-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow'
                   }`}
                 >
                     {tier.highlight && <div className="absolute top-0 right-0 bg-art-yellow text-black px-3 py-1 text-xs font-bold font-mono uppercase border-l-2 border-b-2 border-black">Recommended</div>}
                     <h3 className="text-2xl font-black uppercase mb-2">{tier.name}</h3>
                     <div className="text-3xl font-bold mb-8 font-mono">{tier.price}</div>
                     <ul className="space-y-4 mb-8 font-mono text-sm">
                         {tier.features.map((feature, fIdx) => (
                             <li key={fIdx} className="flex items-start gap-3">
                                 <Check className={`w-5 h-5 shrink-0 ${tier.highlight ? 'text-art-yellow' : 'text-art-blue'}`} />
                                 <span className={tier.highlight ? 'text-gray-300' : 'text-gray-600'}>{feature}</span>
                             </li>
                         ))}
                     </ul>
                     <a 
                       href={
                         tier.cta === 'Create Free Listing' || tier.cta === 'List RSVP Event' 
                           ? '/gallery-login'
                           : `mailto:admin@artflaneur.art?subject=Request: ${tier.name}${tier.cta.includes('Trial') ? ' Trial' : tier.cta.includes('Demo') ? ' Demo' : ' Package'}`
                       }
                       className={`block w-full py-4 font-bold uppercase tracking-widest text-xs transition-colors border-2 text-center ${tier.highlight ? 'border-white bg-white text-black hover:bg-art-yellow hover:border-art-yellow' : 'border-black bg-black text-white hover:bg-art-red hover:border-art-red'}`}
                     >
                         {tier.cta}
                     </a>
                 </div>
             ))}
         </div>

         {/* Comparison Table - Only for Galleries */}
         {isGallery && (
           <div className="mt-20">
             <div className="text-center mb-8">
               <h3 className="text-2xl font-black uppercase mb-2">Feature Comparison</h3>
               <p className="font-mono text-xs text-gray-600">See what's included in each tier</p>
             </div>
             <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
               <table className="w-full min-w-[640px] border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                 <thead>
                   <tr className="bg-art-black text-white">
                     <th className="border-2 border-black p-4 text-left font-mono text-xs uppercase tracking-wider">Feature</th>
                     <th className={`border-2 border-black p-4 text-center font-mono text-xs uppercase tracking-wider transition-all ${selectedTier === 0 ? 'bg-art-blue' : ''}`}>Free</th>
                     <th className={`border-2 border-black p-4 text-center font-mono text-xs uppercase tracking-wider transition-all ${selectedTier === 1 ? 'bg-art-yellow text-black' : 'bg-art-yellow text-black'}`}>
                       <div className="flex flex-col items-center gap-1">
                         <span>Visibility Pro</span>
                         <span className="text-[10px] font-normal">Recommended</span>
                       </div>
                     </th>
                     <th className={`border-2 border-black p-4 text-center font-mono text-xs uppercase tracking-wider transition-all ${selectedTier === 2 ? 'bg-art-blue' : ''}`}>Insights Premium</th>
                     <th className={`border-2 border-black p-4 text-center font-mono text-xs uppercase tracking-wider transition-all ${selectedTier === 3 ? 'bg-art-blue' : ''}`}>Studio/Enterprise</th>
                   </tr>
                 </thead>
                 <tbody className="font-mono text-sm">
                   <tr>
                     <td className="border-2 border-black p-4 font-medium">Map Listing</td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
                         <Check className="w-4 h-4 text-white" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center bg-art-yellow/10">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
                         <Check className="w-4 h-4 text-white" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
                         <Check className="w-4 h-4 text-white" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
                         <Check className="w-4 h-4 text-white" />
                       </div>
                     </td>
                   </tr>
                   <tr className="bg-art-paper">
                     <td className="border-2 border-black p-4 font-medium">Event Calendar</td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
                         <Check className="w-4 h-4 text-white" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center bg-art-yellow/10">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
                         <Check className="w-4 h-4 text-white" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
                         <Check className="w-4 h-4 text-white" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
                         <Check className="w-4 h-4 text-white" />
                       </div>
                     </td>
                   </tr>
                   <tr>
                     <td className="border-2 border-black p-4 font-medium">Monthly Analytics Report</td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 border-2 border-gray-300">
                         <X className="w-4 h-4 text-gray-400" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center bg-art-yellow/10">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
                         <Check className="w-4 h-4 text-white" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
                         <Check className="w-4 h-4 text-white" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
                         <Check className="w-4 h-4 text-white" />
                       </div>
                     </td>
                   </tr>
                   <tr className="bg-art-paper">
                     <td className="border-2 border-black p-4 font-medium">Real-Time Analytics</td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 border-2 border-gray-300">
                         <X className="w-4 h-4 text-gray-400" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center bg-art-yellow/10">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 border-2 border-gray-300">
                         <X className="w-4 h-4 text-gray-400" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
                         <Check className="w-4 h-4 text-white" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
                         <Check className="w-4 h-4 text-white" />
                       </div>
                     </td>
                   </tr>
                   <tr>
                     <td className="border-2 border-black p-4 font-medium">Heatmaps & Journey Tracking</td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 border-2 border-gray-300">
                         <X className="w-4 h-4 text-gray-400" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center bg-art-yellow/10">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 border-2 border-gray-300">
                         <X className="w-4 h-4 text-gray-400" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
                         <Check className="w-4 h-4 text-white" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
                         <Check className="w-4 h-4 text-white" />
                       </div>
                     </td>
                   </tr>
                   <tr className="bg-art-paper">
                     <td className="border-2 border-black p-4 font-medium">Exhibition Impact Reports</td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 border-2 border-gray-300">
                         <X className="w-4 h-4 text-gray-400" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center bg-art-yellow/10">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 border-2 border-gray-300">
                         <X className="w-4 h-4 text-gray-400" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
                         <Check className="w-4 h-4 text-white" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
                         <Check className="w-4 h-4 text-white" />
                       </div>
                     </td>
                   </tr>
                   <tr>
                     <td className="border-2 border-black p-4 font-medium">Downloadable Reports</td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 border-2 border-gray-300">
                         <X className="w-4 h-4 text-gray-400" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center bg-art-yellow/10">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 border-2 border-gray-300">
                         <X className="w-4 h-4 text-gray-400" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
                         <Check className="w-4 h-4 text-white" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
                         <Check className="w-4 h-4 text-white" />
                       </div>
                     </td>
                   </tr>
                   <tr className="bg-art-paper">
                     <td className="border-2 border-black p-4 font-medium">Free Events/Month</td>
                     <td className="border-2 border-black p-4 text-center">
                       <span className="text-xs text-gray-500">None</span>
                     </td>
                     <td className="border-2 border-black p-4 text-center bg-art-yellow/10">
                       <span className="text-xs text-gray-500">None</span>
                     </td>
                     <td className="border-2 border-black p-4 text-center">
                       <span className="font-bold text-art-blue">1</span>
                     </td>
                     <td className="border-2 border-black p-4 text-center">
                       <span className="font-bold text-art-blue">Unlimited</span>
                     </td>
                   </tr>
                   <tr>
                     <td className="border-2 border-black p-4 font-medium">White-Label Option</td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 border-2 border-gray-300">
                         <X className="w-4 h-4 text-gray-400" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center bg-art-yellow/10">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 border-2 border-gray-300">
                         <X className="w-4 h-4 text-gray-400" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 border-2 border-gray-300">
                         <X className="w-4 h-4 text-gray-400" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
                         <Check className="w-4 h-4 text-white" />
                       </div>
                     </td>
                   </tr>
                   <tr className="bg-art-paper">
                     <td className="border-2 border-black p-4 font-medium">Dedicated Account Manager</td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 border-2 border-gray-300">
                         <X className="w-4 h-4 text-gray-400" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center bg-art-yellow/10">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 border-2 border-gray-300">
                         <X className="w-4 h-4 text-gray-400" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 border-2 border-gray-300">
                         <X className="w-4 h-4 text-gray-400" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
                         <Check className="w-4 h-4 text-white" />
                       </div>
                     </td>
                   </tr>
                   <tr>
                     <td className="border-2 border-black p-4 font-medium">API Access</td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 border-2 border-gray-300">
                         <X className="w-4 h-4 text-gray-400" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center bg-art-yellow/10">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 border-2 border-gray-300">
                         <X className="w-4 h-4 text-gray-400" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 border-2 border-gray-300">
                         <X className="w-4 h-4 text-gray-400" />
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
                         <Check className="w-4 h-4 text-white" />
                       </div>
                     </td>
                   </tr>
                   <tr className="bg-art-paper border-t-4 border-black">
                     <td className="border-2 border-black p-4 font-bold">Support</td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center px-3 py-1 bg-gray-100 border-2 border-gray-300 rounded-full">
                         <span className="text-xs font-mono uppercase">Community</span>
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center bg-art-yellow/10">
                       <div className="inline-flex items-center justify-center px-3 py-1 bg-art-yellow border-2 border-black rounded-full">
                         <span className="text-xs font-mono uppercase font-bold">Email</span>
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center px-3 py-1 bg-art-blue border-2 border-black rounded-full">
                         <span className="text-xs font-mono uppercase font-bold text-white">Email + Calls</span>
                       </div>
                     </td>
                     <td className="border-2 border-black p-4 text-center">
                       <div className="inline-flex items-center justify-center px-3 py-1 bg-art-red border-2 border-black rounded-full">
                         <span className="text-xs font-mono uppercase font-bold text-white">24/7 + SLA</span>
                       </div>
                     </td>
                   </tr>
                 </tbody>
               </table>
             </div>
           </div>
         )}
      </section>

      {/* Social Proof & Case Study */}
      <section id="case-study" className="py-24 bg-art-paper border-t-2 border-black">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="w-16 h-2 bg-art-blue mx-auto mb-6"></div>
            <h2 className="text-4xl font-black uppercase mb-4">Trusted by Leading Institutions</h2>
            <p className="font-mono text-gray-600">Real results from real partners</p>
          </div>

          {/* Ballarat Case Study - Only for Events */}
          {!isGallery && (
            <div className="mb-12 md:mb-16 border-2 border-black bg-white p-6 md:p-8 lg:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="px-3 md:px-4 py-1 md:py-2 bg-art-blue text-white font-mono text-[10px] md:text-xs uppercase tracking-widest font-bold">
                  Case Study
                </div>
              </div>
              <h3 className="text-xl md:text-2xl lg:text-3xl font-black uppercase mb-3 md:mb-4 leading-tight">
                Ballarat International Foto Biennale: From Digital Confusion to 1250+ Guided Visitors
              </h3>
              <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
                <div>
                  <p className="text-xs md:text-sm leading-relaxed text-gray-700 mb-3 md:mb-4">
                    Australia's leading photo festival faced a challenge: 100+ locations across Ballarat, 120 concurrent events, and unclear visitor flow. They needed a solution that could guide attendees seamlessly and provide real-time insights.
                  </p>
                  <p className="text-xs md:text-sm leading-relaxed text-gray-700">
                    Art Flaneur provided the complete navigation app with analytics—turning scattered locations into a cohesive festival experience.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="border-2 border-black p-3 md:p-4 bg-art-yellow">
                    <div className="text-2xl md:text-3xl font-black">1250</div>
                    <div className="text-[10px] md:text-xs font-mono uppercase text-gray-700">Total Visitors</div>
                  </div>
                  <div className="border-2 border-black p-3 md:p-4 bg-art-blue text-white">
                    <div className="text-2xl md:text-3xl font-black">60min</div>
                    <div className="text-[10px] md:text-xs font-mono uppercase">Avg Dwell Time</div>
                  </div>
                  <div className="border-2 border-black p-3 md:p-4 bg-art-red text-white">
                    <div className="text-2xl md:text-3xl font-black">86%</div>
                    <div className="text-[10px] md:text-xs font-mono uppercase">Local Attendance</div>
                  </div>
                  <div className="border-2 border-black p-3 md:p-4 bg-art-paper">
                    <div className="text-2xl md:text-3xl font-black">23%</div>
                    <div className="text-[10px] md:text-xs font-mono uppercase text-gray-700">Return Rate</div>
                  </div>
                </div>
              </div>
              <blockquote className="border-l-4 border-art-blue pl-6 italic text-lg text-gray-700 mb-6">
                "Art Flaneur gave us the tools to understand our audience in real-time. We went from guessing how people moved through our festival to having actual data. That changed everything for next year's planning."
              </blockquote>
              <div className="font-mono text-xs text-gray-500">
                — Festival Director, Ballarat International Foto Biennale
              </div>
            </div>
          )}

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border-2 border-black bg-white p-6 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow">
              <div className="mb-4 text-art-yellow">★★★★★</div>
              <p className="text-sm leading-relaxed mb-6 italic">
                "We were invisible. Now we're the first gallery people see when they search our area. Our exhibition traffic is up 47% in 3 months."
              </p>
              <div className="font-mono text-xs text-gray-500">
                — Gallery Director, Melbourne
                <div className="text-gray-400">Insights Premium subscriber</div>
              </div>
            </div>

            <div className="border-2 border-black bg-white p-6 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow">
              <div className="mb-4 text-art-yellow">★★★★★</div>
              <p className="text-sm leading-relaxed mb-6 italic">
                "Our event went from 30 expected attendees to 120 actual. Art Flaneur's map and notifications drove awareness we couldn't generate on our own."
              </p>
              <div className="font-mono text-xs text-gray-500">
                — Community Arts Manager, Brisbane
                <div className="text-gray-400">Event Route user</div>
              </div>
            </div>

            <div className="border-2 border-black bg-white p-6 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow">
              <div className="mb-4 text-art-yellow">★★★★★</div>
              <p className="text-sm leading-relaxed mb-6 italic">
                "The heatmap data was crucial for our Arts Council grant application. We had proof that our exhibitions were driving foot traffic and visitor engagement."
              </p>
              <div className="font-mono text-xs text-gray-500">
                — Gallery Owner, Adelaide
                <div className="text-gray-400">Insights Premium subscriber</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-art-yellow border-t-2 border-black">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
              <h2 className="text-4xl font-black uppercase mb-4 text-center text-black">Questions?</h2>
              <p className="text-center font-mono text-sm text-gray-700 mb-12">Everything you need to know</p>
              <div className="bg-white border-2 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                  {isGallery ? (
                    <>
                      <FAQItem 
                        question="How long does it take to get my gallery on Art Flaneur?" 
                        answer="Free listing? Instant. We'll verify your details and have you live in 24-48 hours. Premium tiers? Still fast. Set up your first analytics dashboard in about 30 minutes." 
                      />
                      <FAQItem 
                        question="Can I cancel anytime?" 
                        answer="Yes. No contracts, no penalties. Month-to-month billing, and you can downgrade or cancel from your dashboard." 
                      />
                      <FAQItem 
                        question="Do I need to submit my inventory or artworks?" 
                        answer="Nope. Art Flaneur is about visitor discovery and analytics—not inventory management. Just tell us your opening hours, location, and exhibitions. We handle the rest." 
                      />
                      <FAQItem 
                        question="What data can I access in the analytics dashboard?" 
                        answer="With Insights Premium and above, you get: real-time visitor count, visitor origins (location data), time spent per location (heatmaps), exhibition traffic analysis, visitor journey paths, return visitor rate, and export-ready reports for grants and funding applications." 
                      />
                      <FAQItem 
                        question="Can I use the data for grants and sponsorship applications?" 
                        answer="Absolutely. Our reports are designed for exactly this. Show funders visitor numbers, demographics, exhibition impact, audience trends over time, and community engagement proof. Many partners use Art Flaneur analytics in Cultural Grants Australia applications." 
                      />
                      <FAQItem 
                        question="What if I have multiple gallery locations?" 
                        answer="Each location gets its own dashboard, but you can see combined analytics across all spaces with Premium or Studio tiers. For 5+ locations, ask about our Studio/Enterprise package—we'll set up a consolidated view." 
                      />
                      <FAQItem 
                        question="How is my visitor data collected? Is it private?" 
                        answer="Visitors opt-in when they use the Art Flaneur app. We don't track people outside the app. Full GDPR and Australian Privacy Act compliance. You own your data." 
                      />
                      <FAQItem 
                        question="Do I pay for events separately?" 
                        answer="Free Listing: No event listings. Visibility Pro: Pay $89 per event. Insights Premium: 1 free event listing per month, then $89 each. Studio/Enterprise: Unlimited event listings included." 
                      />
                      <FAQItem 
                        question="What if my gallery is very small or emerging?" 
                        answer="Start free. No risk. Upgrade to Visibility Pro when you're ready ($249/month is designed for emerging spaces in regional Australia)." 
                      />
                      <FAQItem 
                        question="What are Guides and how do they help my gallery?" 
                        answer="Guides are curated collections created by artists, curators, and cultural influencers (e.g., 'Best Contemporary Photography in Melbourne' or 'Hidden Art Gems'). When your gallery is featured in a Guide, thousands of engaged users discover you through trusted recommendations. Visibility Pro includes 1 Guide feature/month, Premium includes 3/month." 
                      />
                    </>
                  ) : (
                    <>
                      <FAQItem 
                        question="How long does it take to list an event?" 
                        answer="5 minutes. Fill in event details, upload a photo, set your ticketing option (RSVP or paid), and you're live." 
                      />
                      <FAQItem 
                        question="What's the difference between RSVP Listing and Event Route?" 
                        answer="RSVP Listing ($89): Free event, no tickets, capacity tracking, basic listing. Event Route ($299): Full ticketing system, interactive Route map with multiple locations, real-time analytics, geo-fencing push notifications, and QR code check-in." 
                      />
                      <FAQItem 
                        question="What payment methods do you accept?" 
                        answer="Credit/debit cards (Visa, Mastercard, American Express), Apple Pay, and Google Pay. Payment processing via Stripe. Funds transfer to your account within 2-3 business days." 
                      />
                      <FAQItem 
                        question="Can I offer discount codes or early-bird pricing?" 
                        answer="Yes. With Event Route and above, you can set early-bird discounts, promotional codes, group rates, and different ticket types (student, general, VIP, etc.)." 
                      />
                      <FAQItem 
                        question="Can I refund tickets?" 
                        answer="Yes. You can issue refunds directly from the dashboard. We'll process them back to the original payment method within 5-7 business days." 
                      />
                      <FAQItem 
                        question="Does Art Flaneur show my event to people outside the app?" 
                        answer="Yes. Events also appear on Art Flaneur website calendar (discoverable via search), your shareable event link (post on socials, email, website), push notifications to subscribers, and Art Flaneur weekly newsletter." 
                      />
                      <FAQItem 
                        question="Can I see real-time ticket sales and attendance?" 
                        answer="Yes. With Event Route and above, your dashboard updates in real-time. See tickets sold (cumulative), revenue generated, visitors checked in at venue (using QR codes), and attendance vs. capacity." 
                      />
                      <FAQItem 
                        question="What if my event is cancelled or rescheduled?" 
                        answer="No penalty. Update your event details anytime from the dashboard. For refunds: You can issue full refunds to all ticket buyers with one click." 
                      />
                      <FAQItem 
                        question="Can I see which visitors came from Art Flaneur vs. other channels?" 
                        answer="With Event Route analytics, yes. We track total visitors to your event page in-app, ticket sales sourced from Art Flaneur, and geographic origin of attendees." 
                      />
                      <FAQItem 
                        question="Do you offer multi-year contracts for recurring events?" 
                        answer="Yes. For annual events (art weeks, biennales, festivals), we offer 2-3 year contracts with 15-20% discount. Benefits include: locked pricing, priority support, year-over-year data comparison, and accumulated audience insights. Perfect for events that need consistent data tracking and budget predictability." 
                      />
                    </>
                  )}
              </div>
          </div>
      </section>

      <NewsletterSection />
    </div>
  );
};

export default Partners;