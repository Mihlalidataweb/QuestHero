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

  // Get all users with detailed information
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .order('xp', { ascending: false })

  if (usersError) {
    console.error('Error fetching users:', usersError.message)
    process.exit(1)
  }

  if (!users || users.length === 0) {
    console.log('No users found in the database.')
    process.exit(0)
  }

  console.log(`=== User Details ===`)
  console.log(`Total users: ${users.length}\n`)

  users.forEach((user, index) => {
    console.log(`👤 User #${index + 1}: ${user.username}`)
    console.log(`   ID: ${user.id}`)
    console.log(`   XP: ${user.xp || 0}`)
    console.log(`   Level: ${user.level || 1}`)
    console.log(`   Rank: #${user.rank || 'N/A'}`)
    console.log(`   XP to next level: ${user.xp_to_next_level || 'N/A'}`)
    console.log(`   Tier: ${user.tier || 'bronze'}`)
    console.log(`   Streak: ${user.streak || 0} days`)
    console.log(`   Reward Points: ${user.reward_points || 0}`)
    console.log(`   Wallet: ${user.wallet_address || 'Not connected'}`)
    console.log(`   Created: ${user.created_at || 'N/A'}`)
    console.log(`   Last Login: ${user.last_login || 'N/A'}`)
    console.log('')
  })
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})