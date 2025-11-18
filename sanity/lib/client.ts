export const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: true,
    stega: { studioUrl: '/art-flaneur-media' },
  })