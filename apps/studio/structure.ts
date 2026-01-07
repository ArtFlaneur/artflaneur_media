import {StructureBuilder} from 'sanity/structure'

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Art Flaneur CRM')
    .items([
      S.listItem()
        .title('Dashboard')
        .child(
          S.list()
            .title('Content Management')
            .items([
              S.listItem()
                .title('In Review')
                .child(
                  S.documentList()
                    .title('Content in Review')
                    .filter('_type in ["article", "review"] && publishStatus == "inReview"')
                    .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                ),
              S.listItem()
                .title('Needs Revision')
                .child(
                  S.documentList()
                    .title('Content Needing Revision')
                    .filter('_type in ["article", "review"] && publishStatus == "needsRevision"')
                    .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                ),
              S.listItem()
                .title('Approved')
                .child(
                  S.documentList()
                    .title('Approved Content')
                    .filter('_type in ["article", "review"] && publishStatus == "approved"')
                    .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                ),
              S.divider(),
              S.listItem()
                .title('🕐 Scheduled Content')
                .child(
                  S.documentList()
                    .title('Scheduled for Publication')
                    .filter(
                      '_type in ["article", "review", "artistStory", "guide"] && publishStatus == "scheduled" && defined(scheduledPublishAt)',
                    )
                    .defaultOrdering([{field: 'scheduledPublishAt', direction: 'asc'}])
                ),
              S.listItem()
                .title('Sponsored Content')
                .child(
                  S.documentList()
                    .title('All Sponsored Content')
                    .filter('defined(sponsorship.enabled) && sponsorship.enabled == true')
                    .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
                ),
            ])
        ),
      S.divider(),
      
      // Content
      S.listItem()
        .title('📝 All Articles')
        .schemaType('article')
        .child(
          S.documentList()
            .title('All Articles')
            .filter('_type == "article"')
            .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
        ),
      S.listItem()
        .title('🎨 Exhibition Reviews')
        .child(
          S.documentList()
            .title('Exhibition Reviews')
            .filter('_type == "article" && contentType == "exhibition-review"')
            .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
        ),
      S.listItem()
        .title('📰 News')
        .child(
          S.documentList()
            .title('News Articles')
            .filter('_type == "article" && contentType == "news"')
            .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
        ),
      S.listItem()
        .title('📚 Book Reviews')
        .child(
          S.documentList()
            .title('Book Reviews')
            .filter('_type == "article" && contentType == "book-review"')
            .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
        ),
      S.listItem()
        .title('🎬 Film Reviews')
        .child(
          S.documentList()
            .title('Film Reviews')
            .filter('_type == "article" && contentType == "film-review"')
            .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
        ),
      
      S.divider(),
      
      S.listItem()
        .title('🔗 Old Reviews (Legacy)')
        .schemaType('review')
        .child(
          S.documentList()
            .title('Legacy Reviews - Migrate to Articles')
            .filter('_type == "review"')
            .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
        ),
      
      S.divider(),
      S.listItem()
        .title('Artist Stories')
        .schemaType('artistStory')
        .child(
          S.documentList()
            .title('Artist Stories')
            .filter('_type == "artistStory"')
            .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
        ),
      S.listItem()
        .title('Guides')
        .schemaType('guide')
        .child(
          S.documentList()
            .title('Guides')
            .filter('_type == "guide"')
            .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
        ),

      S.listItem()
        .title('🗓️ Art Events')
        .schemaType('artEvent')
        .child(
          S.documentList()
            .title('Art Events')
            .filter('_type == "artEvent"')
            .defaultOrdering([{field: 'startDate', direction: 'desc'}])
        ),
      
      S.divider(),
      
      // People
      S.documentTypeListItem('author').title('Authors'),
      
      S.divider(),
      
      // Marketing & Sponsors
      S.documentTypeListItem('sponsor').title('Sponsors'),
      S.documentTypeListItem('landingPage').title('Landing Pages'),
      
      S.divider(),
      
      // Settings
      S.listItem()
        .title('Settings')
        .child(
          S.list()
            .title('Site Settings')
            .items([
              S.listItem()
                .title('General Settings')
                .child(
                  S.document()
                    .schemaType('siteSettings')
                    .documentId('siteSettings')
                ),
              S.listItem()
                .title('Homepage Content')
                .child(
                  S.document()
                    .schemaType('homepageContent')
                    .documentId('homepageContent')
                ),
            ])
        ),
    ])