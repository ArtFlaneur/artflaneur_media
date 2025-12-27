import {createClient} from '@sanity/client'

const token = process.env.SANITY_API_TOKEN || process.env.SANITY_AUTH_TOKEN

if (!token) {
  throw new Error('Missing Sanity token. Set SANITY_API_TOKEN (preferred) or SANITY_AUTH_TOKEN before running this script.')
}

const client = createClient({
  projectId: 'o1yl0ri9',
  dataset: 'blog',
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const normalizeBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value > 0
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (['yes', 'true', 'enabled', '1'].includes(normalized)) return true
    if (['no', 'false', 'disabled', '0'].includes(normalized)) return false
  }
  return undefined
}

const mapLegacyType = (value?: string | null): 'paid' | 'partnership' | 'affiliate' | undefined => {
  if (!value) return undefined
  const normalized = value.trim().toLowerCase()
  if (['paid', 'paidarticle', 'sponsored', 'ad'].includes(normalized)) return 'paid'
  if (['partner', 'partnercontent', 'branded', 'collaboration'].includes(normalized)) return 'partnership'
  if (['affiliate', 'referral'].includes(normalized)) return 'affiliate'
  return undefined
}

const mapBadgePlacement = (value?: string | null): 'default' | 'top' | 'afterTitle' | 'bottom' | undefined => {
  if (!value) return undefined
  const normalized = value.trim().toLowerCase()
  if (['top', 'hero', 'beforetitle'].includes(normalized)) return 'top'
  if (['aftertitle', 'mid', 'body'].includes(normalized)) return 'afterTitle'
  if (['bottom', 'footer'].includes(normalized)) return 'bottom'
  if (normalized === 'default') return 'default'
  return undefined
}

const mapLegacyWorkflowStatus = (
  value?: string | null,
): 'draft' | 'inReview' | 'needsRevision' | 'approved' | 'published' | undefined => {
  if (!value) return undefined
  const normalized = value.trim().toLowerCase()
  if (['approved', 'ready', 'done'].includes(normalized)) return 'approved'
  if (['needsrevision', 'needs-revision', 'changes', 'revise'].includes(normalized)) return 'needsRevision'
  if (['inreview', 'review', 'pending'].includes(normalized)) return 'inReview'
  if (['published', 'live'].includes(normalized)) return 'published'
  if (['draft', 'new'].includes(normalized)) return 'draft'
  return undefined
}

async function migrateLegacySponsorshipFields() {
  const legacyReviews = await client.fetch(
    `*[_type == "review" && (
        defined(sponsorshipEnabled) ||
        defined(sponsorshipType) ||
        defined(sponsorBadgeSettings) ||
        defined(sponsor) ||
        defined(status)
      )]{
        _id,
        sponsorshipEnabled,
        sponsorshipType,
        sponsor,
        sponsorBadgeSettings,
        status,
        sponsorship,
        publishStatus
      }`
  )

  if (!legacyReviews.length) {
    console.log('✅ No legacy sponsorship fields found. Nothing to migrate.')
    return
  }

  console.log(`🔄 Migrating ${legacyReviews.length} review document(s) to the new sponsorship schema...`)

  for (const review of legacyReviews) {
    const setPayload: Record<string, unknown> = {}
    const unsetFields: string[] = []

    let sponsorshipTouched = false
    const nextSponsorship: Record<string, unknown> = {...(review.sponsorship || {})}

    const legacyEnabled = normalizeBoolean(review.sponsorshipEnabled)
    if (typeof legacyEnabled !== 'undefined' && nextSponsorship.enabled !== legacyEnabled) {
      nextSponsorship.enabled = legacyEnabled
      sponsorshipTouched = true
    }

    if (!nextSponsorship.sponsor && review.sponsor) {
      nextSponsorship.sponsor = review.sponsor
      sponsorshipTouched = true
    }

    const legacyType = mapLegacyType(review.sponsorshipType)
    if (legacyType && nextSponsorship.type !== legacyType) {
      nextSponsorship.type = legacyType
      sponsorshipTouched = true
    }

    const legacyPlacement = mapBadgePlacement(review.sponsorBadgeSettings?.placement)
    if (legacyPlacement && nextSponsorship.badgePlacement !== legacyPlacement) {
      nextSponsorship.badgePlacement = legacyPlacement
      sponsorshipTouched = true
    }

    if (sponsorshipTouched) {
      if (typeof nextSponsorship.enabled === 'undefined') {
        nextSponsorship.enabled = false
      }
      if (!nextSponsorship.badgePlacement) {
        nextSponsorship.badgePlacement = 'default'
      }
      setPayload.sponsorship = nextSponsorship
    }

    const mappedWorkflowStatus = mapLegacyWorkflowStatus(review.status)
    if (mappedWorkflowStatus && review.publishStatus !== mappedWorkflowStatus) {
      setPayload.publishStatus = mappedWorkflowStatus
    }

    if (typeof review.sponsorshipEnabled !== 'undefined') unsetFields.push('sponsorshipEnabled')
    if (typeof review.sponsorshipType !== 'undefined') unsetFields.push('sponsorshipType')
    if (typeof review.sponsor !== 'undefined') unsetFields.push('sponsor')
    if (typeof review.sponsorBadgeSettings !== 'undefined') unsetFields.push('sponsorBadgeSettings')
    if (typeof review.status !== 'undefined') unsetFields.push('status')

    if (!Object.keys(setPayload).length && !unsetFields.length) {
      console.log(`ℹ️  ${review._id}: already up to date, skipping.`)
      continue
    }

    let patch = client.patch(review._id)
    if (Object.keys(setPayload).length) {
      patch = patch.set(setPayload)
    }
    if (unsetFields.length) {
      patch = patch.unset(unsetFields)
    }

    await patch.commit()

    console.log(`✅ ${review._id}: migrated legacy sponsorship fields`)
  }

  console.log('🎉 Migration complete!')
}

migrateLegacySponsorshipFields().catch((error) => {
  console.error('❌ Migration failed:', error)
  process.exit(1)
})
