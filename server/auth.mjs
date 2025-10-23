import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const app = express();
const PORT = process.env.PORT || 3000;

// Dev-friendly CORS: allow any localhost origin
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.startsWith('http://localhost:')) return callback(null, true);
    if (origin.startsWith('http://127.0.0.1:')) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// Simple JSON file database for users
const DB_PATH = path.resolve(process.cwd(), 'server', 'db.json');
function loadDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { users: {} };
  }
}
function saveDB(db) {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save DB:', err);
  }
}

function usernameFromAddress(address) {
  return `base-${String(address).slice(2, 6)}`;
}
function defaultUserProfile(address) {
  return {
    id: address.toLowerCase(),
    username: usernameFromAddress(address),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`,
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
    address,
  };
}

// In-memory stores (nonce and sessions)
const nonces = new Set();
const sessions = new Map(); // token -> address

// In-memory demo data for API mode
const leaderboard = [
  { rank: 1, username: 'QuestMaster', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=QuestMaster', level: 15, xp: 4250, completedQuests: 42, tier: 'platinum', streak: 12, usdcEarned: 125.50, badges: ['Early Adopter', 'Quest Creator', 'Community Leader'] },
  { rank: 2, username: 'EcoWarrior', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EcoWarrior', level: 12, xp: 3100, completedQuests: 31, tier: 'gold', streak: 8, usdcEarned: 89.25, badges: ['Environmental Champion', 'Sustainability Expert'] },
  { rank: 3, username: 'DataNinja', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DataNinja', level: 11, xp: 2890, completedQuests: 28, tier: 'gold', streak: 6, usdcEarned: 76.80, badges: ['Tech Wizard', 'Data Master', 'Python Pro'] },
  { rank: 4, username: 'StreetLens', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=StreetLens', level: 10, xp: 2650, completedQuests: 25, tier: 'gold', streak: 5, usdcEarned: 68.40, badges: ['Creative Vision', 'Photography Expert', 'Urban Explorer'] },
  { rank: 5, username: 'GreenThumb', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GreenThumb', level: 9, xp: 2420, completedQuests: 22, tier: 'silver', streak: 4, usdcEarned: 58.90, badges: ['Community Builder', 'Garden Master', 'Social Impact'] },
  { rank: 6, username: 'MindfulMover', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MindfulMover', level: 8, xp: 2180, completedQuests: 20, tier: 'silver', streak: 7, usdcEarned: 52.30, badges: ['Wellness Warrior', 'Mindfulness Master', 'Consistency King'] },
  { rank: 7, username: 'LocalHero', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LocalHero', level: 7, xp: 1950, completedQuests: 18, tier: 'silver', streak: 3, usdcEarned: 45.75, badges: ['Community Supporter', 'Local Champion', 'Business Booster'] },
  { rank: 8, username: 'NatureLover', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NatureLover', level: 6, xp: 1720, completedQuests: 16, tier: 'silver', streak: 2, usdcEarned: 38.60, badges: ['Digital Detox', 'Nature Explorer', 'Mindful Living'] },
  { rank: 9, username: 'GlobalChef', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GlobalChef', level: 6, xp: 1680, completedQuests: 15, tier: 'bronze', streak: 4, usdcEarned: 34.20, badges: ['Culinary Artist', 'Cultural Explorer', 'Recipe Master'] },
  { rank: 10, username: 'FitnessFanatic', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FitnessFanatic', level: 5, xp: 1450, completedQuests: 14, tier: 'bronze', streak: 6, usdcEarned: 29.80, badges: ['Fitness Guru', 'Morning Warrior', 'Health Champion'] },
];

const quests = [
  {
    id: '1',
    title: 'Sustainable Living Challenge',
    description: 'Adopt 10 eco-friendly habits for a week and track your environmental impact',
    category: 'environmental',
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
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 604800000).toISOString(),
  },
  {
    id: '2',
    title: 'Master Python Data Science',
    description: 'Complete 5 data science projects using Python, pandas, and visualization libraries',
    category: 'technology',
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
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 1209600000).toISOString(),
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
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 864000000).toISOString(),
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
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 1814400000).toISOString(),
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
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 2592000000).toISOString(),
  },
  {
    id: '6',
    title: 'Local Business Support Challenge',
    description: 'Support 15 different local businesses and share your experiences',
    category: 'economic',
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
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 1209600000).toISOString(),
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
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 604800000).toISOString(),
  },
  {
    id: '8',
    title: 'Culinary World Tour',
    description: 'Cook authentic dishes from 12 different countries using traditional recipes',
    category: 'cultural',
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
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 1036800000).toISOString(),
  },
];

const submissions = [
  {
    id: 'sub1',
    questId: '1',
    userId: 'user2',
    username: 'RunnerPro',
    evidence: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400',
    submittedAt: new Date(Date.now() - 120000).toISOString(),
    votesFor: 8,
    votesAgainst: 1,
    status: 'pending',
    timeRemaining: 180,
  },
  {
    id: 'sub2',
    questId: '2',
    userId: 'user3',
    username: 'StudyBuddy',
    evidence: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
    submittedAt: new Date(Date.now() - 300000).toISOString(),
    votesFor: 12,
    votesAgainst: 2,
    status: 'pending',
    timeRemaining: 120,
  },
  {
    id: 'sub3',
    questId: '3',
    userId: 'user4',
    username: 'PixelArtist',
    evidence: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400',
    submittedAt: new Date(Date.now() - 600000).toISOString(),
    votesFor: 15,
    votesAgainst: 0,
    status: 'pending',
    timeRemaining: 60,
  },
];

const rewards = [
  {
    id: 'reward1',
    userId: 'user1',
    type: 'xp',
    amount: 500,
    questId: '1',
    questTitle: '10K Morning Run Challenge',
    claimedAt: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'reward2',
    userId: 'user1',
    type: 'usdc',
    amount: 5,
    questId: '1',
    questTitle: '10K Morning Run Challenge',
    claimedAt: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const badges = [
  { id: 'early_bird', name: 'Early Bird', description: 'Complete 5 morning quests', icon: '🌅' },
  { id: 'streak_master', name: 'Streak Master', description: 'Maintain a 7-day streak', icon: '🔥' },
  { id: 'community_helper', name: 'Community Helper', description: 'Vote on 50 submissions', icon: '🤝' },
  { id: 'quest_creator', name: 'Quest Creator', description: 'Create your first quest', icon: '⭐' },
];

// Health
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', message: 'Auth API running' });
});

// Generate nonce for SIWE
app.get('/api/auth/nonce', (_, res) => {
  const nonce = crypto.randomBytes(16).toString('hex');
  nonces.add(nonce);
  res.send(nonce);
});

// Verify SIWE signature
const client = createPublicClient({ chain: base, transport: http() });

app.post('/api/auth/verify', async (req, res) => {
  try {
    const { address, message, signature } = req.body || {};
    if (!address || !message || !signature) {
      return res.status(400).json({ error: 'Missing address, message, or signature' });
    }

    // Extract nonce from the message (simple regex for last 32 hex chars)
    const match = message.match(/([a-fA-F0-9]{32})$/);
    const nonce = match?.[1];
    if (!nonce || !nonces.delete(nonce)) {
      return res.status(400).json({ error: 'Invalid or reused nonce' });
    }

    const valid = await client.verifyMessage({ address, message, signature });
    if (!valid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Create simple session token and persist user if new
    const token = crypto.randomBytes(24).toString('hex');
    sessions.set(token, address);

    const db = loadDB();
    if (!db.users[address.toLowerCase()]) {
      db.users[address.toLowerCase()] = defaultUserProfile(address);
      saveDB(db);
    }

    return res.json({ ok: true, token, user: { address } });
  } catch (err) {
    console.error('Auth verify error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Current user endpoint (used by frontend when USE_API is enabled)
app.get('/api/users/me', (req, res) => {
  try {
    const auth = req.headers['authorization'] || '';
    const token = String(auth).startsWith('Bearer ') ? String(auth).slice(7) : null;
    if (!token || !sessions.has(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const address = sessions.get(token);
    const db = loadDB();
    let user = db.users[address.toLowerCase()];
    if (!user) {
      user = defaultUserProfile(address);
      db.users[address.toLowerCase()] = user;
      saveDB(db);
    }
    return res.json(user);
  } catch (err) {
    console.error('users/me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to get user from token
function getUserFromToken(req) {
  const auth = req.headers['authorization'] || '';
  const token = String(auth).startsWith('Bearer ') ? String(auth).slice(7) : null;
  if (!token || !sessions.has(token)) return null;
  return sessions.get(token);
}

// --- QUEST ENDPOINTS ---
app.get('/api/quests', (req, res) => {
  try {
    const { category, difficulty, tier, search } = req.query;
    let filteredQuests = [...quests];
    
    if (category) filteredQuests = filteredQuests.filter(q => q.category === category);
    if (difficulty) filteredQuests = filteredQuests.filter(q => q.difficulty === difficulty);
    if (tier) filteredQuests = filteredQuests.filter(q => q.tier === tier);
    if (search) {
      const searchLower = search.toLowerCase();
      filteredQuests = filteredQuests.filter(q => 
        q.title.toLowerCase().includes(searchLower) || 
        q.description.toLowerCase().includes(searchLower)
      );
    }
    
    res.json(filteredQuests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quests' });
  }
});

app.get('/api/quests/:id', (req, res) => {
  try {
    const quest = quests.find(q => q.id === req.params.id);
    if (!quest) return res.status(404).json({ error: 'Quest not found' });
    res.json(quest);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quest' });
  }
});

app.post('/api/quests', (req, res) => {
  try {
    const userAddress = getUserFromToken(req);
    if (!userAddress) return res.status(401).json({ error: 'Unauthorized' });
    
    const body = req.body || {};
    const id = crypto.randomBytes(6).toString('hex');
    const quest = {
      id,
      title: body.title || 'Untitled Quest',
      description: body.description || '',
      category: body.category || 'fitness',
      difficulty: body.difficulty || 'easy',
      xpReward: body.xpReward || 100,
      usdcReward: body.usdcReward,
      voucherReward: body.voucherReward,
      duration: body.duration || '1 day',
      participants: 0,
      maxParticipants: body.maxParticipants,
      createdBy: body.createdBy || 'Anonymous',
      status: 'active',
      image: body.image || 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400',
      requirements: Array.isArray(body.requirements) ? body.requirements : [],
      verificationMethod: body.verificationMethod || 'photo',
      tier: body.tier || 'bronze',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000).toISOString(),
    };
    quests.push(quest);
    res.status(201).json(quest);
  } catch (err) {
    res.status(400).json({ error: 'Invalid quest payload' });
  }
});

app.put('/api/quests/:id', (req, res) => {
  try {
    const userAddress = getUserFromToken(req);
    if (!userAddress) return res.status(401).json({ error: 'Unauthorized' });
    
    const questIndex = quests.findIndex(q => q.id === req.params.id);
    if (questIndex === -1) return res.status(404).json({ error: 'Quest not found' });
    
    const updatedQuest = { ...quests[questIndex], ...req.body };
    quests[questIndex] = updatedQuest;
    res.json(updatedQuest);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update quest' });
  }
});

app.delete('/api/quests/:id', (req, res) => {
  try {
    const userAddress = getUserFromToken(req);
    if (!userAddress) return res.status(401).json({ error: 'Unauthorized' });
    
    const questIndex = quests.findIndex(q => q.id === req.params.id);
    if (questIndex === -1) return res.status(404).json({ error: 'Quest not found' });
    
    quests.splice(questIndex, 1);
    res.json({ ok: true, message: 'Quest deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete quest' });
  }
});

app.post('/api/quests/:id/join', (req, res) => {
  try {
    const userAddress = getUserFromToken(req);
    if (!userAddress) return res.status(401).json({ error: 'Unauthorized' });
    
    const quest = quests.find(q => q.id === req.params.id);
    if (!quest) return res.status(404).json({ error: 'Quest not found' });
    
    const nextParticipants = (quest.participants || 0) + 1;
    if (quest.maxParticipants && nextParticipants > quest.maxParticipants) {
      return res.status(400).json({ error: 'Quest is full' });
    }
    
    quest.participants = nextParticipants;
    res.json({ ok: true, participants: quest.participants });
  } catch (err) {
    res.status(500).json({ error: 'Failed to join quest' });
  }
});

app.post('/api/quests/:id/submit', (req, res) => {
  try {
    const userAddress = getUserFromToken(req);
    if (!userAddress) return res.status(401).json({ error: 'Unauthorized' });
    
    const quest = quests.find(q => q.id === req.params.id);
    if (!quest) return res.status(404).json({ error: 'Quest not found' });
    
    const { evidence } = req.body || {};
    if (!evidence) return res.status(400).json({ error: 'Evidence is required' });
    
    const db = loadDB();
    const user = db.users[userAddress.toLowerCase()];
    
    const submission = {
      id: crypto.randomBytes(6).toString('hex'),
      questId: quest.id,
      userId: userAddress,
      username: user?.username || usernameFromAddress(userAddress),
      evidence,
      status: 'pending',
      votesFor: 0,
      votesAgainst: 0,
      submittedAt: new Date().toISOString(),
      timeRemaining: 300, // 5 minutes for voting
    };
    
    submissions.push(submission);
    res.status(201).json(submission);
  } catch (err) {
    res.status(400).json({ error: 'Failed to submit evidence' });
  }
});

app.get('/api/quests/user/:userId', (req, res) => {
  try {
    const userQuests = quests.filter(q => q.createdBy === req.params.userId);
    res.json(userQuests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user quests' });
  }
});

// --- USER ENDPOINTS ---
app.put('/api/users/me', (req, res) => {
  try {
    const userAddress = getUserFromToken(req);
    if (!userAddress) return res.status(401).json({ error: 'Unauthorized' });
    
    const db = loadDB();
    const user = db.users[userAddress.toLowerCase()];
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const updatedUser = { ...user, ...req.body };
    db.users[userAddress.toLowerCase()] = updatedUser;
    saveDB(db);
    
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update user' });
  }
});

app.get('/api/users/:id', (req, res) => {
  try {
    const db = loadDB();
    const user = db.users[req.params.id.toLowerCase()];
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.post('/api/users/claim-xp', (req, res) => {
  try {
    const userAddress = getUserFromToken(req);
    if (!userAddress) return res.status(401).json({ error: 'Unauthorized' });
    
    const db = loadDB();
    const user = db.users[userAddress.toLowerCase()];
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const pendingRewards = rewards.filter(r => r.userId === userAddress && !r.claimedAt && r.type === 'xp');
    const totalXP = pendingRewards.reduce((sum, r) => sum + r.amount, 0);
    
    if (totalXP > 0) {
      user.xp += totalXP;
      // Update level based on XP
      user.level = Math.floor(user.xp / 1000) + 1;
      user.xpToNextLevel = 1000 - (user.xp % 1000);
      
      // Mark rewards as claimed
      pendingRewards.forEach(r => r.claimedAt = new Date().toISOString());
      
      saveDB(db);
    }
    
    res.json({ ok: true, xpClaimed: totalXP, newXP: user.xp, newLevel: user.level });
  } catch (err) {
    res.status(500).json({ error: 'Failed to claim XP' });
  }
});

app.get('/api/users/badges', (req, res) => {
  try {
    const userAddress = getUserFromToken(req);
    if (!userAddress) return res.status(401).json({ error: 'Unauthorized' });
    
    const db = loadDB();
    const user = db.users[userAddress.toLowerCase()];
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const userBadges = badges.filter(b => user.badges.includes(b.id));
    res.json(userBadges);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

// --- SUBMISSION & VOTING ENDPOINTS ---
app.get('/api/submissions/pending', (_req, res) => {
  try {
    const pendingSubmissions = submissions.filter(s => s.status === 'pending');
    res.json(pendingSubmissions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending submissions' });
  }
});

app.get('/api/submissions/:id', (req, res) => {
  try {
    const submission = submissions.find(s => s.id === req.params.id);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

app.post('/api/submissions/:id/vote', (req, res) => {
  try {
    const userAddress = getUserFromToken(req);
    if (!userAddress) return res.status(401).json({ error: 'Unauthorized' });
    
    const submission = submissions.find(s => s.id === req.params.id);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    
    const { approve } = req.body || {};
    if (approve) {
      submission.votesFor = (submission.votesFor || 0) + 1;
    } else {
      submission.votesAgainst = (submission.votesAgainst || 0) + 1;
    }
    
    // Auto-approve if enough votes
    if (submission.votesFor >= 5) {
      submission.status = 'approved';
      // Create rewards for the submitter
      const quest = quests.find(q => q.id === submission.questId);
      if (quest) {
        if (quest.xpReward) {
          rewards.push({
            id: crypto.randomBytes(6).toString('hex'),
            userId: submission.userId,
            type: 'xp',
            amount: quest.xpReward,
            questId: quest.id,
            questTitle: quest.title,
            claimedAt: null,
            createdAt: new Date().toISOString(),
          });
        }
        if (quest.usdcReward) {
          rewards.push({
            id: crypto.randomBytes(6).toString('hex'),
            userId: submission.userId,
            type: 'usdc',
            amount: quest.usdcReward,
            questId: quest.id,
            questTitle: quest.title,
            claimedAt: null,
            createdAt: new Date().toISOString(),
          });
        }
      }
    } else if (submission.votesAgainst >= 3) {
      submission.status = 'rejected';
    }
    
    res.json({ 
      ok: true, 
      votesFor: submission.votesFor, 
      votesAgainst: submission.votesAgainst,
      status: submission.status 
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to vote on submission' });
  }
});

app.get('/api/submissions/quest/:questId', (req, res) => {
  try {
    const questSubmissions = submissions.filter(s => s.questId === req.params.questId);
    res.json(questSubmissions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quest submissions' });
  }
});

// --- LEADERBOARD ENDPOINTS ---
app.get('/api/leaderboard', (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const start = parseInt(offset);
    const end = start + parseInt(limit);
    const paginatedLeaderboard = leaderboard.slice(start, end);
    res.json(paginatedLeaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

app.get('/api/leaderboard/weekly', (_req, res) => {
  try {
    // Mock weekly leaderboard (same data for demo)
    res.json(leaderboard.slice(0, 5));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch weekly leaderboard' });
  }
});

app.get('/api/leaderboard/monthly', (_req, res) => {
  try {
    // Mock monthly leaderboard (same data for demo)
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch monthly leaderboard' });
  }
});

// --- REWARDS ENDPOINTS ---
app.get('/api/rewards/pending', (req, res) => {
  try {
    const userAddress = getUserFromToken(req);
    if (!userAddress) return res.status(401).json({ error: 'Unauthorized' });
    
    const pendingRewards = rewards.filter(r => r.userId === userAddress && !r.claimedAt);
    res.json(pendingRewards);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending rewards' });
  }
});

app.post('/api/rewards/claim/:id', (req, res) => {
  try {
    const userAddress = getUserFromToken(req);
    if (!userAddress) return res.status(401).json({ error: 'Unauthorized' });
    
    const reward = rewards.find(r => r.id === req.params.id && r.userId === userAddress);
    if (!reward) return res.status(404).json({ error: 'Reward not found' });
    
    if (reward.claimedAt) return res.status(400).json({ error: 'Reward already claimed' });
    
    reward.claimedAt = new Date().toISOString();
    
    // Update user balance/XP
    const db = loadDB();
    const user = db.users[userAddress.toLowerCase()];
    if (user) {
      if (reward.type === 'xp') {
        user.xp += reward.amount;
        user.level = Math.floor(user.xp / 1000) + 1;
        user.xpToNextLevel = 1000 - (user.xp % 1000);
      } else if (reward.type === 'usdc') {
        user.usdcBalance += reward.amount;
      }
      saveDB(db);
    }
    
    res.json({ ok: true, reward });
  } catch (err) {
    res.status(500).json({ error: 'Failed to claim reward' });
  }
});

app.get('/api/rewards/history', (req, res) => {
  try {
    const userAddress = getUserFromToken(req);
    if (!userAddress) return res.status(401).json({ error: 'Unauthorized' });
    
    const userRewards = rewards.filter(r => r.userId === userAddress && r.claimedAt);
    res.json(userRewards);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reward history' });
  }
});

// --- AUTH ENDPOINTS ---
app.post('/api/auth/logout', (req, res) => {
  try {
    const auth = req.headers['authorization'] || '';
    const token = String(auth).startsWith('Bearer ') ? String(auth).slice(7) : null;
    if (token && sessions.has(token)) {
      sessions.delete(token);
    }
    res.json({ ok: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to logout' });
  }
});

app.get('/api/auth/verify', (req, res) => {
  try {
    const userAddress = getUserFromToken(req);
    if (!userAddress) return res.status(401).json({ error: 'Invalid token' });
    res.json({ ok: true, address: userAddress });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify token' });
  }
});

app.post('/api/auth/refresh', (req, res) => {
  try {
    const userAddress = getUserFromToken(req);
    if (!userAddress) return res.status(401).json({ error: 'Invalid token' });
    
    // Generate new token
    const newToken = crypto.randomBytes(24).toString('hex');
    sessions.set(newToken, userAddress);
    
    res.json({ ok: true, token: newToken });
  } catch (err) {
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

app.listen(PORT, () => {
  console.log(`🔵 Auth server listening on http://localhost:${PORT}`);
});