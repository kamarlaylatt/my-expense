# Google OAuth Implementation Guide

## Frontend Setup ✅ COMPLETE

The frontend has been configured with NextAuth.js for Google OAuth. Here's what's been implemented:

### Files Created/Updated:

1. **`app/api/auth/[...nextauth]/route.ts`** - NextAuth configuration with Google provider
2. **`app/api/auth/callback/google/page.tsx`** - OAuth callback handler page
3. **`types/index.ts`** - Extended User type with OAuth fields
4. **`lib/api.ts`** - Added `googleAuth` method to authApi
5. **`context/AuthContext.tsx`** - Extended with `googleAuth` method and `setUser` function
6. **`app/(auth)/login/page.tsx`** - Added "Sign in with Google" button
7. **`.env.local.example`** - Environment variables template

### Frontend OAuth Flow:

```
User clicks "Sign in with Google"
    ↓
NextAuth redirects to Google login
    ↓
User authenticates with Google
    ↓
Google redirects to callback with authorization code
    ↓
Callback page calls: POST /api/auth/google with Google user data
    ↓
Backend exchanges code and returns JWT token
    ↓
Frontend stores token in localStorage
    ↓
Frontend redirects to dashboard
```

---

## Backend Implementation (Node.js) - REQUIRED

Your Node.js backend needs to implement the following:

### 1. **Extend User Model**

Add these fields to your User database table:

```typescript
{
  id: number,
  email: string,
  name: string,
  password?: string,           // Optional for OAuth users
  provider?: string,           // 'google' | 'credentials'
  providerAccountId?: string,  // Google's unique user ID
  emailVerified?: boolean,     // Auto-true for Google users
  image?: string,              // Google profile picture URL
  createdAt: Date,
  updatedAt: Date
}
```

### 2. **Create POST /api/auth/google Endpoint**

This endpoint receives Google user data and issues your JWT token.

**Request Body:**

```json
{
  "email": "user@gmail.com",
  "name": "John Doe",
  "providerAccountId": "118364933200870915143",
  "provider": "google",
  "image": "https://example.com/avatar.jpg"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Google authentication successful",
  "data": {
    "user": {
      "id": 2,
      "email": "user@gmail.com",
      "name": "John Doe",
      "provider": "google",
      "providerAccountId": "118364933200870915143",
      "image": "https://example.com/avatar.jpg",
      "emailVerified": true,
      "createdAt": "2025-12-06T10:00:00.000Z",
      "updatedAt": "2025-12-06T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. **Implementation Logic**

```pseudocode
POST /api/auth/google

1. Validate request body (email, providerAccountId, provider required)

2. Check if user exists by providerAccountId
   - If exists: Return user + generate JWT token
   - If not exists: Continue to step 3

3. Check if user exists by email
   - If exists: Link Google provider to existing account
     - Update: provider = "google", providerAccountId
     - Return user + JWT token
   - If not exists: Continue to step 4

4. Create new user
   - email: from request
   - name: from request (or default)
   - provider: "google"
   - providerAccountId: from request
   - emailVerified: true
   - image: from request (optional)
   - password: null (no password for OAuth users)

5. Generate JWT token (7-day expiration as per your API docs)
   - Include: user.id, user.email
   - Return token + user data

6. Response with 200 OK
```

### 4. **What NOT to Store**

❌ Google's access token
❌ Google's refresh token  
❌ Google's authorization code
❌ Google's ID token

**Why?** You only need the `providerAccountId` to identify the user. You're issuing your own JWT tokens.

### 5. **Optional: Enhanced Flow (Token Exchange)**

For maximum security, you can add a server-side token exchange step:

**Option A: Frontend sends authorization code to backend**

```
Frontend: POST /api/auth/google { code }
Backend:
  1. Exchange code with Google for tokens
  2. Fetch user profile from Google
  3. Create/link user
  4. Return JWT token
Frontend: Store JWT, redirect to dashboard
```

**Option B: Current setup (Simpler)**

```
Frontend: POST /api/auth/google { email, name, providerAccountId, provider }
Backend:
  1. Create/link user (assume email is verified by Google)
  2. Return JWT token
Frontend: Store JWT, redirect to dashboard
```

The current setup (Option B) is simpler but assumes you trust the email data from the frontend.

---

## Environment Setup

### Frontend (.env.local)

```bash
# Generate NEXTAUTH_SECRET with:
openssl rand -base64 32

# Or use any 32+ character random string
```

### Google OAuth Console Setup

1. Go to: https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web Application)
5. Add authorized redirect URI:
   ```
   http://localhost:3001/api/auth/callback/google
   (or your production URL)
   ```
6. Copy Client ID and Client Secret to `.env.local`

### Backend Environment Variables

You don't need Google credentials on backend if using Option B above.

---

## Frontend Configuration Checklist

- [x] NextAuth.js installed
- [x] Google provider configured
- [x] Callback route created
- [x] AuthContext updated
- [x] Login page updated with Google button
- [x] Types extended
- [x] API method created

## Backend Todo Checklist

- [ ] Add provider, providerAccountId, emailVerified, image to User table
- [ ] Create POST /api/auth/google endpoint
- [ ] Implement user creation/linking logic
- [ ] Generate JWT token
- [ ] Test Google OAuth flow end-to-end
- [ ] (Optional) Implement server-side token exchange

---

## Testing Google OAuth

1. Fill in `.env.local` with Google credentials
2. Run frontend: `npm run dev`
3. Click "Sign in with Google" on login page
4. Authorize the application
5. Should redirect to dashboard with JWT token stored

## Troubleshooting

**Error: "No authorization code received"**

- Check NEXTAUTH_URL matches your frontend URL
- Verify Google OAuth callback URI is correct

**Error: "Backend endpoint not responding"**

- Ensure Node.js backend is running on correct port
- Check NEXT_PUBLIC_API_URL points to backend

**Error: "Invalid provider credentials"**

- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Check they're not accidentally swapped
