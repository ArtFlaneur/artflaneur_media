import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MOCK_ARTICLES } from '../constants';
import { EntityCard } from '../components/Shared';
import { Instagram, Twitter, Mail } from 'lucide-react';
import { client } from '../sanity/lib/client';
import { AUTHOR_QUERY } from '../sanity/lib/queries';

const AmbassadorView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [author, setAuthor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const authorArticles = MOCK_ARTICLES; // In real app, filter by author ID

  useEffect(() => {
    const fetchAuthor = async () => {
      if (!id) return;
      
      try {
        console.log('🔍 Fetching author with slug:', id);
        const authorData = await client.fetch(AUTHOR_QUERY, { slug: id });
        console.log('📦 Author data received:', authorData);
        
        if (authorData) {
          setAuthor({
            id: authorData._id,
            name: authorData.name,
            role: authorData.role || 'Contributor',
            image: authorData.photo?.asset?.url || 'https://picsum.photos/400/400',
            bio: authorData.email ? `Contact: ${authorData.email}` : 'Bio coming soon'
          });
        } else {
          console.warn('⚠️ No author found with slug:', id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching author:', error);
        setLoading(false);
      }
    };
    
    fetchAuthor();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-lg">Loading ambassador...</p>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-lg">Ambassador not found</p>
      </div>
    );
  }

  return (
    <div className="bg-art-paper min-h-screen">
        <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                
                {/* Profile Sidebar */}
                <div className="md:col-span-4">
                    <div className="bg-white border-2 border-black sticky top-24">
                        <div className="aspect-square w-full border-b-2 border-black overflow-hidden">
                            <img src={author.image} alt={author.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-8">
                            <h1 className="text-3xl font-black uppercase mb-2">{author.name}</h1>
                            <p className="font-mono text-art-blue text-sm font-bold uppercase mb-6">{author.role}</p>
                            <p className="font-serif italic text-lg leading-relaxed mb-8">{author.bio}</p>
                            
                            <div className="flex gap-4 border-t border-gray-200 pt-6">
                                <button className="w-10 h-10 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors"><Instagram className="w-4 h-4" /></button>
                                <button className="w-10 h-10 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors"><Twitter className="w-4 h-4" /></button>
                                <button className="w-10 h-10 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors"><Mail className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feed */}
                <div className="md:col-span-8">
                    <h2 className="text-2xl font-black uppercase mb-8 border-b-2 border-black pb-4">Contributions</h2>
                    <div className="grid grid-cols-1 gap-8">
                        {authorArticles.map(article => (
                            <EntityCard key={article.id} data={article} type="article" variant="horizontal" />
                        ))}
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};

export default AmbassadorView;