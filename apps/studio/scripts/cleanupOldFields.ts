/**
 * Migration script to remove deprecated fields from review documents
 * 
 * Removes:
 * - exhibition (replaced by externalExhibition)
 * - sponsorBadgeSettings (replaced by sponsorship.badgeSettings)
 * - sponsorshipEnabled (replaced by sponsorship.enabled)
 * - status (replaced by publishStatus)
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient()

const BATCH_SIZE = 100

async function cleanupOldFields() {
  console.log('🧹 Starting cleanup of deprecated fields from review documents...\n')

  // Fetch all review documents with old fields
  const query = `*[_type == "review" && (
    defined(exhibition) || 
    defined(sponsorBadgeSettings) || 
    defined(sponsorshipEnabled) || 
    defined(status)
  )][0...${BATCH_SIZE}]{
    _id,
    _type,
    title,
    exhibition,
    sponsorBadgeSettings,
    sponsorshipEnabled,
    status
  }`

  const documents = await client.fetch(query)

  if (documents.length === 0) {
    console.log('✅ No documents found with deprecated fields. All clean!')
    return
  }

  console.log(`📊 Found ${documents.length} documents with deprecated fields\n`)

  // Create transaction to unset old fields
  const transaction = client.transaction()

  documents.forEach((doc: any) => {
    console.log(`🔧 Cleaning: ${doc.title || doc._id}`)
    
    const fieldsToUnset: string[] = []
    
    if (doc.exhibition) {
      fieldsToUnset.push('exhibition')
      console.log(`   - Removing 'exhibition' field`)
    }
    
    if (doc.sponsorBadgeSettings) {
      fieldsToUnset.push('sponsorBadgeSettings')
      console.log(`   - Removing 'sponsorBadgeSettings' field`)
    }
    
    if (doc.sponsorshipEnabled) {
      fieldsToUnset.push('sponsorshipEnabled')
      console.log(`   - Removing 'sponsorshipEnabled' field`)
    }
    
    if (doc.status) {
      fieldsToUnset.push('status')
      console.log(`   - Removing 'status' field`)
    }

    if (fieldsToUnset.length > 0) {
      transaction.patch(doc._id, (patch) => patch.unset(fieldsToUnset))
    }
  })

  console.log('\n💾 Committing changes...')
  
  try {
    await transaction.commit()
    console.log('✅ Successfully cleaned up deprecated fields!')
    console.log(`\n📊 Processed ${documents.length} documents`)
  } catch (error) {
    console.error('❌ Failed to commit changes:', error)
    throw error
  }

  // Check if there are more documents to process
  if (documents.length === BATCH_SIZE) {
    console.log('\n⚠️ There might be more documents to process. Run the script again.')
  }
}

cleanupOldFields()
  .then(() => {
    console.log('\n🎉 Cleanup completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Cleanup failed:', error)
    process.exit(1)
  })
