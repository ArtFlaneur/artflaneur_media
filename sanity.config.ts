import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
// import {presentationTool} from 'sanity/presentation'
import {visionTool} from '@sanity/vision'
import {colorInput} from '@sanity/color-input'
import {table} from '@sanity/table'
import {dashboardTool} from '@sanity/dashboard'
import {documentInternationalization} from '@sanity/document-internationalization'
import {googleMapsInput} from '@sanity/google-maps-input'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

export default defineConfig({
  name: 'default',
  title: 'Art Flaneur Media',
  
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'your-project-id',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [
    structureTool({
      structure,
      title: 'Content',
    }),
    // presentationTool(),
    dashboardTool({
      title: 'Dashboard',
    }),
    visionTool({
      title: 'GROQ',
    }),
    documentInternationalization({
      // Required: languages configuration
      supportedLanguages: [
        {id: 'en', title: 'English'},
        {id: 'ru', title: 'Russian'},
      ],
      schemaTypes: ['review', 'artistStory', 'guide'], // documents to translate
    }),
    colorInput(),
    table(),
    googleMapsInput({
      apiKey: process.env.SANITY_STUDIO_GOOGLE_MAPS_API_KEY || '',
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})