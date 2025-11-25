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
                             <li>
                                 <strong>Art Flaneur Global Pty Ltd</strong>
                             </li>
                             <li>ABN 27 672 710 520</li>
                             <li>
                                 Email: <a href="mailto:tim@artflaneur.com.au" className="text-art-blue hover:underline">tim@artflaneur.com.au</a>
                             </li>
                             <li>
                                 Web: <a href="https://www.artflaneur.com.au" target="_blank" rel="noopener noreferrer" className="text-art-blue hover:underline">www.artflaneur.com.au</a>
                             </li>
                         </ul>
                     </div>
                     <div>
                         <h3 className="font-mono font-bold uppercase text-xl mb-4">Legal</h3>
                         <ul className="space-y-2 font-mono text-sm">
                             <li>Registered in Australia</li>
                             <li>ABN: 27 672 710 520</li>
                             <li className="pt-4">
                                 <strong>Company Name:</strong><br/>
                                 Art Flaneur Global Pty Ltd
                             </li>
                         </ul>
                     </div>
                 </div>
             </div>
        </div>
        <NewsletterSection />
    </div>
  );
};

export default About;