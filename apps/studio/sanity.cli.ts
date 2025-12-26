import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'o1yl0ri9',
    dataset: process.env.SANITY_STUDIO_DATASET || 'blog',
  },
  studioHost: 'art-flaneur',
})
