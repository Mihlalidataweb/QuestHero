import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { signInWithBase } from '@/services/baseAccount';
import apiClient from '@/services/api';
import { userService, User } from '@/services/userService';

interface AuthUser {
  address: string;
  username?: string;
  id?: string;
  xp?: number;
  reward_points?: number;
  level?: number;
  tier?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  userProfile: User | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => void;
  loading: boolean;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUserProfile = async () => {
    if (!user?.address) return;
    
    try {
      const profile = await userService.getUserByWallet(user.address);
      setUserProfile(profile);
      
      if (profile) {
        setUser(prev => prev ? {
          ...prev,
          id: profile.id,
          username: profile.username,
          xp: profile.xp,
          reward_points: profile.reward_points,
          level: profile.level,
          tier: profile.tier
        } : null);
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const u = localStorage.getItem('user');
    const USE_API = import.meta.env.VITE_USE_API === 'true';
    
    async function hydrate() {
      try {
        if (USE_API && token) {
          const res = await apiClient.get('/users/me');
          setUser({ address: res.data.address, username: res.data.username });
        } else if (u) {
          const parsed = JSON.parse(u);
          setUser(parsed);
        }
      } catch (err) {
        console.error('Failed to hydrate user:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    hydrate();
  }, []);

  useEffect(() => {
    if (user?.address && !loading) {
      refreshUserProfile();
    }
  }, [user?.address, loading]);

  const login = async () => {
    const { address } = await signInWithBase();
    try {
      const USE_API = import.meta.env.VITE_USE_API === 'true';
      if (USE_API) {
        const res = await apiClient.get('/users/me');
        setUser({ address: res.data.address, username: res.data.username });
      } else {
        // Check if user exists in database, if not register them
        let profile = await userService.getUserByWallet(address);
        
        if (!profile) {
          // Register new user with signup bonus
          profile = await userService.registerUser(address);
          console.log('New user registered with signup bonus:', profile.username);
        }
        
        setUser({ 
          address,
          id: profile.id,
          username: profile.username,
          xp: profile.xp,
          reward_points: profile.reward_points,
          level: profile.level,
          tier: profile.tier
        });
        setUserProfile(profile);
        
        // Update real-time data (streak, rank, level)
        try {
          await userService.updateUserStreak(profile.id);
          await userService.calculateUserRank(profile.id);
          await userService.updateUserLevel(profile.id);
          
          // Refresh profile to get updated data
          const updatedProfile = await userService.getUserById(profile.id);
          if (updatedProfile) {
            setUserProfile(updatedProfile);
            setUser({ 
              address,
              id: updatedProfile.id,
              username: updatedProfile.username,
              xp: updatedProfile.xp,
              reward_points: updatedProfile.reward_points,
              level: updatedProfile.level,
              tier: updatedProfile.tier
            });
          }
        } catch (updateError) {
          console.error('Failed to update real-time data:', updateError);
        }
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify({ 
          address,
          id: profile.id,
          username: profile.username,
          xp: profile.xp,
          reward_points: profile.reward_points,
          level: profile.level,
          tier: profile.tier
        }));
      }
    } catch (err) {
      console.error('Failed to fetch profile after login:', err);
      setUser({ address });
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setUserProfile(null);
  };

  const value = useMemo<AuthContextType>(() => ({
    user,
    userProfile,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
    refreshUserProfile,
  }), [user, userProfile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};