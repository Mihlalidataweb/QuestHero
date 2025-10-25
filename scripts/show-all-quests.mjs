import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or a Supabase key (.env).');
  process.exit(1);
}

const supabase = createClient(url, key);

async function showAllQuests() {
  try {
    const { data: quests, error } = await supabase
      .from('quests')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching quests:', error);
      return;
    }

    console.log(`=== All Quests (${quests?.length || 0}) ===\n`);

    if (!quests || quests.length === 0) {
      console.log('No quests found in database.');
      return;
    }

    quests.forEach((quest, index) => {
      console.log(`🎯 Quest #${index + 1}: ${quest.title}`);
      console.log(`   ID: ${quest.id}`);
      console.log(`   Description: ${quest.description}`);
      console.log(`   Category: ${quest.category}`);
      console.log(`   Difficulty: ${quest.difficulty}`);
      console.log(`   XP Reward: ${quest.xp_reward}`);
      console.log(`   USDC Reward: ${quest.usdc_reward || 'None'}`);
      console.log(`   Voucher Reward: ${quest.voucher_reward || 'None'}`);
      console.log(`   Duration: ${quest.duration}`);
      console.log(`   Participants: ${quest.participants || 0}`);
      console.log(`   Max Participants: ${quest.max_participants || 'Unlimited'}`);
      console.log(`   Created By: ${quest.created_by}`);
      console.log(`   Status: ${quest.status}`);
      console.log(`   Tier: ${quest.tier}`);
      console.log(`   Requirements: ${JSON.stringify(quest.requirements)}`);
      console.log(`   Verification: ${quest.verification_method}`);
      console.log(`   Start Date: ${quest.start_date}`);
      console.log(`   End Date: ${quest.end_date}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

showAllQuests();