import { createClient } from '@sanity/client';

const token = process.env.SANITY_API_TOKEN || process.env.SANITY_AUTH_TOKEN;

if (!token) {
  throw new Error(
    'Missing Sanity token. Set SANITY_API_TOKEN (preferred) or SANITY_AUTH_TOKEN in your environment.'
  );
}

const client = createClient({
  projectId: 'o1yl0ri9',
  dataset: 'blog',
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
});

async function addSlugsToAuthors() {
  try {
    console.log('🔍 Fetching authors without slugs...');
    
    const authors = await client.fetch(`*[_type == "author" && !defined(slug)]`);
    console.log(`📦 Found ${authors.length} authors without slugs`);
    
    for (const author of authors) {
      // Generate slug from name: "Elena Vance" -> "elena-vance"
      const slug = author.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      console.log(`✏️ Updating ${author.name} (${author._id}) with slug: ${slug}`);
      
      await client
        .patch(author._id)
        .set({ slug: { _type: 'slug', current: slug } })
        .commit();
    }
    
    console.log('✅ All authors updated successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addSlugsToAuthors();
