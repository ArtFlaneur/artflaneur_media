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
                    .title('Reviews in Review')
                    .filter('_type == "review" && editorialStatus == "inReview"')
                ),
              S.listItem()
                .title('Needs Revision')
                .child(
                  S.documentList()
                    .title('Reviews Needing Revision')
                    .filter('_type == "review" && editorialStatus == "needsRevision"')
                ),
              S.listItem()
                .title('Approved')
                .child(
                  S.documentList()
                    .title('Approved Reviews')
                    .filter('_type == "review" && editorialStatus == "approved"')
                ),
              S.divider(),
              S.listItem()
                .title('🕐 Scheduled Content')
                .child(
                  S.documentList()
                    .title('Scheduled for Publication')
                    .filter('_type in ["review", "artistStory", "guide"] && defined(scheduledPublishAt) && scheduledPublishAt > now()')
                    .params({now: new Date().toISOString()})
                ),
              S.listItem()
                .title('Sponsored Content')
                .child(
                  S.documentList()
                    .title('All Sponsored Content')
                    .filter('defined(sponsorship.enabled) && sponsorship.enabled == true')
                ),
            ])
        ),
      S.divider(),
      
      // Content
      S.documentTypeListItem('review').title('Reviews'),
      S.documentTypeListItem('artistStory').title('Artist Stories'),
      S.documentTypeListItem('guide').title('Guides'),
      
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
              S.documentTypeListItem('siteSettings').title('General Settings'),
              S.documentTypeListItem('homepageContent').title('Homepage Content'),
            ])
        ),
    ])