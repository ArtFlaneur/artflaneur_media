import React from 'react';
import { NewsletterSection } from '../components/Shared';

const About: React.FC = () => {
  return (
    <div className="bg-white">
        <div className="container mx-auto px-4 md:px-6 py-24">
             <div className="max-w-4xl mx-auto">
                 <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter mb-12 leading-[0.8]">
                     We Are<br/>
                     <span className="text-art-red">Art Flaneur</span>
                 </h1>
                 
                 <div className="prose prose-lg md:prose-xl font-serif max-w-none mb-24">
                     <p>
                         Art Flaneur is a digital platform dedicated to the contemporary art world. We bridge the gap between institutions, galleries, and the public through critical review, curated guides, and data-driven insights.
                     </p>
                     <p>
                         Founded in 2024, our mission is to democratize access to high culture while maintaining rigorous critical standards.
                     </p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t-4 border-black pt-12">
                     <div>
                         <h3 className="font-mono font-bold uppercase text-xl mb-4">Contact</h3>
                         <ul className="space-y-2 font-mono text-sm">
                             <li>General: hello@artflaneur.com</li>
                             <li>Editorial: editor@artflaneur.com</li>
                             <li>Partnerships: partners@artflaneur.com</li>
                         </ul>
                     </div>
                     <div>
                         <h3 className="font-mono font-bold uppercase text-xl mb-4">Offices</h3>
                         <address className="not-italic font-mono text-sm space-y-4">
                             <p>
                                 <strong>London</strong><br/>
                                 180 The Strand<br/>
                                 London, WC2R 1EA
                             </p>
                             <p>
                                 <strong>New York</strong><br/>
                                 52 Walker St<br/>
                                 New York, NY 10013
                             </p>
                         </address>
                     </div>
                 </div>
             </div>
        </div>
        <NewsletterSection />
    </div>
  );
};

export default About;