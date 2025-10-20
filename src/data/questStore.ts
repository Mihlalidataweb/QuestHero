export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'fitness' | 'learning' | 'social' | 'creative' | 'wellness';
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  xpReward: number;
  usdcReward?: number;
  voucherReward?: string;
  duration: string;
  participants: number;
  maxParticipants?: number;
  createdBy: string;
  status: 'active' | 'completed' | 'pending_validation';
  image: string;
  requirements: string[];
  verificationMethod: 'photo' | 'video' | 'gps' | 'community';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  startDate: Date;
  endDate: Date;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
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
  userId: string;
  username: string;
  evidence: string;
  submittedAt: Date;
  votesFor: number;
  votesAgainst: number;
  status: 'pending' | 'approved' | 'rejected';
  timeRemaining: number;
}

import * as questService from '@/services/questService';

class QuestStore {
  private quests: Quest[] = [
    {
      id: '1',
      title: '10K Morning Run Challenge',
      description: 'Complete a 10km run before 9 AM and submit GPS tracking proof',
      category: 'fitness',
      difficulty: 'medium',
      xpReward: 500,
      usdcReward: 5,
      duration: '1 day',
      participants: 234,
      maxParticipants: 500,
      createdBy: 'FitMaster',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400',
      requirements: ['GPS tracking enabled', 'Complete before 9 AM', 'Minimum pace: 6 min/km'],
      verificationMethod: 'gps',
      tier: 'silver',
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
    },
    {
      id: '2',
      title: 'Learn 50 New Words in Spanish',
      description: 'Master 50 Spanish vocabulary words and pass the quiz',
      category: 'learning',
      difficulty: 'easy',
      xpReward: 300,
      voucherReward: 'Duolingo Premium 1 Month',
      duration: '3 days',
      participants: 567,
      createdBy: 'LanguagePro',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400',
      requirements: ['Complete vocabulary list', 'Pass quiz with 80%+ score', 'Submit screenshot'],
      verificationMethod: 'photo',
      tier: 'bronze',
      startDate: new Date(),
      endDate: new Date(Date.now() + 259200000),
    },
    {
      id: '3',
      title: 'Random Acts of Kindness',
      description: 'Perform 5 random acts of kindness and document each one',
      category: 'social',
      difficulty: 'easy',
      xpReward: 400,
      duration: '1 week',
      participants: 892,
      createdBy: 'KindnessWarrior',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400',
      requirements: ['Document each act', 'Get recipient confirmation', 'Share story'],
      verificationMethod: 'community',
      tier: 'bronze',
      startDate: new Date(),
      endDate: new Date(Date.now() + 604800000),
    },
    {
      id: '4',
      title: 'Create Digital Art Masterpiece',
      description: 'Design and complete an original digital artwork',
      category: 'creative',
      difficulty: 'hard',
      xpReward: 800,
      usdcReward: 15,
      voucherReward: 'Adobe Creative Cloud 1 Month',
      duration: '5 days',
      participants: 156,
      maxParticipants: 200,
      createdBy: 'ArtGenius',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1561998338-13ad7883b20f?w=400',
      requirements: ['Original artwork only', 'Minimum 2000x2000px', 'Include process shots'],
      verificationMethod: 'community',
      tier: 'gold',
      startDate: new Date(),
      endDate: new Date(Date.now() + 432000000),
    },
    {
      id: '5',
      title: '30-Day Meditation Streak',
      description: 'Meditate for at least 15 minutes daily for 30 consecutive days',
      category: 'wellness',
      difficulty: 'extreme',
      xpReward: 2000,
      usdcReward: 50,
      duration: '30 days',
      participants: 445,
      createdBy: 'ZenMaster',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
      requirements: ['Daily 15min minimum', 'Use tracking app', 'Weekly check-ins'],
      verificationMethod: 'photo',
      tier: 'platinum',
      startDate: new Date(),
      endDate: new Date(Date.now() + 2592000000),
    },
    {
      id: '6',
      title: 'Cook 5 Healthy Meals',
      description: 'Prepare and cook 5 different healthy meals from scratch',
      category: 'wellness',
      difficulty: 'medium',
      xpReward: 450,
      voucherReward: '$20 HelloFresh Voucher',
      duration: '1 week',
      participants: 678,
      createdBy: 'ChefLife',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      requirements: ['5 different recipes', 'Photo of each meal', 'Share recipes'],
      verificationMethod: 'photo',
      tier: 'silver',
      startDate: new Date(),
      endDate: new Date(Date.now() + 604800000),
    },
  ];

  private currentUser: UserProfile = {
    id: 'user1',
    username: 'QuestHero',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=QuestHero',
    level: 12,
    xp: 3450,
    xpToNextLevel: 5000,
    tier: 'gold',
    totalQuests: 47,
    completedQuests: 38,
    streak: 7,
    rank: 156,
    badges: ['Early Adopter', 'Fitness Fanatic', 'Social Butterfly', 'Learning Legend'],
    usdcBalance: 125.50,
    credits: 2340,
  };

  private submissions: Submission[] = [
    {
      id: 'sub1',
      questId: '1',
      userId: 'user2',
      username: 'RunnerPro',
      evidence: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400',
      submittedAt: new Date(Date.now() - 120000),
      votesFor: 8,
      votesAgainst: 1,
      status: 'pending',
      timeRemaining: 180,
    },
    {
      id: 'sub2',
      questId: '2',
      userId: 'user3',
      username: 'LinguistKing',
      evidence: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
      submittedAt: new Date(Date.now() - 180000),
      votesFor: 12,
      votesAgainst: 0,
      status: 'pending',
      timeRemaining: 120,
    },
    {
      id: 'sub3',
      questId: '4',
      userId: 'user4',
      username: 'ArtisticSoul',
      evidence: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400',
      submittedAt: new Date(Date.now() - 60000),
      votesFor: 5,
      votesAgainst: 2,
      status: 'pending',
      timeRemaining: 240,
    },
  ];

  async getQuests(): Promise<Quest[]> {
    return questService.getQuests();
  }

  async getQuestById(id: string): Promise<Quest | undefined> {
    return questService.getQuestById(id);
  }

  async getCurrentUser(): Promise<UserProfile> {
    return questService.getCurrentUser();
  }

  async getSubmissions(): Promise<Submission[]> {
    return questService.getSubmissions();
  }

  async createQuest(quest: Omit<Quest, 'id' | 'participants' | 'status'>): Promise<Quest> {
    return questService.createQuest(quest);
  }

  async joinQuest(questId: string): Promise<void> {
    return questService.joinQuest(questId);
  }

  async submitEvidence(questId: string, evidence: string): Promise<void> {
    return questService.submitEvidence(questId, evidence);
  }

  async vote(submissionId: string, approve: boolean): Promise<void> {
    return questService.vote(submissionId, approve);
  }
}

export const questStore = new QuestStore();