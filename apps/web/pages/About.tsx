import React from 'react';
import { NewsletterSection } from '../components/Shared';

const About: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter mb-8 leading-[0.8]">
            We Are<br/>
            <span className="text-art-red">Art Flaneur</span>
          </h1>
          
          <div className="prose prose-lg md:prose-xl font-serif max-w-none space-y-6 mb-16">
            <p className="text-xl md:text-2xl leading-relaxed">
              Art Flaneur Global Pty Ltd began the way many good cultural stories begin: not with a pitch deck, but with walking. Walking through unfamiliar streets, noticing small "gallery" signs in windows, following curiosity into laneways, and learning that art is often hiding in plain sight — waiting for someone to slow down long enough to find it.
            </p>
          </div>
        </div>
      </div>

      {/* Who We Are Section */}
      <div className="bg-art-paper border-y-4 border-black">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-8">
              Who we are <span className="text-art-blue">(and why it matters)</span>
            </h2>
            
            <div className="prose prose-lg font-serif max-w-none space-y-6">
              <p className="text-lg leading-relaxed">
                We're Eva and Tim — a "big corporation" of two humans based in Melbourne, Australia. Art Flaneur is our love story and our family story, built with our own hands, our own time, and our own family budget. It's also our long-term cultural project: a platform designed to make art discovery feel more alive, more playful, and more accessible — for locals and cultural travellers, in Australia and around the world.
              </p>
              
              <p className="text-lg leading-relaxed border-l-4 border-art-yellow pl-6 py-2">
                Tim is the tech mind: an MLOps professional building the infrastructure and the AI layer that powers smarter discovery. Eva is a photographer, a researcher, and someone who has spent years thinking about how artists build careers and visibility over time (including ongoing PhD studies).
              </p>
              
              <p className="text-lg leading-relaxed">
                Different backgrounds, same obsession: the belief that art is not a luxury ornament — it's a way cities breathe, communities speak, and people make sense of life.
              </p>
              
              <p className="text-base leading-relaxed text-gray-700 italic">
                We do work with freelancers across the world and sometimes get support from art professionals who simply like what we're building. But we keep the core intentionally small, because the culture we're trying to create — slow, attentive, respectful — should also exist inside the company.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What Art Flaneur Is */}
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black uppercase mb-8 border-b-4 border-art-red pb-4">
            What Art Flaneur is
          </h2>
          
          <div className="prose prose-lg font-serif max-w-none space-y-6">
            <p className="text-lg leading-relaxed">
              Art Flaneur is a mobile-first platform for discovering galleries, exhibitions, and cultural events, with interactive maps, personal planning tools, and recommendations. We use technology like geofencing, gamification and immersive, smartphone-first formats to turn cultural exploration into a journey rather than a to-do list.
            </p>
            
            <p className="text-xl font-bold text-art-blue border-t-2 border-b-2 border-black py-6 my-8">
              At its heart, Art Flaneur is built around a feeling: the quiet thrill of finding something you didn't expect.
            </p>
            
            <p className="text-lg leading-relaxed">
              Not the "must-see top ten," not the overcrowded photo spot — but the small gallery you walk into on a rainy afternoon and leave with a new artist in your head.
            </p>
            
            <p className="text-lg leading-relaxed">
              We believe cities can be read like books — and art spaces are the chapters people often skip because they don't know they're allowed to enter. Art Flaneur exists to open those doors gently.
            </p>
          </div>
        </div>
      </div>

      {/* Who It's For */}
      <div className="bg-art-yellow">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black uppercase mb-8">
              Who it's for
            </h2>
            
            <div className="prose prose-lg font-serif max-w-none space-y-6">
              <p className="text-lg leading-relaxed">
                Art Flaneur is for cultural tourists, local explorers, students, collectors, artists, and anyone who wants to feel more connected to where they are. It's for the person who lands in a new city and doesn't want an itinerary that feels like homework. It's also for the local who has lived somewhere for years and suddenly realises there are entire creative worlds within a 15‑minute walk.
              </p>
              
              <p className="text-lg leading-relaxed">
                And it's for cultural organisations — especially independent galleries, artist studios, festivals, biennials, triennials, and other programs that need modern digital infrastructure without needing a large marketing department or a tech team.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Approach */}
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-3xl md:text-4xl font-black uppercase mb-6 border-b-4 border-art-blue pb-4">
                Our approach: open discovery, not gated culture
              </h3>
              
              <div className="prose prose-lg font-serif space-y-4">
                <p className="text-lg leading-relaxed">
                  Art Flaneur is not "invitation-only." We don't believe cultural visibility should belong only to the biggest budgets. Any independent gallery or artist studio can appear on the map, because that's how cultural ecosystems stay diverse and alive.
                </p>
                
                <p className="text-lg leading-relaxed">
                  Yes, we do offer premium listings for those who want to stand out — because long-term sustainability matters, and the project needs a stable model to grow. But the deeper idea stays the same: discovery should be fair, and cultural maps should be more than a ranking of who can pay to be seen.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-3xl md:text-4xl font-black uppercase mb-6 border-b-4 border-art-red pb-4">
                Building without "growth at any cost"
              </h3>
              
              <div className="prose prose-lg font-serif space-y-4">
                <p className="text-lg leading-relaxed">
                  Art Flaneur is self-funded. That's not a marketing slogan — it's a philosophy about pace and care. We are building in real time, continuously adding features and expanding what the platform can do.
                </p>
                
                <p className="text-lg leading-relaxed">
                  If someone comes offering VC investment tied to aggressive growth and the demand for a 100× return in five years, we will most likely decline. Not because we don't want to succeed — but because we're not willing to trade mental health and emotional stability for numbers on a chart. We're here for cultural impact that lasts, not the kind of success that burns people out and leaves communities with nothing behind.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sustainability Section */}
      <div className="bg-black text-white">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-4xl md:text-6xl font-black uppercase mb-8">
              Why we care about <span className="text-art-yellow">"paperless"</span> and sustainable culture
            </h3>
            
            <div className="prose prose-lg font-serif max-w-none space-y-6 text-gray-300">
              <p className="text-lg leading-relaxed">
                The arts sector is full of passionate people working with limited resources. Traditional promotion often depends on printing and distribution that can be expensive, wasteful, and uneven — especially for smaller organisations. Our mission includes paperless cultural marketing: helping cultural institutions reach audiences through digital tools and interactive experiences that fit how people actually move through cities today.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* The Invitation */}
      <div className="bg-art-blue text-white border-y-4 border-black">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-4xl md:text-6xl font-black uppercase mb-8">
              The Invitation
            </h3>
            
            <div className="prose prose-lg font-serif max-w-none space-y-6 text-gray-100">
              <p className="text-xl leading-relaxed">
                Art Flaneur is still growing — and what you see now is only a small part of what we're building. If you're a gallery, festival, institution, or cultural organisation, partnering with us means joining a movement toward more accessible, more interactive, more human cultural discovery.
              </p>
              
              <p className="text-lg leading-relaxed">
                If you spot an error, have an idea, want to collaborate, or simply want to say hello, you can reach us directly: Tim for technical questions and Eva for everything else (including newsletters and social media). We genuinely love hearing from people who care about culture — because Art Flaneur was never meant to be just an app. It's a way of moving through the world, together.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
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