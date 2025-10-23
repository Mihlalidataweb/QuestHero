import { supabase } from './supabaseClient';

export interface User {
  id: string;
  username: string;
  avatar?: string;
  level: number;
  xp: number;
  xp_to_next_level: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  total_quests: number;
  completed_quests: number;
  streak: number;
  rank: number;
  badges: any[];
  usdc_balance: number;
  credits: number;
  reward_points: number;
  wallet_address?: string;
  created_at: string;
  last_login?: string;
}

export interface XPTransaction {
  id: string;
  user_id: string;
  username: string;
  transaction_type: 'signup_bonus' | 'quest_creation_fee' | 'quest_join_fee' | 'quest_completion_reward' | 'quest_creation_refund';
  amount: number;
  quest_id?: string;
  description?: string;
  created_at: string;
}

export interface QuestParticipant {
  id: string;
  quest_id: string;
  user_id: string;
  username: string;
  joined_at: string;
  status: 'joined' | 'submitted' | 'completed' | 'failed';
  evidence_submitted: boolean;
}

class UserService {
  // Register new user with wallet address and signup bonus
  async registerUser(walletAddress: string): Promise<User> {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (existingUser) {
        return existingUser;
      }

      // Call the database function to register user with bonus
      const { data, error } = await supabase.rpc('register_user_with_bonus', {
        wallet_addr: walletAddress
      });

      if (error) throw error;

      // Fetch the newly created user
      const { data: newUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data)
        .single();

      if (fetchError) throw fetchError;

      return newUser;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  // Get user by wallet address
  async getUserByWallet(walletAddress: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      return data;
    } catch (error) {
      console.error('Error fetching user by wallet:', error);
      return null;
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  }

  // Update user XP and reward points
  async updateUserPoints(userId: string, xpChange: number, rewardPointsChange: number): Promise<void> {
    try {
      // Get current user data
      const { data: currentUser, error: fetchError } = await supabase
        .from('users')
        .select('xp, reward_points')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      // Update with new values
      const { error } = await supabase
        .from('users')
        .update({
          xp: (currentUser.xp || 0) + xpChange,
          reward_points: (currentUser.reward_points || 0) + rewardPointsChange
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user points:', error);
      throw error;
    }
  }

  // Record XP transaction
  async recordXPTransaction(
    userId: string,
    username: string,
    type: XPTransaction['transaction_type'],
    amount: number,
    questId?: string,
    description?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('xp_transactions')
        .insert({
          user_id: userId,
          username,
          transaction_type: type,
          amount,
          quest_id: questId,
          description
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error recording XP transaction:', error);
      throw error;
    }
  }

  // Get user's XP transaction history
  async getUserXPTransactions(userId: string): Promise<XPTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('xp_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching XP transactions:', error);
      return [];
    }
  }

  // Join a quest (with fee deduction)
  async joinQuest(userId: string, username: string, questId: string, joinFee: number): Promise<void> {
    try {
      // Check if user has enough reward points
      const user = await this.getUserById(userId);
      if (!user || user.reward_points < joinFee) {
        throw new Error('Insufficient reward points to join quest');
      }

      // Start transaction
      const { error: participantError } = await supabase
        .from('quest_participants')
        .insert({
          quest_id: questId,
          user_id: userId,
          username,
          status: 'joined'
        });

      if (participantError) throw participantError;

      // Deduct reward points
      await this.updateUserPoints(userId, 0, -joinFee);

      // Record transaction
      await this.recordXPTransaction(
        userId,
        username,
        'quest_join_fee',
        -joinFee,
        questId,
        'Fee for joining quest'
      );

      // Update quest participants count
      const { data: currentQuest, error: fetchQuestError } = await supabase
        .from('quests')
        .select('participants')
        .eq('id', questId)
        .single();

      if (fetchQuestError) throw fetchQuestError;

      const { error: questError } = await supabase
        .from('quests')
        .update({
          participants: (currentQuest.participants || 0) + 1
        })
        .eq('id', questId);

      if (questError) throw questError;

    } catch (error) {
      console.error('Error joining quest:', error);
      throw error;
    }
  }

  // Get user's quest participations
  async getUserQuestParticipations(userId: string): Promise<QuestParticipant[]> {
    try {
      const { data, error } = await supabase
        .from('quest_participants')
        .select('*')
        .eq('user_id', userId)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching quest participations:', error);
      return [];
    }
  }

  // Submit evidence for a quest
  async submitQuestEvidence(userId: string, questId: string, evidence: string): Promise<void> {
    try {
      // Update participant status
      const { error: participantError } = await supabase
        .from('quest_participants')
        .update({
          status: 'submitted',
          evidence_submitted: true
        })
        .eq('user_id', userId)
        .eq('quest_id', questId);

      if (participantError) throw participantError;

      // Create submission record
      const { error: submissionError } = await supabase
        .from('submissions')
        .insert({
          quest_id: questId,
          user_id: userId,
          evidence,
          status: 'pending'
        });

      if (submissionError) throw submissionError;

    } catch (error) {
      console.error('Error submitting quest evidence:', error);
      throw error;
    }
  }

  // Check if user has joined a specific quest
  async hasUserJoinedQuest(userId: string, questId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('quest_participants')
        .select('id')
        .eq('user_id', userId)
        .eq('quest_id', questId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking quest participation:', error);
      return false;
    }
  }

  // Get quest participation status
  async getQuestParticipationStatus(userId: string, questId: string): Promise<QuestParticipant | null> {
    try {
      const { data, error } = await supabase
        .from('quest_participants')
        .select('*')
        .eq('user_id', userId)
        .eq('quest_id', questId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching quest participation status:', error);
      return null;
    }
  }

  // Update user streak based on login activity
  async updateUserStreak(userId: string): Promise<void> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return;

      const now = new Date();
       const lastLogin = user.last_login ? new Date(user.last_login) : new Date();
       const daysDiff = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

       let newStreak = user.streak || 0;
       
       if (daysDiff === 1) {
         // Consecutive day login
         newStreak += 1;
       } else if (daysDiff > 1) {
         // Streak broken
         newStreak = 1;
       }
       // If daysDiff === 0, it's the same day, keep current streak

       const { error } = await supabase
         .from('users')
         .update({ 
           streak: newStreak,
           last_login: now.toISOString()
         })
         .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user streak:', error);
      throw error;
    }
  }

  // Calculate and update user rank based on XP
  async calculateUserRank(userId: string): Promise<number> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return 0;

      // Get count of users with higher XP
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gt('xp', user.xp);

      if (error) throw error;

      const rank = (count || 0) + 1;

      // Update user's rank in database
      const { error: updateError } = await supabase
        .from('users')
        .update({ rank })
        .eq('id', userId);

      if (updateError) throw updateError;

      return rank;
    } catch (error) {
      console.error('Error calculating user rank:', error);
      return 0;
    }
  }

  // Update user level based on XP
  async updateUserLevel(userId: string): Promise<void> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return;

      // Simple level calculation: level = floor(XP / 1000) + 1
      const newLevel = Math.floor(user.xp / 1000) + 1;
      const xpToNextLevel = (newLevel * 1000) - user.xp;

      const { error } = await supabase
        .from('users')
        .update({ 
          level: newLevel,
          xp_to_next_level: xpToNextLevel
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user level:', error);
      throw error;
    }
  }
}

export const userService = new UserService();