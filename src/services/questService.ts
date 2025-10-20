import { supabase } from '@/services/supabaseClient';
import { z } from 'zod';

export type Tier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type Category = 'fitness' | 'learning' | 'social' | 'creative' | 'wellness';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';
export type Verification = 'photo' | 'video' | 'gps' | 'community';
export type QuestStatus = 'active' | 'completed' | 'pending_validation';

export interface Quest {
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
}

export interface UserProfile {
  id: string;
  username: string;
  avatar?: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  tier: Tier;
  totalQuests: number;
  completedQuests: number;
  streak: number;
  rank: number;
  badges: string[];
  usdcBalance: number;
  credits: number;
}

export interface Submission {
  id: string;
  questId: string;
  userId?: string;
  username?: string;
  evidence: string;
  submittedAt: Date;
  votesFor: number;
  votesAgainst: number;
  status: 'pending' | 'approved' | 'rejected';
  timeRemaining?: number;
}

const QuestSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.enum(['fitness','learning','social','creative','wellness']),
  difficulty: z.enum(['easy','medium','hard','extreme']),
  xpReward: z.number().int().positive(),
  usdcReward: z.number().optional(),
  voucherReward: z.string().optional(),
  duration: z.string(),
  maxParticipants: z.number().int().positive().optional(),
  createdBy: z.string(),
  image: z.string().url().optional(),
  requirements: z.array(z.string()),
  verificationMethod: z.enum(['photo','video','gps','community']),
  tier: z.enum(['bronze','silver','gold','platinum']),
  startDate: z.date(),
  endDate: z.date(),
});

function mapQuestRow(row: any): Quest {
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
  };
}

function mapSubmissionRow(row: any): Submission {
  return {
    id: row.id,
    questId: row.quest_id,
    userId: row.user_id ?? undefined,
    username: row.username ?? undefined,
    evidence: row.evidence,
    submittedAt: new Date(row.submitted_at),
    votesFor: row.votes_for ?? 0,
    votesAgainst: row.votes_against ?? 0,
    status: row.status,
    timeRemaining: row.time_remaining ?? 0,
  };
}

function mapUserRow(row: any): UserProfile {
  return {
    id: row.id,
    username: row.username,
    avatar: row.avatar ?? undefined,
    level: row.level ?? 1,
    xp: row.xp ?? 0,
    xpToNextLevel: row.xp_to_next_level ?? 1000,
    tier: row.tier,
    totalQuests: row.total_quests ?? 0,
    completedQuests: row.completed_quests ?? 0,
    streak: row.streak ?? 0,
    rank: row.rank ?? 0,
    badges: Array.isArray(row.badges) ? row.badges : [],
    usdcBalance: Number(row.usdc_balance ?? 0),
    credits: row.credits ?? 0,
  };
}

export async function getQuests(): Promise<Quest[]> {
  const { data, error } = await supabase
    .from('quests')
    .select('*')
    .order('start_date', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(mapQuestRow);
}

export async function getQuestById(id: string): Promise<Quest | undefined> {
  const { data, error } = await supabase
    .from('quests')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapQuestRow(data) : undefined;
}

export async function getCurrentUser(): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) {
    // Fallback default user to avoid breaking UI before seeding
    return {
      id: 'fallback-user',
      username: 'QuestHero',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=QuestHero',
      level: 1,
      xp: 0,
      xpToNextLevel: 1000,
      tier: 'bronze',
      totalQuests: 0,
      completedQuests: 0,
      streak: 0,
      rank: 0,
      badges: [],
      usdcBalance: 0,
      credits: 0,
    };
  }
  return mapUserRow(data);
}

export async function getSubmissions(): Promise<Submission[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('submitted_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(mapSubmissionRow);
}

export async function createQuest(input: Omit<Quest, 'id' | 'participants' | 'status'>): Promise<Quest> {
  const parsed = QuestSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.errors.map(e => e.message).join(', '));
  }
  const payload = {
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
    created_by: input.createdBy,
    status: 'active',
    image: input.image,
    requirements: input.requirements,
    verification_method: input.verificationMethod,
    tier: input.tier,
    start_date: input.startDate.toISOString(),
    end_date: input.endDate.toISOString(),
  };
  const { data, error } = await supabase
    .from('quests')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return mapQuestRow(data);
}

export async function joinQuest(questId: string): Promise<void> {
  const { data, error } = await supabase
    .from('quests')
    .select('participants,max_participants')
    .eq('id', questId)
    .single();
  if (error) throw new Error(error.message);
  const next = (data.participants ?? 0) + 1;
  if (data.max_participants && next > data.max_participants) {
    throw new Error('Quest is full');
  }
  const { error: updErr } = await supabase
    .from('quests')
    .update({ participants: next })
    .eq('id', questId);
  if (updErr) throw new Error(updErr.message);
}

export async function submitEvidence(questId: string, evidence: string): Promise<void> {
  const { error } = await supabase.from('submissions').insert({
    quest_id: questId,
    evidence,
    status: 'pending',
    votes_for: 0,
    votes_against: 0,
  });
  if (error) throw new Error(error.message);
}

export async function vote(submissionId: string, approve: boolean): Promise<void> {
  const { data, error } = await supabase
    .from('submissions')
    .select('votes_for,votes_against')
    .eq('id', submissionId)
    .single();
  if (error) throw new Error(error.message);
  const update = approve
    ? { votes_for: (data.votes_for ?? 0) + 1 }
    : { votes_against: (data.votes_against ?? 0) + 1 };
  const { error: updErr } = await supabase
    .from('submissions')
    .update(update)
    .eq('id', submissionId);
  if (updErr) throw new Error(updErr.message);
}