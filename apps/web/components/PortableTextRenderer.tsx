import React from 'react';
import imageUrlBuilder from '@sanity/image-url';

import { sanityConfig } from '../sanity/lib/client';

interface PortableTextRendererProps {
  value?: Array<Record<string, any>> | null;
}

const urlBuilder = imageUrlBuilder({
  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,
});

const resolveImageUrl = (block: Record<string, any>): string | null => {
  const directUrl = block?.asset?.url;
  if (typeof directUrl === 'string' && directUrl.length) return directUrl;

  const assetRef = block?.asset?._ref;
  if (typeof assetRef !== 'string' || !assetRef.length) return null;

  try {
    return urlBuilder.image({ asset: { _ref: assetRef, _type: 'reference' } }).width(1600).fit('max').url();
  } catch {
    return null;
  }
};

const PortableTextRenderer: React.FC<PortableTextRendererProps> = ({ value }) => {
  if (!value?.length) {
    return null;
  }

  return (
    <div className="font-serif text-base leading-7 space-y-5 text-gray-900">
      {value.map((block, blockIndex) => {
        // Render image blocks
        if (block._type === 'image') {
          const imageUrl = resolveImageUrl(block);
          const alt = block.alt || 'Article image';
          const caption = block.caption;

          if (!imageUrl) {
            console.log('No image URL found for block:', block);
            return null;
          }

          return (
            <div key={block._key ?? `image-${blockIndex}`} className="my-12 border-2 border-black p-2">
              <img 
                src={imageUrl} 
                alt={alt}
                className="w-full grayscale hover:grayscale-0 transition-all" 
              />
              {caption && (
                <p className="font-mono text-xs text-gray-500 mt-2 uppercase">{caption}</p>
              )}
            </div>
          );
        }

        // Render text blocks
        if (block._type === 'block') {
          const style = block.style || 'normal';
          const children = block.children || [];
          const markDefs = Array.isArray(block.markDefs) ? block.markDefs : [];
          
          // Render text content with marks
          const renderChildren = () => {
            return children.map((child, childIndex) => {
              if (!child.text) return null;

              let text: React.ReactNode = child.text;
              
              // Apply marks (bold, italic, etc.)
              if (child.marks?.includes('strong')) {
                text = (
                  <strong
                    key={`${block._key}-child-strong-${childIndex}`}
                    className="font-serif font-bold"
                  >
                    {text}
                  </strong>
                );
              }
              if (child.marks?.includes('em')) {
                text = <em key={`${block._key}-child-em-${childIndex}`}>{text}</em>;
              }

              // Find and render links
              const linkKey = Array.isArray(child.marks)
                ? child.marks.find((mark: any) => typeof mark === 'string' && mark !== 'strong' && mark !== 'em')
                : null;
              const linkDef = linkKey
                ? markDefs.find((def: any) => def && typeof def === 'object' && def._key === linkKey && def._type === 'link')
                : null;

              if (linkDef && typeof linkDef.href === 'string' && linkDef.href.length) {
                text = (
                  <a 
                    key={`${block._key}-child-${childIndex}`}
                    href={linkDef.href}
                    className="text-art-blue underline hover:text-art-red transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {text}
                  </a>
                );
              }

              return <React.Fragment key={`${block._key}-child-${childIndex}`}>{text}</React.Fragment>;
            });
          };

          const content = renderChildren();
          const key = block._key ?? `block-${blockIndex}`;

          // Render based on style
          switch (style) {
            case 'h2':
              return (
                <h2 key={key} className="text-3xl md:text-4xl font-black uppercase mt-12 mb-6 leading-tight">
                  {content}
                </h2>
              );
            case 'h3':
              return (
                <h3 key={key} className="text-2xl md:text-3xl font-bold uppercase mt-8 mb-4">
                  {content}
                </h3>
              );
            case 'h4':
              return (
                <h4 key={key} className="text-xl font-bold uppercase mt-6 mb-3">
                  {content}
                </h4>
              );
            case 'blockquote':
              return (
                <blockquote key={key} className="border-l-4 border-art-blue pl-6 my-12 bg-gray-100 p-8 border-y-2 border-r-2 border-gray-200">
                  <p className="font-black uppercase text-xl not-italic">{content}</p>
                </blockquote>
              );
            case 'normal':
            default:
              // First paragraph gets drop cap
              if (blockIndex === 0) {
                return (
                  <p key={key} className="text-lg md:text-xl leading-relaxed">
                    {content}
                  </p>
                );
              }
              return (
                <p key={key} className="text-lg md:text-xl leading-relaxed">
                  {content}
                </p>
              );
          }
        }

        // Render factTable
        if (block._type === 'factTable') {
          return (
            <div key={block._key ?? `fact-${blockIndex}`} className="my-8 border-2 border-black p-6 bg-gray-50">
              <h4 className="font-black uppercase text-lg mb-4">Key Facts</h4>
              <div className="space-y-2 font-mono text-sm">
                {block.rows?.map((row: any, idx: number) => (
                  <div key={row._key ?? `row-${idx}`} className="grid grid-cols-2 gap-4">
                    <span className="font-bold">{row.label}</span>
                    <span>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // Render keyInsights
        if (block._type === 'keyInsights') {
          return (
            <div key={block._key ?? `insights-${blockIndex}`} className="my-8 border-l-4 border-art-yellow pl-6 bg-art-yellow/5 p-6">
              <h4 className="font-black uppercase text-lg mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-art-yellow"></span>
                Key Insights
              </h4>
              <ul className="space-y-3">
                {block.insights?.map((insightItem: any, idx: number) => {
                  const text = typeof insightItem === 'string' ? insightItem : insightItem?.insight;
                  return (
                    <li key={insightItem._key ?? `insight-${idx}`} className="flex items-start gap-3">
                      <span className="text-art-yellow mt-1">•</span>
                      <span>{text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

export default PortableTextRenderer;
