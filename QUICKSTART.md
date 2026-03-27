# ⚡ Quick Start - Deploy in 5 Minutes

## You Are Here: Local Setup Complete ✅

Your API is running locally. Now let's make it public so Roblox can access it!

---

## 🚀 Fastest Path to Production: Railway

### Step 1: Create GitHub Account (if needed)
Go to https://github.com/join (2 minutes)

### Step 2: Create Repository
1. Go to https://github.com/new
2. Repository name: `donation-logger`
3. Keep it **Private** (recommended)
4. Click "Create repository"

### Step 3: Push Your Code
Copy these commands **exactly**:

```bash
cd /home/ubuntu/.openclaw/workspace/donation-logger

# Initialize git
git init
git add .
git commit -m "Donation Logger API"

# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/donation-logger.git
git branch -M main
git push -u origin main
```

GitHub will ask for credentials:
- Username: your GitHub username
- Password: use a **Personal Access Token** (not your password)
  - Generate at: https://github.com/settings/tokens
  - Click "Generate new token (classic)"
  - Select scopes: `repo`
  - Copy the token

### Step 4: Deploy on Railway
1. Go to https://railway.app
2. Click "Login" → "Login with GitHub"
3. Authorize Railway
4. Click "New Project"
5. Select "Deploy from GitHub repo"
6. Choose `donation-logger`
7. Click "Deploy Now"

### Step 5: Add Environment Variable
1. In Railway project, click "Variables" tab
2. Click "New Variable"
3. Add:
   ```
   DISCORD_WEBHOOK_URL
   https://discord.com/api/webhooks/1486493175924261035/ixdzicHQ_zHsA1PTyRIx70zUjfkCkyaiGnY8lZFNm0ia4WSVE0UVtD_J1rKx5RyMfZBh
   ```
4. Click "Add"

### Step 6: Get Your URL
1. Click "Settings" tab
2. Scroll to "Domains"
3. Click "Generate Domain"
4. Copy your URL (looks like: `donation-logger-production-xxxx.up.railway.app`)

### Step 7: Test It!
```bash
./test-api.sh https://YOUR-RAILWAY-URL.up.railway.app
```

Check Discord - you should see test donations! ✅

### Step 8: Update Roblox Script
1. Open Roblox Studio
2. ServerScriptService → DonationSystem
3. Line 12, change to:
   ```lua
   local API_URL = "https://YOUR-RAILWAY-URL.up.railway.app/api/donation"
   ```
4. Save and publish

---

## 🎮 Test in Roblox

1. Open your game in Studio
2. Click "Test" → "Start" (need 2+ players)
3. Press **G** to open donation menu
4. Select a player
5. Enter amount: 50000
6. Add message: "Testing!"
7. Click "DONATE"
8. Check Discord! 🎉

---

## ✅ That's It!

Your donation system is now:
- ✅ Deployed to Railway
- ✅ Accessible via HTTPS
- ✅ Logging to Discord
- ✅ Creating custom images
- ✅ Ready for production!

---

## 🔧 Alternative: Skip GitHub (Render Direct)

If you don't want to use GitHub:

1. Go to https://render.com
2. New → Web Service
3. Connect via "Public Git Repository"
4. Paste: Your repo URL (if you make it public)

OR upload files directly in some platforms.

---

## 💡 Pro Tips

**Keep Railway Awake:**
Railway projects don't sleep, unlike Render's free tier!

**Monitor Logs:**
In Railway, click "Deployments" → "View Logs" to see requests.

**Update Code:**
Just push to GitHub:
```bash
git add .
git commit -m "Updated features"
git push
```
Railway auto-deploys! 🚀

---

## 🆘 Quick Troubleshooting

**"Permission denied" pushing to GitHub:**
- Use Personal Access Token, not password
- Generate at: https://github.com/settings/tokens

**"Failed to connect to Railway":**
- Make sure you authorized Railway with GitHub
- Check repository is accessible to Railway

**Railway build failed:**
- Check logs in Railway dashboard
- Verify package.json is correct
- Environment variable must be set

**Roblox can't reach API:**
- Verify URL is HTTPS (not HTTP)
- Check URL ends with `/api/donation`
- Test with curl first: `curl https://your-url/health`

---

## 📊 Your System Architecture

```
[Roblox Game] 
    ↓ (HTTPS Request)
[Railway Server] 
    ↓ (Fetch Profiles)
[Roblox API]
    ↓ (Generate Image)
[Your Server]
    ↓ (Send Image)
[Discord Webhook]
    ↓
[Your Discord Channel] 🎉
```

---

**Time to deploy: ~5 minutes**
**Cost: $0 (Free tier)**
**Difficulty: Easy**

You've got this! 🚀
