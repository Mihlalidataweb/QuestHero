# QuestClash Backend Integration Guide

This guide explains how to replace the mock data stores with real backend API calls to make QuestClash fully functional with a live backend.

## Table of Contents
1. [Current Architecture](#current-architecture)
2. [Backend Requirements](#backend-requirements)
3. [Step-by-Step Integration](#step-by-step-integration)
4. [API Endpoints Needed](#api-endpoints-needed)
5. [Authentication Setup](#authentication-setup)
6. [File Upload Configuration](#file-upload-configuration)
7. [Real-time Features](#real-time-features)
8. [Testing the Integration](#testing-the-integration)

---

## Current Architecture

Currently, QuestClash uses **in-memory mock data stores** located in:
- `src/data/questStore.ts` - Manages quests, user profiles, and submissions
- `src/data/leaderboardStore.ts` - Manages leaderboard data

These stores simulate async API calls with `setTimeout` delays and store data in memory (which resets on page refresh).

---

## Backend Requirements

Your backend should provide:

### 1. **RESTful API Endpoints**
- Quest management (CRUD operations)
- User profile management
- Submission and voting system
- Leaderboard data
- XP and rewards management

### 2. **Authentication**
- Wallet-based authentication (Web3)
- JWT token management
- Session handling

### 3. **File Storage**
- Image/video upload for quest evidence
- Quest thumbnail images
- User avatars

### 4. **Real-time Updates** (Optional but recommended)
- WebSocket connections for live voting
- Real-time quest participant updates
- Live leaderboard updates

### 5. **Database**
- PostgreSQL, MongoDB, or similar
- Tables/Collections for: users, quests, submissions, votes, rewards, badges

---

## Step-by-Step Integration

### Step 1: Create API Service Layer

Create a new file `src/services/api.ts` to centralize all API calls:

```typescript
// src/services/api.ts
import axios from 'axios';

// Configure your backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    throw error;
  }
);

export default apiClient;
```

### Step 2: Replace Quest Store with API Calls

Update `src/data/questStore.ts`:

```typescript
// src/data/questStore.ts
import apiClient from '@/services/api';

// Keep the interfaces (Quest, UserProfile, Submission) as they are
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

class QuestStore {
  // Replace all methods with API calls
  
  async getQuests(): Promise<Quest[]> {
    const response = await apiClient.get('/quests');
    return response.data;
  }

  async getQuestById(id: string): Promise<Quest | undefined> {
    const response = await apiClient.get(`/quests/${id}`);
    return response.data;
  }

  async getCurrentUser(): Promise<UserProfile> {
    const response = await apiClient.get('/users/me');
    return response.data;
  }

  async getSubmissions(): Promise<Submission[]> {
    const response = await apiClient.get('/submissions/pending');
    return response.data;
  }

  async createQuest(quest: Omit<Quest, 'id' | 'participants' | 'status'>): Promise<Quest> {
    const response = await apiClient.post('/quests', quest);
    return response.data;
  }

  async joinQuest(questId: string): Promise<void> {
    await apiClient.post(`/quests/${questId}/join`);
  }

  async submitEvidence(questId: string, evidence: string): Promise<void> {
    const response = await apiClient.post(`/quests/${questId}/submit`, {
      evidence,
    });
    return response.data;
  }

  async vote(submissionId: string, approve: boolean): Promise<void> {
    await apiClient.post(`/submissions/${submissionId}/vote`, {
      approve,
    });
  }
}

export const questStore = new QuestStore();
```

### Step 3: Replace Leaderboard Store

Update `src/data/leaderboardStore.ts`:

```typescript
// src/data/leaderboardStore.ts
import apiClient from '@/services/api';

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
    const response = await apiClient.get('/leaderboard');
    return response.data;
  }
}

export const leaderboardStore = new LeaderboardStore();
```

### Step 4: Add Environment Variables

Create a `.env` file in the root directory:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:3000/api

# Or for production
# VITE_API_BASE_URL=https://api.questclash.com/api

# File upload service (if using separate service like AWS S3)
VITE_UPLOAD_URL=https://upload.questclash.com

# WebSocket URL for real-time features
VITE_WS_URL=ws://localhost:3000
```

---

## API Endpoints Needed

Your backend should implement these endpoints:

### **Quests**
```
GET    /api/quests                    - Get all quests (with filters)
GET    /api/quests/:id                - Get quest by ID
POST   /api/quests                    - Create new quest
PUT    /api/quests/:id                - Update quest
DELETE /api/quests/:id                - Delete quest
POST   /api/quests/:id/join           - Join a quest
POST   /api/quests/:id/submit         - Submit evidence for quest
GET    /api/quests/user/:userId       - Get user's quests
```

### **Users**
```
GET    /api/users/me                  - Get current user profile
PUT    /api/users/me                  - Update user profile
GET    /api/users/:id                 - Get user by ID
POST   /api/users/claim-xp            - Claim pending XP rewards
GET    /api/users/badges              - Get user badges
```

### **Submissions & Voting**
```
GET    /api/submissions/pending       - Get pending submissions for voting
GET    /api/submissions/:id           - Get submission by ID
POST   /api/submissions/:id/vote      - Vote on submission
GET    /api/submissions/quest/:questId - Get submissions for a quest
```

### **Leaderboard**
```
GET    /api/leaderboard               - Get leaderboard (with pagination)
GET    /api/leaderboard/weekly        - Get weekly leaderboard
GET    /api/leaderboard/monthly       - Get monthly leaderboard
```

### **Authentication**
```
POST   /api/auth/wallet-connect       - Connect wallet and authenticate
POST   /api/auth/logout               - Logout user
GET    /api/auth/verify               - Verify JWT token
POST   /api/auth/refresh              - Refresh JWT token
```

### **Rewards**
```
GET    /api/rewards/pending           - Get pending rewards to claim
POST   /api/rewards/claim/:id         - Claim a specific reward
GET    /api/rewards/history           - Get reward claim history
```

---

## Authentication Setup

### Step 1: Create Auth Service

Create `src/services/auth.ts`:

```typescript
// src/services/auth.ts
import apiClient from './api';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    walletAddress: string;
  };
}

class AuthService {
  async connectWallet(walletAddress: string, signature: string): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/wallet-connect', {
      walletAddress,
      signature,
    });
    
    const { token, user } = response.data;
    
    // Store token in localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const authService = new AuthService();
```

### Step 2: Create Auth Context

Create `src/contexts/AuthContext.tsx`:

```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, AuthResponse } from '@/services/auth';

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  login: (walletAddress: string, signature: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (walletAddress: string, signature: string) => {
    const response = await authService.connectWallet(walletAddress, signature);
    setUser(response.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Step 3: Wrap App with Auth Provider

Update `src/App.tsx`:

```typescript
import { AuthProvider } from '@/contexts/AuthContext';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          {/* ... rest of your app */}
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

---

## File Upload Configuration

### Step 1: Create Upload Service

Create `src/services/upload.ts`:

```typescript
// src/services/upload.ts
import apiClient from './api';

class UploadService {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url; // Returns the uploaded image URL
  }

  async uploadVideo(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url;
  }

  async uploadEvidence(questId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('questId', questId);

    const response = await apiClient.post('/upload/evidence', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url;
  }
}

export const uploadService = new UploadService();
```

### Step 2: Add File Upload Component

Create `src/components/FileUpload.tsx`:

```typescript
// src/components/FileUpload.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { uploadService } from '@/services/upload';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  accept?: string;
  maxSize?: number; // in MB
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  accept = 'image/*,video/*',
  maxSize = 10,
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: `Maximum file size is ${maxSize}MB`,
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    const isImage = file.type.startsWith('image/');
    const uploadUrl = isImage
      ? await uploadService.uploadImage(file)
      : await uploadService.uploadVideo(file);

    onUploadComplete(uploadUrl);
    setUploading(false);

    toast({
      title: 'Upload successful',
      description: 'Your file has been uploaded.',
    });
  };

  return (
    <div>
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button type="button" disabled={uploading} asChild>
          <span>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </>
            )}
          </span>
        </Button>
      </label>
    </div>
  );
};
```

---

## Real-time Features

### Step 1: Create WebSocket Service

Create `src/services/websocket.ts`:

```typescript
// src/services/websocket.ts
class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect() {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.emit(data.type, data.payload);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 3 seconds
      setTimeout(() => this.connect(), 3000);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data));
    }
  }

  send(event: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: event, payload: data }));
    }
  }
}

export const wsService = new WebSocketService();
```

### Step 2: Use WebSocket in Components

Example usage in the Voting page:

```typescript
// In src/pages/Voting.tsx
import { wsService } from '@/services/websocket';

const Voting = () => {
  useEffect(() => {
    // Connect to WebSocket
    wsService.connect();

    // Listen for real-time vote updates
    const handleVoteUpdate = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    };

    wsService.on('vote:update', handleVoteUpdate);

    return () => {
      wsService.off('vote:update', handleVoteUpdate);
    };
  }, []);

  // ... rest of component
};
```

---

## Testing the Integration

### Step 1: Test API Endpoints

Use tools like Postman or curl to test your backend endpoints:

```bash
# Test getting quests
curl http://localhost:3000/api/quests

# Test authentication
curl -X POST http://localhost:3000/api/auth/wallet-connect \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "0x123...", "signature": "0xabc..."}'
```

### Step 2: Test Frontend Integration

1. Start your backend server
2. Update `.env` with correct API URL
3. Run the frontend: `npm run dev`
4. Test each feature:
   - Browse quests
   - Create a quest
   - Join a quest
   - Submit evidence
   - Vote on submissions
   - Check leaderboard
   - View profile

### Step 3: Error Handling

Add proper error handling in components:

```typescript
const { data: quests, isLoading, error } = useQuery({
  queryKey: ['quests'],
  queryFn: () => questStore.getQuests(),
});

if (error) {
  return (
    <div className="text-center py-12">
      <p className="text-red-500">Error loading quests: {error.message}</p>
      <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['quests'] })}>
        Retry
      </Button>
    </div>
  );
}
```

---

## Summary Checklist

- [ ] Backend API is running and accessible
- [ ] Created `src/services/api.ts` with axios configuration
- [ ] Updated `src/data/questStore.ts` to use API calls
- [ ] Updated `src/data/leaderboardStore.ts` to use API calls
- [ ] Created `.env` file with API URLs
- [ ] Implemented authentication service and context
- [ ] Added file upload functionality
- [ ] Set up WebSocket for real-time features (optional)
- [ ] Tested all API endpoints
- [ ] Tested frontend integration
- [ ] Added error handling throughout the app
- [ ] Configured CORS on backend to allow frontend requests
- [ ] Set up proper authentication flow with JWT tokens
- [ ] Implemented file storage (AWS S3, Cloudinary, etc.)

---

## Additional Resources

### Recommended Backend Stack
- **Node.js + Express** or **NestJS** for API
- **PostgreSQL** or **MongoDB** for database
- **Prisma** or **TypeORM** for ORM
- **Socket.io** for WebSocket connections
- **AWS S3** or **Cloudinary** for file storage
- **JWT** for authentication
- **Redis** for caching (optional)

### Security Considerations
- Implement rate limiting on API endpoints
- Validate all user inputs on backend
- Use HTTPS in production
- Implement proper CORS policies
- Sanitize file uploads
- Use environment variables for sensitive data
- Implement proper error handling without exposing sensitive info

---

**Need Help?** If you encounter issues during integration, check:
1. Browser console for frontend errors
2. Backend logs for API errors
3. Network tab in DevTools to inspect API calls
4. Ensure CORS is properly configured on backend