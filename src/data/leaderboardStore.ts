import { supabase } from '@/services/supabaseClient';
import apiClient from '@/services/api'

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  completedQuests: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  streak: number;
  usdcEarned?: number;
  badges?: string[];
  joinedDate?: Date;
}

const USE_API = import.meta.env.VITE_USE_API === 'true'

class LeaderboardStore {
  private leaderboardData: LeaderboardEntry[] = [
    {
      rank: 1,
      username: 'QuestMaster',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=QuestMaster',
      level: 15,
      xp: 4250,
      completedQuests: 42,
      tier: 'platinum',
      streak: 12,
      usdcEarned: 125.50,
      badges: ['Early Adopter', 'Quest Creator', 'Community Leader'],
      joinedDate: new Date('2024-01-15'),
    },
    {
      rank: 2,
      username: 'EcoWarrior',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EcoWarrior',
      level: 12,
      xp: 3100,
      completedQuests: 31,
      tier: 'gold',
      streak: 8,
      usdcEarned: 89.25,
      badges: ['Environmental Champion', 'Sustainability Expert'],
      joinedDate: new Date('2024-02-01'),
    },
    {
      rank: 3,
      username: 'DataNinja',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DataNinja',
      level: 11,
      xp: 2890,
      completedQuests: 28,
      tier: 'gold',
      streak: 6,
      usdcEarned: 76.80,
      badges: ['Tech Wizard', 'Data Master', 'Python Pro'],
      joinedDate: new Date('2024-01-28'),
    },
    {
      rank: 4,
      username: 'StreetLens',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=StreetLens',
      level: 10,
      xp: 2650,
      completedQuests: 25,
      tier: 'gold',
      streak: 5,
      usdcEarned: 68.40,
      badges: ['Creative Vision', 'Photography Expert', 'Urban Explorer'],
      joinedDate: new Date('2024-02-10'),
    },
    {
      rank: 5,
      username: 'GreenThumb',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GreenThumb',
      level: 9,
      xp: 2420,
      completedQuests: 22,
      tier: 'silver',
      streak: 4,
      usdcEarned: 58.90,
      badges: ['Community Builder', 'Garden Master', 'Social Impact'],
      joinedDate: new Date('2024-02-15'),
    },
    {
      rank: 6,
      username: 'MindfulMover',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MindfulMover',
      level: 8,
      xp: 2180,
      completedQuests: 20,
      tier: 'silver',
      streak: 7,
      usdcEarned: 52.30,
      badges: ['Wellness Warrior', 'Mindfulness Master', 'Consistency King'],
      joinedDate: new Date('2024-02-20'),
    },
    {
      rank: 7,
      username: 'LocalHero',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LocalHero',
      level: 7,
      xp: 1950,
      completedQuests: 18,
      tier: 'silver',
      streak: 3,
      usdcEarned: 45.75,
      badges: ['Community Supporter', 'Local Champion', 'Business Booster'],
      joinedDate: new Date('2024-02-25'),
    },
    {
      rank: 8,
      username: 'NatureLover',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NatureLover',
      level: 6,
      xp: 1720,
      completedQuests: 16,
      tier: 'silver',
      streak: 2,
      usdcEarned: 38.60,
      badges: ['Digital Detox', 'Nature Explorer', 'Mindful Living'],
      joinedDate: new Date('2024-03-01'),
    },
    {
      rank: 9,
      username: 'GlobalChef',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GlobalChef',
      level: 6,
      xp: 1680,
      completedQuests: 15,
      tier: 'bronze',
      streak: 4,
      usdcEarned: 34.20,
      badges: ['Culinary Artist', 'Cultural Explorer', 'Recipe Master'],
      joinedDate: new Date('2024-03-05'),
    },
    {
      rank: 10,
      username: 'FitnessFanatic',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FitnessFanatic',
      level: 5,
      xp: 1450,
      completedQuests: 14,
      tier: 'bronze',
      streak: 6,
      usdcEarned: 29.80,
      badges: ['Fitness Guru', 'Morning Warrior', 'Health Champion'],
      joinedDate: new Date('2024-03-08'),
    },
    {
      rank: 11,
      username: 'ArtisticSoul',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ArtisticSoul',
      level: 5,
      xp: 1320,
      completedQuests: 12,
      tier: 'bronze',
      streak: 2,
      usdcEarned: 26.40,
      badges: ['Creative Genius', 'Digital Artist', 'Visual Storyteller'],
      joinedDate: new Date('2024-03-12'),
    },
    {
      rank: 12,
      username: 'TechPioneer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechPioneer',
      level: 4,
      xp: 1180,
      completedQuests: 11,
      tier: 'bronze',
      streak: 3,
      usdcEarned: 22.90,
      badges: ['Innovation Leader', 'Code Warrior', 'Tech Explorer'],
      joinedDate: new Date('2024-03-15'),
    },
    {
      rank: 13,
      username: 'SocialButterfly',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SocialButterfly',
      level: 4,
      xp: 1050,
      completedQuests: 10,
      tier: 'bronze',
      streak: 1,
      usdcEarned: 19.50,
      badges: ['Community Connector', 'Kindness Ambassador', 'Social Impact'],
      joinedDate: new Date('2024-03-18'),
    },
    {
      rank: 14,
      username: 'LearningLegend',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LearningLegend',
      level: 3,
      xp: 920,
      completedQuests: 9,
      tier: 'bronze',
      streak: 2,
      usdcEarned: 16.80,
      badges: ['Knowledge Seeker', 'Skill Builder', 'Growth Mindset'],
      joinedDate: new Date('2024-03-20'),
    },
    {
      rank: 15,
      username: 'WellnessWarrior',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WellnessWarrior',
      level: 3,
      xp: 780,
      completedQuests: 8,
      tier: 'bronze',
      streak: 5,
      usdcEarned: 14.20,
      badges: ['Health Advocate', 'Balance Master', 'Self Care Champion'],
      joinedDate: new Date('2024-03-22'),
    }
  ];

  // Real-time database integration methods
  private async syncWithDatabase() {
    if (!USE_API) {
      try {
        // Sync leaderboard data to database
        for (const entry of this.leaderboardData) {
          await this.upsertLeaderboardEntry(entry);
        }
        
        console.log('✅ Successfully synced leaderboard data to database');
      } catch (error) {
        console.error('❌ Error syncing leaderboard to database:', error);
      }
    }
  }

  private async upsertLeaderboardEntry(entry: LeaderboardEntry) {
    const { error } = await supabase
      .from('leaderboard_entries')
      .upsert({
        rank: entry.rank,
        username: entry.username,
        avatar: entry.avatar,
        level: entry.level,
        xp: entry.xp,
        completed_quests: entry.completedQuests,
        tier: entry.tier,
        streak: entry.streak,
        usdc_earned: entry.usdcEarned || 0,
        badges: entry.badges || [],
        joined_date: entry.joinedDate || new Date(),
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
  }

  // Real-time subscription setup
  private setupRealtimeSubscriptions() {
    if (!USE_API) {
      // Subscribe to leaderboard changes
      supabase
        .channel('leaderboard-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'leaderboard_entries' },
          (payload) => {
            console.log('Leaderboard updated:', payload);
            this.handleLeaderboardUpdate(payload);
          }
        )
        .subscribe();
    }
  }

  private handleLeaderboardUpdate(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        this.leaderboardData.push(this.transformDbEntryToLeaderboardEntry(newRecord));
        this.sortLeaderboard();
        break;
      case 'UPDATE':
        const entryIndex = this.leaderboardData.findIndex(e => e.rank === newRecord.rank);
        if (entryIndex !== -1) {
          this.leaderboardData[entryIndex] = this.transformDbEntryToLeaderboardEntry(newRecord);
          this.sortLeaderboard();
        }
        break;
      case 'DELETE':
        this.leaderboardData = this.leaderboardData.filter(e => e.rank !== oldRecord.rank);
        this.reorderRanks();
        break;
    }
  }

  private transformDbEntryToLeaderboardEntry(dbEntry: any): LeaderboardEntry {
    return {
      rank: dbEntry.rank,
      username: dbEntry.username,
      avatar: dbEntry.avatar,
      level: dbEntry.level,
      xp: dbEntry.xp,
      completedQuests: dbEntry.completed_quests,
      tier: dbEntry.tier,
      streak: dbEntry.streak,
      usdcEarned: dbEntry.usdc_earned,
      badges: dbEntry.badges,
      joinedDate: new Date(dbEntry.joined_date),
    };
  }

  private sortLeaderboard() {
    this.leaderboardData.sort((a, b) => {
      // Primary sort by XP (descending)
      if (b.xp !== a.xp) return b.xp - a.xp;
      // Secondary sort by completed quests (descending)
      if (b.completedQuests !== a.completedQuests) return b.completedQuests - a.completedQuests;
      // Tertiary sort by streak (descending)
      return b.streak - a.streak;
    });
    this.reorderRanks();
  }

  private reorderRanks() {
    this.leaderboardData.forEach((entry, index) => {
      entry.rank = index + 1;
    });
  }

  // Initialize store with database sync and real-time subscriptions
  async initialize() {
    await this.syncWithDatabase();
    this.setupRealtimeSubscriptions();
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    if (USE_API) {
      const response = await apiClient.get('/leaderboard')
      return response.data as LeaderboardEntry[]
    }
    
    // Load from database if not using API
    try {
      const { data, error } = await supabase
        .from('leaderboard_entries')
        .select('*')
        .order('rank', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map((row: any) => this.transformDbEntryToLeaderboardEntry(row));
      }
    } catch (error) {
      console.error('Error loading leaderboard from database:', error);
    }

    // Fallback to in-memory data
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.leaderboardData]), 300);
    });
  }

  async getWeeklyLeaderboard(): Promise<LeaderboardEntry[]> {
    if (USE_API) {
      const response = await apiClient.get('/leaderboard/weekly')
      return response.data as LeaderboardEntry[]
    }
    
    // For mock data, return top 10 with adjusted XP for weekly context
    const weeklyData = this.leaderboardData.slice(0, 10).map((entry, index) => ({
      ...entry,
      rank: index + 1,
      xp: Math.floor(entry.xp * 0.3), // Simulate weekly XP
      completedQuests: Math.floor(entry.completedQuests * 0.2), // Weekly quests
    }));
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(weeklyData), 300);
    });
  }

  async getMonthlyLeaderboard(): Promise<LeaderboardEntry[]> {
    if (USE_API) {
      const response = await apiClient.get('/leaderboard/monthly')
      return response.data as LeaderboardEntry[]
    }
    
    // For mock data, return top 15 with adjusted XP for monthly context
    const monthlyData = this.leaderboardData.slice(0, 15).map((entry, index) => ({
      ...entry,
      rank: index + 1,
      xp: Math.floor(entry.xp * 0.8), // Simulate monthly XP
      completedQuests: Math.floor(entry.completedQuests * 0.6), // Monthly quests
    }));
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(monthlyData), 300);
    });
  }

  // Method to update user's leaderboard position in real-time
  async updateUserPosition(username: string, newXp: number, newCompletedQuests: number) {
    const userIndex = this.leaderboardData.findIndex(entry => entry.username === username);
    
    if (userIndex !== -1) {
      this.leaderboardData[userIndex].xp = newXp;
      this.leaderboardData[userIndex].completedQuests = newCompletedQuests;
      
      // Update in database if not using API
      if (!USE_API) {
        try {
          await this.upsertLeaderboardEntry(this.leaderboardData[userIndex]);
        } catch (error) {
          console.error('Error updating user position in database:', error);
        }
      }
      
      this.sortLeaderboard();
    }
  }
}

export const leaderboardStore = new LeaderboardStore();