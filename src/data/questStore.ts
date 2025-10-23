import type { Quest, UserProfile, Submission } from '@/services/questService';
import * as questService from '@/services/questService';
import apiClient from '@/services/api'
import { supabase } from '@/services/supabaseClient';

const USE_API = import.meta.env.VITE_USE_API === 'true'

class QuestStore {
  private quests: Quest[] = [
    {
      id: '1',
      title: 'Sustainable Living Challenge',
      description: 'Adopt 10 eco-friendly habits for a week and track your environmental impact',
      category: 'wellness',
      difficulty: 'medium',
      xpReward: 600,
      usdcReward: 8,
      duration: '7 days',
      participants: 342,
      maxParticipants: 500,
      createdBy: 'EcoWarrior',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400',
      requirements: ['Track daily habits', 'Calculate carbon footprint reduction', 'Share weekly progress'],
      verificationMethod: 'photo',
      tier: 'silver',
      startDate: new Date(),
      endDate: new Date(Date.now() + 604800000),
    },
    {
      id: '2',
      title: 'Master Python Data Science',
      description: 'Complete 5 data science projects using Python, pandas, and visualization libraries',
      category: 'learning',
      difficulty: 'hard',
      xpReward: 1200,
      usdcReward: 25,
      voucherReward: 'Coursera Data Science Specialization',
      duration: '14 days',
      participants: 189,
      maxParticipants: 300,
      createdBy: 'DataNinja',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
      requirements: ['5 complete projects', 'Use real datasets', 'Document code with comments', 'Create visualizations'],
      verificationMethod: 'community',
      tier: 'gold',
      startDate: new Date(),
      endDate: new Date(Date.now() + 1209600000),
    },
    {
      id: '3',
      title: 'Urban Photography Expedition',
      description: 'Capture the essence of city life through 50 unique street photography shots',
      category: 'creative',
      difficulty: 'medium',
      xpReward: 750,
      usdcReward: 12,
      duration: '10 days',
      participants: 267,
      maxParticipants: 400,
      createdBy: 'StreetLens',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
      requirements: ['50 unique shots', 'Different city locations', 'Include people and architecture', 'Edit and curate final collection'],
      verificationMethod: 'photo',
      tier: 'silver',
      startDate: new Date(),
      endDate: new Date(Date.now() + 864000000),
    },
    {
      id: '4',
      title: 'Community Garden Project',
      description: 'Start or contribute to a community garden and grow vegetables for local food bank',
      category: 'social',
      difficulty: 'hard',
      xpReward: 1000,
      usdcReward: 20,
      duration: '21 days',
      participants: 78,
      maxParticipants: 150,
      createdBy: 'GreenThumb',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
      requirements: ['Establish garden space', 'Plant and maintain vegetables', 'Coordinate with food bank', 'Document growth progress'],
      verificationMethod: 'community',
      tier: 'gold',
      startDate: new Date(),
      endDate: new Date(Date.now() + 1814400000),
    },
    {
      id: '5',
      title: 'Mindful Movement Marathon',
      description: 'Practice different forms of mindful movement (yoga, tai chi, qigong) for 30 days',
      category: 'wellness',
      difficulty: 'extreme',
      xpReward: 1800,
      usdcReward: 35,
      voucherReward: 'Premium Wellness App Subscription',
      duration: '30 days',
      participants: 156,
      maxParticipants: 250,
      createdBy: 'MindfulMover',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
      requirements: ['Daily 30min practice', 'Try 3 different movement forms', 'Track flexibility improvements', 'Weekly reflection journal'],
      verificationMethod: 'photo',
      tier: 'platinum',
      startDate: new Date(),
      endDate: new Date(Date.now() + 2592000000),
    },
    {
      id: '6',
      title: 'Local Business Support Challenge',
      description: 'Support 15 different local businesses and share your experiences',
      category: 'social',
      difficulty: 'easy',
      xpReward: 400,
      usdcReward: 5,
      duration: '14 days',
      participants: 523,
      maxParticipants: 800,
      createdBy: 'LocalHero',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
      requirements: ['Visit 15 different businesses', 'Make purchases or use services', 'Write reviews', 'Share on social media'],
      verificationMethod: 'photo',
      tier: 'bronze',
      startDate: new Date(),
      endDate: new Date(Date.now() + 1209600000),
    },
    {
      id: '7',
      title: 'Digital Detox & Nature Immersion',
      description: 'Spend 7 days with minimal screen time while exploring nature',
      category: 'wellness',
      difficulty: 'hard',
      xpReward: 900,
      usdcReward: 15,
      duration: '7 days',
      participants: 234,
      maxParticipants: 300,
      createdBy: 'NatureLover',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
      requirements: ['Max 2 hours screen time daily', 'Spend 4+ hours in nature daily', 'Keep analog journal', 'No social media'],
      verificationMethod: 'community',
      tier: 'gold',
      startDate: new Date(),
      endDate: new Date(Date.now() + 604800000),
    },
    {
      id: '8',
      title: 'Culinary World Tour',
      description: 'Cook authentic dishes from 12 different countries using traditional recipes',
      category: 'creative',
      difficulty: 'medium',
      xpReward: 650,
      usdcReward: 10,
      voucherReward: 'MasterClass Cooking Course',
      duration: '12 days',
      participants: 445,
      maxParticipants: 600,
      createdBy: 'GlobalChef',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
      requirements: ['12 different countries', 'Use authentic recipes', 'Document cooking process', 'Share cultural background'],
      verificationMethod: 'photo',
      tier: 'silver',
      startDate: new Date(),
      endDate: new Date(Date.now() + 1036800000),
    }
  ];

  private userProfiles: UserProfile[] = [
    {
      id: '1',
      username: 'QuestMaster',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=QuestMaster',
      level: 15,
      xp: 4250,
      xpToNextLevel: 750,
      tier: 'platinum',
      totalQuests: 45,
      completedQuests: 42,
      streak: 12,
      rank: 1,
      badges: ['Early Adopter', 'Quest Creator', 'Community Leader'],
      usdcBalance: 125.50,
      credits: 2500,
    },
    {
      id: '2',
      username: 'EcoWarrior',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EcoWarrior',
      level: 12,
      xp: 3100,
      xpToNextLevel: 400,
      tier: 'gold',
      totalQuests: 35,
      completedQuests: 31,
      streak: 8,
      rank: 2,
      badges: ['Environmental Champion', 'Sustainability Expert'],
      usdcBalance: 89.25,
      credits: 1850,
    },
  ];

  private submissions: Submission[] = [
    {
      id: '1',
      questId: '1',
      userId: '1',
      username: 'EcoWarrior',
      evidence: 'Completed week 1 of sustainable living - reduced plastic use by 80%, started composting, and switched to renewable energy',
      submittedAt: new Date(Date.now() - 86400000),
      status: 'pending',
      votesFor: 12,
      votesAgainst: 2,
    },
    {
      id: '2',
      questId: '2',
      userId: '2',
      username: 'DataNinja',
      evidence: 'Completed data analysis project on climate change trends using Python and pandas. Created interactive visualizations.',
      submittedAt: new Date(Date.now() - 172800000),
      status: 'approved',
      votesFor: 18,
      votesAgainst: 1,
    },
  ];

  // Real-time database integration methods
  private async syncWithDatabase() {
    if (!USE_API) {
      try {
        // Sync quests to database
        for (const quest of this.quests) {
          await this.upsertQuest(quest);
        }
        
        // Sync user profiles to database
        for (const profile of this.userProfiles) {
          await this.upsertUserProfile(profile);
        }
        
        // Sync submissions to database
        for (const submission of this.submissions) {
          await this.upsertSubmission(submission);
        }
        
        console.log('✅ Successfully synced data to database');
      } catch (error) {
        console.error('❌ Error syncing to database:', error);
      }
    }
  }

  private async upsertQuest(quest: Quest) {
    const { error } = await supabase
      .from('quests')
      .upsert({
        id: quest.id,
        title: quest.title,
        description: quest.description,
        category: quest.category,
        difficulty: quest.difficulty,
        xp_reward: quest.xpReward,
        usdc_reward: quest.usdcReward || 0,
        voucher_reward: quest.voucherReward || null,
        duration: quest.duration,
        participants: quest.participants || 0,
        max_participants: quest.maxParticipants || null,
        created_by: quest.createdBy,
        status: quest.status,
        image: quest.image,
        requirements: quest.requirements,
        verification_method: quest.verificationMethod,
        tier: quest.tier,
        start_date: quest.startDate,
        end_date: quest.endDate,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
  }

  private async upsertUserProfile(profile: UserProfile) {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: profile.id,
        username: profile.username,
        avatar: profile.avatar,
        level: profile.level,
        xp: profile.xp,
        xp_to_next_level: profile.xpToNextLevel,
        tier: profile.tier,
        total_quests: profile.totalQuests,
        completed_quests: profile.completedQuests,
        streak: profile.streak,
        rank: profile.rank,
        badges: profile.badges,
        usdc_balance: profile.usdcBalance,
        credits: profile.credits,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
  }

  private async upsertSubmission(submission: Submission) {
    const { error } = await supabase
      .from('submissions')
      .upsert({
        id: submission.id,
        quest_id: submission.questId,
        user_id: submission.userId,
        username: submission.username,
        evidence: submission.evidence,
        submitted_at: submission.submittedAt,
        status: submission.status,
        votes_for: submission.votesFor,
        votes_against: submission.votesAgainst,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
  }

  // Real-time subscription setup
  private setupRealtimeSubscriptions() {
    if (!USE_API) {
      // Subscribe to quest changes
      supabase
        .channel('quests-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'quests' },
          (payload) => {
            console.log('Quest updated:', payload);
            this.handleQuestUpdate(payload);
          }
        )
        .subscribe();

      // Subscribe to user profile changes
      supabase
        .channel('profiles-changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'user_profiles' },
          (payload) => {
            console.log('Profile updated:', payload);
            this.handleProfileUpdate(payload);
          }
        )
        .subscribe();

      // Subscribe to submission changes
      supabase
        .channel('submissions-changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'submissions' },
          (payload) => {
            console.log('Submission updated:', payload);
            this.handleSubmissionUpdate(payload);
          }
        )
        .subscribe();
    }
  }

  private handleQuestUpdate(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        this.quests.push(this.transformDbQuestToQuest(newRecord));
        break;
      case 'UPDATE':
        const questIndex = this.quests.findIndex(q => q.id === newRecord.id);
        if (questIndex !== -1) {
          this.quests[questIndex] = this.transformDbQuestToQuest(newRecord);
        }
        break;
      case 'DELETE':
        this.quests = this.quests.filter(q => q.id !== oldRecord.id);
        break;
    }
  }

  private handleProfileUpdate(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        this.userProfiles.push(this.transformDbProfileToProfile(newRecord));
        break;
      case 'UPDATE':
        const profileIndex = this.userProfiles.findIndex(p => p.id === newRecord.id);
        if (profileIndex !== -1) {
          this.userProfiles[profileIndex] = this.transformDbProfileToProfile(newRecord);
        }
        break;
      case 'DELETE':
        this.userProfiles = this.userProfiles.filter(p => p.id !== oldRecord.id);
        break;
    }
  }

  private handleSubmissionUpdate(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        this.submissions.push(this.transformDbSubmissionToSubmission(newRecord));
        break;
      case 'UPDATE':
        const submissionIndex = this.submissions.findIndex(s => s.id === newRecord.id);
        if (submissionIndex !== -1) {
          this.submissions[submissionIndex] = this.transformDbSubmissionToSubmission(newRecord);
        }
        break;
      case 'DELETE':
        this.submissions = this.submissions.filter(s => s.id !== oldRecord.id);
        break;
    }
  }

  // Transform database records to application models
  private transformDbQuestToQuest(dbQuest: any): Quest {
    return {
      id: dbQuest.id,
      title: dbQuest.title,
      description: dbQuest.description,
      category: dbQuest.category,
      difficulty: dbQuest.difficulty,
      xpReward: dbQuest.xp_reward,
      usdcReward: dbQuest.usdc_reward,
      voucherReward: dbQuest.voucher_reward,
      duration: dbQuest.duration,
      participants: dbQuest.participants,
      maxParticipants: dbQuest.max_participants,
      createdBy: dbQuest.created_by,
      status: dbQuest.status,
      image: dbQuest.image,
      requirements: dbQuest.requirements,
      verificationMethod: dbQuest.verification_method,
      tier: dbQuest.tier,
      startDate: new Date(dbQuest.start_date),
      endDate: new Date(dbQuest.end_date),
    };
  }

  private transformDbProfileToProfile(dbProfile: any): UserProfile {
    return {
      id: dbProfile.id,
      username: dbProfile.username,
      avatar: dbProfile.avatar,
      level: dbProfile.level,
      xp: dbProfile.xp,
      xpToNextLevel: dbProfile.xp_to_next_level,
      tier: dbProfile.tier,
      totalQuests: dbProfile.total_quests,
      completedQuests: dbProfile.completed_quests,
      streak: dbProfile.streak,
      rank: dbProfile.rank,
      badges: dbProfile.badges,
      usdcBalance: dbProfile.usdc_balance,
      credits: dbProfile.credits,
    };
  }

  private transformDbSubmissionToSubmission(dbSubmission: any): Submission {
    return {
      id: dbSubmission.id,
      questId: dbSubmission.quest_id,
      userId: dbSubmission.user_id,
      username: dbSubmission.username,
      evidence: dbSubmission.evidence,
      submittedAt: new Date(dbSubmission.submitted_at),
      status: dbSubmission.status,
      votesFor: dbSubmission.votes_for,
      votesAgainst: dbSubmission.votes_against,
    };
  }

  // Initialize store with database sync and real-time subscriptions
  async initialize() {
    await this.syncWithDatabase();
    this.setupRealtimeSubscriptions();
  }

  async getQuests(): Promise<Quest[]> {
    if (USE_API) {
      const response = await apiClient.get('/quests')
      return response.data as Quest[]
    }
    
    // Load from database if not using API
    try {
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        return data.map(quest => this.transformDbQuestToQuest(quest));
      }
    } catch (error) {
      console.error('Error loading quests from database:', error);
    }
    
    // Fallback to in-memory data
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.quests]), 500);
    });
  }

  async getQuestById(id: string): Promise<Quest | undefined> {
    if (USE_API) {
      try {
        const response = await apiClient.get(`/quests/${id}`)
        return response.data as Quest
      } catch (err) {
        return undefined
      }
    }
    return questService.getQuestById(id);
  }

  async getCurrentUser(): Promise<UserProfile> {
    if (USE_API) {
      const response = await apiClient.get('/users/me')
      return response.data as UserProfile
    }
    return questService.getCurrentUser();
  }

  async getSubmissions(): Promise<Submission[]> {
    if (USE_API) {
      const response = await apiClient.get('/submissions/pending')
      return response.data as Submission[]
    }
    return questService.getSubmissions();
  }

  async createQuest(quest: Omit<Quest, 'id' | 'participants' | 'status'>): Promise<Quest> {
    if (USE_API) {
      const response = await apiClient.post('/quests', quest)
      return response.data as Quest
    }
    return questService.createQuest(quest);
  }

  async joinQuest(questId: string): Promise<void> {
    if (USE_API) {
      await apiClient.post(`/quests/${questId}/join`)
      return
    }
    return questService.joinQuest(questId);
  }

  async submitEvidence(questId: string, evidence: string): Promise<void> {
    if (USE_API) {
      await apiClient.post(`/quests/${questId}/submit`, { evidence })
      return
    }
    return questService.submitEvidence(questId, evidence);
  }

  async vote(submissionId: string, approve: boolean): Promise<void> {
    if (USE_API) {
      await apiClient.post(`/submissions/${submissionId}/vote`, { approve })
      return
    }
    return questService.vote(submissionId, approve);
  }
}

export const questStore = new QuestStore();