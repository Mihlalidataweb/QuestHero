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

  // Count total users
  const { count: totalUsers, error: usersError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  if (usersError) {
    console.error('Error fetching user count:', usersError.message)
    process.exit(1)
  }

  // Count XP transactions to see activity
  const { count: xpTransactions, error: xpError } = await supabase
    .from('xp_transactions')
    .select('*', { count: 'exact', head: true })

  if (xpError) {
    console.error('Error fetching XP transaction count:', xpError.message)
    process.exit(1)
  }

  // Count quest participants
  const { count: questParticipants, error: participantsError } = await supabase
    .from('quest_participants')
    .select('*', { count: 'exact', head: true })

  if (participantsError) {
    console.error('Error fetching quest participants count:', participantsError.message)
    process.exit(1)
  }

  console.log(`=== User Statistics ===`)
  console.log(`Total users signed up: ${totalUsers ?? 0}`)
  console.log(`XP transactions: ${xpTransactions ?? 0}`)
  console.log(`Quest participations: ${questParticipants ?? 0}`)
  
  if (totalUsers > 0) {
    console.log(`Average XP transactions per user: ${((xpTransactions ?? 0) / totalUsers).toFixed(1)}`)
    console.log(`Average quest participations per user: ${((questParticipants ?? 0) / totalUsers).toFixed(1)}`)
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})