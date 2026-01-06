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
                    .title('Articles in Review')
                    .filter('_type == "review" && publishStatus == "inReview"')
                    .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                ),
              S.listItem()
                .title('Needs Revision')
                .child(
                  S.documentList()
                    .title('Articles Needing Revision')
                    .filter('_type == "review" && publishStatus == "needsRevision"')
                    .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                ),
              S.listItem()
                .title('Approved')
                .child(
                  S.documentList()
                    .title('Approved Articles')
                    .filter('_type == "review" && publishStatus == "approved"')
                    .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                ),
              S.divider(),
              S.listItem()
                .title('🕐 Scheduled Content')
                .child(
                  S.documentList()
                    .title('Scheduled for Publication')
                    .filter(
                      '_type in ["review", "artistStory", "guide"] && publishStatus == "scheduled" && defined(scheduledPublishAt)'
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
        .title('Articles')
        .schemaType('review')
        .child(
          S.documentList()
            .title('Articles')
            .filter('_type == "review"')
            .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
        ),
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