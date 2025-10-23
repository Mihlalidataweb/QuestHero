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

  // Get the first user (the signed-in user)
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1)

  if (usersError) {
    console.error('Error fetching users:', usersError.message)
    process.exit(1)
  }

  if (!users || users.length === 0) {
    console.log('No users found in the database.')
    process.exit(0)
  }

  const user = users[0]
  console.log(`Found user: ${user.username} (ID: ${user.id})`)
  console.log(`Current XP: ${user.xp || 0}`)
  console.log(`Current Level: ${user.level || 1}`)

  // Calculate new XP and level
  const currentXP = user.xp || 0
  const newXP = currentXP + 400
  const newLevel = Math.floor(newXP / 1000) + 1
  const xpToNextLevel = (newLevel * 1000) - newXP

  console.log(`\nAssigning 400 XP...`)
  console.log(`New XP: ${newXP}`)
  console.log(`New Level: ${newLevel}`)
  console.log(`XP to next level: ${xpToNextLevel}`)

  // Update user XP and level
  const { error: updateError } = await supabase
    .from('users')
    .update({
      xp: newXP,
      level: newLevel,
      xp_to_next_level: xpToNextLevel
    })
    .eq('id', user.id)

  if (updateError) {
    console.error('Error updating user:', updateError.message)
    process.exit(1)
  }

  // Try to record XP transaction (optional if table exists)
  try {
    const { error: transactionError } = await supabase
      .from('xp_transactions')
      .insert({
        user_id: user.id,
        username: user.username,
        transaction_type: 'signup_bonus',
        amount: 400,
        description: 'Manual XP assignment - 400 XP bonus'
      })

    if (transactionError) {
      console.log('⚠️  XP transaction table not found - skipping transaction record')
    } else {
      console.log('💾 XP transaction recorded')
    }
  } catch (err) {
    console.log('⚠️  XP transaction table not available - skipping transaction record')
  }

  // Calculate and update rank
  const { count: higherXPUsers, error: rankError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gt('xp', newXP)

  if (rankError) {
    console.error('Error calculating rank:', rankError.message)
    process.exit(1)
  }

  const newRank = (higherXPUsers || 0) + 1

  // Update rank
  const { error: rankUpdateError } = await supabase
    .from('users')
    .update({ rank: newRank })
    .eq('id', user.id)

  if (rankUpdateError) {
    console.error('Error updating rank:', rankUpdateError.message)
    process.exit(1)
  }

  console.log(`\n✅ Successfully updated user!`)
  console.log(`📊 Final Stats:`)
  console.log(`   XP: ${newXP}`)
  console.log(`   Level: ${newLevel}`)
  console.log(`   Rank: #${newRank}`)
  console.log(`   XP to next level: ${xpToNextLevel}`)
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})