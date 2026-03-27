# 🚂 Railway Deployment - Simple Steps

## ✅ Prerequisites (Already Done!)

- [x] Code is ready
- [x] Git repository initialized
- [x] Code committed

## 📝 You Need:

1. **GitHub account** (free) - https://github.com/join
2. **Railway account** (free) - https://railway.app

---

## 🚀 Deployment Steps

### STEP 1: Create GitHub Repository (2 minutes)

1. Go to **https://github.com/new**

2. Fill in:
   - Repository name: `donation-logger`
   - Description: `Roblox Donation Logger API`
   - Choose **Private** or Public
   - **DO NOT** check any boxes (no README, no .gitignore)

3. Click **"Create repository"**

4. GitHub will show a page with commands - **leave this page open!**

---

### STEP 2: Get Personal Access Token

You need this to push code to GitHub:

1. Go to **https://github.com/settings/tokens**

2. Click **"Generate new token"** → **"Generate new token (classic)"**

3. Settings:
   - Note: `Railway Deployment`
   - Expiration: `No expiration` (or 90 days)
   - Select scopes: Check **`repo`** (all sub-boxes)

4. Click **"Generate token"** at bottom

5. **COPY THE TOKEN** (you won't see it again!)
   - It looks like: `ghp_xxxxxxxxxxxxxxxxxxxx`
   - Save it somewhere safe

---

### STEP 3: Push Code to GitHub

Run these commands (replace `YOUR_USERNAME`):

```bash
cd /home/ubuntu/.openclaw/workspace/donation-logger

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/donation-logger.git

# Push to GitHub
git push -u origin main
```

**When prompted:**
- Username: Your GitHub username
- Password: **PASTE YOUR TOKEN** (not your password!)

---

### STEP 4: Deploy to Railway (3 minutes)

1. Go to **https://railway.app**

2. Click **"Login"**

3. Choose **"Login with GitHub"**

4. **Authorize Railway** - click the purple button

5. Click **"New Project"** (top right)

6. Select **"Deploy from GitHub repo"**

7. Choose **`donation-logger`** from the list
   - If you don't see it: Click "Configure GitHub App" and give Railway access to your repo

8. Railway starts deploying automatically! ✅
   - You'll see a deployment in progress
   - Wait ~1-2 minutes

---

### STEP 5: Add Environment Variable

Once deployed:

1. Click on your **service** (the `donation-logger` box in the dashboard)

2. Click **"Variables"** tab (top of the page)

3. Click **"New Variable"** button

4. Add:
   ```
   Variable: DISCORD_WEBHOOK_URL
   
   Value: https://discord.com/api/webhooks/1486493175924261035/ixdzicHQ_zHsA1PTyRIx70zUjfkCkyaiGnY8lZFNm0ia4WSVE0UVtD_J1rKx5RyMfZBh
   ```

5. Click **"Add"**

6. Railway will automatically redeploy with the new variable

---

### STEP 6: Get Your Public URL

1. Click **"Settings"** tab

2. Scroll to **"Networking"** section

3. Under "Public Networking", click **"Generate Domain"**

4. Railway gives you a URL like:
   ```
   https://donation-logger-production-a1b2.up.railway.app
   ```

5. **COPY THIS URL!** ← This is your API endpoint!

---

### STEP 7: Test Your API

Test it works:

```bash
curl https://YOUR-RAILWAY-URL.up.railway.app/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

Or use the test script:

```bash
cd /home/ubuntu/.openclaw/workspace/donation-logger
./test-api.sh https://YOUR-RAILWAY-URL.up.railway.app
```

**Check Discord** - you should see test donations! 🎉

---

### STEP 8: Update Your Roblox Script

1. Open **Roblox Studio**

2. Go to **ServerScriptService** → **DonationSystem**

3. Find line 12 and change:
   ```lua
   local API_URL = "https://YOUR-RAILWAY-URL.up.railway.app/api/donation"
   ```

4. **Save** and **Publish** your game

5. **Enable HTTP Requests**:
   - Home → Game Settings (Alt+S)
   - Security tab
   - Enable "Allow HTTP Requests"
   - Save

---

## ✅ You're Done!

Your system is now:
- ✅ Deployed to Railway
- ✅ Accessible via HTTPS
- ✅ Connected to Discord
- ✅ Ready for Roblox!

---

## 🧪 Test In-Game

1. Open your game in Roblox
2. Join with 2+ players (or use multiple Roblox clients)
3. Press **G** to open donation menu
4. Select a player
5. Enter amount: `50000`
6. Add message: `"Test!"`
7. Click **"DONATE"**
8. **Check Discord!** You should see a custom donation image! 🎉

---

## 📊 Monitor Your App

Railway Dashboard: https://railway.app/project

You can:
- View logs
- See metrics
- Monitor deployments
- Update environment variables
- Check usage

---

## 🔄 Future Updates

When you want to update your code:

```bash
cd /home/ubuntu/.openclaw/workspace/donation-logger

# Make your changes to server.js or other files

# Commit and push
git add .
git commit -m "Updated features"
git push
```

**Railway automatically redeploys!** 🚀

---

## 🆘 Troubleshooting

**Can't see repository in Railway?**
→ Click "Configure GitHub App" and give Railway access

**Build failed?**
→ Check logs in Railway dashboard
→ Make sure package.json is correct

**Environment variable not working?**
→ Make sure you clicked "Add" after pasting
→ Check for extra spaces in the value

**Roblox can't connect?**
→ Make sure URL is HTTPS (not HTTP)
→ URL should end with `/api/donation`
→ HTTP requests must be enabled in Roblox

**Discord not receiving?**
→ Check webhook URL is correct in Railway variables
→ Test with curl first

---

## 💰 Railway Free Tier

Railway gives you:
- 500 hours per month FREE
- More than enough for your donation logger
- ~$0.01-0.02 after free tier (very cheap!)

---

## 🎉 That's It!

Your donation logger is live and ready to use!

Need help with any step? Just ask! 🚀
