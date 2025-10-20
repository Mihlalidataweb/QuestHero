import { supabase } from '@/services/supabaseClient';

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  completedQuests: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  streak: number;
}

class LeaderboardStore {
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .order('rank', { ascending: true });

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return []; // Return empty array on error
    }

    return (data || []).map((row: any) => ({
      rank: row.rank,
      username: row.username,
      avatar: row.avatar,
      level: row.level,
      xp: row.xp,
      completedQuests: row.completed_quests,
      tier: row.tier,
      streak: row.streak,
    }));
  }
}

export const leaderboardStore = new LeaderboardStore();