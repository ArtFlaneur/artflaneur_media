export const token = process.env.SANITY_API_READ_TOKEN

if (!token) {
  console.warn('SANITY_API_READ_TOKEN is not set. Draft queries will be limited to public content.')
}