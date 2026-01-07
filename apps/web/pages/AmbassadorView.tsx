import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { EntityCard } from '../components/Shared';
import { Instagram, Twitter, Mail } from 'lucide-react';
import { client } from '../sanity/lib/client';
import { AUTHOR_QUERY } from '../sanity/lib/queries';
import { Article, ContentType } from '../types';
import { imagePresets } from '../lib/imageBuilder';

type AuthorQueryResponse = {
  _id: string;
  name?: string | null;
  slug?: { current?: string | null } | null;
  email?: string | null;
  role?: string | null;
  photo?: {
    asset?: {
      url?: string | null;
    } | null;
  } | null;
  posts?: Array<{
    _id: string;
    title?: string | null;
    slug?: { current?: string | null } | null;
    publishedAt?: string | null;
    excerpt?: string | null;
    mainImage?: {
      asset?: {
        url?: string | null;
      } | null;
      alt?: string | null;
    } | null;
  }> | null;
};

const AmbassadorView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [author, setAuthor] = useState<AuthorQueryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthor = async () => {
      if (!id) {
        setError('Missing ambassador identifier.');
        setLoading(false);
        return;
      }
      
      try {
        const authorData = await client.fetch<AuthorQueryResponse>(AUTHOR_QUERY, { slug: id });
        setAuthor(authorData ?? null);
        setError(authorData ? null : 'Ambassador not found.');
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching author:', error);
        setError('Unable to load this ambassador right now.');
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
        <p className="font-mono text-lg">{error || 'Ambassador not found'}</p>
      </div>
    );
  }

  const portrait = imagePresets.avatar(author.photo);
  const fallbackImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"%3E%3Crect width="600" height="600" fill="%23f4f4f4"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="24" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
  const authorArticles: Article[] = (author.posts ?? []).map((post) => ({
    id: post._id,
    slug: post.slug?.current ?? post._id,
    type: ContentType.REVIEW,
    title: post.title || 'Untitled story',
    subtitle: post.excerpt || undefined,
    author: {
      id: author._id,
      name: author.name || 'Ambassador',
      role: author.role || 'Contributor',
      image: portrait || fallbackImage,
    },
    date: post.publishedAt || undefined,
    image: imagePresets.card(post.mainImage) || fallbackImage,
  }));

  return (
    <div className="bg-art-paper min-h-screen">
        <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                
                {/* Profile Sidebar */}
                <div className="md:col-span-4">
                    <div className="bg-white border-2 border-black sticky top-24">
                        <div className="aspect-square w-full border-b-2 border-black overflow-hidden">
                            {portrait ? (
                              <img src={portrait} alt={author.name || 'Ambassador portrait'} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs font-mono uppercase">Portrait coming soon</div>
                            )}
                        </div>
                        <div className="p-8">
                            <h1 className="text-3xl font-black uppercase mb-2">{author.name || 'Ambassador'}</h1>
                            <p className="font-mono text-art-blue text-sm font-bold uppercase mb-6">{author.role || 'Contributor'}</p>
                            <p className="font-serif italic text-lg leading-relaxed mb-8">
                              {author.email ? `Reach out: ${author.email}` : 'Profile details coming soon.'}
                            </p>
                            
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {authorArticles.length === 0 ? (
                          <div className="border-2 border-dashed border-black p-6 font-mono text-sm text-gray-500">
                            No published contributions yet.
                          </div>
                        ) : (
                          authorArticles.map(article => (
                            <EntityCard key={article.id} data={article} type="article" variant="horizontal" />
                          ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};

export default AmbassadorView;