# XP Assignment Guide

This guide explains how to assign XP to users and the updated signup bonus system.

## Overview

The system has been updated to provide **1000 XP** to new users upon registration, and includes scripts to manually assign XP to existing users.

## Updated Signup Bonus

### New User Registration
- **Previous**: 100 XP signup bonus
- **Updated**: 1000 XP signup bonus
- **Location**: `supabase/enhanced-schema.sql` - `register_user_with_bonus()` function

When a new user registers through the application:
1. They receive 1000 XP automatically
2. This puts them at Level 2 (1000 XP = Level 2)
3. An XP transaction is recorded in the database

## Manual XP Assignment Scripts

### 1. Assign 1000 XP to Any User
**Script**: `scripts/assign-1000xp-to-user.mjs`

```bash
# Assign by username
node scripts/assign-1000xp-to-user.mjs ProfileTestUser

# Assign by user ID
node scripts/assign-1000xp-to-user.mjs c6e8db39-dd93-469f-8295-1e8d96741371

# Assign by wallet address pattern (when user_wallets table exists)
node scripts/assign-1000xp-to-user.mjs 0xfeB0
```

**Features**:
- Searches by username, user ID, or wallet address pattern
- Calculates new level and XP to next level
- Updates user rank automatically
- Records XP transaction (if table exists)
- Provides detailed before/after stats

### 2. Assign XP to Specific Wallet Address
**Script**: `scripts/assign-xp-to-wallet.mjs`

```bash
node scripts/assign-xp-to-wallet.mjs
```

**Purpose**: Specifically designed to find and assign 1000 XP to users with wallet address matching `0xfeB0...0fcf`

**Note**: This script requires the enhanced schema with `user_wallets` table to be applied.

### 3. General XP Assignment (400 XP)
**Script**: `scripts/assign-xp.mjs`

```bash
node scripts/assign-xp.mjs
```

**Purpose**: Assigns 400 XP to the first user in the database (legacy script)

## For the Specific User (0xfeB0...0fcf)

### Current Status
The user with wallet address `0xfeB0...0fcf` is **not currently registered** in the database.

### When They Register
1. **Automatic**: They will receive 1000 XP automatically upon first registration
2. **Manual**: If additional XP is needed, use:
   ```bash
   node scripts/assign-1000xp-to-user.mjs 0xfeB0
   ```

### To Assign XP Now (if they register)
1. Wait for them to sign in and create their profile
2. Find their username using:
   ```bash
   node scripts/show-user-details.mjs
   ```
3. Assign XP using their username:
   ```bash
   node scripts/assign-1000xp-to-user.mjs [their_username]
   ```

## Database Schema Requirements

### Current Schema (Basic)
- Uses `users` table only
- No wallet address tracking in users table
- XP transactions table may not exist

### Enhanced Schema (Recommended)
- Includes `user_wallets` table for wallet address tracking
- Includes `xp_transactions` table for transaction history
- Updated `register_user_with_bonus()` function with 1000 XP

To apply enhanced schema:
```sql
-- Run the contents of supabase/enhanced-schema.sql in your Supabase SQL editor
```

## XP and Level System

- **Level Calculation**: `Level = floor(XP / 1000) + 1`
- **XP to Next Level**: `(Level * 1000) - Current XP`

### Level Examples
- 0-999 XP = Level 1
- 1000-1999 XP = Level 2
- 2000-2999 XP = Level 3
- etc.

## Verification Commands

### Check All Users
```bash
node scripts/show-user-details.mjs
```

### Count Users and Activity
```bash
node scripts/count-users.mjs
```

## Troubleshooting

### "Table not found" errors
- The enhanced schema may not be applied
- Use the basic scripts that work with the current schema
- Apply `supabase/enhanced-schema.sql` to enable advanced features

### User not found
- Verify the user has registered by checking `show-user-details.mjs`
- Users must sign in at least once to create their profile
- Wallet addresses are only tracked if enhanced schema is applied

### XP transaction not recorded
- This is normal if `xp_transactions` table doesn't exist
- The XP assignment still works, just without transaction history
- Apply enhanced schema to enable transaction tracking

## Summary

✅ **Completed**:
- Updated signup bonus from 100 XP to 1000 XP for new users
- Created flexible script to assign 1000 XP to any user
- Tested XP assignment functionality
- All new users will automatically receive 1000 XP upon registration

🔄 **For user with wallet 0xfeB0...0fcf**:
- User needs to register first (sign in to the application)
- Will automatically receive 1000 XP upon registration
- Can receive additional 1000 XP manually using the provided script