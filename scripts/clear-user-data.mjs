import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

async function main() {
  if (!url || !key) {
    console.error('Missing Supabase credentials. Ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY) are set.')
    process.exit(1)
  }

  const supabase = createClient(url, key)

  console.log('🧹 Clearing all existing user data...')

  try {
    // Clear votes first (has foreign key dependencies)
    const { error: votesError } = await supabase
      .from('votes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (votesError) {
      console.error('Error clearing votes:', votesError.message)
    } else {
      console.log('✅ Cleared all votes')
    }

    // Clear submissions (has foreign key dependencies)
    const { error: submissionsError } = await supabase
      .from('submissions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (submissionsError) {
      console.error('Error clearing submissions:', submissionsError.message)
    } else {
      console.log('✅ Cleared all submissions')
    }

    // Clear quests
    const { error: questsError } = await supabase
      .from('quests')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (questsError) {
      console.error('Error clearing quests:', questsError.message)
    } else {
      console.log('✅ Cleared all quests')
    }

    // Clear leaderboard entries
    const { error: leaderboardError } = await supabase
      .from('leaderboard_entries')
      .delete()
      .neq('id', 0) // Delete all

    if (leaderboardError) {
      console.error('Error clearing leaderboard:', leaderboardError.message)
    } else {
      console.log('✅ Cleared all leaderboard entries')
    }

    // Clear users
    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (usersError) {
      console.error('Error clearing users:', usersError.message)
    } else {
      console.log('✅ Cleared all users')
    }

    console.log('🎉 All user data cleared successfully!')
    console.log('📊 Database is now ready for the enhanced user system implementation.')

  } catch (error) {
    console.error('Unexpected error during data clearing:', error)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})