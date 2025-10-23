import { supabase } from '@/services/supabaseClient';
import { userService } from '@/services/userService';
import { z } from 'zod';

export type Tier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type Category = 'fitness' | 'learning' | 'social' | 'creative' | 'wellness';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';
export type Verification = 'photo' | 'video' | 'gps' | 'community';
export type QuestStatus = 'active' | 'completed' | 'pending_validation';

export interface EnhancedQuest {
  id: string;
  title: string;
  description: string;
  category: Category;
  difficulty: Difficulty;
  xpReward: number;
  usdcReward?: number;
  voucherReward?: string;
  duration: string;
  participants: number;
  maxParticipants?: number;
  createdBy: string;
  status: QuestStatus;
  image?: string;
  requirements: string[];
  verificationMethod: Verification;
  tier: Tier;
  startDate: Date;
  endDate: Date;
  creatorCost: number;
  joinCost: number;
  createdAt: Date;
}

export interface QuestCreationInput {
  title: string;
  description: string;
  category: Category;
  difficulty: Difficulty;
  xpReward: number;
  usdcReward?: number;
  voucherReward?: string;
  duration: string;
  maxParticipants?: number;
  image?: string;
  requirements: string[];
  verificationMethod: Verification;
  tier: Tier;
  startDate: Date;
  endDate: Date;
}

const QuestCreationSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.enum(['fitness','learning','social','creative','wellness']),
  difficulty: z.enum(['easy','medium','hard','extreme']),
  xpReward: z.number().int().positive(),
  usdcReward: z.number().optional(),
  voucherReward: z.string().optional(),
  duration: z.string(),
  maxParticipants: z.number().int().positive().optional(),
  image: z.string().url().optional(),
  requirements: z.array(z.string()),
  verificationMethod: z.enum(['photo','video','gps','community']),
  tier: z.enum(['bronze','silver','gold','platinum']),
  startDate: z.date(),
  endDate: z.date(),
});

function mapQuestRow(row: any): EnhancedQuest {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    difficulty: row.difficulty,
    xpReward: row.xp_reward,
    usdcReward: row.usdc_reward ?? undefined,
    voucherReward: row.voucher_reward ?? undefined,
    duration: row.duration,
    participants: row.participants ?? 0,
    maxParticipants: row.max_participants ?? undefined,
    createdBy: row.created_by,
    status: row.status,
    image: row.image ?? undefined,
    requirements: Array.isArray(row.requirements) ? row.requirements : [],
    verificationMethod: row.verification_method,
    tier: row.tier,
    startDate: new Date(row.start_date),
    endDate: new Date(row.end_date),
    creatorCost: row.creator_cost ?? 0,
    joinCost: row.join_cost ?? 0,
    createdAt: new Date(row.created_at),
  };
}

class EnhancedQuestService {
  // Get all quests
  async getQuests(): Promise<EnhancedQuest[]> {
    try {
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(mapQuestRow);
    } catch (error) {
      console.error('Error fetching quests:', error);
      return [];
    }
  }

  // Get quest by ID
  async getQuestById(id: string): Promise<EnhancedQuest | null> {
    try {
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data ? mapQuestRow(data) : null;
    } catch (error) {
      console.error('Error fetching quest by ID:', error);
      return null;
    }
  }

  // Create quest with 50% reward points fee
  async createQuest(userId: string, username: string, input: QuestCreationInput): Promise<EnhancedQuest> {
    try {
      // Validate input
      const parsed = QuestCreationSchema.safeParse(input);
      if (!parsed.success) {
        throw new Error(parsed.error.errors.map(e => e.message).join(', '));
      }

      // Get user's current reward points
      const user = await userService.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Calculate creation cost (50% of current reward points)
      const creationCost = Math.floor(user.reward_points * 0.5);
      if (creationCost <= 0) {
        throw new Error('Insufficient reward points to create quest');
      }

      // Calculate join cost (10% of creation cost, minimum 1)
      const joinCost = Math.max(1, Math.floor(creationCost * 0.1));

      // Prepare quest data
      const questData = {
        title: input.title,
        description: input.description,
        category: input.category,
        difficulty: input.difficulty,
        xp_reward: input.xpReward,
        usdc_reward: input.usdcReward,
        voucher_reward: input.voucherReward,
        duration: input.duration,
        participants: 0,
        max_participants: input.maxParticipants,
        created_by: username,
        status: 'active' as QuestStatus,
        image: input.image,
        requirements: input.requirements,
        verification_method: input.verificationMethod,
        tier: input.tier,
        start_date: input.startDate.toISOString(),
        end_date: input.endDate.toISOString(),
        creator_cost: creationCost,
        join_cost: joinCost,
      };

      // Create quest in database
      const { data: questResult, error: questError } = await supabase
        .from('quests')
        .insert(questData)
        .select('*')
        .single();

      if (questError) throw questError;

      // Deduct reward points from creator
      await userService.updateUserPoints(userId, 0, -creationCost);

      // Record transaction
      await userService.recordXPTransaction(
        userId,
        username,
        'quest_creation_fee',
        -creationCost,
        questResult.id,
        `Fee for creating quest: ${input.title}`
      );

      return mapQuestRow(questResult);
    } catch (error) {
      console.error('Error creating quest:', error);
      throw error;
    }
  }

  // Join quest with 10% fee
  async joinQuest(userId: string, username: string, questId: string): Promise<void> {
    try {
      // Get quest details
      const quest = await this.getQuestById(questId);
      if (!quest) {
        throw new Error('Quest not found');
      }

      // Check if quest is full
      if (quest.maxParticipants && quest.participants >= quest.maxParticipants) {
        throw new Error('Quest is full');
      }

      // Check if user already joined
      const hasJoined = await userService.hasUserJoinedQuest(userId, questId);
      if (hasJoined) {
        throw new Error('You have already joined this quest');
      }

      // Join quest using userService (handles fee deduction and transaction recording)
      await userService.joinQuest(userId, username, questId, quest.joinCost);

    } catch (error) {
      console.error('Error joining quest:', error);
      throw error;
    }
  }

  // Submit evidence for quest
  async submitEvidence(userId: string, questId: string, evidence: string): Promise<void> {
    try {
      // Check if user has joined the quest
      const hasJoined = await userService.hasUserJoinedQuest(userId, questId);
      if (!hasJoined) {
        throw new Error('You must join the quest before submitting evidence');
      }

      // Submit evidence using userService
      await userService.submitQuestEvidence(userId, questId, evidence);

    } catch (error) {
      console.error('Error submitting evidence:', error);
      throw error;
    }
  }

  // Get user's quest participation status
  async getUserQuestStatus(userId: string, questId: string) {
    try {
      return await userService.getQuestParticipationStatus(userId, questId);
    } catch (error) {
      console.error('Error getting quest status:', error);
      return null;
    }
  }

  // Get quests created by user
  async getQuestsByCreator(username: string): Promise<EnhancedQuest[]> {
    try {
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('created_by', username)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(mapQuestRow);
    } catch (error) {
      console.error('Error fetching quests by creator:', error);
      return [];
    }
  }

  // Get user's active quest participations
  async getUserActiveQuests(userId: string): Promise<EnhancedQuest[]> {
    try {
      const { data, error } = await supabase
        .from('quest_participants')
        .select(`
          quest_id,
          quests (*)
        `)
        .eq('user_id', userId)
        .in('status', ['joined', 'submitted']);
      
      if (error) throw error;
      
      return (data || [])
        .filter(item => item.quests)
        .map(item => mapQuestRow(item.quests));
    } catch (error) {
      console.error('Error fetching user active quests:', error);
      return [];
    }
  }

  // Vote on submission
  async vote(submissionId: string, approve: boolean, voterUsername: string): Promise<void> {
    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('submission_id', submissionId)
        .eq('voter', voterUsername)
        .single();

      if (existingVote) {
        throw new Error('You have already voted on this submission');
      }

      // Record vote
      const { error: voteError } = await supabase
        .from('votes')
        .insert({
          submission_id: submissionId,
          voter: voterUsername,
          approve
        });

      if (voteError) throw voteError;

      // Update submission vote counts
      const { data: submission, error: fetchError } = await supabase
        .from('submissions')
        .select('votes_for, votes_against')
        .eq('id', submissionId)
        .single();

      if (fetchError) throw fetchError;

      const update = approve
        ? { votes_for: (submission.votes_for ?? 0) + 1 }
        : { votes_against: (submission.votes_against ?? 0) + 1 };

      const { error: updateError } = await supabase
        .from('submissions')
        .update(update)
        .eq('id', submissionId);

      if (updateError) throw updateError;

    } catch (error) {
      console.error('Error voting on submission:', error);
      throw error;
    }
  }
}

export const enhancedQuestService = new EnhancedQuestService();