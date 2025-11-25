import React from 'react';
import { ArrowRight, MapPin, Calendar, User } from 'lucide-react';
import { Article, Artist, Exhibition, Author, Guide } from '../types';
import { Link } from 'react-router-dom';

export const SectionHeader: React.FC<{ title: string; linkText?: string; linkTo?: string }> = ({ title, linkText, linkTo }) => (
  <div className="flex justify-between items-end mb-8 border-b-2 border-black pb-4">
    <div className="flex items-center gap-4">
        <div className="w-4 h-4 bg-art-red hidden md:block"></div>
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-black">{title}</h2>
    </div>
    {linkText && linkTo && (
      <Link to={linkTo} className="hidden md:flex items-center text-xs font-mono uppercase tracking-widest gap-2 hover:bg-black hover:text-white px-3 py-1 transition-all border border-transparent hover:border-black">
        [{linkText}] <ArrowRight className="w-3 h-3" />
      </Link>
    )}
  </div>
);

// Generic Entity Card covering different content types
export const EntityCard: React.FC<{ 
    data: Article | Artist | Exhibition | Guide | Author; 
    type: 'article' | 'artist' | 'exhibition' | 'guide' | 'author';
    variant?: 'vertical' | 'horizontal';
}> = ({ data, type, variant = 'vertical' }) => {
    
    // RENDER: ARTIST CARD
    if (type === 'artist') {
        const artist = data as Artist;
        return (
            <Link to={`/artists/${artist.id}`} className="group block border-2 border-black bg-white hover:shadow-[8px_8px_0px_0px_rgba(255,215,0,1)] transition-all duration-200">
                <div className="relative aspect-square overflow-hidden border-b-2 border-black">
                    <img src={artist.image} alt={artist.name} className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500" />
                </div>
                <div className="p-4">
                    <h3 className="text-2xl font-black uppercase mb-1">{artist.name}</h3>
                    <p className="font-mono text-xs text-gray-500 uppercase">{artist.location}</p>
                </div>
            </Link>
        );
    }

    // RENDER: EXHIBITION CARD
    if (type === 'exhibition') {
        const exhibition = data as Exhibition;
        return (
            <Link to={`/exhibitions/${exhibition.id}`} className="group block border-2 border-black bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,85,212,1)] transition-all duration-200 h-full flex flex-col">
                <div className="relative aspect-[3/2] overflow-hidden border-b-2 border-black">
                    <img src={exhibition.image} alt={exhibition.title} className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500" />
                    <div className="absolute top-0 right-0 bg-art-yellow px-2 py-1 text-xs font-mono font-bold border-l-2 border-b-2 border-black">
                        {exhibition.city}
                    </div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                    <div className="mb-4">
                        <span className="font-mono text-xs font-bold uppercase block mb-1">{exhibition.gallery}</span>
                        <h3 className="text-xl font-bold uppercase leading-tight">{exhibition.title}</h3>
                    </div>
                    <div className="mt-auto pt-4 border-t border-gray-200 flex items-center gap-2 font-mono text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {exhibition.startDate} — {exhibition.endDate}
                    </div>
                </div>
            </Link>
        );
    }

    // RENDER: AUTHOR CARD
    if (type === 'author') {
        const author = data as Author;
        return (
             <Link to={`/ambassadors/${author.id}`} className="group block border-2 border-black bg-white hover:-translate-y-1 transition-all">
                <div className="flex items-center p-4 gap-4">
                    <div className="w-16 h-16 border-2 border-black overflow-hidden flex-shrink-0">
                        <img src={author.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                    </div>
                    <div>
                        <h4 className="font-bold uppercase text-lg leading-none mb-1">{author.name}</h4>
                        <p className="font-mono text-xs text-gray-500">{author.role}</p>
                    </div>
                    <ArrowRight className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
             </Link>
        );
    }

    // RENDER: ARTICLE / GUIDE (Default)
    const article = data as Article;
    return (
        <Link to={type === 'guide' ? `/guides/${article.id}` : `/reviews/${article.id}`} className="group block border-2 border-black bg-white hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(217,48,37,1)] transition-all duration-200 h-full flex flex-col">
          <div className="relative aspect-[4/5] border-b-2 border-black overflow-hidden">
            <img 
              src={article.image} 
              alt={article.title} 
              className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute top-0 left-0 bg-white px-3 py-1 text-xs font-bold font-mono uppercase border-r-2 border-b-2 border-black z-10 group-hover:bg-art-blue group-hover:text-white transition-colors">
                {article.type}
            </div>
          </div>
          <div className="p-5 flex flex-col flex-grow justify-between">
            <div>
                <h3 className="text-xl font-bold uppercase leading-tight mb-3 group-hover:underline decoration-2 underline-offset-2">{article.title}</h3>
                {article.subtitle && <p className="text-gray-600 text-sm mb-4 font-mono leading-relaxed line-clamp-3">{article.subtitle}</p>}
            </div>
            {article.author && (
                <div className="pt-4 border-t border-gray-200 flex justify-between items-center text-xs font-mono text-gray-500 uppercase">
                    <span>{article.author.name}</span>
                    <ArrowRight className="w-4 h-4 text-black -ml-4 opacity-0 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                </div>
            )}
          </div>
        </Link>
    );
};

export const ArticleCard: React.FC<{ article: Article; variant?: 'vertical' | 'horizontal' }> = ({ article, variant }) => {
    return <EntityCard data={article} type="article" variant={variant} />;
};

export const NewsletterSection: React.FC = () => (
    <section className="bg-art-yellow border-t-2 border-black py-20">
        <div className="container mx-auto px-4 md:px-6">
            <div className="border-2 border-black bg-white p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-4xl mx-auto text-center">
                <h3 className="text-4xl md:text-5xl font-black uppercase mb-4 tracking-tight">The Art World.<br/>In Your Inbox.</h3>
                <p className="font-mono text-gray-600 mb-8 max-w-lg mx-auto">Get our weekly curation of must-see exhibitions, artist interviews, and city guides.</p>
                <form className="flex flex-col sm:flex-row gap-0 border-2 border-black max-w-xl mx-auto">
                    <input 
                        type="email" 
                        placeholder="EMAIL ADDRESS" 
                        className="flex-1 bg-white px-6 py-4 focus:outline-none font-mono text-sm uppercase placeholder:text-gray-400"
                    />
                    <button type="submit" className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-art-red transition-colors border-l-2 border-black sm:border-l-2 sm:border-t-0 border-t-2">
                        Subscribe
                    </button>
                </form>
                <p className="text-[10px] font-mono uppercase text-gray-400 mt-4">No spam. Only Art.</p>
            </div>
        </div>
    </section>
);

export const AiTeaser: React.FC = () => (
    <section className="bg-art-black text-white py-0 border-y-2 border-black overflow-hidden relative">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2">
            
            <div className="p-12 md:p-24 border-b-2 md:border-b-0 md:border-r-2 border-white/20 flex flex-col justify-center">
                <div className="inline-block bg-art-blue text-white px-3 py-1 font-mono text-xs uppercase mb-6 w-max border border-white">
                    App Feature
                </div>
                <h2 className="text-5xl md:text-7xl font-serif mb-6 leading-[0.9]">
                    Your Personal<br/>
                    <span className="text-transparent stroke-white" style={{WebkitTextStroke: '2px #fff'}}>Art Curator</span>
                </h2>
                <p className="font-mono text-gray-400 text-sm mb-12 max-w-md leading-relaxed">
                    Not sure what to see? Ask our AI assistant. Get personalized itineraries instantly.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <a 
                        href="https://apps.apple.com/au/app/art-flaneur-discover-art/id6449169783"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white text-black px-8 py-4 font-bold uppercase tracking-wide hover:bg-art-yellow hover:text-black transition-colors border-2 border-white hover:border-art-yellow text-center"
                    >
                        App Store
                    </a>
                    <a 
                        href="https://play.google.com/store/apps/details?id=com.artflaneur"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-transparent text-white px-8 py-4 font-bold uppercase tracking-wide hover:bg-white hover:text-black transition-colors border-2 border-white text-center"
                    >
                        Google Play
                    </a>
                </div>
            </div>
            
            {/* Visual Representation */}
            <div className="bg-art-paper relative flex items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                
                {/* Chat UI Card */}
                <div className="bg-white border-2 border-black w-full max-w-sm shadow-[8px_8px_0px_0px_rgba(217,48,37,1)] p-4 relative z-10">
                    <div className="border-b-2 border-black pb-2 mb-4 flex justify-between items-center">
                         <span className="font-mono text-xs font-bold uppercase">AI_Curator_Bot.exe</span>
                         <div className="flex gap-1">
                             <div className="w-3 h-3 bg-black rounded-full"></div>
                             <div className="w-3 h-3 border border-black rounded-full"></div>
                         </div>
                    </div>
                    <div className="space-y-4 font-mono text-xs">
                         <div className="bg-gray-100 p-3 border border-black text-black">
                             Show me something provocative near me.
                         </div>
                         <div className="bg-art-blue/10 p-3 border border-art-blue text-art-blue">
                             <p className="mb-2 font-bold">&gt; I recommend &quot;Raw Flesh&quot; at The Basement Gallery.</p>
                             <div className="aspect-video bg-black grayscale mix-blend-multiply mb-2 overflow-hidden">
                                 <img src="https://picsum.photos/400/200?random=20" className="w-full h-full object-cover opacity-80" alt="Preview"/>
                             </div>
                             <p>It matches your interest in brutalism.</p>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);