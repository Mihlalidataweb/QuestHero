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

  const { count, error } = await supabase
    .from('quests')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('Error fetching quest count:', error.message)
    process.exit(1)
  }

  console.log(`Quest count: ${count ?? 0}`)
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})