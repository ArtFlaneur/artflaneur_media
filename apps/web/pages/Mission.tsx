import React from 'react';
import { NewsletterSection } from '../components/Shared';

const Mission: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter mb-8 leading-[0.8]">
            Our<br/>
            <span className="text-art-blue">Mission</span>
          </h1>
          
          <div className="prose prose-lg md:prose-xl font-serif max-w-none space-y-6 mb-16">
            <p className="text-xl md:text-2xl leading-relaxed">
              Art Flaneur exists for a simple reason: art should feel like something you can step into — not something you need permission to understand.
            </p>
            
            <p className="text-lg leading-relaxed">
              We believe culture doesn't live only behind museum doors or inside perfectly written wall labels; it lives in the streets between venues, in the quiet side galleries, in temporary pop-ups, in artist-run spaces, and in the moments when a city surprises you.
            </p>
            
            <p className="text-lg leading-relaxed italic border-l-4 border-art-yellow pl-6 py-2">
              The word "flâneur" describes a particular way of moving through the world: not rushing, not collecting trophies, not chasing highlights — but wandering with attention. That's the spirit behind Art Flaneur: to turn cultural discovery into an experience of presence, curiosity, and connection.
            </p>
          </div>
        </div>
      </div>

      {/* Vision Section */}
      <div className="bg-art-paper border-y-4 border-black">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-8">
              A world where art is <span className="text-art-red">playable</span> and <span className="text-art-blue">personal</span>
            </h2>
            
            <div className="prose prose-lg font-serif max-w-none space-y-6">
              <p className="text-lg leading-relaxed">
                Our vision is a world where art feels playable and personal — where a city becomes a living museum and every walk can turn into a meaningful cultural journey. We use augmented reality, storytelling, gamified quests, and AI personalisation not as gimmicks, but as invitations: to look closer, to go further than the obvious, and to discover spaces you'd never find through mainstream tourist routes.
              </p>
              
              <p className="text-xl font-bold text-art-blue border-t-2 border-b-2 border-black py-6 my-8">
                We want people to feel that spark: "I didn't know this place existed — and now it matters to me."
              </p>
              
              <p className="text-lg leading-relaxed">
                Because when discovery becomes emotional, culture stops being content and starts becoming memory.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Innovation Section */}
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-3xl md:text-4xl font-black uppercase mb-6 border-b-4 border-art-yellow pb-4">
                Innovation with a purpose
              </h3>
              
              <div className="prose prose-lg font-serif space-y-4">
                <p className="text-lg leading-relaxed">
                  Technology shapes where attention goes. In culture, that can either concentrate power — or distribute it. Art Flaneur is designed to do the second: to guide attention toward independent galleries, emerging artists, local institutions, and neighbourhood events that deserve to be seen.
                </p>
                
                <p className="text-lg leading-relaxed">
                  Our platform brings together the tools that modern cultural discovery needs: an interactive map, location-aware exploration, and personalised recommendations that help people plan a day (or follow their curiosity in the moment). We're building digital infrastructure for the art world that feels human — a bridge between people and places, not another noisy feed that drains the joy out of exploration.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-3xl md:text-4xl font-black uppercase mb-6 border-b-4 border-art-red pb-4">
                Community is the point
              </h3>
              
              <div className="prose prose-lg font-serif space-y-4">
                <p className="text-lg leading-relaxed">
                  Art is not just what hangs on a wall; it's also the ecosystems that make that work possible. The small galleries that take risks. The local venues that nurture artists long before anyone calls them "successful." The festival organisers who build temporary worlds and bring communities together.
                </p>
                
                <p className="text-lg leading-relaxed">
                  Art Flaneur is built to support those ecosystems by making them easier to find and easier to engage with. We believe in cultural diversity — not as a slogan, but as a practical outcome of visibility: when audiences can discover more, more voices can survive.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsibility Section */}
      <div className="bg-black text-white">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-4xl md:text-6xl font-black uppercase mb-8">
              Responsibility: <span className="text-art-yellow">paperless by design</span>
            </h3>
            
            <div className="prose prose-lg font-serif max-w-none space-y-6 text-gray-300">
              <p className="text-lg leading-relaxed">
                We live in a time where sustainability is no longer optional. Cultural marketing still relies heavily on printed materials that are expensive to produce, difficult to distribute fairly, and often quickly discarded.
              </p>
              
              <p className="text-lg leading-relaxed">
                Art Flaneur is committed to paperless cultural marketing — not to shame traditional methods, but to offer better alternatives. By providing digital tools and interactive experiences, we help institutions communicate with audiences in a way that is efficient, timely, and more environmentally responsible. In a world that already asks the arts sector to do more with less, paperless systems can also mean less waste and more reach — especially for small organisations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Education Section */}
      <div className="bg-art-yellow">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-4xl md:text-6xl font-black uppercase mb-8">
              Education that deepens, not lectures
            </h3>
            
            <div className="prose prose-lg font-serif max-w-none space-y-6">
              <p className="text-lg leading-relaxed">
                We care about education because deeper understanding changes how people see. It makes art less intimidating. It makes cultural contexts more visible. It turns a casual visit into a meaningful encounter.
              </p>
              
              <p className="text-lg leading-relaxed">
                Our goal is to contribute to art and cultural education through resources and experiences that encourage curiosity — the kind that grows over time. Not everyone wants an academic essay on a phone screen; sometimes what people need is a gentle prompt, a story, a well-designed route, or a reason to step into a place they would otherwise pass by.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ethical Growth Section */}
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl md:text-5xl font-black uppercase mb-8 border-b-4 border-art-blue pb-4">
            Ethical growth, long-term impact
          </h3>
          
          <div className="prose prose-lg font-serif max-w-none space-y-6">
            <p className="text-lg leading-relaxed">
              Art Flaneur is not built on the idea of "growth at any cost." We believe cultural technology should be sustainable not only financially, but emotionally and socially. That means building responsibly, partnering carefully, and choosing strategies that create lasting cultural value.
            </p>
            
            <p className="text-lg leading-relaxed">
              We seek supporters and partners who care about impact — not only reach. People who see cities not as products, but as canvases. People who understand that culture thrives when we protect the conditions that allow artists and institutions to keep making work.
            </p>
          </div>
        </div>
      </div>

      {/* The Promise Section */}
      <div className="bg-art-blue text-white border-y-4 border-black">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-4xl md:text-6xl font-black uppercase mb-8">
              The Promise
            </h3>
            
            <div className="prose prose-lg font-serif max-w-none space-y-6 text-gray-100">
              <p className="text-xl leading-relaxed">
                When someone opens Art Flaneur, the promise is not "more information." The promise is a different relationship with place: a slower pace, a sharper eye, and a sense that culture can meet you in the middle of an ordinary day and change it.
              </p>
              
              <p className="text-2xl font-bold leading-relaxed text-white border-t-2 border-white pt-8 mt-8">
                We are building a future where cultural discovery is accessible, sustainable, and deeply human — where art is not a distant monument, but a living conversation you can join, one step at a time.
              </p>
            </div>
          </div>
        </div>
      </div>

      <NewsletterSection />
    </div>
  );
};

export default Mission;
