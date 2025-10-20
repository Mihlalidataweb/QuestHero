import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or a Supabase key (.env).');
  process.exit(1);
}
const supabase = createClient(url, key);

// --- Mock data (derived from your in-memory stores) ---
const users = [
  {
    username: 'QuestHero',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=QuestHero',
    level: 12,
    xp: 3450,
    xp_to_next_level: 5000,
    tier: 'gold',
    total_quests: 47,
    completed_quests: 38,
    streak: 7,
    rank: 156,
    badges: ['Early Adopter', 'Fitness Fanatic', 'Social Butterfly', 'Learning Legend'],
    usdc_balance: 125.5,
    credits: 2340,
  },
];

const quests = [
  {
    title: '10K Morning Run Challenge',
    description: 'Complete a 10km run before 9 AM and submit GPS tracking proof',
    category: 'fitness',
    difficulty: 'medium',
    xp_reward: 500,
    usdc_reward: 5,
    voucher_reward: null,
    duration: '1 day',
    participants: 0,
    max_participants: 500,
    created_by: 'FitMaster',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400',
    requirements: ['GPS tracking enabled', 'Complete before 9 AM', 'Minimum pace: 6 min/km'],
    verification_method: 'gps',
    tier: 'silver',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    title: 'Learn 50 New Words in Spanish',
    description: 'Master 50 Spanish vocabulary words and pass the quiz',
    category: 'learning',
    difficulty: 'easy',
    xp_reward: 300,
    usdc_reward: null,
    voucher_reward: 'Duolingo Premium 1 Month',
    duration: '3 days',
    participants: 0,
    max_participants: null,
    created_by: 'LanguagePro',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400',
    requirements: ['Complete vocabulary list', 'Pass quiz with 80%+ score', 'Submit screenshot'],
    verification_method: 'photo',
    tier: 'bronze',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 259200000).toISOString(),
  },
];

const leaderboardEntries = [
  { rank: 1, username: 'LegendaryQuester', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Legend', level: 45, xp: 125000, completed_quests: 342, tier: 'platinum', streak: 89 },
  { rank: 2, username: 'EpicChampion', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Epic', level: 42, xp: 118500, completed_quests: 298, tier: 'platinum', streak: 67 },
  { rank: 3, username: 'QuestMaster3000', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Master', level: 40, xp: 112000, completed_quests: 276, tier: 'platinum', streak: 54 },
  { rank: 4, username: 'AdventureSeeker', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adventure', level: 38, xp: 105000, completed_quests: 245, tier: 'gold', streak: 43 },
  { rank: 5, username: 'ChallengeAccepted', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Challenge', level: 36, xp: 98000, completed_quests: 223, tier: 'gold', streak: 38 },
];

async function upsertUsers() {
  for (const u of users) {
    const { error } = await supabase.from('users').upsert(u, { onConflict: 'username' });
    if (error) throw error;
  }
}

async function insertQuests() {
  if (!quests.length) return;
  const { error } = await supabase.from('quests').insert(quests);
  if (error) throw error;
}

async function insertLeaderboard() {
  if (!leaderboardEntries.length) return;
  const { error } = await supabase.from('leaderboard_entries').insert(leaderboardEntries);
  if (error) throw error;
}

async function main() {
  await upsertUsers();
  await insertQuests();
  await insertLeaderboard();
  console.log('✅ Seed complete.');
}

main().catch((e) => {
  console.error('❌ Seed failed', e);
  process.exit(1);
});