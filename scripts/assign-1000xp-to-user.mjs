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

  // Get command line arguments
  const args = process.argv.slice(2)
  const userIdentifier = args[0] // Can be username, user ID, or wallet address pattern

  if (!userIdentifier) {
    console.log('Usage: node assign-1000xp-to-user.mjs <username|user_id|wallet_pattern>')
    console.log('Examples:')
    console.log('  node assign-1000xp-to-user.mjs ProfileTestUser')
    console.log('  node assign-1000xp-to-user.mjs c6e8db39-dd93-469f-8295-1e8d96741371')
    console.log('  node assign-1000xp-to-user.mjs 0xfeB0')
    process.exit(1)
  }

  console.log(`🔍 Searching for user: ${userIdentifier}`)

  let user = null

  // Try to find user by different methods
  // 1. Try by username
  const { data: userByUsername } = await supabase
    .from('users')
    .select('*')
    .eq('username', userIdentifier)
    .single()

  if (userByUsername) {
    user = userByUsername
    console.log(`✅ Found user by username: ${user.username}`)
  } else {
    // 2. Try by user ID
    const { data: userById } = await supabase
      .from('users')
      .select('*')
      .eq('id', userIdentifier)
      .single()

    if (userById) {
      user = userById
      console.log(`✅ Found user by ID: ${user.username}`)
    } else {
      // 3. Try by wallet address pattern (if user_wallets table exists)
      try {
        const { data: walletData } = await supabase
          .from('user_wallets')
          .select(`
            wallet_address,
            users!inner(*)
          `)
          .like('wallet_address', `${userIdentifier}%`)

        if (walletData && walletData.length > 0) {
          user = {
            ...walletData[0].users,
            wallet_address: walletData[0].wallet_address
          }
          console.log(`✅ Found user by wallet pattern: ${user.username} (${user.wallet_address})`)
        }
      } catch (err) {
        console.log('💡 user_wallets table not available, skipping wallet search')
      }
    }
  }

  if (!user) {
    console.log(`❌ No user found matching: ${userIdentifier}`)
    console.log('💡 Make sure the user exists in the database.')
    process.exit(0)
  }

  console.log(`\n👤 User Details:`)
  console.log(`   Username: ${user.username}`)
  console.log(`   ID: ${user.id}`)
  console.log(`   Current XP: ${user.xp || 0}`)
  console.log(`   Current Level: ${user.level || 1}`)
  if (user.wallet_address) {
    console.log(`   Wallet: ${user.wallet_address}`)
  }

  // Calculate new XP and level
  const currentXP = user.xp || 0
  const bonusXP = 1000
  const newXP = currentXP + bonusXP
  const newLevel = Math.floor(newXP / 1000) + 1
  const xpToNextLevel = (newLevel * 1000) - newXP

  console.log(`\n🎁 Assigning ${bonusXP} XP bonus...`)
  console.log(`   New XP: ${newXP}`)
  console.log(`   New Level: ${newLevel}`)
  console.log(`   XP to next level: ${xpToNextLevel}`)

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

  // Record XP transaction
  try {
    const { error: transactionError } = await supabase
      .from('xp_transactions')
      .insert({
        user_id: user.id,
        username: user.username,
        transaction_type: 'signup_bonus',
        amount: bonusXP,
        description: `Special 1000 XP bonus assigned manually`
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

  console.log(`\n🎉 Successfully updated user!`)
  console.log(`📊 Final Stats:`)
  console.log(`   User: ${user.username}`)
  if (user.wallet_address) {
    console.log(`   Wallet: ${user.wallet_address}`)
  }
  console.log(`   XP: ${newXP}`)
  console.log(`   Level: ${newLevel}`)
  console.log(`   Rank: #${newRank}`)
  console.log(`   XP to next level: ${xpToNextLevel}`)
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})