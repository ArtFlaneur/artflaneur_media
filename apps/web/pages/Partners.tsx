import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { GALLERY_PRICING, EVENT_PRICING } from '../constants';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { NewsletterSection } from '../components/Shared';

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
  const title = isGallery ? "For Galleries" : "For Art Events";
  const subtitle = isGallery 
    ? "Connect with a curated audience of collectors and enthusiasts." 
    : "Drive foot traffic and engagement for your art fair or exhibition.";

  return (
    <div className="">
      {/* Hero Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh] border-b-2 border-black">
         {/* Left: Content */}
         <div className="bg-art-black text-white p-12 lg:p-24 flex flex-col justify-center border-b-2 lg:border-b-0 lg:border-r-2 border-black">
            <span className="text-art-yellow font-mono font-bold uppercase tracking-widest mb-6 block">Partner Program</span>
            <h1 className="text-5xl lg:text-7xl font-black uppercase mb-8 leading-[0.9]">{title}</h1>
            <p className="text-xl text-gray-300 font-mono mb-12 max-w-md">{subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-white text-black px-8 py-4 font-bold uppercase tracking-wide hover:bg-art-blue hover:text-white transition-colors border-2 border-white">
                    Request Demo
                </button>
                <button className="border-2 border-white text-white px-8 py-4 font-bold uppercase tracking-wide hover:bg-white hover:text-black transition-colors">
                    Download Kit
                </button>
            </div>
         </div>
         
         {/* Right: Analytics Visual */}
         <div className="bg-art-paper p-8 lg:p-16 flex items-center justify-center relative overflow-hidden">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
            
            <div className="bg-white p-6 border-2 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg z-10">
                <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
                    <div>
                        <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider font-mono">Visitor Growth</h3>
                        <div className="text-3xl font-black text-black">+142% <span className="text-xs text-art-green font-mono font-normal">vs last month</span></div>
                    </div>
                    <div className="text-[10px] uppercase font-bold border border-black px-2 py-1">Last 7 Days</div>
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

      {/* Pricing Section */}
      <section className="py-24 container mx-auto px-4 md:px-6">
         <div className="text-center max-w-3xl mx-auto mb-16">
             <div className="w-16 h-2 bg-art-red mx-auto mb-6"></div>
             <h2 className="text-4xl font-black uppercase mb-4">Membership Tiers</h2>
             <p className="font-mono text-gray-600">Transparent pricing. No hidden fees.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
             {pricing.map((tier, idx) => (
                 <div key={idx} className={`p-8 border-2 border-black relative ${tier.highlight ? 'bg-black text-white shadow-[16px_16px_0px_0px_rgba(255,215,0,1)]' : 'bg-white text-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow'}`}>
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
                     <button className={`w-full py-4 font-bold uppercase tracking-widest text-xs transition-colors border-2 ${tier.highlight ? 'border-white bg-white text-black hover:bg-art-yellow hover:border-art-yellow' : 'border-black bg-black text-white hover:bg-art-red hover:border-art-red'}`}>
                         {tier.cta}
                     </button>
                 </div>
             ))}
         </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-art-yellow border-t-2 border-black">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
              <h2 className="text-4xl font-black uppercase mb-12 text-center text-black">Questions?</h2>
              <div className="bg-white border-2 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                  <FAQItem question="How does the analytics dashboard work?" answer="We aggregate user location data (anonymized) and interaction metrics from the app to show you real foot traffic and digital engagement." />
                  <FAQItem question="Can I update my exhibition info?" answer="Yes, partners get access to a dedicated portal to update images, dates, and descriptions in real-time." />
                  <FAQItem question="What is the 'Ambassador Review'?" answer="Our top-tier plan includes a visit from one of our vetted art critics who will write an editorial feature about your show." />
              </div>
          </div>
      </section>

      <NewsletterSection />
    </div>
  );
};

export default Partners;